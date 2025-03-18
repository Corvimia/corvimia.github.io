import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

// Types
export interface TaskItem {
  id: string;
  content: string;
  completed: boolean;
  children: TaskItem[];
}

export type RootTaskList = TaskItem[];

type TaskListManagerContextType = {
  tasks: RootTaskList;
  addTask: (content: string, parentId?: string) => void;
  updateTask: (id: string, content: string) => void;
  toggleTaskCompletion: (id: string) => void;
  deleteTask: (id: string) => void;
  importFromMarkdown: (markdown: string) => void;
  exportToMarkdown: () => string;
};

const TaskListManagerContext = createContext<TaskListManagerContextType | undefined>(undefined);

export const TaskListManagerProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<RootTaskList>([]);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("taskListManager");
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (error) {
        console.error("Error parsing tasks from localStorage:", error);
      }
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("taskListManager", JSON.stringify(tasks));
  }, [tasks]);

  // Helper function to find a task by ID in the nested structure
  const findTaskById = (id: string, taskList: TaskItem[] = tasks): { task: TaskItem | null, parent: TaskItem[] | null } => {
    for (const task of taskList) {
      if (task.id === id) {
        return { task, parent: taskList };
      }
      if (task.children.length > 0) {
        const result = findTaskById(id, task.children);
        if (result.task) {
          return result;
        }
      }
    }
    return { task: null, parent: null };
  };

  // Add a new task
  const addTask = (content: string, parentId?: string) => {
    const newTask: TaskItem = {
      id: Date.now().toString(),
      content,
      completed: false,
      children: [],
    };

    if (!parentId) {
      // Add to root level
      setTasks((prevTasks) => [...prevTasks, newTask]);
    } else {
      // Add as a child to the specified parent
      setTasks((prevTasks) => {
        const updatedTasks = [...prevTasks];
        
        // Recursive function to add task to the correct parent
        const addToParent = (taskList: TaskItem[]): boolean => {
          for (let i = 0; i < taskList.length; i++) {
            if (taskList[i].id === parentId) {
              taskList[i].children.push(newTask);
              return true;
            }
            if (taskList[i].children.length > 0) {
              if (addToParent(taskList[i].children)) {
                return true;
              }
            }
          }
          return false;
        };

        addToParent(updatedTasks);
        return updatedTasks;
      });
    }
  };

  // Update a task's content
  const updateTask = (id: string, content: string) => {
    setTasks((prevTasks) => {
      const updatedTasks = [...prevTasks];
      
      // Recursive function to update task
      const updateTaskContent = (taskList: TaskItem[]): boolean => {
        for (let i = 0; i < taskList.length; i++) {
          if (taskList[i].id === id) {
            taskList[i].content = content;
            return true;
          }
          if (taskList[i].children.length > 0) {
            if (updateTaskContent(taskList[i].children)) {
              return true;
            }
          }
        }
        return false;
      };

      updateTaskContent(updatedTasks);
      return updatedTasks;
    });
  };

  // Toggle a task's completion status
  const toggleTaskCompletion = (id: string) => {
    setTasks((prevTasks) => {
      const updatedTasks = [...prevTasks];
      
      // Recursive function to toggle task completion
      const toggleCompletion = (taskList: TaskItem[]): boolean => {
        for (let i = 0; i < taskList.length; i++) {
          if (taskList[i].id === id) {
            taskList[i].completed = !taskList[i].completed;
            return true;
          }
          if (taskList[i].children.length > 0) {
            if (toggleCompletion(taskList[i].children)) {
              return true;
            }
          }
        }
        return false;
      };

      toggleCompletion(updatedTasks);
      return updatedTasks;
    });
  };

  // Delete a task
  const deleteTask = (id: string) => {
    setTasks((prevTasks) => {
      const updatedTasks = [...prevTasks];
      
      // Recursive function to delete task
      const removeTask = (taskList: TaskItem[]): boolean => {
        for (let i = 0; i < taskList.length; i++) {
          if (taskList[i].id === id) {
            taskList.splice(i, 1);
            return true;
          }
          if (taskList[i].children.length > 0) {
            if (removeTask(taskList[i].children)) {
              return true;
            }
          }
        }
        return false;
      };

      removeTask(updatedTasks);
      return updatedTasks;
    });
  };

  // Import from Markdown
  const importFromMarkdown = (markdown: string) => {
    const lines = markdown.split('\n');
    const rootTasks: RootTaskList = [];
    let taskStack: { task: TaskItem, level: number }[] = [];
    
    lines.forEach(line => {
      // Ignore empty lines
      if (!line.trim()) return;
      
      // Count indentation level by number of spaces at start
      const match = line.match(/^(\s*)[-*+] \[([ x])\] (.*)/);
      if (!match) return;
      
      const indent = match[1].length;
      const completed = match[2] === 'x';
      const content = match[3].trim();
      const level = Math.floor(indent / 2); // Assuming 2 spaces = 1 level
      
      const newTask: TaskItem = {
        id: Date.now() + Math.random().toString(36).substring(2, 9),
        content,
        completed,
        children: [],
      };
      
      if (level === 0) {
        // Root level task
        rootTasks.push(newTask);
        taskStack = [{ task: newTask, level: 0 }];
      } else {
        // Find the appropriate parent
        while (taskStack.length > 0 && taskStack[taskStack.length - 1].level >= level) {
          taskStack.pop();
        }
        
        if (taskStack.length > 0) {
          const parent = taskStack[taskStack.length - 1].task;
          parent.children.push(newTask);
        } else {
          // Fallback to root if parent not found
          rootTasks.push(newTask);
        }
        
        taskStack.push({ task: newTask, level });
      }
    });
    
    setTasks(rootTasks);
  };

  // Export to Markdown
  const exportToMarkdown = () => {
    let markdown = '';
    
    const appendTaskToMarkdown = (task: TaskItem, level = 0) => {
      const indent = ' '.repeat(level * 2);
      const checkmark = task.completed ? 'x' : ' ';
      markdown += `${indent}- [${checkmark}] ${task.content}\n`;
      
      task.children.forEach(child => {
        appendTaskToMarkdown(child, level + 1);
      });
    };
    
    tasks.forEach(task => {
      appendTaskToMarkdown(task);
    });
    
    return markdown;
  };

  const value = {
    tasks,
    addTask,
    updateTask,
    toggleTaskCompletion,
    deleteTask,
    importFromMarkdown,
    exportToMarkdown,
  };

  return (
    <TaskListManagerContext.Provider value={value}>
      {children}
    </TaskListManagerContext.Provider>
  );
};

export const useTaskListManager = () => {
  const context = useContext(TaskListManagerContext);
  if (context === undefined) {
    throw new Error("useTaskListManager must be used within a TaskListManagerProvider");
  }
  return context;
}; 
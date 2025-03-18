import { useState } from "react";
import { useTaskListManager, type TaskItem } from "@/hooks/use-task-list-manager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Edit,
  Check, 
  X 
} from "lucide-react";

// Task Item Component
const Task = ({ task, level = 0 }: { task: TaskItem; level?: number }) => {
  const { updateTask, toggleTaskCompletion, deleteTask, addTask } = useTaskListManager();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(task.content);
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [newSubtaskContent, setNewSubtaskContent] = useState("");

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleToggleComplete = () => {
    toggleTaskCompletion(task.id);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(task.content);
  };

  const handleSaveEdit = () => {
    if (editContent.trim()) {
      updateTask(task.id, editContent);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleAddSubtask = () => {
    if (newSubtaskContent.trim()) {
      addTask(newSubtaskContent, task.id);
      setNewSubtaskContent("");
      setShowAddSubtask(false);
      setIsExpanded(true); // Expand to show the new subtask
    }
  };

  return (
    <div className="mb-2" style={{ marginLeft: `${level * 24}px` }}>
      <div className="flex items-center group">
        {task.children.length > 0 && (
          <button
            onClick={handleToggleExpand}
            className="mr-1 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
        )}
        {task.children.length === 0 && (
          <div className="w-[18px] mr-1"></div> // Placeholder for alignment
        )}
        
        <Checkbox 
          checked={task.completed} 
          onCheckedChange={handleToggleComplete}
          className="mr-2"
        />
        
        {isEditing ? (
          <div className="flex-1 flex gap-2">
            <Input
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="flex-1"
              autoFocus
            />
            <Button variant="ghost" size="icon" onClick={handleSaveEdit}>
              <Check size={18} />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleCancelEdit}>
              <X size={18} />
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex items-center">
            <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : ''}`}>
              {task.content}
            </span>
            <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
              <Button variant="ghost" size="sm" onClick={handleEdit}>
                <Edit size={16} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAddSubtask(!showAddSubtask)}
              >
                <Plus size={16} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => deleteTask(task.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {showAddSubtask && (
        <div className="flex items-center mt-2 ml-[42px] gap-2">
          <Input
            value={newSubtaskContent}
            onChange={(e) => setNewSubtaskContent(e.target.value)}
            placeholder="Add subtask..."
            className="flex-1"
            autoFocus
          />
          <Button variant="outline" size="sm" onClick={handleAddSubtask}>
            Add
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowAddSubtask(false)}
          >
            Cancel
          </Button>
        </div>
      )}

      {isExpanded && task.children.length > 0 && (
        <div className="mt-2">
          {task.children.map((child) => (
            <Task key={child.id} task={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

// Main Task List Component
const TaskList = () => {
  const { tasks, addTask } = useTaskListManager();
  const [newTaskContent, setNewTaskContent] = useState("");

  const handleAddTask = () => {
    if (newTaskContent.trim()) {
      addTask(newTaskContent);
      setNewTaskContent("");
    }
  };

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <Input
          value={newTaskContent}
          onChange={(e) => setNewTaskContent(e.target.value)}
          placeholder="Add a new task..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAddTask();
            }
          }}
        />
        <Button onClick={handleAddTask}>Add Task</Button>
      </div>

      <div className="mt-4">
        {tasks.length === 0 ? (
          <div className="text-center text-gray-500 my-8">
            No tasks yet. Add a task or import from Markdown.
          </div>
        ) : (
          tasks.map((task) => <Task key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
};

export default TaskList; 
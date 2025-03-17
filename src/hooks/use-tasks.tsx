import { createContext, useContext, useState, useEffect, type ReactNode, useRef, useCallback, useMemo } from "react"
import { parseISO, format, addMonths, addWeeks, addDays } from "date-fns"
import { useTimeline } from "./use-timeline"

// Types
export interface Task {
  id: string
  title: string
  description: string
  dateType: "absolute" | "relative" // absolute = specific date, relative = relative to event
  date: string // ISO date string for absolute dates
  relativeTime?: {
    value: number
    unit: "days" | "weeks" | "months"
    direction: "before" | "after"
  }
  completed: boolean
  important: boolean
  dependencies?: string[] // Array of task IDs that this task depends on
}

type TaskContextType = {
  tasks: Task[]
  addTask: (task: Omit<Task, "id" | "completed">) => void
  addTasks: (tasks: Omit<Task, "id" | "completed">[]) => void
  updateTask: (task: Task) => void
  deleteTask: (taskId: string) => void
  toggleTaskCompletion: (taskId: string) => void
  toggleTaskImportance: (taskId: string) => void
  getTasksByDate: () => Record<string, Task[]>
  getAllTasksSorted: () => Task[]
  calculateTaskDate: (task: Task) => Date | null
  getRelativeTimeString: (task: Task) => string
  getTaskById: (taskId: string) => Task | undefined
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const { eventDate } = useTimeline()

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("timelineTaskManager")
    if (savedState) {
      try {
        const { tasks: savedTasks } = JSON.parse(savedState)
        if (Array.isArray(savedTasks)) {
          setTasks(savedTasks)
        }
      } catch (error) {
        console.error("Error parsing tasks from localStorage:", error)
      }
    }
  }, [])

  // Save tasks to localStorage whenever they change
  const lastSavedTasksLengthRef = useRef(-1)
  
  useEffect(() => {
    // Skip the initial render and unnecessary updates
    if (lastSavedTasksLengthRef.current === tasks.length && lastSavedTasksLengthRef.current !== -1) {
      // If only the length is the same, we might still need to save if task contents changed
      // For simplicity, we'll proceed if any deep property changed
      if (lastSavedTasksLengthRef.current !== -1) {
        try {
          const savedState = localStorage.getItem("timelineTaskManager")
          if (savedState) {
            const { tasks: savedTasks } = JSON.parse(savedState)
            if (JSON.stringify(savedTasks) === JSON.stringify(tasks)) {
              return; // No changes, skip update
            }
          }
        } catch (error) {
          console.error("Error comparing tasks with localStorage:", error)
        }
      }
    }
    
    try {
      let state = { tasks }
      const savedState = localStorage.getItem("timelineTaskManager")
      
      if (savedState) {
        try {
          // Try to parse the saved state and merge with new tasks
          const parsedState = JSON.parse(savedState)
          state = { ...parsedState, tasks }
        } catch (error) {
          console.error("Error parsing saved state, overwriting with new data:", error)
        }
      }
      
      localStorage.setItem("timelineTaskManager", JSON.stringify(state))
      lastSavedTasksLengthRef.current = tasks.length;
    } catch (error) {
      console.error("Error saving tasks to localStorage:", error)
    }
  }, [tasks])

  // Calculate the actual date for a task (handles both absolute and relative dates)
  const calculateTaskDate = (task: Task): Date | null => {
    if (task.dateType === "absolute") {
      return parseISO(task.date)
    } else if (task.dateType === "relative" && eventDate && task.relativeTime) {
      const date = parseISO(eventDate)
      const { value, unit, direction } = task.relativeTime

      if (direction === "before") {
        if (unit === "days") return addDays(date, -value)
        if (unit === "weeks") return addWeeks(date, -value)
        if (unit === "months") return addMonths(date, -value)
      } else {
        if (unit === "days") return addDays(date, value)
        if (unit === "weeks") return addWeeks(date, value)
        if (unit === "months") return addMonths(date, value)
      }
    }

    return null
  }

  // Get a human-readable string for relative time
  const getRelativeTimeString = (task: Task): string => {
    if (task.dateType === "absolute") {
      return format(parseISO(task.date), "MMM d, yyyy")
    } else if (task.relativeTime) {
      const { value, unit, direction } = task.relativeTime
      return `${value} ${unit} ${direction} event`
    }
    return ""
  }

  // Group tasks by date
  const getTasksByDate = (): Record<string, Task[]> => {
    const tasksByDate: Record<string, Task[]> = {}

    tasks.forEach((task) => {
      const taskDate = calculateTaskDate(task)
      if (taskDate) {
        const dateKey = format(taskDate, "yyyy-MM-dd")
        if (!tasksByDate[dateKey]) {
          tasksByDate[dateKey] = []
        }
        tasksByDate[dateKey].push(task)
      }
    })

    return tasksByDate
  }

  // Get all tasks sorted by date
  const getAllTasksSorted = (): Task[] => {
    return [...tasks].sort((a, b) => {
      const dateA = calculateTaskDate(a)
      const dateB = calculateTaskDate(b)

      if (!dateA && !dateB) return 0
      if (!dateA) return 1
      if (!dateB) return -1

      return dateA.getTime() - dateB.getTime()
    })
  }

  // Get task by ID
  const getTaskById = (taskId: string): Task | undefined => {
    return tasks.find((task) => task.id === taskId)
  }

  // Task operations
  const addTask = (task: Omit<Task, "id" | "completed">) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      completed: false,
    }

    setTasks((prev) => [...prev, newTask])
  }

  // Add multiple tasks at once (for CSV import or test data)
  const addTasks = (newTasks: Omit<Task, "id" | "completed">[]) => {
    // Create a mapping of temporary IDs to actual IDs
    const idMapping: Record<string, string> = {}

    // First pass: create tasks with new IDs and build the mapping
    const tasksToAdd = newTasks.map((task) => {
      const newId = Date.now() + Math.random().toString(36).substring(2, 9)

      // If the task has a temporary ID (like task-0), map it to the new ID
      if ((task as Task).id && (task as Task).id.startsWith("task-")) {
        idMapping[(task as Task).id] = newId
      }

      return {
        ...task,
        id: newId,
        completed: false,
      }
    })

    // Second pass: update dependencies using the ID mapping
    const tasksWithUpdatedDeps = tasksToAdd.map((task) => {
      if (!task.dependencies || task.dependencies.length === 0) {
        return task
      }

      // Replace temporary IDs with actual IDs
      const updatedDeps = task.dependencies.map((depId) => {
        return idMapping[depId] || depId
      })

      return {
        ...task,
        dependencies: updatedDeps,
      }
    })

    setTasks((prev) => [...prev, ...tasksWithUpdatedDeps])
  }

  const updateTask = (task: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)))
  }

  const deleteTask = (taskId: string) => {
    // First, remove this task from any dependencies
    setTasks((prev) =>
      prev.map((task) => {
        if (task.dependencies?.includes(taskId)) {
          return {
            ...task,
            dependencies: task.dependencies.filter((id) => id !== taskId),
          }
        }
        return task
      }),
    )

    // Then delete the task
    setTasks((prev) => prev.filter((task) => task.id !== taskId))
  }

  const toggleTaskCompletion = (taskId: string) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)))
  }

  const toggleTaskImportance = (taskId: string) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, important: !task.important } : task)))
  }

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        addTasks,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        toggleTaskImportance,
        getTasksByDate,
        getAllTasksSorted,
        calculateTaskDate,
        getRelativeTimeString,
        getTaskById,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTasks() {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider")
  }
  return context
}


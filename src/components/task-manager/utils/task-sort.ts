import { parseISO } from "date-fns"
import { Task } from "@/hooks/use-tasks"

/**
 * Sort tasks by date
 */
export const sortTasksByDate = (tasks: Task[], calculateTaskDate: (task: Task) => Date | null) => {
  return [...tasks].sort((a, b) => {
    const dateA = calculateTaskDate(a)
    const dateB = calculateTaskDate(b)
    if (!dateA || !dateB) return 0
    return dateA.getTime() - dateB.getTime()
  })
}

/**
 * Sort tasks by importance first, then by date
 */
export const sortTasksByImportanceAndDate = (tasks: Task[], calculateTaskDate: (task: Task) => Date | null) => {
  return [...tasks].sort((a, b) => {
    // First sort by importance
    if (a.important && !b.important) return -1
    if (!a.important && b.important) return 1
    
    // Then sort by date
    const dateA = calculateTaskDate(a)
    const dateB = calculateTaskDate(b)
    if (!dateA || !dateB) return 0
    return dateA.getTime() - dateB.getTime()
  })
}

/**
 * Sort tasks by completion status, then by date
 */
export const sortTasksByCompletionAndDate = (tasks: Task[], calculateTaskDate: (task: Task) => Date | null) => {
  return [...tasks].sort((a, b) => {
    // First sort by completion status (incomplete first)
    if (!a.completed && b.completed) return -1
    if (a.completed && !b.completed) return 1
    
    // Then sort by date
    const dateA = calculateTaskDate(a)
    const dateB = calculateTaskDate(b)
    if (!dateA || !dateB) return 0
    return dateA.getTime() - dateB.getTime()
  })
}

/**
 * Group tasks by date
 */
export const groupTasksByDate = (tasks: Task[], calculateTaskDate: (task: Task) => Date | null) => {
  const taskGroups: Record<string, Task[]> = {}

  tasks.forEach((task) => {
    const taskDate = calculateTaskDate(task)
    if (!taskDate) return

    const dateKey = taskDate.toISOString().split("T")[0]
    if (!taskGroups[dateKey]) {
      taskGroups[dateKey] = []
    }
    taskGroups[dateKey].push(task)
  })

  return taskGroups
} 
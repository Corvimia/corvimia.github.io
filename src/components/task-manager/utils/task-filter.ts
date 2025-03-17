import { Task } from "@/hooks/use-tasks"

/**
 * Filter tasks that are within the visible date range
 */
export const filterTasksByDateRange = (
  tasks: Task[], 
  calculateTaskDate: (task: Task) => Date | null, 
  start: Date, 
  end: Date
) => {
  return tasks.filter((task) => {
    const taskDate = calculateTaskDate(task)
    if (!taskDate) return false

    return taskDate >= start && taskDate <= end
  })
}

/**
 * Filter tasks by completion status
 */
export const filterTasksByCompletion = (tasks: Task[], showCompleted: boolean) => {
  return tasks.filter((task) => showCompleted || !task.completed)
}

/**
 * Filter tasks by importance
 */
export const filterTasksByImportance = (tasks: Task[], onlyImportant: boolean) => {
  return onlyImportant ? tasks.filter(task => task.important) : tasks
}

/**
 * Filter tasks by search term (searches in title and description)
 */
export const filterTasksBySearchTerm = (tasks: Task[], searchTerm: string) => {
  if (!searchTerm) return tasks
  
  const lowerCaseSearch = searchTerm.toLowerCase()
  return tasks.filter(
    task => 
      task.title.toLowerCase().includes(lowerCaseSearch) || 
      task.description.toLowerCase().includes(lowerCaseSearch)
  )
}

/**
 * Filter tasks by dependency (tasks that depend on a specific task)
 */
export const filterTasksByDependency = (tasks: Task[], dependencyId: string) => {
  return tasks.filter(task => task.dependencies?.includes(dependencyId))
}

/**
 * Filter tasks that have dependencies
 */
export const filterTasksWithDependencies = (tasks: Task[]) => {
  return tasks.filter(task => task.dependencies && task.dependencies.length > 0)
}

/**
 * Check if a task is related to another task (either as a dependency or dependent)
 */
export const isTaskRelatedTo = (
  task: Task, 
  relatedTaskId: string, 
  tasks: Task[]
) => {
  // The task itself is related
  if (task.id === relatedTaskId) return true
  
  // The task depends on the related task
  if (task.dependencies?.includes(relatedTaskId)) return true
  
  // The related task depends on this task
  const relatedTask = tasks.find(t => t.id === relatedTaskId)
  if (relatedTask?.dependencies?.includes(task.id)) return true
  
  return false
} 
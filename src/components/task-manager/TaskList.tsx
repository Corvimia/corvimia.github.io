"use client"

import { Task } from "@/hooks/use-tasks"
import { TaskItem } from "./TaskItem"

interface TaskListProps {
  tasks: Task[]
  getRelativeTimeString: (task: Task) => string
  calculateTaskDate: (task: Task) => Date | null
  getDependencyNames: (task: Task) => string
  toggleTaskCompletion: (id: string) => void
  toggleTaskImportance: (id: string) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (id: string) => void
}

export function TaskList({
  tasks,
  getRelativeTimeString,
  calculateTaskDate,
  getDependencyNames,
  toggleTaskCompletion,
  toggleTaskImportance,
  onEditTask,
  onDeleteTask,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No tasks yet. Click "Add Task" to create your first task, "Import CSV" to bulk import tasks, or "Load Test
        Data" to add sample tasks.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          getRelativeTimeString={getRelativeTimeString}
          calculateTaskDate={calculateTaskDate}
          getDependencyNames={getDependencyNames}
          toggleTaskCompletion={toggleTaskCompletion}
          toggleTaskImportance={toggleTaskImportance}
          onEdit={onEditTask}
          onDelete={onDeleteTask}
        />
      ))}
    </div>
  )
} 
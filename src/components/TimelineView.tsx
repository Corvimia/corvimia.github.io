"use client"

import { format, parseISO, isSameDay, isToday } from "date-fns"
import { Link, Star } from "lucide-react"
import { Task } from "@/hooks/use-tasks"
import { groupTasksByDate } from "./task-manager/utils/task-sort"

interface TimelineViewProps {
  tasks: Task[]
  eventDate: string | null
  calculateTaskDate: (task: Task) => Date | null
  getRelativeTimeString: (task: Task) => string
  getDependencyNames: (task: Task) => string
  toggleTaskCompletion: (id: string) => void
  toggleTaskImportance: (id: string) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (id: string) => void
}

export function TimelineView({
  tasks,
  eventDate,
  calculateTaskDate,
  getRelativeTimeString,
  getDependencyNames,
  toggleTaskCompletion,
  toggleTaskImportance,
  onEditTask,
  onDeleteTask,
}: TimelineViewProps) {
  // Filter visible tasks and sort them by date
  const visibleTasks = tasks
    .filter((task) => calculateTaskDate(task) !== null)
    .sort((a, b) => {
      const dateA = calculateTaskDate(a)
      const dateB = calculateTaskDate(b)
      if (!dateA || !dateB) return 0
      return dateA.getTime() - dateB.getTime()
    })

  if (visibleTasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No tasks found on the current timeline view. Try adjusting the timeline or adding tasks.
      </div>
    )
  }

  // Group tasks by date for display
  const taskGroups = groupTasksByDate(visibleTasks, calculateTaskDate)

  return (
    <div className="space-y-8">
      {Object.entries(taskGroups).map(([dateStr, tasksForDate]) => {
        const date = parseISO(dateStr)

        return (
          <div key={dateStr} className="border-l-2 pl-4 pb-8 relative">
            <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-primary"></div>
            <h3 className="font-bold mb-2">
              {format(date, "EEEE, MMMM d, yyyy")}
              {isToday(date) && <span className="ml-2 text-blue-500">(Today)</span>}
              {eventDate && isSameDay(parseISO(eventDate), date) && (
                <span className="ml-2 text-amber-500">(Event Day)</span>
              )}
            </h3>
            <div className="space-y-2">
              {tasksForDate.map((task) => (
                <div key={task.id} className={`p-3 rounded-md ${task.completed ? "bg-muted/50" : "bg-card"} border`}>
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTaskCompletion(task.id)}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                          {task.title}
                        </h4>
                        {task.important && <Star className="ml-2 h-4 w-4 text-amber-400 fill-amber-400" />}
                        {task.dependencies && task.dependencies.length > 0 && (
                          <Link className="ml-2 h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                      {task.dateType === "relative" && (
                        <div className="text-xs text-muted-foreground mt-1">{getRelativeTimeString(task)}</div>
                      )}
                      {task.dependencies && task.dependencies.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1 flex items-center">
                          <Link className="h-3 w-3 mr-1" />
                          <span>Dependencies: {getDependencyNames(task)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <button
                        className={`p-1 rounded-sm ${task.important ? "text-amber-400" : "text-gray-400"}`}
                        onClick={() => toggleTaskImportance(task.id)}
                      >
                        <Star className={`h-4 w-4 ${task.important ? "fill-amber-400" : ""}`} />
                      </button>
                      <button
                        className="p-1 rounded-sm text-gray-400"
                        onClick={() => onEditTask(task)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="p-1 rounded-sm text-gray-400"
                        onClick={() => onDeleteTask(task.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
} 
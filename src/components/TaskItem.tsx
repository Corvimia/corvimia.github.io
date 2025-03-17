"use client"

import { format, parseISO } from "date-fns"
import { Star, Edit, Trash2, Calendar, Clock, Link } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Task } from "@/hooks/use-tasks"

interface TaskItemProps {
  task: Task
  getRelativeTimeString: (task: Task) => string
  calculateTaskDate: (task: Task) => Date | null
  getDependencyNames: (task: Task) => string
  toggleTaskCompletion: (id: string) => void
  toggleTaskImportance: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

export function TaskItem({
  task,
  getRelativeTimeString,
  calculateTaskDate,
  getDependencyNames,
  toggleTaskCompletion,
  toggleTaskImportance,
  onEdit,
  onDelete,
}: TaskItemProps) {
  return (
    <Card key={task.id} className={`${task.completed ? "bg-muted/50" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTaskCompletion(task.id)}
              className="mt-1"
            />
            <div>
              <div className="flex items-center">
                <h3 className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                  {task.title}
                </h3>
                {task.important && <Star className="ml-2 h-4 w-4 text-amber-400 fill-amber-400" />}
                {task.dependencies && task.dependencies.length > 0 && (
                  <Link className="ml-2 h-4 w-4 text-gray-400" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">{task.description}</p>
              <div className="flex items-center mt-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                <span>
                  {task.dateType === "absolute"
                    ? format(parseISO(task.date), "MMM d, yyyy")
                    : getRelativeTimeString(task)}
                </span>
                {task.dateType === "relative" && (
                  <>
                    <Clock className="h-3 w-3 ml-3 mr-1" />
                    <span>{format(calculateTaskDate(task)!, "MMM d, yyyy")}</span>
                  </>
                )}
              </div>
              {task.dependencies && task.dependencies.length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center">
                    <Link className="h-3 w-3 mr-1" />
                    Dependencies: {getDependencyNames(task)}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleTaskImportance(task.id)}
              className={task.important ? "text-amber-400" : ""}
            >
              <Star className={`h-4 w-4 ${task.important ? "fill-amber-400" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onEdit(task)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(task.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 
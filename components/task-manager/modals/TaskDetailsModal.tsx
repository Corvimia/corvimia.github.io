"use client"

import { format, parseISO } from "date-fns"
import { CalendarClock, CheckCircle2, CircleDashed, Clock, Star } from "lucide-react"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Task } from "@/hooks/use-tasks"

interface TaskDetailsModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  getTaskById: (id: string) => Task | undefined
  calculateTaskDate: (task: Task) => Date | null
  getRelativeTimeString: (task: Task) => string
}

export function TaskDetailsModal({
  task,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  getTaskById,
  calculateTaskDate,
  getRelativeTimeString
}: TaskDetailsModalProps) {
  if (!task) return null
  
  const taskDate = calculateTaskDate(task)
  const dateString = taskDate ? format(taskDate, "PPP") : "No date set"
  const relativeTimeString = getRelativeTimeString(task)

  // Get dependency names for the task
  const getDependencyNames = () => {
    if (!task.dependencies || task.dependencies.length === 0) {
      return "None"
    }

    return task.dependencies
      .map((depId) => {
        const depTask = getTaskById(depId)
        return depTask ? depTask.title : "Unknown task"
      })
      .join(", ")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {task.completed ? (
              <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
            ) : (
              <CircleDashed className="mr-2 h-5 w-5" />
            )}
            <span className="mr-2">{task.title}</span>
            {task.important && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 my-4">
          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
            <p className="text-sm">{task.description || "No description provided"}</p>
          </div>

          {/* Date Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                <CalendarClock className="mr-1 h-4 w-4" /> Date
              </h3>
              <p className="text-sm">{dateString}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                <Clock className="mr-1 h-4 w-4" /> Relative Time
              </h3>
              <p className="text-sm">{relativeTimeString}</p>
            </div>
          </div>

          {/* Dependencies */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Dependencies</h3>
            <p className="text-sm">{getDependencyNames()}</p>
          </div>

          {/* Date Type */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Date Type</h3>
            <p className="text-sm capitalize">{task.dateType}</p>
            {task.dateType === "absolute" && (
              <p className="text-xs text-muted-foreground mt-1">
                Set to: {task.date ? format(parseISO(task.date), "PPP") : "No date"}
              </p>
            )}
            {task.dateType === "relative" && (
              <p className="text-xs text-muted-foreground mt-1">
                {task.relativeValue} {task.relativeUnit}{task.relativeValue !== 1 ? "s" : ""} {task.relativeDirection} {task.relativeTo === "event" ? "the event" : "now"}
              </p>
            )}
          </div>

          {/* Properties */}
          <div className="flex space-x-4 text-sm">
            <div>
              <span className="font-medium">Status:</span>{" "}
              {task.completed ? "Completed" : "Pending"}
            </div>
            <div>
              <span className="font-medium">Priority:</span>{" "}
              {task.important ? "Important" : "Normal"}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-end space-x-2">
          <Button 
            variant="destructive" 
            onClick={() => {
              onDelete(task.id)
              onClose()
            }}
          >
            Delete
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              onClose()
            }}
          >
            Close
          </Button>
          <Button 
            onClick={() => {
              onEdit(task)
              onClose()
            }}
          >
            Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 
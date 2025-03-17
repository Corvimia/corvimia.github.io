"use client"

import { format, parseISO } from "date-fns"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Task } from "@/hooks/use-tasks"

interface DependencySelectorProps {
  tasks: Task[]
  selectedTaskIds: string[]
  onDependencyChange: (taskId: string, checked: boolean) => void
  getRelativeTimeString: (task: Task) => string
}

export function DependencySelector({ 
  tasks, 
  selectedTaskIds, 
  onDependencyChange,
  getRelativeTimeString
}: DependencySelectorProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-2">
        No existing tasks to select as dependencies.
      </div>
    )
  }

  return (
    <div className="max-h-40 overflow-y-auto border rounded-md p-2">
      <div className="text-sm text-muted-foreground mb-2">
        Select tasks that must be completed before this task:
      </div>
      <div className="space-y-2">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-start space-x-2">
            <Checkbox
              id={`dep-${task.id}`}
              checked={selectedTaskIds.includes(task.id)}
              onCheckedChange={(checked) => onDependencyChange(task.id, checked === true)}
            />
            <Label
              htmlFor={`dep-${task.id}`}
              className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {task.title}
              <div className="text-xs text-muted-foreground">
                {task.dateType === "absolute"
                  ? format(parseISO(task.date), "MMM d, yyyy")
                  : getRelativeTimeString(task)}
              </div>
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
} 
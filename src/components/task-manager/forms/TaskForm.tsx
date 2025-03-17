"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Task } from "@/hooks/use-tasks"
import { DependencySelector } from "./DependencySelector"

interface TaskFormProps {
  existingTask?: Task
  allTasks: Task[]
  eventDate: string | null
  getRelativeTimeString: (task: Task) => string
  onSubmit: (task: Omit<Task, "id" | "completed"> | Task) => void
  onCancel: () => void
}

export function TaskForm({ existingTask, allTasks, eventDate, getRelativeTimeString, onSubmit, onCancel }: TaskFormProps) {
  const [taskData, setTaskData] = useState<Omit<Task, "id" | "completed"> | Task>(
    existingTask || {
      title: "",
      description: "",
      dateType: "absolute",
      date: new Date().toISOString().split("T")[0],
      relativeTime: {
        value: 1,
        unit: "weeks",
        direction: "before",
      },
      important: false,
      dependencies: [],
    }
  )

  // Handle form submission
  const handleSubmit = () => {
    onSubmit(taskData)
  }

  // Handle dependency selection
  const handleDependencyChange = (taskId: string, checked: boolean) => {
    setTaskData((prev) => {
      const currentDeps = prev.dependencies || []
      if (checked) {
        return { ...prev, dependencies: [...currentDeps, taskId] }
      } else {
        return { ...prev, dependencies: currentDeps.filter((id) => id !== taskId) }
      }
    })
  }

  // Filter out the current task from available dependencies to prevent self-dependency
  const availableDependencyTasks = existingTask 
    ? allTasks.filter(task => task.id !== existingTask.id) 
    : allTasks

  return (
    <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
      <div className="space-y-2">
        <Label htmlFor="taskTitle">Task Title</Label>
        <Input
          id="taskTitle"
          placeholder="Enter task title"
          value={taskData.title}
          onChange={(e) => setTaskData((prev) => ({ ...prev, title: e.target.value }))}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="taskDescription">Description</Label>
        <Input
          id="taskDescription"
          placeholder="Enter task description"
          value={taskData.description}
          onChange={(e) => setTaskData((prev) => ({ ...prev, description: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label>Date Type</Label>
        <RadioGroup
          value={taskData.dateType}
          onValueChange={(value: "absolute" | "relative") =>
            setTaskData((prev) => ({ ...prev, dateType: value }))
          }
          className="flex flex-col space-y-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="absolute" id="date-absolute" />
            <Label htmlFor="date-absolute">Specific Date</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="relative" id="date-relative" disabled={!eventDate} />
            <Label htmlFor="date-relative">Relative to Event {!eventDate && "(Set event date first)"}</Label>
          </div>
        </RadioGroup>
      </div>

      {taskData.dateType === "absolute" ? (
        <div className="space-y-2">
          <Label htmlFor="taskDate">Task Date</Label>
          <Input
            id="taskDate"
            type="date"
            value={typeof taskData.date === 'string' ? taskData.date.split("T")[0] : taskData.date}
            onChange={(e) => setTaskData((prev) => ({ ...prev, date: e.target.value }))}
          />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-2">
            <Label htmlFor="timeValue">Time</Label>
            <Input
              id="timeValue"
              type="number"
              min="1"
              value={taskData.relativeTime?.value}
              onChange={(e) =>
                setTaskData((prev) => ({
                  ...prev,
                  relativeTime: {
                    ...prev.relativeTime!,
                    value: Number.parseInt(e.target.value) || 1,
                  },
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeUnit">Unit</Label>
            <Select
              value={taskData.relativeTime?.unit}
              onValueChange={(value: "days" | "weeks" | "months") =>
                setTaskData((prev) => ({
                  ...prev,
                  relativeTime: {
                    ...prev.relativeTime!,
                    unit: value,
                  },
                }))
              }
            >
              <SelectTrigger id="timeUnit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="days">Days</SelectItem>
                <SelectItem value="weeks">Weeks</SelectItem>
                <SelectItem value="months">Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeDirection">Direction</Label>
            <Select
              value={taskData.relativeTime?.direction}
              onValueChange={(value: "before" | "after") =>
                setTaskData((prev) => ({
                  ...prev,
                  relativeTime: {
                    ...prev.relativeTime!,
                    direction: value,
                  },
                }))
              }
            >
              <SelectTrigger id="timeDirection">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="before">Before</SelectItem>
                <SelectItem value="after">After</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Dependencies section */}
      <div className="space-y-2 border-t pt-4 mt-4">
        <Label>Dependencies</Label>
        <DependencySelector
          tasks={availableDependencyTasks}
          selectedTaskIds={taskData.dependencies || []}
          onDependencyChange={handleDependencyChange}
          getRelativeTimeString={getRelativeTimeString}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="taskImportant"
          checked={taskData.important}
          onCheckedChange={(checked) => setTaskData((prev) => ({ ...prev, important: checked === true }))}
        />
        <Label htmlFor="taskImportant">Mark as important</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!taskData.title}>
          {existingTask ? "Update Task" : "Add Task"}
        </Button>
      </div>
    </div>
  )
} 
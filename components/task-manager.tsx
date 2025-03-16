"use client"

import { useState } from "react"
import { format, parseISO, isToday, isSameDay, addDays } from "date-fns"
import { Calendar, Clock, Plus, Edit, Trash2, Star, Upload, Link, Download, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { useTimeline } from "@/hooks/use-timeline"
import { useTasks, type Task } from "@/hooks/use-tasks"
import { CsvImportDialog } from "./csv-import-dialog"
import { exportTasksToCSV } from "@/utils/csv-utils"
import { generateTestData } from "@/utils/test-data"
import { useToast } from "@/components/ui/use-toast"

export function TaskManager() {
  const { eventDate, visibleRange, getTimelineDates, setEventDate, setEventTitle } = useTimeline()
  const {
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
  } = useTasks()

  const [newTask, setNewTask] = useState<Omit<Task, "id" | "completed">>({
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
  })

  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false)

  const timelineDates = getTimelineDates()
  const tasksByDate = getTasksByDate()

  const { toast } = useToast()

  const handleAddTask = () => {
    addTask(newTask)

    setNewTask({
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
    })

    setIsAddDialogOpen(false)
  }

  const handleUpdateTask = () => {
    if (!editingTask) return
    updateTask(editingTask)
    setEditingTask(null)
    setIsEditDialogOpen(false)
  }

  // Export tasks to CSV
  const handleExportCSV = async () => {
    const csv = exportTasksToCSV(tasks, getTaskById)

    try {
      await navigator.clipboard.writeText(csv)
      toast({
        title: "Exported to clipboard",
        description: "Task data has been copied to your clipboard as CSV",
        duration: 3000,
      })
    } catch (err) {
      toast({
        title: "Export failed",
        description: "Could not copy to clipboard. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
      console.error(err)
    }
  }

  // Load test data
  const handleLoadTestData = () => {
    // Set event date to 60 days from now
    const eventDateObj = addDays(new Date(), 60)
    setEventDate(eventDateObj.toISOString().split("T")[0])
    setEventTitle("Product Launch")

    // Generate and add test tasks
    const testTasks = generateTestData(eventDateObj)
    addTasks(testTasks)
  }

  // Get tasks that fall within the visible range
  const getVisibleTasks = () => {
    return tasks
      .filter((task) => {
        const taskDate = calculateTaskDate(task)
        if (!taskDate) return false

        return taskDate >= visibleRange.start && taskDate <= visibleRange.end
      })
      .sort((a, b) => {
        const dateA = calculateTaskDate(a)
        const dateB = calculateTaskDate(b)
        if (!dateA || !dateB) return 0
        return dateA.getTime() - dateB.getTime()
      })
  }

  // Handle dependency selection
  const handleDependencyChange = (taskId: string, checked: boolean, isNewTask = false) => {
    if (isNewTask) {
      setNewTask((prev) => {
        const currentDeps = prev.dependencies || []
        if (checked) {
          return { ...prev, dependencies: [...currentDeps, taskId] }
        } else {
          return { ...prev, dependencies: currentDeps.filter((id) => id !== taskId) }
        }
      })
    } else if (editingTask) {
      setEditingTask((prev) => {
        if (!prev) return prev
        const currentDeps = prev.dependencies || []
        if (checked) {
          return { ...prev, dependencies: [...currentDeps, taskId] }
        } else {
          return { ...prev, dependencies: currentDeps.filter((id) => id !== taskId) }
        }
      })
    }
  }

  // Get dependency names for a task
  const getDependencyNames = (task: Task): string => {
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

  const TimelineViewContent = () => {
    const visibleTasks = getVisibleTasks()

    if (visibleTasks.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No tasks found on the current timeline view. Try adjusting the timeline or adding tasks.
        </div>
      )
    }

    // Group tasks by date for display
    const taskGroups: Record<string, Task[]> = {}

    visibleTasks.forEach((task) => {
      const taskDate = calculateTaskDate(task)
      if (!taskDate) return

      const dateKey = format(taskDate, "yyyy-MM-dd")
      if (!taskGroups[dateKey]) {
        taskGroups[dateKey] = []
      }
      taskGroups[dateKey].push(task)
    })

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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleTaskImportance(task.id)}
                          className={task.important ? "text-amber-400" : ""}
                        >
                          <Star className={`h-4 w-4 ${task.important ? "fill-amber-400" : ""}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingTask(task)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
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

  return (
    <>
      {/* Task Management */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Tasks</h2>
        <div className="flex space-x-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="taskTitle">Task Title</Label>
                  <Input
                    id="taskTitle"
                    placeholder="Enter task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taskDescription">Description</Label>
                  <Input
                    id="taskDescription"
                    placeholder="Enter task description"
                    value={newTask.description}
                    onChange={(e) => setNewTask((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date Type</Label>
                  <RadioGroup
                    value={newTask.dateType}
                    onValueChange={(value: "absolute" | "relative") =>
                      setNewTask((prev) => ({ ...prev, dateType: value }))
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

                {newTask.dateType === "absolute" ? (
                  <div className="space-y-2">
                    <Label htmlFor="taskDate">Task Date</Label>
                    <Input
                      id="taskDate"
                      type="date"
                      value={newTask.date}
                      onChange={(e) => setNewTask((prev) => ({ ...prev, date: e.target.value }))}
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
                        value={newTask.relativeTime?.value}
                        onChange={(e) =>
                          setNewTask((prev) => ({
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
                        value={newTask.relativeTime?.unit}
                        onValueChange={(value: "days" | "weeks" | "months") =>
                          setNewTask((prev) => ({
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
                        value={newTask.relativeTime?.direction}
                        onValueChange={(value: "before" | "after") =>
                          setNewTask((prev) => ({
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
                  <div className="text-sm text-muted-foreground mb-2">
                    Select tasks that must be completed before this task:
                  </div>
                  <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                    {tasks.length === 0 ? (
                      <div className="text-sm text-muted-foreground py-2">
                        No existing tasks to select as dependencies.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {tasks.map((task) => (
                          <div key={task.id} className="flex items-start space-x-2">
                            <Checkbox
                              id={`dep-${task.id}`}
                              checked={newTask.dependencies?.includes(task.id)}
                              onCheckedChange={(checked) => handleDependencyChange(task.id, checked === true, true)}
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
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="taskImportant"
                    checked={newTask.important}
                    onCheckedChange={(checked) => setNewTask((prev) => ({ ...prev, important: checked === true }))}
                  />
                  <Label htmlFor="taskImportant">Mark as important</Label>
                </div>
                <Button onClick={handleAddTask} disabled={!newTask.title}>
                  Add Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCsvImportOpen} onOpenChange={setIsCsvImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" /> Import CSV
              </Button>
            </DialogTrigger>
            <CsvImportDialog
              onImport={(tasks) => {
                addTasks(tasks)
                setIsCsvImportOpen(false)
              }}
            />
          </Dialog>

          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>

          {tasks.length === 0 && (
            <Button variant="secondary" onClick={handleLoadTestData}>
              <Database className="mr-2 h-4 w-4" /> Load Test Data
            </Button>
          )}
        </div>
      </div>

      {/* Task List */}
      <Tabs defaultValue="list">
        <TabsList className="mb-4">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          {tasks.length > 0 ? (
            <div className="space-y-4">
              {getAllTasksSorted().map((task) => (
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
                            {task.dateType === "relative" && eventDate && (
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
                        <Dialog
                          open={isEditDialogOpen && editingTask?.id === task.id}
                          onOpenChange={(open) => {
                            setIsEditDialogOpen(open)
                            if (!open) setEditingTask(null)
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setEditingTask(task)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Edit Task</DialogTitle>
                            </DialogHeader>
                            {editingTask && (
                              <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
                                <div className="space-y-2">
                                  <Label htmlFor="editTaskTitle">Task Title</Label>
                                  <Input
                                    id="editTaskTitle"
                                    value={editingTask.title}
                                    onChange={(e) =>
                                      setEditingTask((prev) => (prev ? { ...prev, title: e.target.value } : null))
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="editTaskDescription">Description</Label>
                                  <Input
                                    id="editTaskDescription"
                                    value={editingTask.description}
                                    onChange={(e) =>
                                      setEditingTask((prev) => (prev ? { ...prev, description: e.target.value } : null))
                                    }
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>Date Type</Label>
                                  <RadioGroup
                                    value={editingTask.dateType}
                                    onValueChange={(value: "absolute" | "relative") =>
                                      setEditingTask((prev) => (prev ? { ...prev, dateType: value } : null))
                                    }
                                    className="flex flex-col space-y-1"
                                  >
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="absolute" id="edit-date-absolute" />
                                      <Label htmlFor="edit-date-absolute">Specific Date</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="relative" id="edit-date-relative" disabled={!eventDate} />
                                      <Label htmlFor="edit-date-relative">
                                        Relative to Event {!eventDate && "(Set event date first)"}
                                      </Label>
                                    </div>
                                  </RadioGroup>
                                </div>

                                {editingTask.dateType === "absolute" ? (
                                  <div className="space-y-2">
                                    <Label htmlFor="editTaskDate">Task Date</Label>
                                    <Input
                                      id="editTaskDate"
                                      type="date"
                                      value={editingTask.date.split("T")[0]}
                                      onChange={(e) =>
                                        setEditingTask((prev) => (prev ? { ...prev, date: e.target.value } : null))
                                      }
                                    />
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-3 gap-2">
                                    <div className="space-y-2">
                                      <Label htmlFor="editTimeValue">Time</Label>
                                      <Input
                                        id="editTimeValue"
                                        type="number"
                                        min="1"
                                        value={editingTask.relativeTime?.value}
                                        onChange={(e) =>
                                          setEditingTask((prev) =>
                                            prev
                                              ? {
                                                  ...prev,
                                                  relativeTime: {
                                                    ...prev.relativeTime!,
                                                    value: Number.parseInt(e.target.value) || 1,
                                                  },
                                                }
                                              : null,
                                          )
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="editTimeUnit">Unit</Label>
                                      <Select
                                        value={editingTask.relativeTime?.unit}
                                        onValueChange={(value: "days" | "weeks" | "months") =>
                                          setEditingTask((prev) =>
                                            prev
                                              ? {
                                                  ...prev,
                                                  relativeTime: {
                                                    ...prev.relativeTime!,
                                                    unit: value,
                                                  },
                                                }
                                              : null,
                                          )
                                        }
                                      >
                                        <SelectTrigger id="editTimeUnit">
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
                                      <Label htmlFor="editTimeDirection">Direction</Label>
                                      <Select
                                        value={editingTask.relativeTime?.direction}
                                        onValueChange={(value: "before" | "after") =>
                                          setEditingTask((prev) =>
                                            prev
                                              ? {
                                                  ...prev,
                                                  relativeTime: {
                                                    ...prev.relativeTime!,
                                                    direction: value,
                                                  },
                                                }
                                              : null,
                                          )
                                        }
                                      >
                                        <SelectTrigger id="editTimeDirection">
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

                                {/* Dependencies section for edit */}
                                <div className="space-y-2 border-t pt-4 mt-4">
                                  <Label>Dependencies</Label>
                                  <div className="text-sm text-muted-foreground mb-2">
                                    Select tasks that must be completed before this task:
                                  </div>
                                  <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                                    {tasks.filter((t) => t.id !== editingTask.id).length === 0 ? (
                                      <div className="text-sm text-muted-foreground py-2">
                                        No other tasks to select as dependencies.
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        {tasks
                                          .filter((t) => t.id !== editingTask.id)
                                          .map((task) => (
                                            <div key={task.id} className="flex items-start space-x-2">
                                              <Checkbox
                                                id={`edit-dep-${task.id}`}
                                                checked={editingTask.dependencies?.includes(task.id)}
                                                onCheckedChange={(checked) =>
                                                  handleDependencyChange(task.id, checked === true)
                                                }
                                              />
                                              <Label
                                                htmlFor={`edit-dep-${task.id}`}
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
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="editTaskImportant"
                                    checked={editingTask.important}
                                    onCheckedChange={(checked) =>
                                      setEditingTask((prev) => (prev ? { ...prev, important: checked === true } : null))
                                    }
                                  />
                                  <Label htmlFor="editTaskImportant">Mark as important</Label>
                                </div>
                                <Button onClick={handleUpdateTask}>Update Task</Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No tasks yet. Click "Add Task" to create your first task, "Import CSV" to bulk import tasks, or "Load Test
              Data" to add sample tasks.
            </div>
          )}
        </TabsContent>

        <TabsContent value="timeline">
          <TimelineViewContent />
        </TabsContent>
      </Tabs>
    </>
  )
}


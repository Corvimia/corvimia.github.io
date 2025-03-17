"use client"

import { useState } from "react"
import { addDays } from "date-fns"
import { Plus, Upload, Download, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTimeline } from "@/hooks/use-timeline"
import { useTasks, type Task } from "@/hooks/use-tasks"
import { CsvImportDialog } from "./common/csv-import-dialog"
import { exportTasksToCSV } from "@/utils/csv-utils"
import { generateTestData } from "@/utils/test-data"
import { useToast } from "@/hooks/use-toast"
import { TaskList } from "./TaskList"
import { TimelineView } from "./TimelineView"
import { TaskForm } from "./task-manager/forms/TaskForm"
import { sortTasksByCompletionAndDate } from "./task-manager/utils/task-sort"
import { filterTasksByDateRange } from "./task-manager/utils/task-filter"

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

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false)

  const timelineDates = getTimelineDates()
  const { toast } = useToast()

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

  // Handle adding a new task
  const handleAddTask = (newTask: Omit<Task, "id" | "completed">) => {
    addTask(newTask)
    setIsAddDialogOpen(false)
  }

  // Handle updating an existing task
  const handleUpdateTask = (updatedTask: Task | Omit<Task, "id" | "completed">) => {
    if ('id' in updatedTask) {
      updateTask(updatedTask as Task)
    }
    setEditingTask(null)
    setIsEditDialogOpen(false)
  }

  // Handle task edit button click
  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsEditDialogOpen(true)
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
    return filterTasksByDateRange(tasks, calculateTaskDate, visibleRange.start, visibleRange.end)
  }

  // Sort tasks by completion and date
  const sortedTasks = getAllTasksSorted()

  return (
    <>
      {/* Task Management Header */}
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
              <TaskForm 
                allTasks={tasks}
                eventDate={eventDate}
                getRelativeTimeString={getRelativeTimeString}
                onSubmit={handleAddTask}
                onCancel={() => setIsAddDialogOpen(false)}
              />
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

      {/* Edit Task Dialog */}
      <Dialog 
        open={isEditDialogOpen} 
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) setEditingTask(null)
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <TaskForm 
              existingTask={editingTask}
              allTasks={tasks}
              eventDate={eventDate}
              getRelativeTimeString={getRelativeTimeString}
              onSubmit={handleUpdateTask}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setEditingTask(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Task Views */}
      <Tabs defaultValue="list">
        <TabsList className="mb-4">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <TaskList
            tasks={sortedTasks}
            getRelativeTimeString={getRelativeTimeString}
            calculateTaskDate={calculateTaskDate}
            getDependencyNames={getDependencyNames}
            toggleTaskCompletion={toggleTaskCompletion}
            toggleTaskImportance={toggleTaskImportance}
            onEditTask={handleEditTask}
            onDeleteTask={deleteTask}
          />
        </TabsContent>

        <TabsContent value="timeline">
          <TimelineView
            tasks={getVisibleTasks()}
            eventDate={eventDate}
            calculateTaskDate={calculateTaskDate}
            getRelativeTimeString={getRelativeTimeString}
            getDependencyNames={getDependencyNames}
            toggleTaskCompletion={toggleTaskCompletion}
            toggleTaskImportance={toggleTaskImportance}
            onEditTask={handleEditTask}
            onDeleteTask={deleteTask}
          />
        </TabsContent>
      </Tabs>
    </>
  )
} 
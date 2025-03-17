"use client"

import { useState, useRef, useEffect } from "react"
import { Calendar, format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useTimeline } from "@/hooks/use-timeline"
import { useTasks, type Task } from "@/hooks/use-tasks"

import { TimelineControls } from "./TimelineControls"
import { TimelineHeader } from "./TimelineHeader"
import { EventNode } from "./EventNode"
import { TaskNode } from "./TaskNode"
import { VerticalLines } from "./VerticalLines"
import { DependencyLines } from "./DependencyLines"
import { 
  processTaskNodes, 
  findMaxLevel, 
  calculateTimelineHeight,
  TaskNode as TaskNodeType
} from "./utils/node-layout"

export function Timeline() {
  const {
    zoomLevel,
    eventDate,
    eventTitle,
    visibleRange,
    getTimelineDates,
    shiftTimelineLeft,
    shiftTimelineRight,
    handleZoomIn,
    handleZoomOut,
    resetTimelineView,
  } = useTimeline()

  const { tasks, getTasksByDate, calculateTaskDate, getTaskById } = useTasks()
  
  const [timelineWidth, setTimelineWidth] = useState(0)
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const timelineRef = useRef<HTMLDivElement>(null)
  const timelineDates = getTimelineDates()
  const hasEventDate = Boolean(eventDate)

  // Update timeline width when component mounts or window resizes
  useEffect(() => {
    const updateWidth = () => {
      if (timelineRef.current) {
        setTimelineWidth(timelineRef.current.offsetWidth)
      }
    }

    updateWidth()
    window.addEventListener("resize", updateWidth)

    return () => {
      window.removeEventListener("resize", updateWidth)
    }
  }, [])

  // Get all tasks that fall within the visible range
  const getVisibleTasks = () => {
    return tasks.filter((task) => {
      const taskDate = calculateTaskDate(task)
      if (!taskDate) return false

      return taskDate >= visibleRange.start && taskDate <= visibleRange.end
    })
  }

  const visibleTasks = getVisibleTasks()

  // Check if a task is related to the selected task
  const isRelatedToSelected = (taskId: string) => {
    if (!selectedTaskId) return true // If no task is selected, all tasks are "related"
    if (taskId === selectedTaskId) return true // The selected task itself is related

    const selectedTask = getTaskById(selectedTaskId)
    if (!selectedTask) return false

    // Check if this task is a dependency of the selected task
    if (selectedTask.dependencies?.includes(taskId)) return true

    // Check if the selected task is a dependency of this task
    const task = getTaskById(taskId)
    if (task?.dependencies?.includes(selectedTaskId)) return true

    return false
  }

  // Process tasks into nodes for the timeline
  const processedNodes = processTaskNodes(
    visibleTasks,
    calculateTaskDate,
    visibleRange,
    timelineWidth,
    eventDate,
    eventTitle || "Event"
  )

  // Calculate maximum level and timeline height
  const maxLevel = findMaxLevel(processedNodes)
  const timelineHeight = calculateTimelineHeight(maxLevel)

  // Handle task click
  const handleTaskClick = (taskId: string) => {
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null) // Deselect if already selected
    } else {
      setSelectedTaskId(taskId) // Select the clicked task
    }
  }

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Timeline</CardTitle>
        <TimelineControls
          zoomLevel={zoomLevel}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onShiftLeft={shiftTimelineLeft}
          onShiftRight={shiftTimelineRight}
          onReset={resetTimelineView}
        />
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[600px] relative" ref={timelineRef}>
            {/* Timeline header with date labels */}
            <TimelineHeader dates={timelineDates} eventDate={eventDate} />

            {/* Timeline content */}
            <div className="relative" style={{ height: `${timelineHeight}px` }}>
              {/* Horizontal line */}
              <div className="absolute top-4 left-0 right-0 h-px bg-border"></div>

              <TooltipProvider>
                {/* Step 1: Draw vertical lines first, so they're beneath everything else */}
                <VerticalLines
                  nodes={processedNodes}
                  getTaskById={getTaskById}
                />

                {/* Dependency lines */}
                <DependencyLines
                  hoveredTaskId={hoveredTaskId}
                  nodes={processedNodes}
                  getTaskById={getTaskById}
                  visibleRange={visibleRange}
                />

                {/* Step 2: Event node */}
                {processedNodes
                  .filter((node) => node.isEvent)
                  .map((node, index) => (
                    <EventNode key={`event-${index}`} node={node} />
                  ))}

                {/* Step 2: Task nodes (drawn on top of lines) */}
                {processedNodes
                  .filter((node) => node.task && !node.isEvent)
                  .map((node) => (
                    <TaskNode
                      key={node.id}
                      node={node}
                      isHovered={hoveredTaskId === node.id}
                      isSelected={selectedTaskId === node.id}
                      isRelated={isRelatedToSelected(node.id as string)}
                      onMouseEnter={setHoveredTaskId}
                      onMouseLeave={() => setHoveredTaskId(null)}
                      onClick={handleTaskClick}
                      getTasks={() => tasks}
                      getTaskById={getTaskById}
                    />
                  ))}

                {/* Current date line */}
                {visibleRange.start <= new Date() && visibleRange.end >= new Date() && (
                  <div
                    className="absolute h-full w-0.5 bg-indigo-500"
                    style={{
                      left: `${calculateVisiblePercentage(new Date(), visibleRange)}%`,
                      top: "0",
                      bottom: "0",
                      transform: "translateX(-50%)",
                    }}
                  >
                    <div className="absolute top-[-10px] left-1/2 transform -translate-x-1/2">
                      <div className="bg-indigo-500 text-white text-xs px-1 py-0.5 rounded whitespace-nowrap">
                        Today
                      </div>
                    </div>
                  </div>
                )}
              </TooltipProvider>

              {/* Message when no event date is set */}
              {!hasEventDate && (
                <div className="text-center mt-4 text-amber-600 flex items-center justify-center">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Set an event date to see a better timeline view
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to calculate the position percentage for a date in the visible range
function calculateVisiblePercentage(date: Date, visibleRange: { start: Date; end: Date }) {
  if (!visibleRange.start || !visibleRange.end) return 0

  const totalRange = visibleRange.end.getTime() - visibleRange.start.getTime()
  const daysFromStart = date.getTime() - visibleRange.start.getTime()

  // Ensure the percentage is between 0 and 100
  const percentage = Math.max(0, Math.min(100, (daysFromStart / totalRange) * 100))
  return percentage
} 
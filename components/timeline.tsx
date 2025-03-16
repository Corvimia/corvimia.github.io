"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { format, isToday, isSameDay, parseISO, differenceInDays } from "date-fns"
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Calendar, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTimeline } from "@/hooks/use-timeline"
import { useTasks, type Task } from "@/hooks/use-tasks"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Estimate text width based on character count and font size
const estimateTextWidth = (text: string, fontSize = 12) => {
  // Average character width in pixels (approximate)
  const avgCharWidth = fontSize * 0.6
  return text.length * avgCharWidth + 24 // Add padding
}

interface TaskNode {
  task: Task | null // null for event marker
  position: number
  width: number
  level: number
  date: Date
  isEvent?: boolean
  title: string
  id?: string
}

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
  const tasksByDate = getTasksByDate()
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

  // Calculate position for a date as percentage within the visible range
  const calculatePositionPercentage = (date: Date) => {
    if (!visibleRange.start || !visibleRange.end) return 0

    const totalRange = differenceInDays(visibleRange.end, visibleRange.start)
    const daysFromStart = differenceInDays(date, visibleRange.start)

    // Ensure the percentage is between 0 and 100
    const percentage = Math.max(0, Math.min(100, (daysFromStart / totalRange) * 100))
    return percentage
  }

  // Get all tasks that fall within the visible range
  const getVisibleTasks = () => {
    return tasks.filter((task) => {
      const taskDate = calculateTaskDate(task)
      if (!taskDate) return false

      return taskDate >= visibleRange.start && taskDate <= visibleRange.end
    })
  }

  const visibleTasks = getVisibleTasks()
  const eventDateObj = eventDate ? parseISO(eventDate) : null
  const isEventInRange = eventDateObj && eventDateObj >= visibleRange.start && eventDateObj <= visibleRange.end

  // Get dependencies for a task
  const getDependencies = (task: Task) => {
    if (!task.dependencies || task.dependencies.length === 0) return []

    return task.dependencies
      .map((depId) => {
        const depTask = getTaskById(depId)
        if (!depTask) return null

        const depDate = calculateTaskDate(depTask)
        if (!depDate) return null

        return {
          id: depId,
          title: depTask.title,
          date: depDate,
          position: calculatePositionPercentage(depDate),
        }
      })
      .filter(Boolean) as { id: string; title: string; date: Date; position: number }[]
  }

  // Get tasks that depend on the given task
  const getDependentTasks = (taskId: string) => {
    return tasks
      .filter((t) => t.dependencies?.includes(taskId))
      .map((task) => {
        const taskDate = calculateTaskDate(task)
        if (!taskDate) return null

        return {
          id: task.id,
          title: task.title,
          date: taskDate,
          position: calculatePositionPercentage(taskDate),
        }
      })
      .filter(Boolean) as { id: string; title: string; date: Date; position: number }[]
  }

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

  // Process tasks to handle overlaps with a more sophisticated algorithm
  const processedTasks = useMemo(() => {
    if (!timelineWidth) return []

    // Step 1: Create task nodes with position and estimated width
    const taskNodes: TaskNode[] = []

    // Add event marker if it's in range
    if (isEventInRange && eventDateObj) {
      const eventPosition = calculatePositionPercentage(eventDateObj)
      const eventWidth = (estimateTextWidth(eventTitle || "Event") / timelineWidth) * 100

      taskNodes.push({
        task: null, // Not a real task
        position: eventPosition,
        width: eventWidth,
        level: 0, // Start at top level
        date: eventDateObj,
        isEvent: true,
        title: eventTitle || "Event",
        id: "event",
      })
    }

    // Add all visible tasks
    visibleTasks.forEach((task) => {
      const taskDate = calculateTaskDate(task)
      if (!taskDate) return

      const position = calculatePositionPercentage(taskDate)
      const width = (estimateTextWidth(task.title) / timelineWidth) * 100 // Convert to percentage of timeline width

      taskNodes.push({
        task,
        position,
        width,
        level: 0, // Initial level
        date: taskDate,
        title: task.title,
        id: task.id,
      })
    })

    // Step 2: Sort nodes by date
    taskNodes.sort((a, b) => a.date.getTime() - b.date.getTime())

    // Step 3: Assign levels to avoid overlaps
    const assignedNodes: TaskNode[] = []

    taskNodes.forEach((node) => {
      let level = 0
      let overlap = true

      // Find the first level where this node doesn't overlap with any existing node
      while (overlap) {
        overlap = false

        for (const existingNode of assignedNodes) {
          if (existingNode.level !== level) continue

          // Check if nodes would overlap
          const nodeLeft = node.position - node.width / 2
          const nodeRight = node.position + node.width / 2
          const existingLeft = existingNode.position - existingNode.width / 2
          const existingRight = existingNode.position + existingNode.width / 2

          // Add a small buffer to prevent nodes from being too close
          const buffer = 2 // percentage points

          if (
            (nodeLeft >= existingLeft - buffer && nodeLeft <= existingRight + buffer) ||
            (nodeRight >= existingLeft - buffer && nodeRight <= existingRight + buffer) ||
            (nodeLeft <= existingLeft - buffer && nodeRight >= existingRight + buffer)
          ) {
            overlap = true
            break
          }
        }

        if (overlap) {
          level++
        }
      }

      // Assign the level and add to assigned nodes
      node.level = level
      assignedNodes.push(node)
    })

    return assignedNodes
  }, [visibleTasks, visibleRange, timelineWidth, eventDateObj, eventTitle, isEventInRange])

  // Calculate max level from processed tasks - OUTSIDE the useMemo hook
  const maxLevel = useMemo(() => {
    if (processedTasks.length === 0) return 0
    return Math.max(...processedTasks.map((node) => node.level))
  }, [processedTasks])

  // Handle task click
  const handleTaskClick = (taskId: string) => {
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null) // Deselect if already selected
    } else {
      setSelectedTaskId(taskId) // Select the clicked task
    }
  }

  // Calculate timeline height based on max level
  const timelineHeight = Math.max(150, 30 + maxLevel * 40 + 60) // Base height + level height + padding

  // Find the node for a given task ID
  const findNodeById = (id: string) => {
    return processedTasks.find((node) => node.id === id)
  }

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Timeline</CardTitle>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={shiftTimelineLeft}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleZoomIn} disabled={zoomLevel === 1}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleZoomOut} disabled={zoomLevel === 4}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={shiftTimelineRight}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => resetTimelineView()}>
            Reset View
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[800px] relative" ref={timelineRef}>
            {/* Date labels */}
            <div className="flex justify-between mb-2">
              {timelineDates.map((date, index) => (
                <div key={index} className="text-center px-2">
                  <div className="text-sm font-medium">{format(date, "EEE d/M")}</div>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="relative" style={{ height: `${timelineHeight}px` }}>
              {/* Horizontal line */}
              <div className="absolute top-4 left-0 right-0 h-px bg-border"></div>

              {/* Date markers */}
              <div className="flex justify-between relative pt-4">
                {timelineDates.map((date, index) => {
                  const isCurrentDate = isToday(date)
                  const isEventDate = eventDate && isSameDay(parseISO(eventDate), date)

                  return (
                    <div key={index} className="flex flex-col items-center">
                      {/* Vertical line */}
                      <div
                        className={cn(
                          "h-4 w-px bg-border",
                          isCurrentDate && "bg-indigo-500 w-0.5",
                          isEventDate && "bg-amber-500 w-0.5 h-6",
                        )}
                      ></div>

                      {/* Current date marker */}
                      {isCurrentDate && (
                        <div className="absolute top-[-10px]">
                          <div className="bg-indigo-500 text-white text-xs px-1 py-0.5 rounded">Today</div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Task markers (positioned by percentage) */}
              <TooltipProvider>
                {/* Dependency lines (only show when hovering over a task) */}
                {hoveredTaskId &&
                  (() => {
                    const task = getTaskById(hoveredTaskId)
                    if (!task) return null

                    const taskDate = calculateTaskDate(task)
                    if (!taskDate) return null

                    const taskNode = findNodeById(task.id)
                    if (!taskNode) return null

                    const dependencies = getDependencies(task)
                    const dependentTasks = getDependentTasks(task.id)

                    return (
                      <>
                        {/* Lines to dependencies */}
                        {dependencies.map((dep) => {
                          const depNode = findNodeById(dep.id)
                          if (!depNode) return null

                          // Calculate vertical positions based on node levels
                          const sourceY = 4 + taskNode.level * 40 + 20 // Middle of task pill
                          const targetY = 4 + depNode.level * 40 + 20 // Middle of dependency pill

                          return (
                            <div
                              key={`${task.id}-${dep.id}`}
                              className="absolute bg-navy-600"
                              style={{
                                left: `${Math.min(taskNode.position, depNode.position)}%`,
                                top: `${Math.min(sourceY, targetY)}px`,
                                width: `${Math.abs(taskNode.position - depNode.position)}%`,
                                height: `${Math.abs(sourceY - targetY) + 1}px`,
                                zIndex: 5,
                                borderLeft: taskNode.position > depNode.position ? "1px solid" : "none",
                                borderRight: taskNode.position < depNode.position ? "1px solid" : "none",
                                borderTop: sourceY > targetY ? "1px solid" : "none",
                                borderBottom: sourceY < targetY ? "1px solid" : "none",
                                borderColor: "rgb(30, 58, 138)", // navy-600
                              }}
                            >
                              <ArrowRight
                                className="absolute h-3 w-3 text-navy-600"
                                style={{
                                  right: taskNode.position < depNode.position ? "-6px" : "auto",
                                  left: taskNode.position > depNode.position ? "-6px" : "auto",
                                  top: sourceY === targetY ? "-5px" : "auto",
                                  bottom: sourceY < targetY ? "-6px" : "auto",
                                  transform:
                                    taskNode.position < depNode.position
                                      ? "rotate(0deg)"
                                      : sourceY === targetY
                                        ? "rotate(180deg)"
                                        : "rotate(270deg)",
                                }}
                              />
                            </div>
                          )
                        })}

                        {/* Lines from dependent tasks */}
                        {dependentTasks.map((dep) => {
                          const depNode = findNodeById(dep.id)
                          if (!depNode) return null

                          // Calculate vertical positions based on node levels
                          const sourceY = 4 + taskNode.level * 40 + 20 // Middle of task pill
                          const targetY = 4 + depNode.level * 40 + 20 // Middle of dependency pill

                          return (
                            <div
                              key={`dependent-${task.id}-${dep.id}`}
                              className="absolute bg-blue-400"
                              style={{
                                left: `${Math.min(taskNode.position, depNode.position)}%`,
                                top: `${Math.min(sourceY, targetY)}px`,
                                width: `${Math.abs(taskNode.position - depNode.position)}%`,
                                height: `${Math.abs(sourceY - targetY) + 1}px`,
                                zIndex: 5,
                                borderLeft: taskNode.position > depNode.position ? "1px solid" : "none",
                                borderRight: taskNode.position < depNode.position ? "1px solid" : "none",
                                borderTop: sourceY > targetY ? "1px solid" : "none",
                                borderBottom: sourceY < targetY ? "1px solid" : "none",
                                borderColor: "rgb(96, 165, 250)", // blue-400
                              }}
                            >
                              <ArrowRight
                                className="absolute h-3 w-3 text-blue-400"
                                style={{
                                  right: depNode.position < taskNode.position ? "-6px" : "auto",
                                  left: depNode.position > taskNode.position ? "-6px" : "auto",
                                  top: sourceY === targetY ? "-5px" : "auto",
                                  bottom: sourceY < targetY ? "-6px" : "auto",
                                  transform:
                                    depNode.position < taskNode.position
                                      ? "rotate(0deg)"
                                      : sourceY === targetY
                                        ? "rotate(180deg)"
                                        : "rotate(270deg)",
                                }}
                              />
                            </div>
                          )
                        })}
                      </>
                    )
                  })()}

                {/* All nodes (tasks and event) */}
                {processedTasks.map((node, index) => {
                  // Event marker
                  if (node.isEvent) {
                    return (
                      <div
                        key={`event-${index}`}
                        className="absolute"
                        style={{
                          left: `${node.position}%`,
                          top: `${4 + node.level * 40}px`,
                          transform: "translateX(-50%)",
                          zIndex: 15,
                        }}
                      >
                        <div className="flex flex-col items-center">
                          <div className="h-0.5 w-0.5 bg-amber-500"></div>
                          <div className="mt-1 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
                            {node.title}
                          </div>
                        </div>
                      </div>
                    )
                  }

                  // Task marker
                  if (node.task) {
                    const task = node.task
                    const isDependency = tasks.some((t) => t.dependencies?.includes(task.id))
                    const hasDependencies = task.dependencies && task.dependencies.length > 0
                    const isRelated = isRelatedToSelected(task.id)

                    // Determine border color based on dependency relationship
                    let borderColor = ""
                    let borderClass = ""

                    if (isDependency && hasDependencies) {
                      borderColor = "border-purple-500" // Both a dependency and has dependencies
                      borderClass = "border-2"
                    } else if (isDependency) {
                      borderColor = "border-blue-400" // Is a dependency of other tasks
                      borderClass = "border-2"
                    } else if (hasDependencies) {
                      borderColor = "border-navy-600" // Has dependencies
                      borderClass = "border-2"
                    }

                    // Calculate opacity based on selection state
                    const opacity = selectedTaskId && !isRelated ? "opacity-30" : "opacity-100"

                    return (
                      <Tooltip key={task.id}>
                        <TooltipTrigger asChild>
                          <div
                            className={`absolute cursor-pointer transition-opacity duration-200 ${opacity}`}
                            style={{
                              left: `${node.position}%`,
                              top: `${4 + node.level * 40}px`, // Offset vertically based on level
                              transform: "translateX(-50%)",
                              zIndex: hoveredTaskId === task.id ? 20 : 15,
                            }}
                            onMouseEnter={() => setHoveredTaskId(task.id)}
                            onMouseLeave={() => setHoveredTaskId(null)}
                            onClick={() => handleTaskClick(task.id)}
                          >
                            <div className="flex flex-col items-center">
                              {/* Vertical line that goes all the way to the timeline */}
                              {node.level > 0 && (
                                <div
                                  className={`w-0.5 ${task.important ? "bg-amber-400" : "bg-teal-500"}`}
                                  style={{ height: `${node.level * 40}px` }}
                                ></div>
                              )}
                              <div
                                className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap max-w-[150px] truncate ${
                                  task.important ? "bg-amber-400" : "bg-teal-500"
                                } text-white ${borderClass} ${borderColor}`}
                                style={{
                                  // Adjust position to account for border width
                                  transform: borderClass ? "translateY(-1px)" : "none",
                                }}
                              >
                                {task.title}
                              </div>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="max-w-[250px]">
                            <div className="font-medium">{task.title}</div>
                            <div className="text-xs text-muted-foreground mt-1">{format(node.date, "MMM d, yyyy")}</div>
                            {task.description && <div className="mt-2 text-sm border-t pt-2">{task.description}</div>}
                            {task.dependencies && task.dependencies.length > 0 && (
                              <div className="mt-2 text-xs border-t pt-2">
                                <div className="font-medium mb-1">Dependencies:</div>
                                <ul className="list-disc pl-4">
                                  {task.dependencies.map((depId) => {
                                    const depTask = getTaskById(depId)
                                    return <li key={depId}>{depTask ? depTask.title : "Unknown task"}</li>
                                  })}
                                </ul>
                              </div>
                            )}
                            {isDependency && (
                              <div className="mt-2 text-xs border-t pt-2">
                                <div className="font-medium mb-1">Required for:</div>
                                <ul className="list-disc pl-4">
                                  {tasks
                                    .filter((t) => t.dependencies?.includes(task.id))
                                    .map((t) => (
                                      <li key={t.id}>{t.title}</li>
                                    ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )
                  }

                  return null
                })}

                {/* Current date line */}
                {visibleRange.start <= new Date() && visibleRange.end >= new Date() && (
                  <div
                    className="absolute h-full w-0.5 bg-indigo-500"
                    style={{
                      left: `${calculatePositionPercentage(new Date())}%`,
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
                  <Calendar className="h-4 w-4 mr-2" />
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


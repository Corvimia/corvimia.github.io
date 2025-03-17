import { Task } from "@/hooks/use-tasks"
import { calculatePositionPercentage, estimateTextWidth, CONSTANTS } from "./position-utils"

// Define the TaskNode type for timeline visualization
export interface TaskNode {
  task: Task | null // null for event marker
  position: number
  width: number
  level: number
  date: Date
  isEvent?: boolean
  title: string
  id?: string
}

/**
 * Check if two nodes overlap on the timeline
 * @param nodeA First node
 * @param nodeB Second node
 * @param buffer Buffer percentage to prevent nodes from being too close
 * @returns True if nodes overlap
 */
export const doNodesOverlap = (nodeA: TaskNode, nodeB: TaskNode, buffer = CONSTANTS.NODE_BUFFER_PERCENTAGE) => {
  const nodeALeft = nodeA.position - nodeA.width / 2
  const nodeARight = nodeA.position + nodeA.width / 2
  const nodeBLeft = nodeB.position - nodeB.width / 2
  const nodeBRight = nodeB.position + nodeB.width / 2

  return (
    (nodeALeft >= nodeBLeft - buffer && nodeALeft <= nodeBRight + buffer) ||
    (nodeARight >= nodeBLeft - buffer && nodeARight <= nodeBRight + buffer) ||
    (nodeALeft <= nodeBLeft - buffer && nodeARight >= nodeBRight + buffer)
  )
}

/**
 * Process tasks to handle overlaps with a sophisticated algorithm
 * @param tasks Array of tasks to process
 * @param calculateTaskDate Function to calculate a date for a task
 * @param visibleRange Start and end dates of the visible timeline
 * @param timelineWidth Width of the timeline in pixels
 * @param eventDate Optional event date
 * @param eventTitle Optional event title
 * @returns Array of processed TaskNode objects with assigned levels
 */
export const processTaskNodes = (
  tasks: Task[],
  calculateTaskDate: (task: Task) => Date | null,
  visibleRange: { start: Date; end: Date },
  timelineWidth: number,
  eventDate: string | null = null,
  eventTitle: string = "Event"
): TaskNode[] => {
  if (!timelineWidth) return []

  // Step 1: Create task nodes with position and estimated width
  const taskNodes: TaskNode[] = []

  // Add event marker if it's in range
  if (eventDate) {
    const eventDateObj = new Date(eventDate)
    if (eventDateObj >= visibleRange.start && eventDateObj <= visibleRange.end) {
      const eventPosition = calculatePositionPercentage(eventDateObj, visibleRange)
      const eventWidth = (estimateTextWidth(eventTitle) / timelineWidth) * 100

      taskNodes.push({
        task: null, // Not a real task
        position: eventPosition,
        width: eventWidth,
        level: 0, // Start at top level
        date: eventDateObj,
        isEvent: true,
        title: eventTitle,
        id: "event",
      })
    }
  }

  // Add all visible tasks
  tasks.forEach((task) => {
    const taskDate = calculateTaskDate(task)
    if (!taskDate) return

    const position = calculatePositionPercentage(taskDate, visibleRange)
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
        if (doNodesOverlap(node, existingNode)) {
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
}

/**
 * Find the maximum level in an array of task nodes
 * @param nodes Array of TaskNode objects
 * @returns Maximum level (0 if array is empty)
 */
export const findMaxLevel = (nodes: TaskNode[]): number => {
  if (nodes.length === 0) return 0
  return Math.max(...nodes.map((node) => node.level))
}

/**
 * Calculate timeline height based on max level
 * @param maxLevel Maximum node level
 * @returns Height in pixels
 */
export const calculateTimelineHeight = (maxLevel: number): number => {
  return Math.max(180, 30 + maxLevel * CONSTANTS.LEVEL_SPACING + 80) // Minimum height with padding
}

/**
 * Find a node by its ID in the nodes array
 * @param nodes Array of TaskNode objects
 * @param id ID to search for
 * @returns The found node or undefined
 */
export const findNodeById = (nodes: TaskNode[], id: string): TaskNode | undefined => {
  return nodes.find((node) => node.id === id)
} 
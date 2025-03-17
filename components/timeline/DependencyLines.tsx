"use client"

import { Task } from "@/hooks/use-tasks"
import { findNodeById, TaskNode } from "./utils/node-layout"
import { calculatePositionPercentage, getNodeYPosition } from "./utils/position-utils"

interface DependencyLinesProps {
  hoveredTaskId: string | null
  nodes: TaskNode[]
  getTaskById: (id: string) => Task | undefined
  visibleRange: { start: Date; end: Date }
}

export function DependencyLines({ hoveredTaskId, nodes, getTaskById, visibleRange }: DependencyLinesProps) {
  if (!hoveredTaskId) return null

  const task = getTaskById(hoveredTaskId)
  if (!task) return null

  const taskNode = findNodeById(nodes, task.id)
  if (!taskNode) return null

  // Get task dependencies
  const dependencies = task.dependencies || []
  
  // Get tasks that depend on this task
  const dependentTasks = nodes
    .filter(node => node.task && node.task.dependencies?.includes(task.id))
    .map(node => node.id)
    .filter(Boolean) as string[]

  return (
    <>
      {/* Lines to dependencies */}
      {dependencies.map((depId) => {
        const depTask = getTaskById(depId)
        if (!depTask) return null

        const depNode = findNodeById(nodes, depId)
        if (!depNode) return null

        // Calculate vertical positions based on node levels
        const sourceY = 4 // Timeline position
        const targetY = getNodeYPosition(taskNode.level)

        // Connection for dependency (navy blue)
        return (
          <div
            key={`${task.id}-${depId}`}
            className="absolute bg-gradient-to-r from-navy-600 to-navy-600"
            style={{
              left: `${Math.min(taskNode.position, depNode.position)}%`,
              top: `${Math.min(sourceY, targetY)}px`,
              width: `${Math.abs(taskNode.position - depNode.position)}%`,
              height: `${Math.abs(sourceY - targetY) + 2}px`,
              zIndex: 5,
              borderRadius: '4px',
              border: '1px solid rgb(30, 58, 138)', // navy-600
              borderLeft: taskNode.position > depNode.position ? "1px solid rgb(30, 58, 138)" : "none",
              borderRight: taskNode.position < depNode.position ? "1px solid rgb(30, 58, 138)" : "none",
              borderTop: sourceY > targetY ? "1px solid rgb(30, 58, 138)" : "none",
              borderBottom: sourceY < targetY ? "1px solid rgb(30, 58, 138)" : "none",
            }}
          />
        )
      })}

      {/* Lines from dependent tasks */}
      {dependentTasks.map((depId) => {
        const depNode = findNodeById(nodes, depId)
        if (!depNode) return null

        // Calculate vertical positions based on node levels
        const sourceY = 4 // Timeline position
        const targetY = getNodeYPosition(depNode.level)

        // Connection for dependent task (lighter blue)
        return (
          <div
            key={`dependent-${task.id}-${depId}`}
            className="absolute bg-gradient-to-r from-blue-400 to-blue-400"
            style={{
              left: `${Math.min(taskNode.position, depNode.position)}%`,
              top: `${Math.min(sourceY, targetY)}px`,
              width: `${Math.abs(taskNode.position - depNode.position)}%`,
              height: `${Math.abs(sourceY - targetY) + 2}px`,
              zIndex: 5,
              borderRadius: '4px',
              border: '1px solid rgb(96, 165, 250)', // blue-400
              borderLeft: taskNode.position > depNode.position ? "1px solid rgb(96, 165, 250)" : "none",
              borderRight: taskNode.position < depNode.position ? "1px solid rgb(96, 165, 250)" : "none",
              borderTop: sourceY > targetY ? "1px solid rgb(96, 165, 250)" : "none",
              borderBottom: sourceY < targetY ? "1px solid rgb(96, 165, 250)" : "none",
            }}
          />
        )
      })}
    </>
  )
} 
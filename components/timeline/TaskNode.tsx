"use client"

import { format } from "date-fns"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { TaskNode as TaskNodeType } from "./utils/node-layout"
import { CONSTANTS } from "./utils/position-utils"
import { Task } from "@/hooks/use-tasks"

interface TaskNodeProps {
  node: TaskNodeType
  isHovered: boolean
  isSelected: boolean
  isRelated: boolean
  onMouseEnter: (id: string) => void
  onMouseLeave: () => void
  onClick: (id: string) => void
  getTasks: () => Task[]
  getTaskById: (id: string) => Task | undefined
}

export function TaskNode({
  node,
  isHovered,
  isSelected,
  isRelated,
  onMouseEnter,
  onMouseLeave,
  onClick,
  getTasks,
  getTaskById,
}: TaskNodeProps) {
  if (!node.task || node.isEvent) return null
  
  const task = node.task
  const isDependency = getTasks().some((t) => t.dependencies?.includes(task.id))
  const hasDependencies = task.dependencies && task.dependencies.length > 0
  
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
  const opacity = !isRelated ? "opacity-30" : "opacity-100"

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={`absolute cursor-pointer transition-opacity duration-200 ${opacity}`}
          style={{
            left: `${node.position}%`,
            top: '0', // Reset the top positioning
            transform: "translateX(-50%)",
            zIndex: isHovered ? 20 : 15,
          }}
          onMouseEnter={() => onMouseEnter(task.id)}
          onMouseLeave={() => onMouseLeave()}
          onClick={() => onClick(task.id)}
        >
          <div className="flex flex-col items-center">
            {/* Vertical line that goes from the timeline to the task */}
            <div
              className={`w-0.5 ${task.important ? "bg-amber-400" : "bg-teal-500"}`}
              style={{ 
                height: `${CONSTANTS.BASE_TIMELINE_OFFSET + node.level * CONSTANTS.LEVEL_SPACING + 4}px`,
                position: 'absolute',
                top: '-4px', // Start at the timeline (accounting for container's top padding)
                left: '50%',
                transform: 'translateX(-50%)',
                width: `${CONSTANTS.STANDARD_LINE_WIDTH}px`, // Use standard line width
                zIndex: 1 // Put line behind the node
              }}
            ></div>
            
            {/* Task pill */}
            <div
              className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap max-w-[150px] truncate ${
                task.important ? "bg-amber-400" : "bg-teal-500"
              } text-white ${borderClass} ${borderColor}`}
              style={{
                // Adjust position to account for border width
                transform: borderClass ? "translateY(-1px)" : "none",
                marginTop: `${CONSTANTS.BASE_TIMELINE_OFFSET + node.level * CONSTANTS.LEVEL_SPACING}px`, // Push the task pill down by the height of the line
                zIndex: 2 // Ensure it appears on top of the line
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
                {getTasks()
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
"use client"

import { TaskNode } from "./utils/node-layout"
import { CONSTANTS } from "./utils/position-utils"

interface EventNodeProps {
  node: TaskNode
}

export function EventNode({ node }: EventNodeProps) {
  if (!node.isEvent) return null

  return (
    <div
      className="absolute"
      style={{
        left: `${node.position}%`,
        top: '0', // Reset the top positioning
        transform: "translateX(-50%)",
        zIndex: 15,
      }}
    >
      <div className="flex flex-col items-center">
        {/* Vertical line connecting to timeline */}
        <div 
          className="h-0.5 w-0.5 bg-amber-500"
          style={{ 
            position: 'absolute',
            top: '-4px', // Start at the timeline (accounting for container's top padding)
            left: '50%',
            transform: 'translateX(-50%)',
            height: `${CONSTANTS.BASE_TIMELINE_OFFSET + node.level * CONSTANTS.LEVEL_SPACING + 4}px`, // Add 4px to reach the timeline
            width: `${CONSTANTS.STANDARD_LINE_WIDTH}px`, // Use standard line width
            zIndex: 1 // Put line behind the node
          }}
        ></div>
        
        {/* Event marker */}
        <div 
          className="mt-1 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap"
          style={{
            marginTop: `${CONSTANTS.BASE_TIMELINE_OFFSET + node.level * CONSTANTS.LEVEL_SPACING}px`, // Push the event marker down by the height of the line
            zIndex: 2 // Ensure it appears on top of the line
          }}
        >
          {node.title}
        </div>
      </div>
    </div>
  )
} 
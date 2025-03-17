"use client"

import { TaskNode as TaskNodeType } from "./utils/node-layout"
import { CONSTANTS } from "./utils/position-utils"
import { Task } from "@/hooks/use-tasks"

interface VerticalLinesProps {
  nodes: TaskNodeType[]
  getTaskById: (id: string) => Task | undefined
}

export function VerticalLines({ nodes, getTaskById }: VerticalLinesProps) {
  return (
    <div className="absolute top-0 left-0 right-0 w-full h-full pointer-events-none">
      {/* Draw all vertical lines first */}
      {nodes
        .filter((node) => node.task && !node.isEvent)
        .map((node) => {
          if (!node.task) return null;
          const task = node.task;
          
          return (
            <div 
              key={`line-${node.id}`}
              className="absolute"
              style={{
                left: `${node.position}%`,
                top: '0',
                width: '100%',
                height: '100%',
                transform: "translateX(-50%)",
                zIndex: 1, // Lower z-index so nodes appear on top
              }}
            >
              {/* Vertical line that goes from the timeline to the task level */}
              <div
                className={`${task.important ? "bg-amber-400" : "bg-teal-500"}`}
                style={{ 
                  height: `${CONSTANTS.BASE_TIMELINE_OFFSET + node.level * CONSTANTS.LEVEL_SPACING + 4}px`,
                  position: 'absolute',
                  top: '-4px', // Start at the timeline (accounting for container's top padding)
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: `${CONSTANTS.STANDARD_LINE_WIDTH}px`, // Use standard line width
                  // Add a subtle highlight effect when nodes are vertically aligned
                  boxShadow: '0 0 3px rgba(255, 255, 255, 0.5)'
                }}
              ></div>
            </div>
          );
        })}
    </div>
  );
} 
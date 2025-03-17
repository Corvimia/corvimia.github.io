"use client"

import { format, isToday, isSameDay, parseISO } from "date-fns"
import { cn } from "@/lib/utils"

interface TimelineHeaderProps {
  dates: Date[]
  eventDate: string | null
}

export function TimelineHeader({ dates, eventDate }: TimelineHeaderProps) {
  return (
    <>
      {/* Date labels */}
      <div className="flex justify-between mb-2">
        {dates.map((date, index) => (
          <div key={index} className="text-center px-1">
            <div className="text-sm font-medium">{format(date, "EEE d/M")}</div>
          </div>
        ))}
      </div>

      {/* Timeline markers */}
      <div className="flex justify-between relative pt-4">
        {dates.map((date, index) => {
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
    </>
  )
} 
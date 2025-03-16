"use client"
import { TimelineProvider } from "@/hooks/use-timeline"
import { TaskProvider } from "@/hooks/use-tasks"
import { EventDetails } from "@/components/event-details"
import { Timeline } from "@/components/timeline"
import { TaskManager } from "@/components/task-manager"

export default function TimelineTaskManagerApp() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Timeline Task Manager</h1>

      <TimelineProvider>
        <TaskProvider>
          <EventDetails />
          <Timeline />
          <TaskManager />
        </TaskProvider>
      </TimelineProvider>
    </div>
  )
}


import { EventDetails } from "@/components/event-details"
import { Timeline } from "@/components/timeline"
import { TaskManager } from "@/components/task-manager"
import Head from "next/head"

export default function TimelineTaskManagerApp() {
  return (
    <>
      <Head>
        <title>Timeline Task Manager</title>
        <meta name="description" content="A tool to manage timeline tasks" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Timeline Task Manager</h1>
        <EventDetails />
        <Timeline />
        <TaskManager />
      </div>
    </>
  )
} 
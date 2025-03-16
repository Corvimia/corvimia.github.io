import { addMonths, format } from "date-fns"
import type { Task } from "@/hooks/use-tasks"

/**
 * Generates test data for the timeline task manager
 */
export function generateTestData(eventDate: Date): Omit<Task, "id" | "completed">[] {
  // Create a set of tasks with various properties and dependencies
  const tasks: Omit<Task, "id" | "completed">[] = [
    // Planning phase - absolute dates (far in the past)
    {
      title: "Initial Planning Meeting",
      description: "Kickoff meeting to discuss project goals and timeline",
      dateType: "absolute",
      date: format(addMonths(eventDate, -8), "yyyy-MM-dd"),
      important: true,
      dependencies: [],
    },
    {
      title: "Define Requirements",
      description: "Document all product requirements and specifications",
      dateType: "absolute",
      date: format(addMonths(eventDate, -7), "yyyy-MM-dd"),
      important: true,
      dependencies: ["task-0"], // Will be replaced with actual ID after import
    },
    {
      title: "Create Project Plan",
      description: "Develop detailed project plan with milestones",
      dateType: "absolute",
      date: format(addMonths(eventDate, -6), "yyyy-MM-dd"),
      important: false,
      dependencies: ["task-1"],
    },

    // Development phase - relative to event (spread out)
    {
      title: "Design Phase",
      description: "Complete all design work including mockups and prototypes",
      dateType: "relative",
      date: "",
      relativeTime: {
        value: 5,
        unit: "months",
        direction: "before",
      },
      important: true,
      dependencies: ["task-2"],
    },
    {
      title: "Development Sprint 1",
      description: "First development sprint focusing on core functionality",
      dateType: "relative",
      date: "",
      relativeTime: {
        value: 4,
        unit: "months",
        direction: "before",
      },
      important: true,
      dependencies: ["task-3"],
    },
    {
      title: "Development Sprint 2",
      description: "Second development sprint focusing on additional features",
      dateType: "relative",
      date: "",
      relativeTime: {
        value: 3,
        unit: "months",
        direction: "before",
      },
      important: false,
      dependencies: ["task-4"],
    },

    // Testing phase - more spread out
    {
      title: "QA Testing",
      description: "Comprehensive testing of all features",
      dateType: "relative",
      date: "",
      relativeTime: {
        value: 6,
        unit: "weeks",
        direction: "before",
      },
      important: true,
      dependencies: ["task-5"],
    },
    {
      title: "Bug Fixes",
      description: "Address issues identified during testing",
      dateType: "relative",
      date: "",
      relativeTime: {
        value: 4,
        unit: "weeks",
        direction: "before",
      },
      important: false,
      dependencies: ["task-6"],
    },

    // Launch preparation - closer to event
    {
      title: "Final Review",
      description: "Final review of product before launch",
      dateType: "relative",
      date: "",
      relativeTime: {
        value: 2,
        unit: "weeks",
        direction: "before",
      },
      important: true,
      dependencies: ["task-7"],
    },
    {
      title: "Marketing Materials",
      description: "Prepare all marketing materials for launch",
      dateType: "relative",
      date: "",
      relativeTime: {
        value: 3,
        unit: "weeks",
        direction: "before",
      },
      important: true,
      dependencies: [],
    },

    // Launch day
    {
      title: "Product Launch",
      description: "Official product launch event",
      dateType: "relative",
      date: "",
      relativeTime: {
        value: 0,
        unit: "days",
        direction: "before",
      },
      important: true,
      dependencies: ["task-8", "task-9"],
    },

    // Post-launch - after event
    {
      title: "Post-Launch Review",
      description: "Evaluate launch success and gather feedback",
      dateType: "relative",
      date: "",
      relativeTime: {
        value: 2,
        unit: "weeks",
        direction: "after",
      },
      important: false,
      dependencies: ["task-10"],
    },
    {
      title: "Follow-up Marketing",
      description: "Execute follow-up marketing campaigns",
      dateType: "relative",
      date: "",
      relativeTime: {
        value: 1,
        unit: "months",
        direction: "after",
      },
      important: true,
      dependencies: ["task-11"],
    },
  ]

  // Replace task-X references with temporary IDs that will be replaced after import
  return tasks.map((task, index) => ({
    ...task,
    id: `task-${index}`, // Temporary ID for dependency references
  })) as Omit<Task, "id" | "completed">[]
}


import type { Task } from "@/hooks/use-tasks"

/**
 * Exports tasks to CSV format
 */
export function exportTasksToCSV(tasks: Task[], getTaskById: (id: string) => Task | undefined): string {
  // Define CSV headers to match import format
  const headers = [
    "title",
    "description",
    "dateType",
    "date",
    "relativeValue",
    "relativeUnit",
    "relativeDirection",
    "important",
    "dependencies",
  ]

  // Create CSV content
  let csv = headers.join(",") + "\n"

  // Add each task as a row
  tasks.forEach((task) => {
    const row = [
      escapeCsvValue(task.title),
      escapeCsvValue(task.description),
      task.dateType,
      task.dateType === "absolute" ? task.date : "",
      task.relativeTime?.value || "",
      task.relativeTime?.unit || "",
      task.relativeTime?.direction || "",
      task.important ? "true" : "false",
      task.dependencies?.join(";") || "",
    ]

    csv += row.join(",") + "\n"
  })

  return csv
}

/**
 * Escapes special characters in CSV values
 */
function escapeCsvValue(value: string): string {
  // If the value contains commas, quotes, or newlines, wrap it in quotes
  if (value && (value.includes(",") || value.includes('"') || value.includes("\n"))) {
    // Double up any quotes to escape them
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}


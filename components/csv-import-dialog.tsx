"use client"

import { useState } from "react"
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, FileText, Check } from "lucide-react"
import type { Task } from "@/hooks/use-tasks"

type CsvImportDialogProps = {
  onImport: (tasks: Omit<Task, "id" | "completed">[]) => void
}

export function CsvImportDialog({ onImport }: CsvImportDialogProps) {
  const [csvContent, setCsvContent] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<Omit<Task, "id" | "completed">[]>([])
  const [step, setStep] = useState<"input" | "preview" | "mapping">("input")

  const parseCSV = () => {
    setError(null)

    if (!csvContent.trim()) {
      setError("Please enter CSV content")
      return
    }

    try {
      // Split by lines and filter out empty lines
      const lines = csvContent.split("\n").filter((line) => line.trim())

      if (lines.length < 2) {
        setError("CSV must contain a header row and at least one data row")
        return
      }

      // Parse header row
      const headers = lines[0].split(",").map((h) => h.trim())

      // Check for required columns
      if (!headers.includes("title")) {
        setError("CSV must contain a 'title' column")
        return
      }

      // Parse data rows
      const parsedTasks: Omit<Task, "id" | "completed">[] = []

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim())

        if (values.length !== headers.length) {
          setError(`Row ${i + 1} has a different number of columns than the header`)
          return
        }

        const task: any = {
          important: false,
          dependencies: [],
        }

        headers.forEach((header, index) => {
          if (header === "title" || header === "description") {
            task[header] = values[index]
          } else if (header === "dateType") {
            task.dateType = values[index] === "relative" ? "relative" : "absolute"
          } else if (header === "date" && (!task.dateType || task.dateType === "absolute")) {
            task.date = values[index] || new Date().toISOString().split("T")[0]
          } else if (header === "important") {
            task.important = values[index].toLowerCase() === "true" || values[index] === "1"
          } else if (header === "dependencies") {
            // Parse dependencies as semicolon-separated list of task IDs
            if (values[index]) {
              task.dependencies = values[index]
                .split(";")
                .map((id) => id.trim())
                .filter(Boolean)
            }
          } else if (header === "relativeValue" && (task.dateType === "relative" || !task.dateType)) {
            if (!task.relativeTime) task.relativeTime = { value: 1, unit: "weeks", direction: "before" }
            task.relativeTime.value = Number.parseInt(values[index]) || 1
            if (!task.dateType) task.dateType = "relative"
          } else if (header === "relativeUnit" && (task.dateType === "relative" || !task.dateType)) {
            if (!task.relativeTime) task.relativeTime = { value: 1, unit: "weeks", direction: "before" }
            task.relativeTime.unit = ["days", "weeks", "months"].includes(values[index])
              ? (values[index] as "days" | "weeks" | "months")
              : "weeks"
            if (!task.dateType) task.dateType = "relative"
          } else if (header === "relativeDirection" && (task.dateType === "relative" || !task.dateType)) {
            if (!task.relativeTime) task.relativeTime = { value: 1, unit: "weeks", direction: "before" }
            task.relativeTime.direction = values[index] === "after" ? "after" : "before"
            if (!task.dateType) task.dateType = "relative"
          }
        })

        // Set defaults for required fields if missing
        if (!task.description) task.description = ""
        if (!task.dateType) {
          task.dateType = "absolute"
          task.date = new Date().toISOString().split("T")[0]
        }
        if (task.dateType === "relative" && !task.relativeTime) {
          task.relativeTime = { value: 1, unit: "weeks", direction: "before" }
        }
        if (task.dateType === "absolute" && !task.date) {
          task.date = new Date().toISOString().split("T")[0]
        }

        parsedTasks.push(task as Omit<Task, "id" | "completed">)
      }

      setPreview(parsedTasks)
      setStep("preview")
    } catch (err) {
      setError("Failed to parse CSV. Please check the format and try again.")
      console.error(err)
    }
  }

  const handleImport = () => {
    onImport(preview)
  }

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Import Tasks from CSV</DialogTitle>
      </DialogHeader>

      {step === "input" && (
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="csvContent">CSV Content</Label>
            <div className="text-sm text-muted-foreground mb-2">
              Paste your CSV content below. The first row should be a header row with column names.
              <br />
              Required columns: <code>title</code>
              <br />
              Optional columns: <code>description</code>, <code>date</code>, <code>important</code>,{" "}
              <code>dependencies</code> (semicolon-separated IDs), <code>dateType</code> (absolute/relative),{" "}
              <code>relativeValue</code>, <code>relativeUnit</code>, <code>relativeDirection</code>
            </div>
            <Textarea
              id="csvContent"
              placeholder="title,description,dateType,date,relativeValue,relativeUnit,relativeDirection,important,dependencies
Task 1,Description for task 1,absolute,2023-12-25,,,,,true,
Task 2,Another task,relative,,2,weeks,before,false,task-1"
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              className="font-mono h-60"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end">
            <Button onClick={parseCSV}>
              <FileText className="mr-2 h-4 w-4" /> Preview Import
            </Button>
          </div>
        </div>
      )}

      {step === "preview" && (
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Preview ({preview.length} tasks)</h3>
            <div className="border rounded-md overflow-hidden overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left">Title</th>
                    <th className="p-2 text-left">Description</th>
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-left">Important</th>
                    <th className="p-2 text-left">Dependencies</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((task, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2">{task.title}</td>
                      <td className="p-2">{task.description}</td>
                      <td className="p-2">
                        {task.dateType === "absolute"
                          ? task.date
                          : `${task.relativeTime?.value} ${task.relativeTime?.unit} ${task.relativeTime?.direction} event`}
                      </td>
                      <td className="p-2">{task.important ? "Yes" : "No"}</td>
                      <td className="p-2">{task.dependencies?.length ? task.dependencies.join("; ") : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("input")}>
              Back to Edit
            </Button>
            <Button onClick={handleImport}>
              <Check className="mr-2 h-4 w-4" /> Import Tasks
            </Button>
          </div>
        </div>
      )}
    </DialogContent>
  )
}


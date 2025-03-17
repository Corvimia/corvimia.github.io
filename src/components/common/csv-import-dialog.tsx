"use client"

import { useState } from "react"
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import type { Task } from "@/hooks/use-tasks"

interface CsvImportDialogProps {
  onImport: (tasks: Task[]) => void
}

export function CsvImportDialog({ onImport }: CsvImportDialogProps) {
  const [csvText, setCsvText] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleCsvChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCsvText(e.target.value)
    setError(null)
  }

  const handleImport = () => {
    try {
      // Basic validation
      if (!csvText.trim()) {
        setError("CSV text is empty")
        return
      }

      // Split the CSV into lines
      const lines = csvText.trim().split('\n')
      if (lines.length < 2) {
        setError("CSV must contain a header row and at least one data row")
        return
      }

      // Parse the header row
      const headers = parseCsvLine(lines[0])
      const requiredHeaders = ["title", "dateType"]
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
      
      if (missingHeaders.length > 0) {
        setError(`Missing required headers: ${missingHeaders.join(", ")}`)
        return
      }

      // Parse the data rows
      const tasks: Task[] = []
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue // Skip empty lines
        
        const values = parseCsvLine(lines[i])
        if (values.length !== headers.length) {
          setError(`Line ${i + 1} has ${values.length} values, but header has ${headers.length} columns`)
          return
        }

        // Create a task object from the CSV data
        const task: Partial<Task> = {
          id: `import-${Date.now()}-${i}`,
          completed: false
        }

        // Map CSV columns to task properties
        headers.forEach((header, index) => {
          const value = values[index]
          
          switch (header) {
            case "title":
              task.title = value
              break
            case "description":
              task.description = value
              break
            case "dateType":
              task.dateType = value as "absolute" | "relative"
              break
            case "date":
              if (value && task.dateType === "absolute") {
                task.date = value
              }
              break
            case "relativeValue":
              if (value && task.dateType === "relative") {
                if (!task.relativeTime) task.relativeTime = { value: 0, unit: "days", direction: "before" }
                task.relativeTime.value = parseInt(value)
              }
              break
            case "relativeUnit":
              if (value && task.dateType === "relative") {
                if (!task.relativeTime) task.relativeTime = { value: 0, unit: "days", direction: "before" }
                task.relativeTime.unit = value as "days" | "weeks" | "months"
              }
              break
            case "relativeDirection":
              if (value && task.dateType === "relative") {
                if (!task.relativeTime) task.relativeTime = { value: 0, unit: "days", direction: "before" }
                task.relativeTime.direction = value as "before" | "after"
              }
              break
            case "important":
              task.important = value.toLowerCase() === "true"
              break
            case "dependencies":
              if (value) {
                task.dependencies = value.split(";").filter(Boolean)
              }
              break
          }
        })

        // Validate the task
        if (!task.title) {
          setError(`Task on line ${i + 1} is missing a title`)
          return
        }

        if (task.dateType === "absolute" && !task.date) {
          setError(`Task "${task.title}" has date type "absolute" but no date`)
          return
        }

        if (task.dateType === "relative" && (!task.relativeTime || !task.relativeTime.value)) {
          setError(`Task "${task.title}" has date type "relative" but missing relative time data`)
          return
        }

        tasks.push(task as Task)
      }

      // Success - import the tasks
      onImport(tasks)
      setCsvText("")
      setError(null)
      
    } catch (err) {
      setError(`Error parsing CSV: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setCsvText(text)
      setError(null)
    } catch (err) {
      setError("Could not paste from clipboard. Please paste manually.")
    }
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Import Tasks from CSV</DialogTitle>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Paste your CSV data below. The first row should be a header row with these columns:
            <br />
            <code className="text-xs">
              title,description,dateType,date,relativeValue,relativeUnit,relativeDirection,important,dependencies
            </code>
          </p>

          <Button type="button" variant="outline" onClick={handlePaste} className="w-full">
            Paste from Clipboard
          </Button>
          
          <Textarea
            placeholder="title,description,dateType,date,relativeValue,relativeUnit,relativeDirection,important,dependencies"
            value={csvText}
            onChange={handleCsvChange}
            className="min-h-[200px] font-mono text-sm"
          />

          <Button type="button" onClick={handleImport} className="w-full">
            Import Tasks
          </Button>
        </div>
      </div>
    </DialogContent>
  )
}

// Helper function to parse a CSV line, handling quoted values
function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && i < line.length - 1 && line[i + 1] === '"') {
        // Handle escaped quote (two double quotes)
        current += '"'
        i++ // Skip the next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current)
      current = ""
    } else {
      current += char
    }
  }
  
  // Add the last field
  result.push(current)
  
  return result
} 
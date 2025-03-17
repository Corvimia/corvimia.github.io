"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define the filter options
export interface TaskFilters {
  searchTerm: string
  sortBy: "date" | "title" | "importance"
  showCompleted: boolean
  priority: "all" | "important" | "normal"
}

// Define the component props
interface TaskFiltersProps {
  filters: TaskFilters
  onFilterChange: (filters: TaskFilters) => void
}

export function TaskFilters({ filters, onFilterChange }: TaskFiltersProps) {
  // Update a single filter property
  const updateFilter = <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) => {
    onFilterChange({
      ...filters,
      [key]: value,
    })
  }

  return (
    <div className="bg-muted/40 rounded-md p-4 mb-4 space-y-4">
      <h3 className="font-medium text-lg mb-2">Filter Tasks</h3>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-8"
            value={filters.searchTerm}
            onChange={(e) => updateFilter("searchTerm", e.target.value)}
          />
        </div>

        {/* Sort By Select */}
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="sort-by">Sort By</Label>
          <Select
            value={filters.sortBy}
            onValueChange={(value: "date" | "title" | "importance") => updateFilter("sortBy", value)}
          >
            <SelectTrigger id="sort-by">
              <SelectValue placeholder="Select sorting" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="importance">Importance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        {/* Show Completed Checkbox */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="show-completed"
            checked={filters.showCompleted}
            onCheckedChange={(checked) => updateFilter("showCompleted", !!checked)}
          />
          <Label htmlFor="show-completed">Show completed tasks</Label>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center space-x-2">
          <Label htmlFor="priority-filter">Priority:</Label>
          <Select 
            value={filters.priority} 
            onValueChange={(value: "all" | "important" | "normal") => updateFilter("priority", value)}
          >
            <SelectTrigger id="priority-filter" className="w-[130px]">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="important">Important</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
} 
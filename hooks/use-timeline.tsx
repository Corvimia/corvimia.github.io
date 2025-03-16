"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { addMonths, addDays, startOfMonth, endOfMonth, parseISO, differenceInDays } from "date-fns"
import React from "react"

// Zoom levels
// 1: Month view
// 2: Quarter view
// 3: Half year view
// 4: Full timeline view

type TimelineContextType = {
  zoomLevel: number
  setZoomLevel: (level: number) => void
  visibleRange: {
    start: Date
    end: Date
  }
  setVisibleRange: (range: { start: Date; end: Date }) => void
  eventDate: string
  setEventDate: (date: string) => void
  eventTitle: string
  setEventTitle: (title: string) => void
  getTimelineDates: () => Date[]
  shiftTimelineLeft: () => void
  shiftTimelineRight: () => void
  handleZoomIn: () => void
  handleZoomOut: () => void
  resetTimelineView: () => void
}

const TimelineContext = createContext<TimelineContextType | undefined>(undefined)

export function TimelineProvider({ children }: { children: ReactNode }) {
  const [zoomLevel, setZoomLevel] = useState(2) // Default to quarter view
  const [eventDate, setEventDate] = useState("")
  const [eventTitle, setEventTitle] = useState("")
  const [visibleRange, setVisibleRange] = useState({
    start: new Date(),
    end: addMonths(new Date(), 3),
  })

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("timelineTaskManager")
    if (savedState) {
      try {
        const { eventDate, eventTitle } = JSON.parse(savedState)
        setEventDate(eventDate || "")
        setEventTitle(eventTitle || "")

        // If event date is set, initialize the timeline around it
        if (eventDate) {
          const parsedEventDate = parseISO(eventDate)
          // We need to directly set the state here instead of calling resetTimelineView
          // to avoid dependency issues with useEffect
          setZoomLevel(4)
          const start = addMonths(parsedEventDate, -9)
          const end = addMonths(parsedEventDate, 3)
          setVisibleRange({ start, end })
        }
      } catch (error) {
        console.error("Error parsing timeline data from localStorage:", error)
      }
    }
  }, []) // Empty dependency array - only run once on mount

  // Save state to localStorage whenever it changes, but with a ref to track last saved value
  // to prevent unnecessary updates
  const lastSavedRef = React.useRef({ eventDate: "", eventTitle: "" })
  
  useEffect(() => {
    // Skip if the values haven't actually changed from last save
    if (lastSavedRef.current.eventDate === eventDate && 
        lastSavedRef.current.eventTitle === eventTitle) {
      return;
    }
    
    try {
      const savedState = localStorage.getItem("timelineTaskManager")
      if (savedState) {
        const state = JSON.parse(savedState)
        localStorage.setItem(
          "timelineTaskManager",
          JSON.stringify({
            ...state,
            eventDate,
            eventTitle,
          }),
        )
      } else {
        localStorage.setItem(
          "timelineTaskManager",
          JSON.stringify({
            eventDate,
            eventTitle,
            tasks: [],
          }),
        )
      }
      
      // Update our ref with current values
      lastSavedRef.current = { eventDate, eventTitle };
    } catch (error) {
      console.error("Error saving timeline data to localStorage:", error)
    }
  }, [eventDate, eventTitle])

  // When event date changes, reset the timeline view
  // But don't trigger on initial load
  const isInitialMount = React.useRef(true);
  
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    if (eventDate) {
      resetTimelineView(parseISO(eventDate))
    }
  }, [eventDate])

  // Generate timeline dates based on zoom level and visible range
  const getTimelineDates = () => {
    if (!visibleRange.start || !visibleRange.end) return []

    const dates: Date[] = []
    const totalDays = differenceInDays(visibleRange.end, visibleRange.start)

    // Determine how many dates to show based on zoom level
    let interval = 1 // days between each date marker

    if (zoomLevel === 1)
      interval = 1 // Month view: show every day
    else if (zoomLevel === 2)
      interval = 7 // Quarter view: show weekly
    else if (zoomLevel === 3)
      interval = 14 // Half year view: show bi-weekly
    else if (zoomLevel === 4) interval = 30 // Full view: show monthly

    let current = new Date(visibleRange.start)

    while (differenceInDays(visibleRange.end, current) >= 0) {
      dates.push(new Date(current))
      current = addDays(current, interval)
    }

    return dates
  }

  // Modify shiftTimelineLeft and shiftTimelineRight to not be restricted by min/max dates
  const shiftTimelineLeft = () => {
    const totalDays = differenceInDays(visibleRange.end, visibleRange.start)
    const shiftDays = Math.round(totalDays * 0.3) // Shift by 30% of the current view

    setVisibleRange((prev) => ({
      start: addDays(prev.start, -shiftDays),
      end: addDays(prev.end, -shiftDays),
    }))
  }

  const shiftTimelineRight = () => {
    const totalDays = differenceInDays(visibleRange.end, visibleRange.start)
    const shiftDays = Math.round(totalDays * 0.3) // Shift by 30% of the current view

    setVisibleRange((prev) => ({
      start: addDays(prev.start, shiftDays),
      end: addDays(prev.end, shiftDays),
    }))
  }

  const handleZoomIn = () => {
    if (zoomLevel > 1) {
      setZoomLevel((prev) => prev - 1)

      // Adjust visible range when zooming in
      const midpoint = new Date((visibleRange.start.getTime() + visibleRange.end.getTime()) / 2)
      let newStart, newEnd

      if (zoomLevel === 2) {
        // Going from quarter to month view
        newStart = startOfMonth(midpoint)
        newEnd = endOfMonth(midpoint)
      } else if (zoomLevel === 3) {
        // Going from half year to quarter view
        newStart = addMonths(midpoint, -1.5)
        newEnd = addMonths(midpoint, 1.5)
      } else if (zoomLevel === 4) {
        // Going from full view to half year view
        newStart = addMonths(midpoint, -3)
        newEnd = addMonths(midpoint, 3)
      }

      setVisibleRange({ start: newStart!, end: newEnd! })
    }
  }

  const handleZoomOut = () => {
    if (zoomLevel < 4) {
      setZoomLevel((prev) => prev + 1)

      // Adjust visible range when zooming out
      const midpoint = new Date((visibleRange.start.getTime() + visibleRange.end.getTime()) / 2)
      let newStart, newEnd

      if (zoomLevel === 1) {
        // Going from month to quarter view
        newStart = addMonths(midpoint, -1.5)
        newEnd = addMonths(midpoint, 1.5)
      } else if (zoomLevel === 2) {
        // Going from quarter to half year view
        newStart = addMonths(midpoint, -3)
        newEnd = addMonths(midpoint, 3)
      } else if (zoomLevel === 3) {
        // Going from half year to full view
        newStart = addMonths(midpoint, -6)
        newEnd = addMonths(midpoint, 6)
      }

      setVisibleRange({ start: newStart!, end: newEnd! })
    }
  }

  // Update the resetTimelineView function to always reset to the full timeline view
  const resetTimelineView = (date = eventDate ? parseISO(eventDate) : new Date()) => {
    // Set the timeline to show the full range
    const eventDateObj = typeof date === "string" ? parseISO(date) : date

    // Always set to full timeline view (zoom level 4)
    setZoomLevel(4)

    // Show the entire timeline
    const start = addMonths(eventDateObj, -9)
    const end = addMonths(eventDateObj, 3)

    setVisibleRange({ start, end })
  }

  return (
    <TimelineContext.Provider
      value={{
        zoomLevel,
        setZoomLevel,
        visibleRange,
        setVisibleRange,
        eventDate,
        setEventDate,
        eventTitle,
        setEventTitle,
        getTimelineDates,
        shiftTimelineLeft,
        shiftTimelineRight,
        handleZoomIn,
        handleZoomOut,
        resetTimelineView,
      }}
    >
      {children}
    </TimelineContext.Provider>
  )
}

export function useTimeline() {
  const context = useContext(TimelineContext)
  if (context === undefined) {
    throw new Error("useTimeline must be used within a TimelineProvider")
  }
  return context
}


"use client"

import type React from "react"

import { useTimeline } from "@/hooks/use-timeline"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export function EventDetails() {
  const { eventDate, setEventDate, eventTitle, setEventTitle } = useTimeline()

  const handleEventDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEventDate(e.target.value)
  }

  const handleEventTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEventTitle(e.target.value)
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Event Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="eventTitle">Event Title</Label>
            <Input
              id="eventTitle"
              placeholder="Enter event title"
              value={eventTitle}
              onChange={handleEventTitleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventDate">Event Date</Label>
            <Input id="eventDate" type="date" value={eventDate} onChange={handleEventDateChange} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


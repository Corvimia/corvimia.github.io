"use client"

import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TimelineControlsProps {
  zoomLevel: number
  onZoomIn: () => void
  onZoomOut: () => void
  onShiftLeft: () => void
  onShiftRight: () => void
  onReset: () => void
}

export function TimelineControls({
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onShiftLeft,
  onShiftRight,
  onReset,
}: TimelineControlsProps) {
  return (
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="icon" onClick={onShiftLeft}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Button variant="outline" size="icon" onClick={onZoomIn} disabled={zoomLevel === 1}>
        <ZoomIn className="h-4 w-4" />
      </Button>
      
      <Button variant="outline" size="icon" onClick={onZoomOut} disabled={zoomLevel === 4}>
        <ZoomOut className="h-4 w-4" />
      </Button>
      
      <Button variant="outline" size="icon" onClick={onShiftRight}>
        <ChevronRight className="h-4 w-4" />
      </Button>
      
      <Button variant="outline" size="sm" onClick={onReset}>
        Reset View
      </Button>
    </div>
  )
} 
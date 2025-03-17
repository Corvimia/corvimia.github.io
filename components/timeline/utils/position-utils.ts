import { differenceInDays } from "date-fns"

/**
 * Estimate text width based on character count and font size
 * This is used to approximate node width on the timeline
 * @param text The text to estimate width for
 * @param fontSize Font size in pixels (default: 12)
 * @returns Width in pixels
 */
export const estimateTextWidth = (text: string, fontSize = 12) => {
  // Average character width in pixels (approximate)
  const avgCharWidth = fontSize * 0.55 // Slightly reduced from 0.6
  return text.length * avgCharWidth + 16 // Reduced padding from 24 to 16
}

/**
 * Calculate position for a date as percentage within the visible range
 * @param date Date to calculate position for
 * @param visibleRange The start and end dates of the visible timeline
 * @returns Position as percentage (0-100)
 */
export const calculatePositionPercentage = (
  date: Date,
  visibleRange: { start: Date; end: Date }
) => {
  if (!visibleRange.start || !visibleRange.end) return 0

  const totalRange = differenceInDays(visibleRange.end, visibleRange.start)
  const daysFromStart = differenceInDays(date, visibleRange.start)

  // Ensure the percentage is between 0 and 100
  const percentage = Math.max(0, Math.min(100, (daysFromStart / totalRange) * 100))
  return percentage
}

/**
 * Calculate pixel positions for connection lines between nodes
 * @param source Source position in percentage
 * @param sourceY Source Y position in pixels
 * @param target Target position in percentage
 * @param targetY Target Y position in pixels
 * @returns Object with line positioning data
 */
export const calculateConnectionLine = (
  source: number,
  sourceY: number,
  target: number,
  targetY: number
) => {
  return {
    left: `${Math.min(source, target)}%`,
    top: `${Math.min(sourceY, targetY)}px`,
    width: `${Math.abs(source - target)}%`,
    height: `${Math.abs(sourceY - targetY) + 2}px`,
    borderLeft: source > target ? "1px solid" : "none",
    borderRight: source < target ? "1px solid" : "none",
    borderTop: sourceY > targetY ? "1px solid" : "none",
    borderBottom: sourceY < targetY ? "1px solid" : "none",
  }
}

// Constants for timeline layout
export const CONSTANTS = {
  // Vertical spacing
  BASE_TIMELINE_OFFSET: 25, // Distance from timeline for level 0 tasks
  LEVEL_SPACING: 35, // Vertical spacing between different node levels
  STANDARD_LINE_WIDTH: 1, // Standard width for all vertical lines
  
  // Buffer for preventing overlap
  NODE_BUFFER_PERCENTAGE: 3, // Percentage points buffer between nodes
}

/**
 * Get the y-coordinate for a node based on its level
 * @param level The node level (0-based)
 * @returns Y-coordinate in pixels
 */
export const getNodeYPosition = (level: number) => {
  return 4 + CONSTANTS.BASE_TIMELINE_OFFSET + level * CONSTANTS.LEVEL_SPACING
} 
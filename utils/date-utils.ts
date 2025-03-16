import { addDays, addWeeks, addMonths, parseISO } from "date-fns"

export type RelativeTime = {
  value: number
  unit: "days" | "weeks" | "months"
  direction: "before" | "after"
}

export function calculateRelativeDate(baseDate: string, relativeTime: RelativeTime): Date | null {
  if (!baseDate) return null

  const date = parseISO(baseDate)
  const { value, unit, direction } = relativeTime

  if (direction === "before") {
    if (unit === "days") return addDays(date, -value)
    if (unit === "weeks") return addWeeks(date, -value)
    if (unit === "months") return addMonths(date, -value)
  } else {
    if (unit === "days") return addDays(date, value)
    if (unit === "weeks") return addWeeks(date, value)
    if (unit === "months") return addMonths(date, value)
  }

  return date
}

export function formatRelativeTime(relativeTime: RelativeTime): string {
  const { value, unit, direction } = relativeTime
  return `${value} ${unit} ${direction} event`
}


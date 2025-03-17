import { cn } from "@/lib/utils"

interface LedIndicatorProps {
  active: boolean
  color?: "green" | "red" | "yellow" | "blue"
  className?: string
  size?: "sm" | "md" | "lg"
}

const LedIndicator = ({
  active,
  color = "green",
  className,
  size = "md"
}: LedIndicatorProps) => {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-6 w-6"
  }

  const colorClasses = {
    green: {
      active: "bg-green-500 shadow-[0_0_10px_2px_rgba(34,197,94,0.7)]",
      inactive: "bg-green-900"
    },
    red: {
      active: "bg-red-500 shadow-[0_0_10px_2px_rgba(239,68,68,0.7)]",
      inactive: "bg-red-900"
    },
    yellow: {
      active: "bg-yellow-400 shadow-[0_0_10px_2px_rgba(250,204,21,0.7)]",
      inactive: "bg-yellow-900"
    },
    blue: {
      active: "bg-blue-500 shadow-[0_0_10px_2px_rgba(59,130,246,0.7)]",
      inactive: "bg-blue-900"
    }
  }

  return (
    <div 
      className={cn(
        "rounded-full transition-all duration-75", 
        sizeClasses[size],
        active ? colorClasses[color].active : colorClasses[color].inactive,
        className
      )}
      aria-hidden="true"
    />
  )
}

export default LedIndicator 
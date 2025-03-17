"use client"

import { useEffect, useRef } from "react"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { useLocalStorage } from "@/src/hooks/useLocalStorage"

type IntervalSliderProps = {
  onRateChange: (rate: number) => void
}

const IntervalSlider = ({ onRateChange }: IntervalSliderProps) => {
  const [sliderValue, setSliderValue] = useLocalStorage<number[]>("geiger-radiation-level", [5])
  const initializedRef = useRef(false)

  // Convert slider value (1-10) to events per second (0.5-20)
  const calculateRate = (value: number): number => {
    // Exponential mapping to get a wider range of rates
    return 0.5 * Math.exp(value * 0.35)
  }

  // Initialize with stored value only once
  useEffect(() => {
    if (!initializedRef.current) {
      onRateChange(calculateRate(sliderValue[0]))
      initializedRef.current = true
    }
  }, [sliderValue, onRateChange])

  const handleValueChange = (value: number[]) => {
    setSliderValue(value)
  }

  const handleValueCommit = (value: number[]) => {
    setSliderValue(value)
    onRateChange(calculateRate(value[0]))
  }

  const currentRate = calculateRate(sliderValue[0])

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label>Radiation Level: Low to High</Label>
      </div>
      <Slider
        value={sliderValue}
        min={0.1}
        max={20}
        step={0.1}
        onValueChange={handleValueChange}
        onValueCommit={handleValueCommit}
        className="cursor-pointer"
      />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>0.5 events/sec</span>
        <span>20 events/sec</span>
      </div>
      <p className="text-sm text-muted-foreground text-center">Current rate: {currentRate.toFixed(2)} events/second</p>
    </div>
  )
}

export default IntervalSlider 
"use client"

import { useEffect, useRef } from "react"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { useLocalStorage } from "@/hooks/useLocalStorage"

export type GeigerSoundConfig = {
  sampleRate: number
  duration: number
  decayRate: number
}

type GeigerSoundGeneratorProps = {
  onSoundConfigChange: (config: GeigerSoundConfig) => void
}

const GeigerSoundGenerator = ({ onSoundConfigChange }: GeigerSoundGeneratorProps) => {
  const [sampleRate, setSampleRate] = useLocalStorage<number[]>("geiger-sample-rate", [44100])
  const [duration, setDuration] = useLocalStorage<number[]>("geiger-duration", [50]) // in milliseconds
  const [decayRate, setDecayRate] = useLocalStorage<number[]>("geiger-decay-rate", [40])
  const initializedRef = useRef(false)

  // Initialize with stored values only once
  useEffect(() => {
    if (!initializedRef.current) {
      updateConfig(sampleRate[0], duration[0], decayRate[0])
      initializedRef.current = true
    }
  }, [sampleRate, duration, decayRate, onSoundConfigChange])

  const handleSampleRateChange = (value: number[]) => {
    setSampleRate(value)
    updateConfig(value[0], duration[0], decayRate[0])
  }

  const handleDurationChange = (value: number[]) => {
    setDuration(value)
    updateConfig(sampleRate[0], value[0], decayRate[0])
  }

  const handleDecayRateChange = (value: number[]) => {
    setDecayRate(value)
    updateConfig(sampleRate[0], duration[0], value[0])
  }

  const updateConfig = (sr: number, dur: number, decay: number) => {
    onSoundConfigChange({
      sampleRate: sr,
      duration: dur / 1000, // convert ms to seconds
      decayRate: decay,
    })
  }

  return (
    <div className="space-y-6 border p-4 rounded-lg">
      <h3 className="text-lg font-medium">Geiger Sound Settings</h3>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Sample Rate: {sampleRate[0]} Hz</Label>
        </div>
        <Slider
          value={sampleRate}
          min={8000}
          max={48000}
          step={100}
          onValueChange={setSampleRate}
          onValueCommit={handleSampleRateChange}
          className="cursor-pointer"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Duration: {duration[0]} ms</Label>
        </div>
        <Slider
          value={duration}
          min={10}
          max={200}
          step={1}
          onValueChange={setDuration}
          onValueCommit={handleDurationChange}
          className="cursor-pointer"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Decay Rate: {decayRate[0]}</Label>
        </div>
        <Slider
          value={decayRate}
          min={5}
          max={100}
          step={1}
          onValueChange={setDecayRate}
          onValueCommit={handleDecayRateChange}
          className="cursor-pointer"
        />
      </div>
    </div>
  )
}

export default GeigerSoundGenerator 
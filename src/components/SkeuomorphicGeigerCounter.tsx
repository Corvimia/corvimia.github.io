"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Volume2, VolumeX } from "lucide-react"
import { useAudio } from "@/contexts/AudioContext"
import type { GeigerSoundConfig } from "./GeigerSoundGenerator"
import LedIndicator from "./LedIndicator"
import { SkeuomorphicGeigerCounterProps, DeviceModelType, deviceStyles } from "@/lib/types/geiger-counter"

const SkeuomorphicGeigerCounter = ({ 
  eventRate, 
  soundConfig = { sampleRate: 44100, duration: 0.05, decayRate: 40 },
  onRateChange 
}: SkeuomorphicGeigerCounterProps) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [ledActive, setLedActive] = useState(false)
  const [needlePosition, setNeedlePosition] = useState(0) // 0 to 100 for needle position
  const [deviceModel, setDeviceModel] = useState<DeviceModelType>("GC-2000")
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const ledTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const needleTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { getAudioContext } = useAudio()
  const audioBufferRef = useRef<AudioBuffer | null>(null)

  // Get current device style
  const deviceStyle = deviceStyles[deviceModel]

  // Generate the geiger sound buffer when config changes
  useEffect(() => {
    generateGeigerSound(soundConfig)
  }, [soundConfig])

  // Update when rate changes
  useEffect(() => {
    if (isPlaying) {
      stopSound()
      startSound()
    }
  }, [eventRate, isPlaying])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSound()
      if (ledTimeoutRef.current) {
        clearTimeout(ledTimeoutRef.current)
      }
      if (needleTimeoutRef.current) {
        clearTimeout(needleTimeoutRef.current)
      }
    }
  }, [])

  const generateGeigerSound = (config: GeigerSoundConfig) => {
    const context = getAudioContext()
    const { sampleRate, duration, decayRate } = config

    // Calculate number of samples
    const numSamples = Math.floor(sampleRate * duration)

    // Create an audio buffer
    const audioBuffer = context.createBuffer(1, numSamples, sampleRate)

    // Get the audio data
    const channelData = audioBuffer.getChannelData(0)

    // Generate white noise with an exponential decay envelope
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate
      // White noise in range [-1, 1]
      const noise = Math.random() * 2 - 1
      const envelope = Math.exp(-t * decayRate)
      channelData[i] = noise * envelope
    }

    // Normalize samples to the range [-1, 1]
    let maxAbs = 0
    for (let i = 0; i < numSamples; i++) {
      maxAbs = Math.max(maxAbs, Math.abs(channelData[i]))
    }

    if (maxAbs > 0) {
      for (let i = 0; i < numSamples; i++) {
        channelData[i] = channelData[i] / maxAbs
      }
    }

    // Store the buffer for playback
    audioBufferRef.current = audioBuffer
  }

  const playSound = () => {
    const context = getAudioContext()

    if (audioBufferRef.current) {
      // Create a buffer source
      const source = context.createBufferSource()
      source.buffer = audioBufferRef.current

      // Create a gain node for volume control
      const gainNode = context.createGain()
      gainNode.gain.value = 0.5

      // Connect the source to the gain node and the gain node to the destination
      source.connect(gainNode)
      gainNode.connect(context.destination)

      // Play the sound
      source.start()
      
      // Activate LED
      setLedActive(true)
      
      // Animate needle
      const randomNeedlePosition = Math.min(95, 20 + Math.random() * 80);
      setNeedlePosition(randomNeedlePosition);
      
      // Turn off LED after a short duration
      if (ledTimeoutRef.current) {
        clearTimeout(ledTimeoutRef.current)
      }
      
      ledTimeoutRef.current = setTimeout(() => {
        setLedActive(false)
      }, 100) // LED stays on for 100ms
      
      // Return needle to base position after a short duration
      if (needleTimeoutRef.current) {
        clearTimeout(needleTimeoutRef.current)
      }
      
      needleTimeoutRef.current = setTimeout(() => {
        setNeedlePosition(Math.max(0, eventRate * 2)); // Base position related to event rate
      }, 200) // Needle returns after 200ms
    }
  }

  // Generate a random time interval using exponential distribution
  // This follows the Poisson process where time between events
  // is exponentially distributed with parameter λ (eventRate)
  const getNextInterval = (): number => {
    // Generate random time from exponential distribution
    // Formula: -ln(U) / λ where U is uniform random in (0,1)
    // and λ is the rate parameter (events per second)
    return (-Math.log(Math.random()) / eventRate) * 1000 // convert to ms
  }

  const scheduleNextSound = () => {
    if (!isPlaying) return

    // Play sound immediately
    playSound()

    // Schedule next sound with random interval
    const nextInterval = getNextInterval()
    timeoutRef.current = setTimeout(scheduleNextSound, nextInterval)
  }

  const startSound = () => {
    if (!timeoutRef.current) {
      setIsPlaying(true)
      scheduleNextSound()
    }
  }

  const stopSound = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
      setIsPlaying(false)
      setLedActive(false)
      setNeedlePosition(0)
    }
  }

  const toggleSound = () => {
    if (isPlaying) {
      stopSound()
    } else {
      startSound()
    }
  }

  const handleRateChange = (value: number[]) => {
    onRateChange(value[0])
  }
  
  const handleModelChange = (model: DeviceModelType) => {
    setDeviceModel(model)
  }

  return (
    <div 
      className="border-4 rounded-lg p-6 w-full max-w-md mx-auto shadow-2xl"
      style={{
        backgroundColor: deviceStyle.backgroundColor,
        borderColor: deviceStyle.borderColor
      }}
    >
      {/* Device model selector */}
      <div className="flex justify-center mb-4 gap-2">
        {Object.keys(deviceStyles).map((model) => (
          <Button 
            key={model}
            size="sm"
            variant={deviceModel === model ? "default" : "outline"}
            onClick={() => handleModelChange(model as DeviceModelType)}
            className="text-xs"
          >
            {model}
          </Button>
        ))}
      </div>
      
      {/* Device header with model name */}
      <div 
        className="rounded-t-md p-2 mb-4 text-center"
        style={{ backgroundColor: `${deviceStyle.backgroundColor}99` }}
      >
        <h3 
          className="text-lg text-yellow-400"
          style={{ fontFamily: deviceStyle.fontFamily }}
        >
          Model {deviceModel} Digital
        </h3>
      </div>
      
      {/* Display panel */}
      <div 
        className="border-2 rounded-md p-4 mb-6"
        style={{ 
          backgroundColor: deviceStyle.displayColor,
          borderColor: deviceStyle.borderColor
        }}
      >
        <div className="flex justify-between items-center">
          <div 
            className="text-green-500 text-xl"
            style={{ fontFamily: deviceStyle.fontFamily }}
          >
            {(60 * eventRate).toFixed(1)} CPM
          </div>
          
          <LedIndicator 
            active={ledActive} 
            color={deviceStyle.ledColor}
            size="md"
            className="mx-2" 
          />
          
          <div 
            className="text-green-500 text-xs"
            style={{ fontFamily: deviceStyle.fontFamily }}
          >
            {isPlaying ? "ACTIVE" : "STANDBY"}
          </div>
        </div>
      </div>
      
      {/* Analog gauge */}
      <div 
        className="bg-gray-200 border-2 border-gray-400 rounded-full h-32 relative mb-6 overflow-hidden"
        style={{ borderColor: deviceStyle.borderColor }}
      >
        {/* Gauge markings */}
        <div className="absolute inset-0">
          <div className="h-full w-full flex items-center justify-center">
            <div className="w-full h-1/2 relative">
              {/* Gauge scale markings */}
              {Array.from({length: 11}).map((_, i) => (
                <div 
                  key={i} 
                  className="absolute bottom-0 w-1 h-3 bg-black" 
                  style={{
                    left: `${i * 10}%`,
                    transform: 'translateX(-50%)'
                  }}
                />
              ))}
              
              {/* Scale numbers */}
              <div className="absolute bottom-4 left-0 text-xs">0</div>
              <div className="absolute bottom-4 left-1/4 text-xs">25</div>
              <div className="absolute bottom-4 left-1/2 text-xs transform -translate-x-1/2">50</div>
              <div className="absolute bottom-4 left-3/4 text-xs">75</div>
              <div className="absolute bottom-4 right-0 text-xs">100</div>
              
              {/* Red danger zone */}
              <div className="absolute bottom-0 right-0 w-1/5 h-3 bg-red-500 opacity-50" />
            </div>
          </div>
        </div>
        
        {/* Needle */}
        <div 
          className="absolute bottom-0 left-1/2 w-1 h-28 origin-bottom transition-transform duration-100"
          style={{
            backgroundColor: deviceStyle.needleColor,
            transform: `translateX(-50%) rotate(${needlePosition * 1.8 - 90}deg)`
          }}
        />
        <div className="absolute bottom-0 left-1/2 w-4 h-4 rounded-full bg-gray-800 transform -translate-x-1/2" />
      </div>
      
      {/* Controls */}
      <div className="space-y-4">
        {/* Sensitivity Knob */}
        <div 
          className="p-3 rounded-md"
          style={{ backgroundColor: `${deviceStyle.backgroundColor}99` }}
        >
          <label 
            className="text-white text-sm mb-2 block"
            style={{ fontFamily: deviceStyle.fontFamily }}
          >
            SENSITIVITY
          </label>
          <Slider
            value={[eventRate]}
            min={0.1}
            max={20}
            step={0.1}
            onValueChange={handleRateChange}
            className="cursor-pointer"
          />
          <div 
            className="flex justify-between text-xs text-gray-300 mt-1"
            style={{ fontFamily: deviceStyle.fontFamily }}
          >
            <span>LOW</span>
            <span>HIGH</span>
          </div>
        </div>
        
        {/* Power button */}
        <Button 
          onClick={toggleSound} 
          className={`w-full ${isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
          style={{ fontFamily: deviceStyle.fontFamily }}
        >
          {isPlaying ? (
            <>
              <VolumeX className="mr-2 h-4 w-4" />
              POWER OFF
            </>
          ) : (
            <>
              <Volume2 className="mr-2 h-4 w-4" />
              POWER ON
            </>
          )}
        </Button>
      </div>
      
      {/* Model details */}
      <div className="mt-4 text-center">
        <p 
          className="text-xs text-gray-400"
          style={{ fontFamily: deviceStyle.fontFamily }}
        >
          Simulated Radiation Detector
        </p>
      </div>
    </div>
  )
}

export default SkeuomorphicGeigerCounter 
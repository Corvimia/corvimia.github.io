"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX } from "lucide-react"
import { useAudio } from "@/src/contexts/AudioContext"
import type { GeigerSoundConfig } from "./GeigerSoundGenerator"

type SoundPlayerProps = {
  eventRate: number // events per second
  soundConfig?: GeigerSoundConfig
}

const SoundPlayer = ({ 
  eventRate, 
  soundConfig = { sampleRate: 44100, duration: 0.05, decayRate: 40 } 
}: SoundPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { getAudioContext } = useAudio()
  const audioBufferRef = useRef<AudioBuffer | null>(null)

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
    }
  }

  const toggleSound = () => {
    if (isPlaying) {
      stopSound()
    } else {
      startSound()
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground text-center">
        Average: {eventRate.toFixed(2)} events/second
        <br />({(60 * eventRate).toFixed(1)} counts per minute)
      </p>
      <Button onClick={toggleSound} className="w-full" variant={isPlaying ? "destructive" : "default"}>
        {isPlaying ? (
          <>
            <VolumeX className="mr-2 h-4 w-4" />
            Stop Counter
          </>
        ) : (
          <>
            <Volume2 className="mr-2 h-4 w-4" />
            Start Counter
          </>
        )}
      </Button>
    </div>
  )
}

export default SoundPlayer 
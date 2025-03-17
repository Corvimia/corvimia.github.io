"use client"

import { createContext, useContext, useRef, type ReactNode } from "react"

type AudioContextType = {
  getAudioContext: () => AudioContext
}

const AudioContext = createContext<AudioContextType | null>(null)

export const useAudio = () => {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider")
  }
  return context
}

interface AudioProviderProps {
  children: ReactNode
}

export const AudioProvider = ({ children }: AudioProviderProps) => {
  const audioContextRef = useRef<AudioContext | null>(null)

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return audioContextRef.current
  }

  return <AudioContext.Provider value={{ getAudioContext }}>{children}</AudioContext.Provider>
} 
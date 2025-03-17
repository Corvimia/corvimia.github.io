import { GeigerSoundConfig } from "@/components/GeigerSoundGenerator"

export interface GeigerCounterProps {
  eventRate: number
  soundConfig?: GeigerSoundConfig
}

export interface SkeuomorphicGeigerCounterProps extends GeigerCounterProps {
  onRateChange: (rate: number) => void
}

export type GeigerCounterViewType = 'standard' | 'skeuomorphic'

export type DeviceModelType = 'GC-2000' | 'GC-1000' | 'Vintage'

export interface GeigerDeviceStyle {
  backgroundColor: string
  borderColor: string
  displayColor: string
  needleColor: string
  ledColor: "green" | "red" | "yellow" | "blue"
  fontFamily: string
}

// Predefined device style presets
export const deviceStyles: Record<DeviceModelType, GeigerDeviceStyle> = {
  'GC-2000': {
    backgroundColor: '#1f2937', // gray-800
    borderColor: '#4b5563', // gray-600
    displayColor: '#000000', // black
    needleColor: '#dc2626', // red-600
    ledColor: 'red',
    fontFamily: 'monospace'
  },
  'GC-1000': {
    backgroundColor: '#374151', // gray-700
    borderColor: '#6b7280', // gray-500
    displayColor: '#111827', // gray-900
    needleColor: '#f59e0b', // amber-500
    ledColor: 'yellow',
    fontFamily: 'monospace'
  },
  'Vintage': {
    backgroundColor: '#7f1d1d', // red-900
    borderColor: '#b45309', // amber-800
    displayColor: '#1f2937', // gray-800
    needleColor: '#fff', // white
    ledColor: 'green',
    fontFamily: 'serif'
  }
} 
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AudioProvider } from "@/contexts/AudioContext"
import GeigerSoundGenerator from "@/components/GeigerSoundGenerator"
import IntervalSlider from "@/components/IntervalSlider"
import SoundPlayer from "@/components/SoundPlayer"
import type { GeigerSoundConfig } from "@/components/GeigerSoundGenerator"

const GeigerCounterSim = () => {
  const [eventRate, setEventRate] = useState<number>(5)
  const [soundConfig, setSoundConfig] = useState<GeigerSoundConfig>({
    sampleRate: 44100,
    duration: 0.05,
    decayRate: 40,
  })

  const handleRateChange = (rate: number) => {
    setEventRate(rate)
  }

  const handleSoundConfigChange = (config: GeigerSoundConfig) => {
    setSoundConfig(config)
  }

  return (
    <AudioProvider>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Geiger Counter Simulator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-6">
            <IntervalSlider onRateChange={handleRateChange} />
            <SoundPlayer eventRate={eventRate} soundConfig={soundConfig} />
          </div>

          <Tabs defaultValue="settings" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="settings">Advanced Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="settings" className="space-y-4 pt-4">
              <GeigerSoundGenerator onSoundConfigChange={handleSoundConfigChange} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </AudioProvider>
  )
}

export default GeigerCounterSim 
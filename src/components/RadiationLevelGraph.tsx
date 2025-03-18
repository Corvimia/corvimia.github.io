import { useState, useEffect, useRef } from 'react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DataPoint {
  time: number // Timestamp
  value: number // Radiation level (CPM)
}

interface RadiationLevelGraphProps {
  eventRate: number // Events per second
}

const RadiationLevelGraph = ({ eventRate }: RadiationLevelGraphProps) => {
  const [data, setData] = useState<DataPoint[]>([])
  const [timeScale, setTimeScale] = useState<number>(60) // Time window in seconds
  const [isRunning, setIsRunning] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Reset data when changing time scale
  useEffect(() => {
    setData([])
  }, [timeScale])
  
  // Update graph data at regular intervals
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }
    
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    // Start a new interval to add data points
    intervalRef.current = setInterval(() => {
      const now = Date.now()
      
      // Generate a data point with some randomness to simulate real Geiger counter variations
      const baseValue = eventRate * 60 // Convert events/sec to CPM
      const randomFactor = 1 + (Math.random() * 0.4 - 0.2) // Random factor between 0.8 and 1.2
      const newValue = baseValue * randomFactor
      
      setData(prevData => {
        // Add new data point
        const newData = [...prevData, { time: now, value: newValue }]
        
        // Remove data points outside the time window
        const cutoffTime = now - (timeScale * 1000)
        return newData.filter(point => point.time >= cutoffTime)
      })
    }, 1000) // Update every second
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [eventRate, timeScale, isRunning])
  
  const handleTimeScaleChange = (value: string) => {
    setTimeScale(parseInt(value))
  }
  
  const handlePlayPause = () => {
    setIsRunning(prev => !prev)
  }
  
  const formatXAxis = (timestamp: number) => {
    // Convert to seconds ago
    const secondsAgo = Math.round((Date.now() - timestamp) / 1000)
    return `-${secondsAgo}s`
  }
  
  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-md font-semibold">Radiation Levels (CPM)</h3>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isRunning ? "default" : "outline"}
            onClick={handlePlayPause}
          >
            {isRunning ? "Pause" : "Resume"}
          </Button>
          <Select onValueChange={handleTimeScaleChange} defaultValue={String(timeScale)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Time Scale" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 seconds</SelectItem>
              <SelectItem value="60">1 minute</SelectItem>
              <SelectItem value="300">5 minutes</SelectItem>
              <SelectItem value="600">10 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="border rounded p-2 bg-black/10 h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis 
              dataKey="time" 
              tickFormatter={formatXAxis}
              type="number"
              domain={[(dataMin: number) => dataMin - 1000, 'dataMax']}
              allowDataOverflow
            />
            <YAxis 
              domain={[0, 'auto']}
              allowDataOverflow
            />
            <Tooltip 
              formatter={(value: number) => [`${value.toFixed(1)} CPM`, 'Radiation Level']}
              labelFormatter={(label: number) => `Time: ${formatXAxis(label)}`}
            />
            <ReferenceLine y={eventRate * 60} stroke="red" strokeDasharray="3 3" />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#4ade80" 
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default RadiationLevelGraph 
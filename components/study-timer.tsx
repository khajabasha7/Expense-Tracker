"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, Square, RotateCcw } from "lucide-react"

interface StudyTimerProps {
  subject: string
  onComplete: () => void
  onCancel: () => void
}

export default function StudyTimer({ subject, onComplete, onCancel }: StudyTimerProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1
          setProgress(((25 * 60 - newTime) / (25 * 60)) * 100)

          if (newTime === 0) {
            setIsRunning(false)
            onComplete()
          }

          return newTime
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isRunning, timeLeft, onComplete])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleStart = () => setIsRunning(true)
  const handlePause = () => setIsRunning(false)
  const handleReset = () => {
    setTimeLeft(25 * 60)
    setProgress(0)
    setIsRunning(false)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Studying {subject}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-6xl font-mono font-bold text-blue-600 mb-2">{formatTime(timeLeft)}</div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex justify-center gap-2">
          {!isRunning ? (
            <Button onClick={handleStart} size="lg" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Start
            </Button>
          ) : (
            <Button
              onClick={handlePause}
              size="lg"
              variant="outline"
              className="flex items-center gap-2 bg-transparent"
            >
              <Pause className="h-4 w-4" />
              Pause
            </Button>
          )}

          <Button onClick={handleReset} size="lg" variant="outline" className="flex items-center gap-2 bg-transparent">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>

          <Button onClick={onCancel} size="lg" variant="destructive" className="flex items-center gap-2">
            <Square className="h-4 w-4" />
            Stop
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

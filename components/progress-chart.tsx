"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface StudySession {
  id: string
  subject: string
  duration: number
  location: string
  networkQuality: string
  completed: boolean
  timestamp: Date
}

interface ProgressChartProps {
  sessions: StudySession[]
}

export default function ProgressChart({ sessions }: ProgressChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Handle responsive sizing
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1

      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)

      // Redraw chart
      drawChart(ctx, rect.width, rect.height)
    }

    const drawChart = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      if (sessions.length === 0) {
        // Draw empty state
        ctx.fillStyle = "#9CA3AF"
        ctx.font = `${Math.min(width, height) / 20}px system-ui`
        ctx.textAlign = "center"
        ctx.fillText("No study sessions yet", width / 2, height / 2)
        return
      }

      // Prepare data
      const completedSessions = sessions.filter((s) => s.completed)
      const subjectData = completedSessions.reduce(
        (acc, session) => {
          acc[session.subject] = (acc[session.subject] || 0) + session.duration
          return acc
        },
        {} as Record<string, number>,
      )

      const subjects = Object.keys(subjectData)
      const maxDuration = Math.max(...Object.values(subjectData))

      // Responsive chart dimensions
      const padding = Math.min(width, height) * 0.1
      const chartWidth = width - padding * 2
      const chartHeight = height - padding * 2
      const barWidth = Math.max((chartWidth / subjects.length) * 0.6, 20)
      const barSpacing = (chartWidth - barWidth * subjects.length) / (subjects.length + 1)

      // Colors for different subjects
      const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"]

      // Draw bars
      subjects.forEach((subject, index) => {
        const duration = subjectData[subject]
        const barHeight = (duration / maxDuration) * chartHeight * 0.8
        const x = padding + barSpacing + index * (barWidth + barSpacing)
        const y = height - padding - barHeight

        // Draw bar with rounded corners
        ctx.fillStyle = colors[index % colors.length]
        ctx.beginPath()
        ctx.roundRect(x, y, barWidth, barHeight, 4)
        ctx.fill()

        // Draw subject label (responsive font size)
        ctx.fillStyle = "#374151"
        ctx.font = `${Math.min(barWidth / 4, 12)}px system-ui`
        ctx.textAlign = "center"

        // Truncate long subject names
        const truncatedSubject = subject.length > 8 ? subject.substring(0, 8) + "..." : subject
        ctx.fillText(truncatedSubject, x + barWidth / 2, height - padding + 15)

        // Draw duration label
        ctx.fillStyle = "#6B7280"
        ctx.font = `${Math.min(barWidth / 5, 10)}px system-ui`
        ctx.fillText(`${duration}min`, x + barWidth / 2, y - 5)
      })

      // Draw responsive title
      ctx.fillStyle = "#111827"
      ctx.font = `bold ${Math.min(width / 20, 16)}px system-ui`
      ctx.textAlign = "center"
      ctx.fillText("Study Time by Subject", width / 2, padding / 2)
    }

    // Initial draw
    resizeCanvas()

    // Handle window resize
    window.addEventListener("resize", resizeCanvas)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [sessions])

  const getStats = () => {
    const completed = sessions.filter((s) => s.completed)
    const totalTime = completed.reduce((acc, s) => acc + s.duration, 0)
    const avgSession = completed.length > 0 ? totalTime / completed.length : 0

    return {
      totalSessions: completed.length,
      totalTime,
      avgSession: Math.round(avgSession),
    }
  }

  const stats = getStats()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Study Analytics</CardTitle>
        <CardDescription>Visual representation of your study progress and patterns</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.totalSessions}</div>
              <div className="text-sm text-gray-600">Sessions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.totalTime}</div>
              <div className="text-sm text-gray-600">Minutes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{stats.avgSession}</div>
              <div className="text-sm text-gray-600">Avg/Session</div>
            </div>
          </div>

          <canvas
            ref={canvasRef}
            className="w-full h-48 sm:h-64 lg:h-80 border rounded-lg touch-none"
            style={{ width: "100%", height: "auto", minHeight: "192px" }}
          />
        </div>
      </CardContent>
    </Card>
  )
}

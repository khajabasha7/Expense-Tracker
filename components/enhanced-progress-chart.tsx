"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Clock } from "lucide-react"

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

export default function EnhancedProgressChart({ sessions }: ProgressChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedMetric, setSelectedMetric] = useState<"subject" | "location" | "time">("subject")

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

      // Redraw chart based on selected metric
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
        ctx.font = `${Math.min(width, height) / 30}px system-ui`
        ctx.fillText("Start studying to see your progress!", width / 2, height / 2 + 30)
        return
      }

      // Prepare data based on selected metric
      let chartData: Record<string, number> = {}
      let chartTitle = ""

      switch (selectedMetric) {
        case "subject":
          chartData = sessions.reduce(
            (acc, session) => {
              if (session.completed) {
                acc[session.subject] = (acc[session.subject] || 0) + session.duration
              }
              return acc
            },
            {} as Record<string, number>,
          )
          chartTitle = "Study Time by Subject"
          break
        case "location":
          chartData = sessions.reduce(
            (acc, session) => {
              if (session.completed) {
                acc[session.location] = (acc[session.location] || 0) + session.duration
              }
              return acc
            },
            {} as Record<string, number>,
          )
          chartTitle = "Study Time by Location"
          break
        case "time":
          // Group by hour of day
          chartData = sessions.reduce(
            (acc, session) => {
              if (session.completed) {
                const hour = new Date(session.timestamp).getHours()
                const timeSlot = `${hour}:00`
                acc[timeSlot] = (acc[timeSlot] || 0) + session.duration
              }
              return acc
            },
            {} as Record<string, number>,
          )
          chartTitle = "Study Time by Hour"
          break
      }

      const labels = Object.keys(chartData)
      const values = Object.values(chartData)
      const maxValue = Math.max(...values)

      if (maxValue === 0) return

      // Responsive chart dimensions
      const padding = Math.min(width, height) * 0.1
      const chartWidth = width - padding * 2
      const chartHeight = height - padding * 2 - 60 // Extra space for title and labels
      const barWidth = Math.max((chartWidth / labels.length) * 0.6, 20)
      const barSpacing = (chartWidth - barWidth * labels.length) / (labels.length + 1)

      // Colors for different categories
      const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#84CC16"]

      // Draw bars with animation effect
      labels.forEach((label, index) => {
        const value = chartData[label]
        const barHeight = (value / maxValue) * chartHeight * 0.8
        const x = padding + barSpacing + index * (barWidth + barSpacing)
        const y = height - padding - 40 - barHeight

        // Draw bar with gradient
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight)
        gradient.addColorStop(0, colors[index % colors.length])
        gradient.addColorStop(1, colors[index % colors.length] + "80")

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.roundRect(x, y, barWidth, barHeight, 4)
        ctx.fill()

        // Draw value label on top of bar
        ctx.fillStyle = "#374151"
        ctx.font = `bold ${Math.min(barWidth / 4, 12)}px system-ui`
        ctx.textAlign = "center"
        ctx.fillText(`${value}min`, x + barWidth / 2, y - 5)

        // Draw category label
        ctx.fillStyle = "#6B7280"
        ctx.font = `${Math.min(barWidth / 5, 10)}px system-ui`
        const truncatedLabel = label.length > 8 ? label.substring(0, 8) + "..." : label
        ctx.fillText(truncatedLabel, x + barWidth / 2, height - padding - 20)
      })

      // Draw title
      ctx.fillStyle = "#111827"
      ctx.font = `bold ${Math.min(width / 20, 16)}px system-ui`
      ctx.textAlign = "center"
      ctx.fillText(chartTitle, width / 2, padding / 2)
    }

    // Initial draw
    resizeCanvas()

    // Handle window resize
    window.addEventListener("resize", resizeCanvas)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [sessions, selectedMetric])

  const getStats = () => {
    const completed = sessions.filter((s) => s.completed)
    const totalTime = completed.reduce((acc, s) => acc + s.duration, 0)
    const avgSession = completed.length > 0 ? totalTime / completed.length : 0
    const todaysSessions = completed.filter((s) => {
      const today = new Date()
      const sessionDate = new Date(s.timestamp)
      return sessionDate.toDateString() === today.toDateString()
    })

    return {
      totalSessions: completed.length,
      totalTime,
      avgSession: Math.round(avgSession),
      todayTime: todaysSessions.reduce((acc, s) => acc + s.duration, 0),
      streak: calculateStreak(completed),
    }
  }

  const calculateStreak = (sessions: StudySession[]) => {
    if (sessions.length === 0) return 0

    const dates = [...new Set(sessions.map((s) => new Date(s.timestamp).toDateString()))].sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime(),
    )

    let streak = 0
    const today = new Date().toDateString()

    for (let i = 0; i < dates.length; i++) {
      const expectedDate = new Date()
      expectedDate.setDate(expectedDate.getDate() - i)

      if (dates[i] === expectedDate.toDateString()) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  const stats = getStats()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Study Analytics</span>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedMetric("subject")}
              className={`px-2 py-1 text-xs rounded ${selectedMetric === "subject" ? "bg-blue-100 text-blue-800" : "bg-gray-100"}`}
            >
              Subject
            </button>
            <button
              onClick={() => setSelectedMetric("location")}
              className={`px-2 py-1 text-xs rounded ${selectedMetric === "location" ? "bg-blue-100 text-blue-800" : "bg-gray-100"}`}
            >
              Location
            </button>
            <button
              onClick={() => setSelectedMetric("time")}
              className={`px-2 py-1 text-xs rounded ${selectedMetric === "time" ? "bg-blue-100 text-blue-800" : "bg-gray-100"}`}
            >
              Time
            </button>
          </div>
        </CardTitle>
        <CardDescription>Interactive visualization of your study progress and patterns</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalSessions}</div>
              <div className="text-xs text-gray-600">Total Sessions</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.totalTime}</div>
              <div className="text-xs text-gray-600">Total Minutes</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.avgSession}</div>
              <div className="text-xs text-gray-600">Avg/Session</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{stats.todayTime}</div>
              <div className="text-xs text-gray-600">Today</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.streak}</div>
              <div className="text-xs text-gray-600">Day Streak</div>
            </div>
          </div>

          <canvas
            ref={canvasRef}
            className="w-full h-48 sm:h-64 lg:h-80 border rounded-lg touch-none"
            style={{ width: "100%", height: "auto", minHeight: "192px" }}
          />

          {/* Real-time insights */}
          {sessions.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Most Productive
                </h4>
                <p className="text-gray-600">
                  {Object.entries(
                    sessions.reduce(
                      (acc, s) => {
                        if (s.completed) {
                          acc[s.location] = (acc[s.location] || 0) + s.duration
                        }
                        return acc
                      },
                      {} as Record<string, number>,
                    ),
                  ).sort(([, a], [, b]) => b - a)[0]?.[0] || "No data"}{" "}
                  is your most productive location
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Peak Hours
                </h4>
                <p className="text-gray-600">
                  You study most between{" "}
                  {sessions.length > 0
                    ? `${Math.min(...sessions.map((s) => new Date(s.timestamp).getHours()))}:00-${Math.max(...sessions.map((s) => new Date(s.timestamp).getHours()))}:00`
                    : "No data"}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

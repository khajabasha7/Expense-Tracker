"use client"

import { useEffect, useRef, useState } from "react"
import { BarChart3, TrendingUp, PieChart } from "lucide-react"
import type { Transaction } from "@/app/page"

interface ExpenseChartProps {
  transactions: Transaction[]
}

export default function ExpenseChart({ transactions }: ExpenseChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [chartType, setChartType] = useState<"category" | "monthly" | "trend">("category")
  const [isVisible, setIsVisible] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Intersection Observer API - Track when chart becomes visible
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            console.log("📊 Chart is now visible - triggering animation")
          } else {
            setIsVisible(false)
          }
        })
      },
      {
        threshold: 0.3,
        rootMargin: "50px",
      },
    )

    observerRef.current.observe(canvas)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  // Canvas API - Draw dynamic charts
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !isVisible) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    console.log("🎨 Canvas API: Drawing chart with", transactions.length, "transactions")

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1

      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)

      drawChart(ctx, rect.width, rect.height)
    }

    const drawChart = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      // Clear with dark background
      ctx.fillStyle = "#1F2937"
      ctx.fillRect(0, 0, width, height)

      if (transactions.length === 0) {
        ctx.fillStyle = "#6B7280"
        ctx.font = `${Math.min(width, height) / 20}px system-ui`
        ctx.textAlign = "center"
        ctx.fillText("No transactions yet", width / 2, height / 2)
        ctx.font = `${Math.min(width, height) / 30}px system-ui`
        ctx.fillText("Add your first transaction to see charts!", width / 2, height / 2 + 30)
        return
      }

      switch (chartType) {
        case "category":
          drawCategoryChart(ctx, width, height)
          break
        case "monthly":
          drawMonthlyChart(ctx, width, height)
          break
        case "trend":
          drawTrendChart(ctx, width, height)
          break
      }
    }

    const drawCategoryChart = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const expenses = transactions.filter((t) => t.type === "expense")
      const categoryData = expenses.reduce(
        (acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount
          return acc
        },
        {} as Record<string, number>,
      )

      const categories = Object.keys(categoryData)
      const values = Object.values(categoryData)
      const maxValue = Math.max(...values)

      if (maxValue === 0) return

      const padding = 50
      const chartWidth = width - padding * 2
      const chartHeight = height - padding * 2 - 80
      const barWidth = Math.max((chartWidth / categories.length) * 0.7, 40)
      const barSpacing = (chartWidth - barWidth * categories.length) / (categories.length + 1)

      const colors = ["#EF4444", "#F97316", "#EAB308", "#22C55E", "#3B82F6", "#8B5CF6", "#EC4899"]

      categories.forEach((category, index) => {
        const value = categoryData[category]
        const barHeight = (value / maxValue) * chartHeight * 0.8
        const x = padding + barSpacing + index * (barWidth + barSpacing)
        const y = height - padding - 60 - barHeight

        // Animated bar growth
        const animationProgress = isVisible ? 1 : 0
        const currentBarHeight = barHeight * animationProgress
        const currentY = height - padding - 60 - currentBarHeight

        // Draw bar with neon glow effect
        const gradient = ctx.createLinearGradient(0, currentY, 0, currentY + currentBarHeight)
        gradient.addColorStop(0, colors[index % colors.length])
        gradient.addColorStop(1, colors[index % colors.length] + "60")

        ctx.fillStyle = gradient
        ctx.fillRect(x, currentY, barWidth, currentBarHeight)

        // Add glow effect
        ctx.shadowColor = colors[index % colors.length]
        ctx.shadowBlur = 15
        ctx.fillRect(x, currentY, barWidth, currentBarHeight)
        ctx.shadowBlur = 0

        // Draw value label
        ctx.fillStyle = "#FFFFFF"
        ctx.font = `bold ${Math.min(barWidth / 4, 14)}px system-ui`
        ctx.textAlign = "center"
        ctx.fillText(`$${value.toFixed(0)}`, x + barWidth / 2, currentY - 10)

        // Draw category label
        ctx.fillStyle = "#D1D5DB"
        ctx.font = `${Math.min(barWidth / 5, 12)}px system-ui`
        const truncatedCategory = category.length > 8 ? category.substring(0, 8) + "..." : category
        ctx.fillText(truncatedCategory, x + barWidth / 2, height - padding - 30)
      })

      // Draw title
      ctx.fillStyle = "#FFFFFF"
      ctx.font = `bold ${Math.min(width / 25, 18)}px system-ui`
      ctx.textAlign = "center"
      ctx.fillText("Expenses by Category", width / 2, 35)
    }

    const drawMonthlyChart = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const monthlyData = transactions.reduce(
        (acc, t) => {
          const month = new Date(t.date).toLocaleDateString("en-US", { month: "short", year: "2-digit" })
          if (!acc[month]) acc[month] = { income: 0, expenses: 0 }

          if (t.type === "income") {
            acc[month].income += t.amount
          } else {
            acc[month].expenses += t.amount
          }
          return acc
        },
        {} as Record<string, { income: number; expenses: number }>,
      )

      const months = Object.keys(monthlyData).sort()
      const maxValue = Math.max(...months.flatMap((month) => [monthlyData[month].income, monthlyData[month].expenses]))

      if (maxValue === 0) return

      const padding = 50
      const chartWidth = width - padding * 2
      const chartHeight = height - padding * 2 - 80
      const barWidth = Math.max((chartWidth / months.length) * 0.3, 20)
      const groupSpacing = chartWidth / months.length

      months.forEach((month, index) => {
        const data = monthlyData[month]
        const x = padding + index * groupSpacing + groupSpacing / 2

        // Income bar (green with glow)
        const incomeHeight = (data.income / maxValue) * chartHeight * 0.8
        const incomeY = height - padding - 60 - incomeHeight
        ctx.fillStyle = "#22C55E"
        ctx.shadowColor = "#22C55E"
        ctx.shadowBlur = 12
        ctx.fillRect(x - barWidth, incomeY, barWidth, incomeHeight)

        // Expense bar (red with glow)
        const expenseHeight = (data.expenses / maxValue) * chartHeight * 0.8
        const expenseY = height - padding - 60 - expenseHeight
        ctx.fillStyle = "#EF4444"
        ctx.shadowColor = "#EF4444"
        ctx.shadowBlur = 12
        ctx.fillRect(x, expenseY, barWidth, expenseHeight)
        ctx.shadowBlur = 0

        // Month label
        ctx.fillStyle = "#D1D5DB"
        ctx.font = "12px system-ui"
        ctx.textAlign = "center"
        ctx.fillText(month, x, height - padding - 15)
      })

      // Legend with glow
      ctx.fillStyle = "#22C55E"
      ctx.shadowColor = "#22C55E"
      ctx.shadowBlur = 8
      ctx.fillRect(padding, padding + 20, 20, 20)
      ctx.fillStyle = "#FFFFFF"
      ctx.font = "14px system-ui"
      ctx.textAlign = "left"
      ctx.shadowBlur = 0
      ctx.fillText("Income", padding + 30, padding + 35)

      ctx.fillStyle = "#EF4444"
      ctx.shadowColor = "#EF4444"
      ctx.shadowBlur = 8
      ctx.fillRect(padding + 100, padding + 20, 20, 20)
      ctx.shadowBlur = 0
      ctx.fillText("Expenses", padding + 130, padding + 35)

      // Title
      ctx.fillStyle = "#FFFFFF"
      ctx.font = "bold 18px system-ui"
      ctx.textAlign = "center"
      ctx.fillText("Monthly Income vs Expenses", width / 2, 35)
    }

    const drawTrendChart = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const sortedTransactions = [...transactions].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      )

      let runningBalance = 0
      const balancePoints = sortedTransactions.map((t) => {
        runningBalance += t.type === "income" ? t.amount : -t.amount
        return {
          date: new Date(t.date),
          balance: runningBalance,
        }
      })

      if (balancePoints.length < 2) return

      const padding = 50
      const chartWidth = width - padding * 2
      const chartHeight = height - padding * 2 - 80

      const minBalance = Math.min(...balancePoints.map((p) => p.balance))
      const maxBalance = Math.max(...balancePoints.map((p) => p.balance))
      const balanceRange = maxBalance - minBalance || 1

      const minDate = balancePoints[0].date.getTime()
      const maxDate = balancePoints[balancePoints.length - 1].date.getTime()
      const dateRange = maxDate - minDate || 1

      // Draw trend line with glow
      ctx.strokeStyle = "#3B82F6"
      ctx.lineWidth = 4
      ctx.shadowColor = "#3B82F6"
      ctx.shadowBlur = 15
      ctx.beginPath()

      balancePoints.forEach((point, index) => {
        const x = padding + ((point.date.getTime() - minDate) / dateRange) * chartWidth
        const y = height - padding - 60 - ((point.balance - minBalance) / balanceRange) * chartHeight * 0.8

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()
      ctx.shadowBlur = 0

      // Draw animated points
      balancePoints.forEach((point, index) => {
        const x = padding + ((point.date.getTime() - minDate) / dateRange) * chartWidth
        const y = height - padding - 60 - ((point.balance - minBalance) / balanceRange) * chartHeight * 0.8

        ctx.fillStyle = "#3B82F6"
        ctx.shadowColor = "#3B82F6"
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.arc(x, y, 5, 0, 2 * Math.PI)
        ctx.fill()
      })
      ctx.shadowBlur = 0

      // Title
      ctx.fillStyle = "#FFFFFF"
      ctx.font = "bold 18px system-ui"
      ctx.textAlign = "center"
      ctx.fillText("Balance Trend Over Time", width / 2, 35)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [transactions, chartType, isVisible])

  const chartButtons = [
    { type: "category", label: "Category", icon: BarChart3 },
    { type: "monthly", label: "Monthly", icon: TrendingUp },
    { type: "trend", label: "Trend", icon: PieChart },
  ]

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center">
          Financial Analytics
          {isVisible && <span className="ml-2 text-xs bg-green-600 px-2 py-1 rounded-full">Live</span>}
        </h3>
        <div className="flex space-x-2">
          {chartButtons.map((button) => (
            <button
              key={button.type}
              onClick={() => setChartType(button.type as any)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                chartType === button.type
                  ? "bg-blue-600 text-white transform scale-105"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <button.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{button.label}</span>
            </button>
          ))}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-80 rounded-lg border border-gray-600"
        style={{ width: "100%", height: "320px" }}
      />

      <div className="mt-4 text-xs text-gray-400 text-center">
        {transactions.length > 0
          ? `Showing data from ${transactions.length} transactions`
          : "Add transactions to see analytics"}
      </div>
    </div>
  )
}

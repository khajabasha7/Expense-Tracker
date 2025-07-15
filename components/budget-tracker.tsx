"use client"

import { useState } from "react"
import { Edit2, Check, X, AlertTriangle, Target } from "lucide-react"
import type { Budget } from "@/app/page"

interface BudgetTrackerProps {
  budgets: Budget[]
  onUpdateBudget: (category: string, newLimit: number) => void
}

export default function BudgetTracker({ budgets, onUpdateBudget }: BudgetTrackerProps) {
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")

  const handleEdit = (category: string, currentLimit: number) => {
    setEditingCategory(category)
    setEditValue(currentLimit.toString())
  }

  const handleSave = (category: string) => {
    const newLimit = Number.parseFloat(editValue)
    if (!isNaN(newLimit) && newLimit > 0) {
      onUpdateBudget(category, newLimit)
    }
    setEditingCategory(null)
    setEditValue("")
  }

  const handleCancel = () => {
    setEditingCategory(null)
    setEditValue("")
  }

  const getBudgetStatus = (budget: Budget) => {
    const percentage = (budget.spent / budget.limit) * 100
    if (percentage >= 100)
      return { status: "over", color: "text-red-400", bgColor: "bg-red-900/20", barColor: "bg-red-500" }
    if (percentage >= 80)
      return { status: "warning", color: "text-orange-400", bgColor: "bg-orange-900/20", barColor: "bg-orange-500" }
    return { status: "good", color: "text-green-400", bgColor: "bg-green-900/20", barColor: "bg-green-500" }
  }

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
  const overBudgetCount = budgets.filter((b) => b.spent > b.limit).length

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Target className="w-5 h-5 mr-2" />
          Budget Tracker
        </h3>
        {overBudgetCount > 0 && (
          <div className="flex items-center space-x-2 bg-red-900/20 text-red-400 px-3 py-1 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">{overBudgetCount} Over Budget</span>
          </div>
        )}
      </div>

      {/* Overall Budget Summary */}
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700/30 p-6 rounded-xl mb-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium text-white">Overall Budget</h4>
          <span className="text-gray-300">
            ${totalSpent.toFixed(2)} / ${totalBudget.toFixed(2)}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 mb-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              totalSpent > totalBudget ? "bg-red-500" : "bg-gradient-to-r from-blue-500 to-purple-500"
            }`}
            style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
          />
        </div>
        <div className="text-sm text-gray-300">
          {totalBudget - totalSpent >= 0
            ? `$${(totalBudget - totalSpent).toFixed(2)} remaining`
            : `$${(totalSpent - totalBudget).toFixed(2)} over budget`}
        </div>
      </div>

      {/* Individual Budget Items */}
      <div className="space-y-4">
        {budgets.map((budget) => {
          const { status, color, bgColor, barColor } = getBudgetStatus(budget)
          const percentage = Math.min((budget.spent / budget.limit) * 100, 100)

          return (
            <div key={budget.category} className={`p-5 rounded-xl border ${bgColor} border-gray-600`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <h4 className="font-medium text-white">{budget.category}</h4>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      status === "over"
                        ? "bg-red-900/40 text-red-300"
                        : status === "warning"
                          ? "bg-orange-900/40 text-orange-300"
                          : "bg-green-900/40 text-green-300"
                    }`}
                  >
                    {status === "over" ? "Over Budget" : status === "warning" ? "Warning" : "On Track"}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  {editingCategory === budget.category ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-24 px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        step="0.01"
                      />
                      <button
                        onClick={() => handleSave(budget.category)}
                        className="p-1 text-green-400 hover:bg-green-900/20 rounded transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="p-1 text-red-400 hover:bg-red-900/20 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <span className="text-white font-medium">
                        ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleEdit(budget.category, budget.limit)}
                        className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="flex justify-between text-sm text-gray-300">
                <span>{percentage.toFixed(1)}% used</span>
                <span className={color}>
                  {budget.limit - budget.spent >= 0
                    ? `$${(budget.limit - budget.spent).toFixed(2)} left`
                    : `$${(budget.spent - budget.limit).toFixed(2)} over`}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Budget Tips */}
      <div className="bg-blue-900/20 border border-blue-700/30 p-5 rounded-xl mt-6">
        <h4 className="font-medium mb-3 text-blue-300 flex items-center">
          <span className="mr-2">💡</span>
          Smart Budget Tips
        </h4>
        <ul className="text-sm text-blue-200 space-y-2">
          <li>• Review and adjust budgets monthly based on spending patterns</li>
          <li>• Set realistic limits - aim for 50% needs, 30% wants, 20% savings</li>
          <li>• Track daily to stay within limits and avoid overspending</li>
          <li>• Use the 24-hour rule for non-essential purchases over $50</li>
        </ul>
      </div>
    </div>
  )
}

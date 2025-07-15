"use client"

import { TrendingUp, TrendingDown, Calendar, Target } from "lucide-react"
import type { Transaction } from "@/app/page"

interface StatsOverviewProps {
  transactions: Transaction[]
}

export default function StatsOverview({ transactions }: StatsOverviewProps) {
  const getCurrentMonthStats = () => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const monthlyTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date)
      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear
    })

    const income = monthlyTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
    const expenses = monthlyTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

    return { income, expenses, net: income - expenses, count: monthlyTransactions.length }
  }

  const getTopCategories = () => {
    const categorySpending = transactions
      .filter((t) => t.type === "expense")
      .reduce(
        (acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount
          return acc
        },
        {} as Record<string, number>,
      )

    return Object.entries(categorySpending)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
  }

  const getRecentActivity = () => {
    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)
  }

  const monthStats = getCurrentMonthStats()
  const topCategories = getTopCategories()
  const recentActivity = getRecentActivity()

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      Food: "🍽️",
      Transportation: "🚗",
      Entertainment: "🎬",
      Shopping: "🛍️",
      Bills: "📄",
      Healthcare: "🏥",
      Education: "📚",
      Travel: "✈️",
      Other: "📦",
    }
    return icons[category] || "💰"
  }

  return (
    <div className="space-y-6">
      {/* Monthly Overview */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          This Month
        </h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-green-900/20 border border-green-700/30 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm">Income</p>
                <p className="text-2xl font-bold text-green-400">${monthStats.income.toFixed(2)}</p>
              </div>
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </div>

          <div className="bg-red-900/20 border border-red-700/30 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-300 text-sm">Expenses</p>
                <p className="text-2xl font-bold text-red-400">${monthStats.expenses.toFixed(2)}</p>
              </div>
              <TrendingDown className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Net Amount</p>
              <p className={`text-2xl font-bold ${monthStats.net >= 0 ? "text-green-400" : "text-red-400"}`}>
                ${monthStats.net.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-300 text-sm">Transactions</p>
              <p className="text-2xl font-bold text-blue-400">{monthStats.count}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Categories */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2" />
          Top Spending Categories
        </h3>

        {topCategories.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No expenses recorded yet</p>
        ) : (
          <div className="space-y-3">
            {topCategories.map(([category, amount], index) => (
              <div key={category} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getCategoryIcon(category)}</span>
                  <div>
                    <p className="text-white font-medium">{category}</p>
                    <p className="text-gray-400 text-sm">#{index + 1} category</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">${amount.toFixed(2)}</p>
                  <p className="text-gray-400 text-sm">
                    {((amount / monthStats.expenses) * 100).toFixed(1)}% of expenses
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>

        {recentActivity.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{getCategoryIcon(transaction.category)}</span>
                  <div>
                    <p className="text-white font-medium">{transaction.description || transaction.category}</p>
                    <p className="text-gray-400 text-sm">{new Date(transaction.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className={`font-bold ${transaction.type === "income" ? "text-green-400" : "text-red-400"}`}>
                  {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

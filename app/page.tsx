"use client"

import { useState, useEffect } from "react"
import { Plus, TrendingUp, TrendingDown, DollarSign, PieChart, List, Bell } from "lucide-react"
import ExpenseForm from "@/components/expense-form"
import ExpenseChart from "@/components/expense-chart"
import TransactionHistory from "@/components/transaction-history"
import BudgetTracker from "@/components/budget-tracker"
import StatsOverview from "@/components/stats-overview"
import NotificationCenter from "@/components/notification-center"

export interface Transaction {
  id: string
  amount: number
  category: string
  description: string
  date: Date
  type: "income" | "expense"
}

export interface Budget {
  category: string
  limit: number
  spent: number
}

export interface Notification {
  id: string
  type: "warning" | "success" | "info" | "error"
  title: string
  message: string
  timestamp: Date
  read: boolean
}

export default function ExpenseTracker() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([
    { category: "Food", limit: 500, spent: 0 },
    { category: "Transportation", limit: 200, spent: 0 },
    { category: "Entertainment", limit: 150, spent: 0 },
    { category: "Shopping", limit: 300, spent: 0 },
    { category: "Bills", limit: 800, spent: 0 },
  ])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [financialInsights, setFinancialInsights] = useState<any>(null)

  // Background task for financial analytics using Background Tasks API
  useEffect(() => {
    const scheduleAnalytics = () => {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(
          () => {
            calculateFinancialInsights()
          },
          { timeout: 5000 },
        )
      } else {
        setTimeout(calculateFinancialInsights, 100)
      }
    }

    const interval = setInterval(scheduleAnalytics, 10000) // Every 10 seconds
    return () => clearInterval(interval)
  }, [transactions, budgets])

  const calculateFinancialInsights = () => {
    // Background task: Calculate complex financial analytics
    console.log("🔄 Background task: Calculating financial insights...")

    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const monthlyTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date)
      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear
    })

    const totalIncome = monthlyTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = monthlyTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

    const categorySpending = monthlyTransactions
      .filter((t) => t.type === "expense")
      .reduce(
        (acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount
          return acc
        },
        {} as Record<string, number>,
      )

    const insights = {
      monthlyIncome: totalIncome,
      monthlyExpenses: totalExpenses,
      netSavings: totalIncome - totalExpenses,
      categorySpending,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0,
      topSpendingCategory: Object.entries(categorySpending).sort(([, a], [, b]) => b - a)[0]?.[0] || "None",
      averageDailySpending: totalExpenses / new Date().getDate(),
      budgetUtilization: budgets.reduce((acc, b) => acc + (b.spent / b.limit) * 100, 0) / budgets.length,
    }

    setFinancialInsights(insights)

    // Generate smart notifications based on insights
    generateSmartNotifications(insights)

    console.log("✅ Background task completed:", insights)
  }

  const generateSmartNotifications = (insights: any) => {
    const newNotifications: Notification[] = []

    // Budget warnings
    budgets.forEach((budget) => {
      const percentage = (budget.spent / budget.limit) * 100
      if (percentage >= 90 && percentage < 100) {
        newNotifications.push({
          id: `budget-warning-${budget.category}-${Date.now()}`,
          type: "warning",
          title: "Budget Alert",
          message: `You've used ${percentage.toFixed(1)}% of your ${budget.category} budget`,
          timestamp: new Date(),
          read: false,
        })
      } else if (percentage >= 100) {
        newNotifications.push({
          id: `budget-exceeded-${budget.category}-${Date.now()}`,
          type: "error",
          title: "Budget Exceeded",
          message: `You've exceeded your ${budget.category} budget by $${(budget.spent - budget.limit).toFixed(2)}`,
          timestamp: new Date(),
          read: false,
        })
      }
    })

    // Savings rate notifications
    if (insights.savingsRate < 10 && insights.monthlyIncome > 0) {
      newNotifications.push({
        id: `low-savings-${Date.now()}`,
        type: "warning",
        title: "Low Savings Rate",
        message: `Your savings rate is ${insights.savingsRate.toFixed(1)}%. Consider reducing expenses.`,
        timestamp: new Date(),
        read: false,
      })
    } else if (insights.savingsRate > 20) {
      newNotifications.push({
        id: `good-savings-${Date.now()}`,
        type: "success",
        title: "Great Savings!",
        message: `Excellent! You're saving ${insights.savingsRate.toFixed(1)}% of your income.`,
        timestamp: new Date(),
        read: false,
      })
    }

    // High spending notifications
    if (insights.averageDailySpending > 50) {
      newNotifications.push({
        id: `high-spending-${Date.now()}`,
        type: "info",
        title: "Spending Pattern",
        message: `Your daily average spending is $${insights.averageDailySpending.toFixed(2)}`,
        timestamp: new Date(),
        read: false,
      })
    }

    // Add new notifications (avoid duplicates)
    if (newNotifications.length > 0) {
      setNotifications((prev) => {
        const existingIds = new Set(prev.map((n) => n.id.split("-").slice(0, -1).join("-")))
        const uniqueNew = newNotifications.filter((n) => !existingIds.has(n.id.split("-").slice(0, -1).join("-")))
        return [...uniqueNew, ...prev].slice(0, 20) // Keep only latest 20
      })
    }
  }

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    }

    setTransactions((prev) => [newTransaction, ...prev])

    // Update budget spending dynamically
    if (transaction.type === "expense") {
      setBudgets((prev) =>
        prev.map((budget) =>
          budget.category === transaction.category ? { ...budget, spent: budget.spent + transaction.amount } : budget,
        ),
      )
    }

    // Add success notification
    setNotifications((prev) => [
      {
        id: `transaction-added-${Date.now()}`,
        type: "success",
        title: "Transaction Added",
        message: `${transaction.type === "income" ? "Income" : "Expense"} of $${transaction.amount.toFixed(2)} added successfully`,
        timestamp: new Date(),
        read: false,
      },
      ...prev,
    ])

    setShowExpenseForm(false)
  }

  const deleteTransaction = (id: string) => {
    const transaction = transactions.find((t) => t.id === id)
    if (transaction && transaction.type === "expense") {
      setBudgets((prev) =>
        prev.map((budget) =>
          budget.category === transaction.category
            ? { ...budget, spent: Math.max(0, budget.spent - transaction.amount) }
            : budget,
        ),
      )
    }
    setTransactions((prev) => prev.filter((t) => t.id !== id))

    // Add deletion notification
    setNotifications((prev) => [
      {
        id: `transaction-deleted-${Date.now()}`,
        type: "info",
        title: "Transaction Deleted",
        message: `Transaction of $${transaction?.amount.toFixed(2)} has been removed`,
        timestamp: new Date(),
        read: false,
      },
      ...prev,
    ])
  }

  const updateBudget = (category: string, newLimit: number) => {
    setBudgets((prev) => prev.map((budget) => (budget.category === category ? { ...budget, limit: newLimit } : budget)))

    // Add budget update notification
    setNotifications((prev) => [
      {
        id: `budget-updated-${Date.now()}`,
        type: "info",
        title: "Budget Updated",
        message: `${category} budget limit updated to $${newLimit.toFixed(2)}`,
        timestamp: new Date(),
        read: false,
      },
      ...prev,
    ])
  }

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const getFinancialSummary = () => {
    const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      transactionCount: transactions.length,
    }
  }

  const summary = getFinancialSummary()
  const unreadNotifications = notifications.filter((n) => !n.read).length

  const navItems = [
    { id: "overview", label: "Overview", icon: PieChart },
    { id: "transactions", label: "Transactions", icon: List },
    { id: "budgets", label: "Budgets", icon: TrendingUp },
    { id: "analytics", label: "Analytics", icon: DollarSign },
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">MoneyTracker</h1>
              <p className="text-sm text-gray-400">Personal Finance Manager</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Notification Center */}
      {showNotifications && (
        <NotificationCenter
          notifications={notifications}
          onMarkAsRead={markNotificationAsRead}
          onClearAll={clearAllNotifications}
          onClose={() => setShowNotifications(false)}
        />
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Quick Stats - Always Dynamic */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-xl transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Income</p>
                <p className="text-2xl font-bold text-white">${summary.totalIncome.toFixed(2)}</p>
                <p className="text-green-200 text-xs mt-1">
                  {transactions.filter((t) => t.type === "income").length} transactions
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-xl transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Total Expenses</p>
                <p className="text-2xl font-bold text-white">${summary.totalExpenses.toFixed(2)}</p>
                <p className="text-red-200 text-xs mt-1">
                  {transactions.filter((t) => t.type === "expense").length} transactions
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-200" />
            </div>
          </div>

          <div
            className={`bg-gradient-to-r ${summary.balance >= 0 ? "from-blue-600 to-blue-700" : "from-orange-600 to-orange-700"} p-6 rounded-xl transform hover:scale-105 transition-transform`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Net Balance</p>
                <p className="text-2xl font-bold text-white">${summary.balance.toFixed(2)}</p>
                <p className="text-blue-200 text-xs mt-1">{summary.balance >= 0 ? "Positive" : "Negative"} balance</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 rounded-xl transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Transactions</p>
                <p className="text-2xl font-bold text-white">{summary.transactionCount}</p>
                <p className="text-purple-200 text-xs mt-1">
                  {transactions.length > 0
                    ? `Latest: ${new Date(transactions[0]?.date).toLocaleDateString()}`
                    : "No transactions"}
                </p>
              </div>
              <List className="w-8 h-8 text-purple-200" />
            </div>
          </div>
        </div>

        {/* AI Insights - Dynamic */}
        {financialInsights && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <span className="mr-2">🤖</span>
              AI Financial Insights
              <span className="ml-2 text-xs bg-green-600 px-2 py-1 rounded-full">Live</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center bg-green-900/20 p-4 rounded-lg border border-green-700/30">
                <div className="text-3xl font-bold text-green-400">{financialInsights.savingsRate.toFixed(1)}%</div>
                <div className="text-gray-400 text-sm">Savings Rate</div>
                <div className="text-xs text-green-300 mt-1">
                  {financialInsights.savingsRate > 20
                    ? "Excellent!"
                    : financialInsights.savingsRate > 10
                      ? "Good"
                      : "Needs improvement"}
                </div>
              </div>
              <div className="text-center bg-blue-900/20 p-4 rounded-lg border border-blue-700/30">
                <div className="text-3xl font-bold text-blue-400">
                  ${financialInsights.averageDailySpending.toFixed(2)}
                </div>
                <div className="text-gray-400 text-sm">Daily Avg Spending</div>
                <div className="text-xs text-blue-300 mt-1">
                  {financialInsights.averageDailySpending > 50 ? "High" : "Moderate"}
                </div>
              </div>
              <div className="text-center bg-purple-900/20 p-4 rounded-lg border border-purple-700/30">
                <div className="text-lg font-bold text-purple-400">{financialInsights.topSpendingCategory}</div>
                <div className="text-gray-400 text-sm">Top Category</div>
                <div className="text-xs text-purple-300 mt-1">
                  ${financialInsights.categorySpending[financialInsights.topSpendingCategory]?.toFixed(2) || "0.00"}
                </div>
              </div>
              <div className="text-center bg-orange-900/20 p-4 rounded-lg border border-orange-700/30">
                <div className="text-3xl font-bold text-orange-400">
                  {financialInsights.budgetUtilization.toFixed(1)}%
                </div>
                <div className="text-gray-400 text-sm">Budget Usage</div>
                <div className="text-xs text-orange-300 mt-1">
                  {financialInsights.budgetUtilization > 80 ? "High usage" : "On track"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex space-x-1 mb-8 bg-gray-800 p-1 rounded-xl">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all ${
                activeTab === item.id
                  ? "bg-blue-600 text-white shadow-lg transform scale-105"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content - All Dynamic */}
        <div className="space-y-6">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StatsOverview transactions={transactions} />
              <ExpenseChart transactions={transactions} />
            </div>
          )}

          {activeTab === "transactions" && (
            <TransactionHistory transactions={transactions} onDeleteTransaction={deleteTransaction} />
          )}

          {activeTab === "budgets" && <BudgetTracker budgets={budgets} onUpdateBudget={updateBudget} />}

          {activeTab === "analytics" && <ExpenseChart transactions={transactions} />}
        </div>
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowExpenseForm(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-green-500 to-blue-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110"
      >
        <Plus className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Expense Form Modal */}
      {showExpenseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <ExpenseForm onSubmit={addTransaction} onCancel={() => setShowExpenseForm(false)} />
        </div>
      )}
    </div>
  )
}

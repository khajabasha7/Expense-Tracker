"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Trash2, Calendar, ArrowUpDown, Filter } from "lucide-react"
import type { Transaction } from "@/app/page"

interface TransactionHistoryProps {
  transactions: Transaction[]
  onDeleteTransaction: (id: string) => void
}

export default function TransactionHistory({ transactions, onDeleteTransaction }: TransactionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [sortOrder, setSortOrder] = useState("desc")
  const [visibleTransactions, setVisibleTransactions] = useState<Transaction[]>([])
  const [loadedCount, setLoadedCount] = useState(20)
  const [isLoading, setIsLoading] = useState(false)

  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Filter and search transactions
  const filteredTransactions = transactions
    .filter((transaction) => {
      const matchesSearch =
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = filterCategory === "all" || transaction.category === filterCategory
      const matchesType = filterType === "all" || transaction.type === filterType

      return matchesSearch && matchesCategory && matchesType
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
        case "amount":
          comparison = a.amount - b.amount
          break
        case "category":
          comparison = a.category.localeCompare(b.category)
          break
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

  // Intersection Observer API - Lazy loading for performance
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && loadedCount < filteredTransactions.length && !isLoading) {
            console.log("👁️ Intersection Observer: Loading more transactions...")
            setIsLoading(true)

            // Simulate loading delay for better UX
            setTimeout(() => {
              setLoadedCount((prev) => Math.min(prev + 20, filteredTransactions.length))
              setIsLoading(false)
            }, 500)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: "100px",
      },
    )

    if (loadMoreRef.current && observerRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [loadedCount, filteredTransactions.length, isLoading])

  // Update visible transactions when filters change
  useEffect(() => {
    setVisibleTransactions(filteredTransactions.slice(0, loadedCount))
  }, [filteredTransactions, loadedCount])

  // Reset loaded count when filters change
  useEffect(() => {
    setLoadedCount(20)
  }, [searchTerm, filterCategory, filterType, sortBy, sortOrder])

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return "Just now"
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`
    } else if (diffInHours < 48) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString()
    }
  }

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

  const categories = [...new Set(transactions.map((t) => t.category))]

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Transaction History
        </h3>
        <div className="flex items-center space-x-2">
          <div className="bg-gray-700 px-3 py-1 rounded-lg text-sm text-gray-300">
            {filteredTransactions.length} of {transactions.length}
          </div>
          <div className="bg-blue-600 px-3 py-1 rounded-lg text-sm text-white">
            Showing {visibleTransactions.length}
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <div className="flex space-x-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="date">Date</option>
            <option value="amount">Amount</option>
            <option value="category">Category</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="px-3 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 hover:text-white hover:bg-gray-600 transition-all transform hover:scale-105"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {visibleTransactions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            {transactions.length === 0 ? (
              <>
                <div className="text-6xl mb-4">💰</div>
                <p className="text-lg mb-2">No transactions yet</p>
                <p className="text-sm">Add your first transaction to get started!</p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-lg">No transactions match your search</p>
                <p className="text-sm">Try adjusting your filters</p>
              </>
            )}
          </div>
        ) : (
          <>
            {visibleTransactions.map((transaction, index) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all border border-gray-600 transform hover:scale-[1.02]"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="text-2xl">{getCategoryIcon(transaction.category)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-1">
                      <h4 className="font-medium text-white truncate">
                        {transaction.description || transaction.category}
                      </h4>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          transaction.type === "income" ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(new Date(transaction.date))}
                      </span>
                      <span>{transaction.category}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div
                    className={`text-xl font-bold ${transaction.type === "income" ? "text-green-400" : "text-red-400"}`}
                  >
                    {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                  </div>
                  <button
                    onClick={() => onDeleteTransaction(transaction.id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all transform hover:scale-110"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Load More Trigger */}
            {loadedCount < filteredTransactions.length && (
              <div ref={loadMoreRef} className="text-center py-6">
                <div className="flex items-center justify-center space-x-2">
                  {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>}
                  <div className="text-gray-400">
                    {isLoading ? "Loading more transactions..." : "Scroll to load more"}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Summary Stats */}
      {visibleTransactions.length > 0 && (
        <div className="border-t border-gray-600 pt-6 mt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-gray-700 p-4 rounded-lg transform hover:scale-105 transition-transform">
              <div className="text-2xl font-bold text-blue-400">{visibleTransactions.length}</div>
              <div className="text-sm text-gray-400">Shown</div>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg transform hover:scale-105 transition-transform">
              <div className="text-2xl font-bold text-green-400">
                $
                {visibleTransactions
                  .filter((t) => t.type === "income")
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toFixed(2)}
              </div>
              <div className="text-sm text-gray-400">Income</div>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg transform hover:scale-105 transition-transform">
              <div className="text-2xl font-bold text-red-400">
                $
                {visibleTransactions
                  .filter((t) => t.type === "expense")
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toFixed(2)}
              </div>
              <div className="text-sm text-gray-400">Expenses</div>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg transform hover:scale-105 transition-transform">
              <div className="text-2xl font-bold text-purple-400">
                $
                {(
                  visibleTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0) -
                  visibleTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
                ).toFixed(2)}
              </div>
              <div className="text-sm text-gray-400">Net</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

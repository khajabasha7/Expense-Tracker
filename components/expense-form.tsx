"use client"

import type React from "react"

import { useState } from "react"
import { X, DollarSign, Tag, Calendar, FileText } from "lucide-react"

interface ExpenseFormProps {
  onSubmit: (transaction: {
    amount: number
    category: string
    description: string
    date: Date
    type: "income" | "expense"
  }) => void
  onCancel: () => void
}

const categories = [
  "Food",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Bills",
  "Healthcare",
  "Education",
  "Travel",
  "Other",
]

export default function ExpenseForm({ onSubmit, onCancel }: ExpenseFormProps) {
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    description: "",
    type: "expense" as "income" | "expense",
    date: new Date().toISOString().split("T")[0],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.amount || !formData.category) {
      alert("Please fill in all required fields")
      return
    }

    onSubmit({
      amount: Number.parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      date: new Date(formData.date),
      type: formData.type,
    })
  }

  return (
    <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-auto border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Add Transaction</h2>
        <button onClick={onCancel} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Toggle */}
        <div className="flex bg-gray-700 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, type: "expense" }))}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              formData.type === "expense" ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, type: "income" }))}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              formData.type === "income" ? "bg-green-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Income
          </button>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <DollarSign className="w-4 h-4 inline mr-1" />
            Amount
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Tag className="w-4 h-4 inline mr-1" />
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Date
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <FileText className="w-4 h-4 inline mr-1" />
            Description
          </label>
          <textarea
            placeholder="Optional description..."
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
          >
            Add Transaction
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

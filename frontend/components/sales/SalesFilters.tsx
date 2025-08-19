'use client'

import { useState } from 'react'
import { Search, Calendar, Filter, X } from 'lucide-react'

interface SalesFiltersProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  saleType: string
  onSaleTypeChange: (type: string) => void
  startDate: string
  onStartDateChange: (date: string) => void
  endDate: string
  onEndDateChange: (date: string) => void
  onClearFilters: () => void
}

export default function SalesFilters({
  searchTerm,
  onSearchChange,
  saleType,
  onSaleTypeChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onClearFilters
}: SalesFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const hasActiveFilters = searchTerm || saleType || startDate || endDate

  return (
    <div className="space-y-4">
      {/* Basic Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search sales by item name, type, or sale type..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="input pl-10 w-full"
        />
      </div>

      {/* Advanced Filters Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="btn btn-secondary flex items-center text-sm"
        >
          <Filter className="h-4 w-4 mr-2" />
          {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
        </button>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="btn btn-danger flex items-center text-sm"
          >
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sale Type Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Sale Type
              </label>
              <select
                value={saleType}
                onChange={(e) => onSaleTypeChange(e.target.value)}
                className="input text-sm"
              >
                <option value="">All Types</option>
                <option value="store">Store Sales</option>
                <option value="out_of_store">Out of Store Sales</option>
              </select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="input text-sm"
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="input text-sm"
                min={startDate}
              />
            </div>
          </div>

          {/* Quick Date Presets */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                const today = new Date()
                const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
                onStartDateChange(weekAgo.toISOString().split('T')[0])
                onEndDateChange(today.toISOString().split('T')[0])
              }}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
            >
              Last 7 Days
            </button>
            <button
              onClick={() => {
                const today = new Date()
                const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
                onStartDateChange(monthAgo.toISOString().split('T')[0])
                onEndDateChange(today.toISOString().split('T')[0])
              }}
              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
            >
              Last Month
            </button>
            <button
              onClick={() => {
                const today = new Date()
                const yearStart = new Date(today.getFullYear(), 0, 1)
                onStartDateChange(yearStart.toISOString().split('T')[0])
                onEndDateChange(today.toISOString().split('T')[0])
              }}
              className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
            >
              This Year
            </button>
            <button
              onClick={() => {
                const today = new Date()
                const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
                onStartDateChange(monthStart.toISOString().split('T')[0])
                onEndDateChange(today.toISOString().split('T')[0])
              }}
              className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors"
            >
              This Month
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

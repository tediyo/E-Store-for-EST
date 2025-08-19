'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { TrendingUp, DollarSign, ShoppingCart, Store, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../dashboard/ui/Card'

interface SalesStats {
  totalSales: number
  totalRevenue: number
  totalProfit: number
  storeSales: number
  outOfStoreSales: number
}

export default function SalesStats() {
  const [stats, setStats] = useState<SalesStats>({
    totalSales: 0,
    totalRevenue: 0,
    totalProfit: 0,
    storeSales: 0,
    outOfStoreSales: 0
  })
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('all')

  useEffect(() => {
    fetchStats()
  }, [dateRange])

  const fetchStats = async () => {
    try {
      setLoading(true)
      let url = 'http://localhost:5000/api/sales/stats/overview'
      
      if (dateRange !== 'all') {
        const now = new Date()
        let startDate: Date
        
        switch (dateRange) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            break
          case 'week':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
            break
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            break
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1)
            break
          default:
            startDate = new Date(0)
        }
        
        url += `?startDate=${startDate.toISOString()}&endDate=${now.toISOString()}`
      }
      
      const token = localStorage.getItem('token')
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch sales stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getProfitColor = (profit: number) => {
    return profit >= 0 ? 'text-success-600' : 'text-danger-600'
  }

  const getProfitIcon = (profit: number) => {
    return profit >= 0 ? '↗️' : '↘️'
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Sales Overview</h3>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="input text-sm"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Sales */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.totalSales}</div>
            <p className="text-xs text-blue-600">Transactions</p>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-xs text-green-600">Gross Income</p>
          </CardContent>
        </Card>

        {/* Total Profit */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Total Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getProfitColor(stats.totalProfit)}`}>
              {formatCurrency(stats.totalProfit)}
            </div>
            <p className="text-xs text-purple-600 flex items-center">
              {getProfitIcon(stats.totalProfit)} Net Profit
            </p>
          </CardContent>
        </Card>

        {/* Store vs Out of Store */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 flex items-center">
              <Store className="h-4 w-4 mr-2" />
              Sale Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-orange-600 flex items-center">
                  <Store className="h-3 w-3 mr-1" />
                  Store
                </span>
                <span className="font-semibold text-orange-900">{stats.storeSales}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-orange-600 flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  Out of Store
                </span>
                <span className="font-semibold text-orange-900">{stats.outOfStoreSales}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      {stats.totalRevenue > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {((stats.totalProfit / stats.totalRevenue) * 100).toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">Profit Margin</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {stats.totalSales > 0 ? formatCurrency(stats.totalRevenue / stats.totalSales) : '$0'}
                </div>
                <p className="text-sm text-gray-600">Average Sale Value</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {stats.totalSales > 0 ? formatCurrency(stats.totalProfit / stats.totalSales) : '$0'}
                </div>
                <p className="text-sm text-gray-600">Average Profit per Sale</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

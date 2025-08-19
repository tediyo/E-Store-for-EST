'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp,
  Calendar,
  Clock,
  BarChart3,
  ClipboardList
} from 'lucide-react'
import toast from 'react-hot-toast'

interface DashboardData {
  summary: {
    totalTransactions: number
    totalProfit: number
    totalRevenue: number
    totalCosts: number
  }
  sales: {
    totalSales: number
    totalRevenue: number
    totalProfit: number
    storeSales: number
    outOfStoreSales: number
  }
  inventory: {
    totalItems: number
    totalValue: number
    inStockItems: number
    lowStockItems: number
    outOfStockItems: number
  }
  tasks: {
    totalTasks: number
    totalProfit: number
    totalCosts: number
    storeTasks: number
    outOfStoreTasks: number
  }
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('all')

  useEffect(() => {
    fetchDashboardData()
  }, [period])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`http://localhost:5000/api/dashboard/overview?period=${period}`)
      setData(response.data)
    } catch (error) {
      toast.error('Failed to fetch dashboard data')
      console.error('Dashboard error:', error)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your inventory and sales</p>
        </div>
        
        {/* Period Filter */}
        <div className="mt-4 sm:mt-0">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="input w-auto"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Sales + Tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.summary.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              From sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.summary.totalProfit)}</div>
            <p className="text-xs text-muted-foreground">
              Revenue - Costs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Costs</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.summary.totalCosts)}</div>
            <p className="text-xs text-muted-foreground">
              From tasks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Sales Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Total Sales:</span>
              <span className="font-semibold">{data.sales.totalSales}</span>
            </div>
            <div className="flex justify-between">
              <span>Store Sales:</span>
              <span className="font-semibold text-success-600">{data.sales.storeSales}</span>
            </div>
            <div className="flex justify-between">
              <span>Out of Store:</span>
              <span className="font-semibold text-warning-600">{data.sales.outOfStoreSales}</span>
            </div>
            <div className="flex justify-between">
              <span>Revenue:</span>
              <span className="font-semibold text-primary-600">{formatCurrency(data.sales.totalRevenue)}</span>
            </div>
            <div className="flex justify-between">
              <span>Profit:</span>
              <span className="font-semibold text-success-600">{formatCurrency(data.sales.totalProfit)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Inventory Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Total Items:</span>
              <span className="font-semibold">{data.inventory.totalItems}</span>
            </div>
            <div className="flex justify-between">
              <span>In Stock:</span>
              <span className="font-semibold text-success-600">{data.inventory.inStockItems}</span>
            </div>
            <div className="flex justify-between">
              <span>Low Stock:</span>
              <span className="font-semibold text-warning-600">{data.inventory.lowStockItems}</span>
            </div>
            <div className="flex justify-between">
              <span>Out of Stock:</span>
              <span className="font-semibold text-danger-600">{data.inventory.outOfStockItems}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Value:</span>
              <span className="font-semibold text-primary-600">{formatCurrency(data.inventory.totalValue)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClipboardList className="h-5 w-5 mr-2" />
              Tasks Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Total Tasks:</span>
              <span className="font-semibold">{data.tasks.totalTasks}</span>
            </div>
            <div className="flex justify-between">
              <span>Store Tasks:</span>
              <span className="font-semibold text-success-600">{data.tasks.storeTasks}</span>
            </div>
            <div className="flex justify-between">
              <span>Out of Store:</span>
              <span className="font-semibold text-warning-600">{data.tasks.outOfStoreTasks}</span>
            </div>
            <div className="flex justify-between">
              <span>Profit:</span>
              <span className="font-semibold text-success-600">{formatCurrency(data.tasks.totalProfit)}</span>
            </div>
            <div className="flex justify-between">
              <span>Costs:</span>
              <span className="font-semibold text-danger-600">{formatCurrency(data.tasks.totalCosts)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

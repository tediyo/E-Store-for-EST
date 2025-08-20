'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { BarChart3, TrendingUp, Calendar, DollarSign, Package } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import PageLayout from '../../components/layout/PageLayout'

interface AnalyticsData {
  period: string
  dateRange: any
  salesTrend: Array<{
    _id: string
    sales: number
    revenue: number
    profit: number
  }>
  tasksTrend: Array<{
    _id: string
    tasks: number
    profit: number
    costs: number
  }>
}

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`http://localhost:5000/api/dashboard/analytics?period=${period}`)
      setAnalyticsData(response.data)
    } catch (error) {
      toast.error('Failed to fetch analytics data')
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

  return (
    <PageLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600">Detailed insights into your business performance</p>
        </div>
        
        {/* Period Filter */}
        <div className="mt-4 sm:mt-0">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="input w-auto"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {analyticsData ? (
        <>
          {/* Sales Trend */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <TrendingUp className="h-6 w-6 text-primary-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Sales Trend</h2>
            </div>
            
            {analyticsData.salesTrend.length > 0 ? (
              <div className="space-y-4">
                {analyticsData.salesTrend.map((trend) => (
                  <div key={trend._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="font-medium text-gray-900">{trend._id}</span>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Sales</p>
                        <p className="text-lg font-semibold text-primary-600">{trend.sales}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Revenue</p>
                        <p className="text-lg font-semibold text-success-600">{formatCurrency(trend.revenue)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Profit</p>
                        <p className="text-lg font-semibold text-success-600">{formatCurrency(trend.profit)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No sales data available for this period</p>
              </div>
            )}
          </div>

          {/* Tasks Trend */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <Package className="h-6 w-6 text-primary-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Tasks Trend</h2>
            </div>
            
            {analyticsData.tasksTrend.length > 0 ? (
              <div className="space-y-4">
                {analyticsData.tasksTrend.map((trend) => (
                  <div key={trend._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="font-medium text-gray-900">{trend._id}</span>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Tasks</p>
                        <p className="text-lg font-semibold text-primary-600">{trend.tasks}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Profit</p>
                        <p className="text-lg font-semibold text-success-600">{formatCurrency(trend.profit)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Costs</p>
                        <p className="text-lg font-semibold text-danger-600">{formatCurrency(trend.costs)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No task data available for this period</p>
              </div>
            )}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-success-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(analyticsData.salesTrend.reduce((sum, trend) => sum + trend.revenue, 0))}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-primary-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Total Profit</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(
                      analyticsData.salesTrend.reduce((sum, trend) => sum + trend.profit, 0) +
                      analyticsData.tasksTrend.reduce((sum, trend) => sum + trend.profit, 0)
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-warning-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Total Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData.tasksTrend.reduce((sum, trend) => sum + trend.tasks, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data available</h3>
          <p className="text-gray-500">Try selecting a different time period or check back later.</p>
        </div>
      )}
      </div>
    </PageLayout>
  )
}

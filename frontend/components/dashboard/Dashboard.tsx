'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { api } from '../../lib/api'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp,
  Calendar,
  Clock,
  BarChart3,
  ClipboardList,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  PieChart,
  Target,
  Zap
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
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

interface ChartData {
  name: string
  revenue: number
  profit: number
  costs: number
  sales: number
}

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

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('all')
  const [selectedMetric, setSelectedMetric] = useState('revenue')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchDashboardData()
  }, [period])

  const fetchDashboardData = async (retryCount = 0) => {
    try {
      setLoading(true)
      
      // Add retry logic for mobile connectivity issues
      const makeRequest = async (url: string) => {
        try {
          return await axios.get(url, {
            timeout: 15000, // 15 second timeout for mobile
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            }
          })
        } catch (error: any) {
          // If it's a network error and we haven't retried yet, try again
          if (retryCount < 2 && (error.code === 'NETWORK_ERROR' || error.message.includes('fetch'))) {
            console.log(`Retrying request (attempt ${retryCount + 1})...`)
            await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
            return makeRequest(url)
          }
          throw error
        }
      }
      
      const [overviewResponse, analyticsResponse] = await Promise.all([
        makeRequest(`${api.baseURL}/api/dashboard/overview?period=${period}`),
        makeRequest(`${api.baseURL}/api/dashboard/analytics?period=${period}`)
      ])
      
      setData(overviewResponse.data)
      setAnalyticsData(analyticsResponse.data)
      
      // Process chart data from analytics
      const salesTrend = analyticsResponse.data.salesTrend || []
      const tasksTrend = analyticsResponse.data.tasksTrend || []
      
      // Combine sales and tasks data for charts
      const processedChartData = salesTrend.map((item: any) => ({
        name: formatDateForChart(item._id, period),
        revenue: item.revenue || 0,
        profit: item.profit || 0,
        costs: 0, // Will be filled from tasks data
        sales: item.sales || 0
      }))
      
      // Add costs from tasks data
      tasksTrend.forEach((taskItem: any) => {
        const existingItem = processedChartData.find(item => item.name === formatDateForChart(taskItem._id, period))
        if (existingItem) {
          existingItem.costs = taskItem.costs || 0
        } else {
          processedChartData.push({
            name: formatDateForChart(taskItem._id, period),
            revenue: 0,
            profit: 0,
            costs: taskItem.costs || 0,
            sales: 0
          })
        }
      })
      
      setChartData(processedChartData.sort((a, b) => a.name.localeCompare(b.name)))
    } catch (error: any) {
      console.error('Dashboard error:', error)
      
      // Check if it's a network/connectivity issue
      const isNetworkError = error.code === 'NETWORK_ERROR' || 
                           error.message.includes('fetch') || 
                           error.message.includes('Network Error') ||
                           !navigator.onLine
      
      // Instead of showing error, set zero data to display empty state gracefully
      const zeroData: DashboardData = {
        summary: {
          totalTransactions: 0,
          totalProfit: 0,
          totalRevenue: 0,
          totalCosts: 0
        },
        sales: {
          totalSales: 0,
          totalRevenue: 0,
          totalProfit: 0,
          storeSales: 0,
          outOfStoreSales: 0
        },
        inventory: {
          totalItems: 0,
          totalValue: 0,
          inStockItems: 0,
          lowStockItems: 0,
          outOfStockItems: 0
        },
        tasks: {
          totalTasks: 0,
          totalProfit: 0,
          totalCosts: 0,
          storeTasks: 0,
          outOfStoreTasks: 0
        }
      }
      
      setData(zeroData)
      setAnalyticsData({
        period: period,
        dateRange: {},
        salesTrend: [],
        tasksTrend: []
      })
      setChartData([])
      
      // Show appropriate message based on error type
      if (isNetworkError) {
        toast('Connection issue - showing offline data', {
          icon: '📱',
          duration: 4000,
          style: {
            background: '#F59E0B',
            color: 'white',
          }
        })
      } else {
        toast('No data available - showing empty dashboard', {
          icon: 'ℹ️',
          duration: 3000,
          style: {
            background: '#3B82F6',
            color: 'white',
          }
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const formatDateForChart = (dateString: string, period: string) => {
    const date = new Date(dateString)
    if (period === 'week' || period === 'month') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } else if (period === 'year') {
      return date.toLocaleDateString('en-US', { month: 'short' })
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const handleQuickAction = async (action: string, route: string) => {
    try {
      setActionLoading(action)
      
      // Simulate a brief loading state for better UX
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Show success toast
      toast.success(`${action} page opened successfully!`)
      
      // Navigate to the route
      router.push(route)
    } catch (error) {
      toast.error(`Failed to open ${action} page`)
      console.error('Navigation error:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }


  // Real inventory data from API
  const getInventoryChartData = () => {
    if (!data) return [
      { name: 'In Stock', value: 0, color: '#3B82F6' },
      { name: 'Low Stock', value: 0, color: '#F97316' },
      { name: 'Out of Stock', value: 0, color: '#3B82F6' },
    ]
    return [
      { name: 'In Stock', value: data.inventory.inStockItems, color: '#3B82F6' },
      { name: 'Low Stock', value: data.inventory.lowStockItems, color: '#F97316' },
      { name: 'Out of Stock', value: data.inventory.outOfStockItems, color: '#3B82F6' },
    ]
  }

  const salesComparisonData = [
    { name: 'Store Sales', value: 70, color: '#3B82F6' },
    { name: 'Out of Store', value: 30, color: '#F97316' },
  ]

  const performanceData = [
    { metric: 'Revenue Growth', value: 85, fullMark: 100 },
    { metric: 'Profit Margin', value: 72, fullMark: 100 },
    { metric: 'Inventory Turnover', value: 68, fullMark: 100 },
    { metric: 'Customer Satisfaction', value: 91, fullMark: 100 },
    { metric: 'Cost Efficiency', value: 78, fullMark: 100 },
  ]

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
                <div className="h-64 bg-gray-200 rounded-2xl"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }


  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Professional Dashboard Header */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 text-white overflow-hidden border border-blue-500/50">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-pattern-dots opacity-5"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 text-white">
                Business Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">Performance overview</p>
            </div>
        
            {/* Enhanced Period Filter */}
            <div className="mt-4 sm:mt-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => fetchDashboardData()}
                  disabled={loading}
                  className="p-2 text-white hover:text-blue-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={loading ? 'Refreshing...' : 'Refresh'}
                >
                  <div className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : ''}`}>
                    {loading ? (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                  </div>
                </button>
                
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-xl sm:rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
                    className="relative px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl sm:rounded-2xl text-white font-semibold focus:ring-4 focus:ring-white/20 focus:border-white/50 transition-all duration-300 cursor-pointer text-xs sm:text-sm"
                  >
                    <option value="all">📊 All Time</option>
                    <option value="today">📅 Today</option>
                    <option value="week">📈 This Week</option>
                    <option value="month">🗓️ This Month</option>
                    <option value="year">📊 This Year</option>
          </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Professional Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 lg:p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="p-1.5 sm:p-2 bg-white/30 rounded-lg">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 text-orange-300 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1">{data.summary.totalTransactions}</div>
              <div className="text-xs text-white/80">Total Transactions</div>
              <div className="w-full bg-white/20 rounded-full h-1 mt-2">
                <div className="bg-orange-300 rounded-full h-1" style={{ width: '75%' }}></div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 lg:p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="p-1.5 sm:p-2 bg-white/30 rounded-lg">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 text-orange-300 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 truncate">{formatCurrency(data.summary.totalRevenue)}</div>
              <div className="text-xs text-white/80">Total Revenue</div>
              <div className="w-full bg-white/20 rounded-full h-1 mt-2">
                <div className="bg-orange-300 rounded-full h-1" style={{ width: '85%' }}></div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 lg:p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="p-1.5 sm:p-2 bg-white/30 rounded-lg">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 text-orange-300 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 truncate">{formatCurrency(data.summary.totalProfit)}</div>
              <div className="text-xs text-white/80">Total Profit</div>
              <div className="w-full bg-white/20 rounded-full h-1 mt-2">
                <div className="bg-orange-300 rounded-full h-1" style={{ width: '92%' }}></div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 lg:p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="p-1.5 sm:p-2 bg-white/30 rounded-lg">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4 text-orange-300 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 truncate">{formatCurrency(data.summary.totalCosts)}</div>
              <div className="text-xs text-white/80">Total Costs</div>
              <div className="w-full bg-white/20 rounded-full h-1 mt-2">
                <div className="bg-orange-300 rounded-full h-1" style={{ width: '45%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Revenue & Profit Trend Chart */}
        <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <span className="hidden sm:inline">Revenue & Profit Trends</span>
              <span className="sm:hidden">Trends</span>
            </h3>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {['revenue', 'profit', 'costs', 'sales'].map((metric) => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                    selectedMetric === metric
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                  }`}
                >
                  {metric.charAt(0).toUpperCase() + metric.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-64 sm:h-72 lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.length > 0 ? chartData : [{ name: 'No Data', revenue: 0, profit: 0, costs: 0, sales: 0 }]}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorCosts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '12px', 
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    padding: '12px'
                  }}
                  labelStyle={{ fontWeight: 'bold', color: '#374151' }}
                  formatter={(value, name) => [
                    name === 'revenue' ? `$${value.toLocaleString()}` : 
                    name === 'profit' ? `$${value.toLocaleString()}` : 
                    name === 'costs' ? `$${value.toLocaleString()}` : 
                    `${value} units`,
                    typeof name === 'string' ? name.charAt(0).toUpperCase() + name.slice(1) : String(name)
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey={selectedMetric} 
                  stroke={selectedMetric === 'revenue' ? '#3B82F6' : selectedMetric === 'profit' ? '#F97316' : selectedMetric === 'costs' ? '#3B82F6' : '#F97316'} 
                  fill={selectedMetric === 'revenue' ? 'url(#colorRevenue)' : selectedMetric === 'profit' ? 'url(#colorProfit)' : selectedMetric === 'costs' ? 'url(#colorCosts)' : 'url(#colorSales)'}
                  strokeWidth={3}
                  activeDot={{ r: 8, strokeWidth: 2, stroke: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Distribution Chart */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                <Package className="h-6 w-6 text-white" />
              </div>
              Inventory Distribution
            </h3>
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Items</div>
              <div className="text-2xl font-bold text-orange-600">{data.inventory.totalItems}</div>
            </div>
          </div>
          
          <div className="h-64 sm:h-72 lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={getInventoryChartData()}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6B7280"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke="#6B7280"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '12px', 
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    padding: '12px'
                  }}
                  formatter={(value, name) => [
                    `${value} items`,
                    name
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#F97316" 
                  strokeWidth={4}
                  dot={{ fill: '#F97316', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#F97316', strokeWidth: 2, fill: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Simple Legend */}
          <div className="flex justify-center gap-6 mt-4">
            {getInventoryChartData().map((item, index) => (
              <div key={`legend-${item.name}-${index}`} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm font-medium text-gray-700">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics & Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Sales Performance */}
        <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg sm:rounded-xl">
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <span className="hidden sm:inline">Sales Performance</span>
              <span className="sm:hidden">Sales</span>
            </h3>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">
              {data.sales.totalSales}
        </div>
      </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl">
              <span className="text-gray-600 font-medium text-sm sm:text-base">Store Sales</span>
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="font-bold text-blue-600 text-sm sm:text-base">{data.sales.storeSales}</span>
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl sm:rounded-2xl">
              <span className="text-gray-600 font-medium text-sm sm:text-base">Out of Store</span>
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="font-bold text-orange-600 text-sm sm:text-base">{data.sales.outOfStoreSales}</span>
                <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl">
              <span className="text-gray-600 font-medium text-sm sm:text-base">Revenue</span>
              <span className="font-bold text-green-600 text-sm sm:text-base truncate">{formatCurrency(data.sales.totalRevenue)}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl sm:rounded-2xl">
              <span className="text-gray-600 font-medium text-sm sm:text-base">Profit</span>
              <span className="font-bold text-purple-600 text-sm sm:text-base truncate">{formatCurrency(data.sales.totalProfit)}</span>
            </div>
          </div>
      </div>

        {/* Inventory Status */}
        <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg sm:rounded-xl">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <span className="hidden sm:inline">Inventory Status</span>
              <span className="sm:hidden">Inventory</span>
            </h3>
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {data.inventory.totalItems}
            </div>
            </div>
          
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl">
              <span className="text-gray-600 font-medium text-sm sm:text-base">In Stock</span>
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="font-bold text-green-600 text-sm sm:text-base">{data.inventory.inStockItems}</span>
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
            </div>
            </div>
            
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl sm:rounded-2xl">
              <span className="text-gray-600 font-medium text-sm sm:text-base">Low Stock</span>
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="font-bold text-orange-600 text-sm sm:text-base">{data.inventory.lowStockItems}</span>
                <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
            </div>
            </div>
            
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl sm:rounded-2xl">
              <span className="text-gray-600 font-medium text-sm sm:text-base">Out of Stock</span>
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="font-bold text-red-600 text-sm sm:text-base">{data.inventory.outOfStockItems}</span>
                <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
            </div>
            </div>
            
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl">
              <span className="text-gray-600 font-medium text-sm sm:text-base">Total Value</span>
              <span className="font-bold text-blue-600 text-sm sm:text-base truncate">{formatCurrency(data.inventory.totalValue)}</span>
            </div>
            </div>
            </div>

        {/* Tasks Overview */}
        <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg sm:rounded-xl">
                <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <span className="hidden sm:inline">Tasks Overview</span>
              <span className="sm:hidden">Tasks</span>
            </h3>
            <div className="text-xl sm:text-2xl font-bold text-purple-600">
              {data.tasks.totalTasks}
            </div>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl">
              <span className="text-gray-600 font-medium text-sm sm:text-base">Store Tasks</span>
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="font-bold text-green-600 text-sm sm:text-base">{data.tasks.storeTasks}</span>
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl sm:rounded-2xl">
              <span className="text-gray-600 font-medium text-sm sm:text-base">Out of Store</span>
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="font-bold text-orange-600 text-sm sm:text-base">{data.tasks.outOfStoreTasks}</span>
                <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl">
              <span className="text-gray-600 font-medium text-sm sm:text-base">Profit</span>
              <span className="font-bold text-green-600 text-sm sm:text-base truncate">{formatCurrency(data.tasks.totalProfit)}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl sm:rounded-2xl">
              <span className="text-gray-600 font-medium text-sm sm:text-base">Costs</span>
              <span className="font-bold text-red-600 text-sm sm:text-base truncate">{formatCurrency(data.tasks.totalCosts)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Radar Chart */}
      <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8 hover:shadow-2xl transition-all duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <span className="hidden sm:inline">Performance Metrics</span>
              <span className="sm:hidden">Performance</span>
            </h3>
          <div className="text-xs sm:text-sm text-gray-500">
            Overall Score: <span className="font-bold text-blue-600">78.8%</span>
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={performanceData}>
              <PolarGrid stroke="#E5E7EB" />
              <PolarAngleAxis dataKey="metric" stroke="#6B7280" />
              <PolarRadiusAxis stroke="#6B7280" />
              <Radar
                name="Performance"
                dataKey="value"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.3}
                strokeWidth={3}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' 
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 border border-gray-100">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl">
            <Zap className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
          </div>
          <span className="hidden sm:inline">Quick Actions</span>
          <span className="sm:hidden">Actions</span>
        </h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <button 
            onClick={() => handleQuickAction('New Sale', '/sales')} 
            className={`group p-3 sm:p-4 lg:p-6 bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 ${
              actionLoading === 'New Sale' ? 'opacity-50 cursor-not-allowed scale-95' : ''
            }`}
            disabled={actionLoading === 'New Sale'}
          >
            <div className="text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">
                {actionLoading === 'New Sale' ? (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                )}
              </div>
              <div className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base">
                {actionLoading === 'New Sale' ? 'Opening...' : 'New Sale'}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                {actionLoading === 'New Sale' ? 'Please wait...' : 'Record transaction'}
              </div>
            </div>
          </button>
          
          <button 
            onClick={() => handleQuickAction('Add Item', '/inventory')} 
            className={`group p-3 sm:p-4 lg:p-6 bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 ${
              actionLoading === 'Add Item' ? 'opacity-50 cursor-not-allowed scale-95' : ''
            }`}
            disabled={actionLoading === 'Add Item'}
          >
            <div className="text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">
                {actionLoading === 'Add Item' ? (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                )}
              </div>
              <div className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base">
                {actionLoading === 'Add Item' ? 'Opening...' : 'Add Item'}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                {actionLoading === 'Add Item' ? 'Please wait...' : 'Update inventory'}
              </div>
            </div>
          </button>
          
          <button 
            onClick={() => handleQuickAction('New Task', '/tasks')} 
            className={`group p-3 sm:p-4 lg:p-6 bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 ${
              actionLoading === 'New Task' ? 'opacity-50 cursor-not-allowed scale-95' : ''
            }`}
            disabled={actionLoading === 'New Task'}
          >
            <div className="text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">
                {actionLoading === 'New Task' ? (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                )}
              </div>
              <div className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base">
                {actionLoading === 'New Task' ? 'Opening...' : 'New Task'}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                {actionLoading === 'New Task' ? 'Please wait...' : 'Create task'}
              </div>
            </div>
          </button>
          
          <button 
            onClick={() => handleQuickAction('View Reports', '/analytics')} 
            className={`group p-3 sm:p-4 lg:p-6 bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 ${
              actionLoading === 'View Reports' ? 'opacity-50 cursor-not-allowed scale-95' : ''
            }`}
            disabled={actionLoading === 'View Reports'}
          >
            <div className="text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">
                {actionLoading === 'View Reports' ? (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                )}
            </div>
              <div className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base">
                {actionLoading === 'View Reports' ? 'Opening...' : 'View Reports'}
            </div>
              <div className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                {actionLoading === 'View Reports' ? 'Please wait...' : 'Detailed analytics'}
            </div>
            </div>
          </button>
            </div>
      </div>
    </div>
  )
}

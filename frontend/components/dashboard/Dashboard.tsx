'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
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

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('all')
  const [selectedMetric, setSelectedMetric] = useState('revenue')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const router = useRouter()

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

  // Mock data for charts (replace with real data from API)
  const chartData = [
    { name: 'Jan', revenue: 4000, profit: 2400, costs: 1600, sales: 24 },
    { name: 'Feb', revenue: 3000, profit: 1398, costs: 1602, sales: 18 },
    { name: 'Mar', revenue: 2000, profit: 9800, costs: 10200, sales: 32 },
    { name: 'Apr', revenue: 2780, profit: 3908, costs: 1128, sales: 28 },
    { name: 'May', revenue: 1890, profit: 4800, costs: 6900, sales: 35 },
    { name: 'Jun', revenue: 2390, profit: 3800, costs: 1410, sales: 42 },
  ]

  // Real inventory data from API
  const getInventoryChartData = () => {
    if (!data) return []
    return [
      { name: 'In Stock', value: data.inventory.inStockItems, color: '#10B981' },
      { name: 'Low Stock', value: data.inventory.lowStockItems, color: '#F59E0B' },
      { name: 'Out of Stock', value: data.inventory.outOfStockItems, color: '#EF4444' },
    ]
  }

  const salesComparisonData = [
    { name: 'Store Sales', value: 70, color: '#3B82F6' },
    { name: 'Out of Store', value: 30, color: '#F59E0B' },
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

  if (!data) {
    return (
      <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-xl border border-gray-100">
        <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <BarChart3 className="h-16 w-16 text-blue-500" />
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-4">No Data Available</h3>
        <p className="text-lg text-gray-600">Start adding data to see your dashboard analytics</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Professional Dashboard Header */}
      <div className="relative bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900 rounded-2xl p-8 text-white overflow-hidden border border-slate-700/50">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-pattern-dots opacity-5"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-3 text-white">
                Business Dashboard
              </h1>
              <p className="text-lg text-slate-300">Comprehensive overview of your business performance</p>
            </div>
        
            {/* Enhanced Period Filter */}
            <div className="mt-6 sm:mt-0">
              <div className="flex gap-3">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
                    className="relative px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl text-white font-semibold focus:ring-4 focus:ring-white/20 focus:border-white/50 transition-all duration-300 cursor-pointer"
                  >
                    <option value="all">📊 All Time</option>
                    <option value="today">📅 Today</option>
                    <option value="week">📈 This Week</option>
                    <option value="month">🗓️ This Month</option>
                    <option value="year">📊 This Year</option>
          </select>
                </div>
                
                {/* Refresh Button */}
                <button
                  onClick={fetchDashboardData}
                  disabled={loading}
                  className="relative group px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl text-white font-semibold hover:bg-white/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}>
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      )}
                    </div>
                    {loading ? 'Refreshing...' : 'Refresh'}
                  </div>
                </button>
              </div>
            </div>
          </div>
          
          {/* Professional Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/30 rounded-xl">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-green-300 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{data.summary.totalTransactions}</div>
              <div className="text-sm text-slate-300">Total Transactions</div>
              <div className="w-full bg-white/20 rounded-full h-1 mt-3">
                <div className="bg-green-300 rounded-full h-1" style={{ width: '75%' }}></div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/30 rounded-xl">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-green-300 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{formatCurrency(data.summary.totalRevenue)}</div>
              <div className="text-sm text-slate-300">Total Revenue</div>
              <div className="w-full bg-white/20 rounded-full h-1 mt-3">
                <div className="bg-green-300 rounded-full h-1" style={{ width: '85%' }}></div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-500/30 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-green-300 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{formatCurrency(data.summary.totalProfit)}</div>
              <div className="text-sm text-slate-300">Total Profit</div>
              <div className="w-full bg-white/20 rounded-full h-1 mt-3">
                <div className="bg-green-300 rounded-full h-1" style={{ width: '92%' }}></div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-500/30 rounded-xl">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <ArrowDownRight className="h-5 w-5 text-red-300 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{formatCurrency(data.summary.totalCosts)}</div>
              <div className="text-sm text-slate-300">Total Costs</div>
              <div className="w-full bg-white/20 rounded-full h-1 mt-3">
                <div className="bg-red-300 rounded-full h-1" style={{ width: '45%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue & Profit Trend Chart */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              Revenue & Profit Trends
            </h3>
            <div className="flex gap-2">
              {['revenue', 'profit', 'costs', 'sales'].map((metric) => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedMetric === metric
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {metric.charAt(0).toUpperCase() + metric.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorCosts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
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
                    name.charAt(0).toUpperCase() + name.slice(1)
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey={selectedMetric} 
                  stroke={selectedMetric === 'revenue' ? '#3B82F6' : selectedMetric === 'profit' ? '#10B981' : selectedMetric === 'costs' ? '#EF4444' : '#F59E0B'} 
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
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                <Package className="h-6 w-6 text-white" />
              </div>
              Inventory Distribution
            </h3>
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Items</div>
              <div className="text-2xl font-bold text-green-600">{data.inventory.totalItems}</div>
            </div>
          </div>
          
          <div className="h-80">
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
                  stroke="#3B82F6" 
                  strokeWidth={4}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2, fill: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Simple Legend */}
          <div className="flex justify-center gap-6 mt-4">
            {getInventoryChartData().map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm font-medium text-gray-700">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics & Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Performance */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              Sales Performance
            </h3>
            <div className="text-2xl font-bold text-blue-600">
              {data.sales.totalSales}
        </div>
      </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
              <span className="text-gray-600 font-medium">Store Sales</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-600">{data.sales.storeSales}</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl">
              <span className="text-gray-600 font-medium">Out of Store</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-orange-600">{data.sales.outOfStoreSales}</span>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl">
              <span className="text-gray-600 font-medium">Revenue</span>
              <span className="font-bold text-green-600">{formatCurrency(data.sales.totalRevenue)}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl">
              <span className="text-gray-600 font-medium">Profit</span>
              <span className="font-bold text-purple-600">{formatCurrency(data.sales.totalProfit)}</span>
            </div>
          </div>
      </div>

        {/* Inventory Status */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                <Package className="h-5 w-5 text-white" />
              </div>
              Inventory Status
            </h3>
            <div className="text-2xl font-bold text-green-600">
              {data.inventory.totalItems}
            </div>
            </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl">
              <span className="text-gray-600 font-medium">In Stock</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-green-600">{data.inventory.inStockItems}</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl">
              <span className="text-gray-600 font-medium">Low Stock</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-orange-600">{data.inventory.lowStockItems}</span>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
            </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl">
              <span className="text-gray-600 font-medium">Out of Stock</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-red-600">{data.inventory.outOfStockItems}</span>
                <XCircle className="h-4 w-4 text-red-500" />
            </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
              <span className="text-gray-600 font-medium">Total Value</span>
              <span className="font-bold text-blue-600">{formatCurrency(data.inventory.totalValue)}</span>
            </div>
            </div>
            </div>

        {/* Tasks Overview */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <ClipboardList className="h-5 w-5 text-white" />
              </div>
              Tasks Overview
            </h3>
            <div className="text-2xl font-bold text-purple-600">
              {data.tasks.totalTasks}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl">
              <span className="text-gray-600 font-medium">Store Tasks</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-green-600">{data.tasks.storeTasks}</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl">
              <span className="text-gray-600 font-medium">Out of Store</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-orange-600">{data.tasks.outOfStoreTasks}</span>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl">
              <span className="text-gray-600 font-medium">Profit</span>
              <span className="font-bold text-green-600">{formatCurrency(data.tasks.totalProfit)}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl">
              <span className="text-gray-600 font-medium">Costs</span>
              <span className="font-bold text-red-600">{formatCurrency(data.tasks.totalCosts)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Radar Chart */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
              <Target className="h-6 w-6 text-white" />
            </div>
            Performance Metrics
          </h3>
          <div className="text-sm text-gray-500">
            Overall Score: <span className="font-bold text-indigo-600">78.8%</span>
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
                stroke="#6366F1"
                fill="#6366F1"
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
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl p-8 border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
            <Zap className="h-6 w-6 text-white" />
          </div>
          Quick Actions
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => handleQuickAction('New Sale', '/sales')} 
            className={`group p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 ${
              actionLoading === 'New Sale' ? 'opacity-50 cursor-not-allowed scale-95' : ''
            }`}
            disabled={actionLoading === 'New Sale'}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                {actionLoading === 'New Sale' ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <ShoppingCart className="h-6 w-6 text-white" />
                )}
              </div>
              <div className="font-semibold text-gray-900">
                {actionLoading === 'New Sale' ? 'Opening...' : 'New Sale'}
              </div>
              <div className="text-sm text-gray-500">
                {actionLoading === 'New Sale' ? 'Please wait...' : 'Record transaction'}
              </div>
            </div>
          </button>
          
          <button 
            onClick={() => handleQuickAction('Add Item', '/inventory')} 
            className={`group p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 ${
              actionLoading === 'Add Item' ? 'opacity-50 cursor-not-allowed scale-95' : ''
            }`}
            disabled={actionLoading === 'Add Item'}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                {actionLoading === 'Add Item' ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Package className="h-6 w-6 text-white" />
                )}
              </div>
              <div className="font-semibold text-gray-900">
                {actionLoading === 'Add Item' ? 'Opening...' : 'Add Item'}
              </div>
              <div className="text-sm text-gray-500">
                {actionLoading === 'Add Item' ? 'Please wait...' : 'Update inventory'}
              </div>
            </div>
          </button>
          
          <button 
            onClick={() => handleQuickAction('New Task', '/tasks')} 
            className={`group p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 ${
              actionLoading === 'New Task' ? 'opacity-50 cursor-not-allowed scale-95' : ''
            }`}
            disabled={actionLoading === 'New Task'}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                {actionLoading === 'New Task' ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <ClipboardList className="h-6 w-6 text-white" />
                )}
              </div>
              <div className="font-semibold text-gray-900">
                {actionLoading === 'New Task' ? 'Opening...' : 'New Task'}
              </div>
              <div className="text-sm text-gray-500">
                {actionLoading === 'New Task' ? 'Please wait...' : 'Create task'}
              </div>
            </div>
          </button>
          
          <button 
            onClick={() => handleQuickAction('View Reports', '/analytics')} 
            className={`group p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 ${
              actionLoading === 'View Reports' ? 'opacity-50 cursor-not-allowed scale-95' : ''
            }`}
            disabled={actionLoading === 'View Reports'}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                {actionLoading === 'View Reports' ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <BarChart3 className="h-6 w-6 text-white" />
                )}
            </div>
              <div className="font-semibold text-gray-900">
                {actionLoading === 'View Reports' ? 'Opening...' : 'View Reports'}
            </div>
              <div className="text-sm text-gray-500">
                {actionLoading === 'View Reports' ? 'Please wait...' : 'Detailed analytics'}
            </div>
            </div>
          </button>
            </div>
      </div>
    </div>
  )
}

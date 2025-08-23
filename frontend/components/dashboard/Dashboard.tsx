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

  // Mock data for charts (replace with real data from API)
  const chartData = [
    { name: 'Jan', revenue: 4000, profit: 2400, costs: 1600, sales: 24 },
    { name: 'Feb', revenue: 3000, profit: 1398, costs: 1602, sales: 18 },
    { name: 'Mar', revenue: 2000, profit: 9800, costs: 10200, sales: 32 },
    { name: 'Apr', revenue: 2780, profit: 3908, costs: 1128, sales: 28 },
    { name: 'May', revenue: 1890, profit: 4800, costs: 6900, sales: 35 },
    { name: 'Jun', revenue: 2390, profit: 3800, costs: 1410, sales: 42 },
  ]

  const inventoryData = [
    { name: 'In Stock', value: 65, color: '#10B981' },
    { name: 'Low Stock', value: 20, color: '#F59E0B' },
    { name: 'Out of Stock', value: 15, color: '#EF4444' },
  ]

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
        {/* Header Skeleton */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 text-white overflow-hidden">
          <div className="animate-pulse">
            <div className="h-12 bg-white/20 rounded-2xl mb-4 w-1/3"></div>
            <div className="h-6 bg-white/20 rounded-xl mb-6 w-1/2"></div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white/20 rounded-2xl p-4">
                  <div className="h-8 bg-white/20 rounded mb-2"></div>
                  <div className="h-4 bg-white/20 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
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
      {/* Enhanced Header with Gradient Background */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-3xl p-8 text-white overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-white/5 rounded-full blur-lg animate-bounce delay-500"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Dashboard Analytics
              </h1>
              <p className="text-xl text-blue-100">Comprehensive overview of your business performance</p>
            </div>
            
            {/* Enhanced Period Filter */}
            <div className="mt-6 sm:mt-0">
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
            </div>
          </div>
          
          {/* Enhanced Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-105 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/30 rounded-xl">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-green-300 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{data.summary.totalTransactions}</div>
              <div className="text-sm text-blue-100">Total Transactions</div>
              <div className="w-full bg-white/20 rounded-full h-1 mt-3">
                <div className="bg-green-300 rounded-full h-1" style={{ width: '75%' }}></div>
              </div>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-105 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/30 rounded-xl">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-green-300 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{formatCurrency(data.summary.totalRevenue)}</div>
              <div className="text-sm text-blue-100">Total Revenue</div>
              <div className="w-full bg-white/20 rounded-full h-1 mt-3">
                <div className="bg-green-300 rounded-full h-1" style={{ width: '85%' }}></div>
              </div>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-105 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-500/30 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-green-300 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{formatCurrency(data.summary.totalProfit)}</div>
              <div className="text-sm text-blue-100">Total Profit</div>
              <div className="w-full bg-white/20 rounded-full h-1 mt-3">
                <div className="bg-green-300 rounded-full h-1" style={{ width: '92%' }}></div>
              </div>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-105 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-500/30 rounded-xl">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <ArrowDownRight className="h-5 w-5 text-red-300 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{formatCurrency(data.summary.totalCosts)}</div>
              <div className="text-sm text-blue-100">Total Costs</div>
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
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '12px', 
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' 
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey={selectedMetric} 
                  stroke={selectedMetric === 'revenue' ? '#3B82F6' : selectedMetric === 'profit' ? '#10B981' : selectedMetric === 'costs' ? '#EF4444' : '#F59E0B'} 
                  fill={selectedMetric === 'revenue' ? 'url(#colorRevenue)' : selectedMetric === 'profit' ? 'url(#colorProfit)' : 'currentColor'}
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Distribution Pie Chart */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                <Package className="h-6 w-6 text-white" />
              </div>
              Inventory Distribution
            </h3>
            <div className="text-sm text-gray-500">
              Total: {data.inventory.totalItems} items
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inventoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {inventoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '12px', 
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' 
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend */}
          <div className="flex justify-center gap-6 mt-4">
            {inventoryData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-600">{item.name}</span>
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
          <button className="group p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <div className="font-semibold text-gray-900">New Sale</div>
              <div className="text-sm text-gray-500">Record transaction</div>
            </div>
          </button>
          
          <button className="group p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div className="font-semibold text-gray-900">Add Item</div>
              <div className="text-sm text-gray-500">Update inventory</div>
            </div>
          </button>
          
          <button className="group p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                <ClipboardList className="h-6 w-6 text-white" />
              </div>
              <div className="font-semibold text-gray-900">New Task</div>
              <div className="text-sm text-gray-500">Create task</div>
            </div>
          </button>
          
          <button className="group p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div className="font-semibold text-gray-900">View Reports</div>
              <div className="text-sm text-gray-500">Detailed analytics</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

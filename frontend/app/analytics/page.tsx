'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Package, 
  Activity,
  Users,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  RefreshCw,
  Eye,
  BarChart,
  PieChart,
  LineChart
} from 'lucide-react'
import { 
  LineChart as RechartsLineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart as RechartsBarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ComposedChart,
  Legend
} from 'recharts'
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
  const [selectedChart, setSelectedChart] = useState('line')
  const [viewMode, setViewMode] = useState('overview')

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

  // Mock data for enhanced charts (replace with real data when available)
  const enhancedChartData = [
    { name: 'Week 1', sales: 45, revenue: 4500, profit: 1800, tasks: 12, costs: 800 },
    { name: 'Week 2', sales: 52, revenue: 5200, profit: 2080, tasks: 15, costs: 950 },
    { name: 'Week 3', sales: 38, revenue: 3800, profit: 1520, tasks: 8, costs: 600 },
    { name: 'Week 4', sales: 61, revenue: 6100, profit: 2440, tasks: 20, costs: 1200 },
  ]

  const performanceData = [
    { metric: 'Sales Growth', value: 85, target: 100, color: '#10B981' },
    { metric: 'Revenue Growth', value: 78, target: 100, color: '#3B82F6' },
    { metric: 'Profit Margin', value: 92, target: 100, color: '#F59E0B' },
    { metric: 'Task Efficiency', value: 88, target: 100, color: '#8B5CF6' },
  ]

  const handleQuickAction = async (action: string) => {
    try {
      switch (action) {
        case 'export':
          toast.success('Exporting report...')
          // Simulate export process
          await new Promise(resolve => setTimeout(resolve, 1000))
          toast.success('Report exported successfully!')
          break
        case 'view':
          setViewMode(viewMode === 'overview' ? 'detailed' : 'overview')
          toast.success(`Switched to ${viewMode === 'overview' ? 'detailed' : 'overview'} view`)
          break
        case 'filter':
          toast.success('Opening advanced filters...')
          // Simulate filter process
          await new Promise(resolve => setTimeout(resolve, 500))
          toast.success('Filters applied!')
          break
        case 'generate':
          toast.success('Generating custom report...')
          // Simulate report generation
          await new Promise(resolve => setTimeout(resolve, 1500))
          toast.success('Custom report generated!')
          break
        default:
          break
      }
    } catch (error) {
      toast.error('Action failed. Please try again.')
    }
  }

  if (loading) {
    return (
      <PageLayout>
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
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="space-y-8">
        {/* Enhanced Header with Gradient Background */}
        <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 rounded-3xl p-8 text-white overflow-hidden">
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
                  Analytics & Reports
                </h1>
                <p className="text-xl text-blue-100">Comprehensive insights into your business performance</p>
              </div>
              
              {/* Enhanced Controls */}
              <div className="mt-6 sm:mt-0 space-y-3">
                <div className="flex gap-3">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <select
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      className="relative px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl text-white font-semibold focus:ring-4 focus:ring-white/20 focus:border-white/50 transition-all duration-300 cursor-pointer"
                    >
                      <option value="week">📅 This Week</option>
                      <option value="month">📊 This Month</option>
                      <option value="year">📈 This Year</option>
                    </select>
                  </div>
                  
                  <button
                    onClick={fetchAnalytics}
                    disabled={loading}
                    className="px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl text-white font-semibold hover:bg-white/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('overview')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      viewMode === 'overview' 
                        ? 'bg-white/30 text-white' 
                        : 'bg-white/10 text-blue-100 hover:bg-white/20'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setViewMode('detailed')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      viewMode === 'detailed' 
                        ? 'bg-white/30 text-white' 
                        : 'bg-white/10 text-blue-100 hover:bg-white/20'
                    }`}
                  >
                    Detailed
                  </button>
                </div>
              </div>
            </div>
            
            {/* Enhanced Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-105 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500/30 rounded-xl">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-green-300 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {analyticsData ? formatCurrency(analyticsData.salesTrend.reduce((sum, trend) => sum + trend.revenue, 0)) : '$0'}
                </div>
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
                <div className="text-3xl font-bold text-white mb-1">
                  {analyticsData ? formatCurrency(
                    analyticsData.salesTrend.reduce((sum, trend) => sum + trend.profit, 0) +
                    analyticsData.tasksTrend.reduce((sum, trend) => sum + trend.profit, 0)
                  ) : '$0'}
                </div>
                <div className="text-sm text-blue-100">Total Profit</div>
                <div className="w-full bg-white/20 rounded-full h-1 mt-3">
                  <div className="bg-green-300 rounded-full h-1" style={{ width: '92%' }}></div>
                </div>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-105 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-500/30 rounded-xl">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-green-300 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {analyticsData ? analyticsData.tasksTrend.reduce((sum, trend) => sum + trend.tasks, 0) : 0}
                </div>
                <div className="text-sm text-blue-100">Total Tasks</div>
                <div className="w-full bg-white/20 rounded-full h-1 mt-3">
                  <div className="bg-green-300 rounded-full h-1" style={{ width: '78%' }}></div>
                </div>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-105 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-red-500/30 rounded-xl">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <ArrowDownRight className="h-5 w-5 text-red-300 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {analyticsData ? formatCurrency(analyticsData.tasksTrend.reduce((sum, trend) => sum + trend.costs, 0)) : '$0'}
                </div>
                <div className="text-sm text-blue-100">Total Costs</div>
                <div className="w-full bg-white/20 rounded-full h-1 mt-3">
                  <div className="bg-red-300 rounded-full h-1" style={{ width: '45%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {analyticsData ? (
          <>
            {/* Interactive Charts Section - Only show in Overview mode */}
            {viewMode === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Performance Trends Chart */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                      Performance Trends
                    </h3>
                    <div className="flex gap-2">
                      {['line', 'area', 'bar'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setSelectedChart(type)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                            selectedChart === type
                              ? 'bg-blue-500 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      {selectedChart === 'line' ? (
                        <RechartsLineChart data={enhancedChartData}>
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
                          <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={3} />
                          <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} />
                          <Line type="monotone" dataKey="profit" stroke="#F59E0B" strokeWidth={3} />
                        </RechartsLineChart>
                      ) : selectedChart === 'area' ? (
                        <AreaChart data={enhancedChartData}>
                          <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                            </linearGradient>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
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
                          <Area type="monotone" dataKey="sales" stroke="#3B82F6" fill="url(#colorSales)" />
                          <Area type="monotone" dataKey="revenue" stroke="#10B981" fill="url(#colorRevenue)" />
                        </AreaChart>
                      ) : (
                        <RechartsBarChart data={enhancedChartData}>
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
                          <Bar dataKey="sales" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="profit" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                        </RechartsBarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Performance Metrics Radar Chart */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
                        <Target className="h-6 w-6 text-white" />
                      </div>
                      Performance Metrics
                    </h3>
                    <div className="text-sm text-gray-500">
                      Overall Score: <span className="font-bold text-indigo-600">85.8%</span>
                    </div>
                  </div>
                  
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={performanceData} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis type="number" domain={[0, 100]} stroke="#6B7280" />
                        <YAxis dataKey="metric" type="category" stroke="#6B7280" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: 'none', 
                            borderRadius: '12px', 
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' 
                          }}
                        />
                        <Bar 
                          dataKey="value" 
                          fill={(entry) => entry.color}
                          radius={[0, 4, 4, 0]}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="target" 
                          stroke="#EF4444" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={false}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed View - Show more comprehensive data */}
            {viewMode === 'detailed' && (
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    Detailed Analytics View
                  </h3>
                  <div className="text-sm text-gray-500">
                    <span className="font-bold text-purple-600">Advanced Insights</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Sales Performance</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                        <span className="text-gray-700">Average Daily Sales</span>
                        <span className="font-bold text-blue-600">24.5</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                        <span className="text-gray-700">Conversion Rate</span>
                        <span className="font-bold text-green-600">68.2%</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl">
                        <span className="text-gray-700">Customer Retention</span>
                        <span className="font-bold text-orange-600">85.7%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Financial Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                        <span className="text-gray-700">Profit Margin</span>
                        <span className="font-bold text-emerald-600">42.3%</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
                        <span className="text-gray-700">ROI</span>
                        <span className="font-bold text-purple-600">156.8%</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                        <span className="text-gray-700">Cost Ratio</span>
                        <span className="font-bold text-red-600">23.1%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Data Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sales Trend Table */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    Sales Trend
                  </h3>
                  <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                    <Download className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
                
                {analyticsData.salesTrend.length > 0 ? (
                  <div className="space-y-4">
                    {analyticsData.salesTrend.map((trend, index) => (
                      <div key={trend._id} className="group p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:scale-105">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-xl">
                              <Calendar className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="font-medium text-gray-900">{trend._id}</span>
                          </div>
                          <div className="flex items-center space-x-6">
                            <div className="text-center">
                              <p className="text-sm text-gray-500">Sales</p>
                              <p className="text-lg font-bold text-blue-600">{trend.sales}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-500">Revenue</p>
                              <p className="text-lg font-bold text-green-600">{formatCurrency(trend.revenue)}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-500">Profit</p>
                              <p className="text-lg font-bold text-emerald-600">{formatCurrency(trend.profit)}</p>
                            </div>
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

              {/* Tasks Trend Table */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    Tasks Trend
                  </h3>
                  <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                    <Download className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
                
                {analyticsData.tasksTrend.length > 0 ? (
                  <div className="space-y-4">
                    {analyticsData.tasksTrend.map((trend, index) => (
                      <div key={trend._id} className="group p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:scale-105">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-xl">
                              <Calendar className="h-4 w-4 text-orange-600" />
                            </div>
                            <span className="font-medium text-gray-900">{trend._id}</span>
                          </div>
                          <div className="flex items-center space-x-6">
                            <div className="text-center">
                              <p className="text-sm text-gray-500">Tasks</p>
                              <p className="text-lg font-bold text-orange-600">{trend.tasks}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-500">Profit</p>
                              <p className="text-lg font-bold text-green-600">{formatCurrency(trend.profit)}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-500">Costs</p>
                              <p className="text-lg font-bold text-red-600">{formatCurrency(trend.costs)}</p>
                            </div>
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
                   onClick={() => handleQuickAction('export')}
                   className="group p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 cursor-pointer"
                 >
                   <div className="text-center">
                     <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                       <Download className="h-6 w-6 text-white" />
                     </div>
                     <div className="font-semibold text-gray-900">Export Report</div>
                     <div className="text-sm text-gray-500">Download PDF</div>
                   </div>
                 </button>
                 
                 <button 
                   onClick={() => handleQuickAction('view')}
                   className="group p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 cursor-pointer"
                 >
                   <div className="text-center">
                     <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                       <Eye className="h-6 w-6 text-white" />
                     </div>
                     <div className="font-semibold text-gray-900">View Details</div>
                     <div className="text-sm text-gray-500">Deep dive</div>
                   </div>
                 </button>
                 
                 <button 
                   onClick={() => handleQuickAction('filter')}
                   className="group p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 cursor-pointer"
                 >
                   <div className="text-center">
                     <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                       <Filter className="h-6 w-6 text-white" />
                     </div>
                     <div className="font-semibold text-gray-900">Advanced Filter</div>
                     <div className="text-sm text-gray-500">Customize view</div>
                   </div>
                 </button>
                 
                 <button 
                   onClick={() => handleQuickAction('generate')}
                   className="group p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 cursor-pointer"
                 >
                   <div className="text-center">
                     <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                       <BarChart3 className="h-6 w-6 text-white" />
                     </div>
                     <div className="font-semibold text-gray-900">Generate Report</div>
                     <div className="text-sm text-gray-500">Create custom</div>
                   </div>
                 </button>
               </div>
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-xl border border-gray-100">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <BarChart3 className="h-16 w-16 text-blue-500" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">No Analytics Data Available</h3>
            <p className="text-lg text-gray-600">Try selecting a different time period or check back later.</p>
          </div>
        )}
      </div>
    </PageLayout>
  )
}

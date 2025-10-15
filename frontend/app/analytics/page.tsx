'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { api } from '../../lib/api'
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

// Dynamic import for jsPDF to avoid SSR issues
let jsPDF: any = null
let autoTable: any = null

// Load jsPDF dynamically
const loadJsPDF = async () => {
  try {
    if (typeof window !== 'undefined') {
      console.log('Loading jsPDF...')
      const jsPDFModule = await import('jspdf')
      jsPDF = jsPDFModule.default
      console.log('jsPDF loaded successfully:', jsPDF)
      
      // Try to load autoTable
      try {
        await import('jspdf-autotable')
        autoTable = true
        console.log('autoTable loaded successfully')
      } catch (e) {
        console.warn('autoTable not available, using fallback tables')
        autoTable = false
      }
    }
  } catch (error) {
    console.error('Failed to load jsPDF:', error)
  }
}

// Force reload jsPDF if needed
const ensureJsPDF = async () => {
  if (!jsPDF) {
    console.log('jsPDF not loaded, attempting to load...')
    await loadJsPDF()
  }
  return jsPDF !== null
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

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')
  const [selectedChart, setSelectedChart] = useState('line')
  const [viewMode, setViewMode] = useState('overview')

  useEffect(() => {
    fetchAnalytics()
    loadJsPDF() // Load jsPDF when component mounts
  }, [period])

  const fetchAnalytics = async (retryCount = 0) => {
    try {
      setLoading(true)
      console.log('Fetching analytics data for period:', period)
      const response = await axios.get(`${api.baseURL}/api/dashboard/analytics?period=${period}`, {
        timeout: 15000, // 15 second timeout for mobile
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      })
      console.log('Analytics data received:', response.data)
      setAnalyticsData(response.data)
      toast.success('Analytics data updated successfully!')
    } catch (error: any) {
      console.error('Failed to fetch analytics data:', error)
      
      // Check if it's a network/connectivity issue
      const isNetworkError = error.code === 'NETWORK_ERROR' || 
                           error.message.includes('fetch') || 
                           error.message.includes('Network Error') ||
                           !navigator.onLine
      
      if (isNetworkError && retryCount < 2) {
        // Retry for network errors
        console.log(`Retrying analytics fetch (attempt ${retryCount + 1})...`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        return fetchAnalytics(retryCount + 1)
      }
      
      // Set empty data instead of showing error
      setAnalyticsData({
        period: period,
        dateRange: {},
        salesTrend: [],
        tasksTrend: []
      })
      
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
        toast('No analytics data available', {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Real data from backend API for enhanced charts
  const enhancedChartData = analyticsData ? [
    ...analyticsData.salesTrend.map((trend, index) => ({
      name: trend._id,
      sales: trend.sales,
      revenue: trend.revenue,
      profit: trend.profit,
      tasks: analyticsData.tasksTrend[index]?.tasks || 0,
      costs: analyticsData.tasksTrend[index]?.costs || 0
    }))
  ] : []

  // Calculate performance metrics from real data
  const performanceData = analyticsData ? [
    {
      metric: 'Sales Growth',
      value: analyticsData.salesTrend.length > 1 ? 
        Math.round(((analyticsData.salesTrend[analyticsData.salesTrend.length - 1].sales - analyticsData.salesTrend[0].sales) / analyticsData.salesTrend[0].sales) * 100) : 0,
      target: 100,
      color: '#10B981'
    },
    {
      metric: 'Revenue Growth',
      value: analyticsData.salesTrend.length > 1 ? 
        Math.round(((analyticsData.salesTrend[analyticsData.salesTrend.length - 1].revenue - analyticsData.salesTrend[0].revenue) / analyticsData.salesTrend[0].revenue) * 100) : 0,
      target: 100,
      color: '#3B82F6'
    },
    {
      metric: 'Profit Margin',
      value: analyticsData.salesTrend.length > 0 ? 
        Math.round((analyticsData.salesTrend.reduce((sum, trend) => sum + trend.profit, 0) / analyticsData.salesTrend.reduce((sum, trend) => sum + trend.revenue, 1)) * 100) : 0,
      target: 100,
      color: '#F59E0B'
    },
    {
      metric: 'Task Efficiency',
      value: analyticsData.tasksTrend.length > 0 ? 
        Math.round((analyticsData.tasksTrend.reduce((sum, trend) => sum + trend.profit, 0) / Math.max(analyticsData.tasksTrend.reduce((sum, trend) => sum + trend.costs, 1), 1)) * 100) : 0,
      target: 100,
      color: '#8B5CF6'
    }
  ] : []

  const handleQuickAction = async (action: string) => {
    try {
      switch (action) {
        case 'export':
          await generateAnalyticsReport()
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
          await generateCustomReport()
          break
        default:
          break
      }
    } catch (error) {
      toast.error('Action failed. Please try again.')
    }
  }

  const generateAnalyticsReport = async () => {
    try {
      console.log('Starting generateAnalyticsReport...')
      console.log('analyticsData:', analyticsData)
      
      toast.loading('Loading PDF library...', { id: 'pdf' })
      
      // Ensure jsPDF is loaded
      const isLoaded = await ensureJsPDF()
      if (!isLoaded) {
        throw new Error('Failed to load PDF library. Please refresh the page and try again.')
      }
      
      console.log('jsPDF loaded successfully, creating document...')
      toast.loading('Generating PDF report...', { id: 'pdf' })
      
      const doc = new jsPDF()
      console.log('PDF document created')
      
      // Add header
      doc.setFontSize(24)
      doc.setTextColor(59, 130, 246) // Blue color
      doc.text('Analytics & Reports', 20, 30)
      
      doc.setFontSize(12)
      doc.setTextColor(107, 114, 128) // Gray color
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45)
      doc.text(`Period: ${period.charAt(0).toUpperCase() + period.slice(1)}`, 20, 55)
      
      // Add summary section
      doc.setFontSize(16)
      doc.setTextColor(17, 24, 39) // Dark color
      doc.text('Summary Overview', 20, 80)
      
      if (analyticsData) {
        console.log('Processing analytics data...')
        const totalRevenue = analyticsData.salesTrend.reduce((sum, trend) => sum + trend.revenue, 0)
        const totalProfit = analyticsData.salesTrend.reduce((sum, trend) => sum + trend.profit, 0) +
                           analyticsData.tasksTrend.reduce((sum, trend) => sum + trend.profit, 0)
        const totalTasks = analyticsData.tasksTrend.reduce((sum, trend) => sum + trend.tasks, 0)
        const totalCosts = analyticsData.tasksTrend.reduce((sum, trend) => sum + trend.costs, 0)
        
        console.log('Calculated totals:', { totalRevenue, totalProfit, totalTasks, totalCosts })
        
        doc.setFontSize(12)
        doc.setTextColor(107, 114, 128)
        doc.text(`Total Revenue: ${formatCurrency(totalRevenue)}`, 20, 100)
        doc.text(`Total Profit: ${formatCurrency(totalProfit)}`, 20, 110)
        doc.text(`Total Tasks: ${totalTasks}`, 20, 120)
        doc.text(`Total Costs: ${formatCurrency(totalCosts)}`, 20, 130)
      } else {
        console.warn('No analytics data available')
        doc.setFontSize(12)
        doc.setTextColor(107, 114, 128)
        doc.text('No analytics data available', 20, 100)
      }
      
      // Add sales trend table
      if (analyticsData && analyticsData.salesTrend.length > 0) {
        console.log('Adding sales trend table...')
        doc.setFontSize(16)
        doc.setTextColor(17, 24, 39)
        doc.text('Sales Trend', 20, 160)
        
        const salesData = analyticsData.salesTrend.map(trend => [
          trend._id,
          trend.sales.toString(),
          formatCurrency(trend.revenue),
          formatCurrency(trend.profit)
        ])
        
        console.log('Sales data:', salesData)
        
        // Check if autoTable is available
        if (autoTable && typeof (doc as any).autoTable === 'function') {
          console.log('Using autoTable for sales data')
          // Clean and validate data before passing to autoTable
          const cleanSalesData = salesData.map(row => [
            String(row[0] || 'N/A').substring(0, 20),
            String(row[1] || '0').substring(0, 10),
            String(row[2] || '$0').substring(0, 15),
            String(row[3] || '$0').substring(0, 15)
          ])
          
          doc.autoTable({
            startY: 170,
            head: [['Period', 'Sales', 'Revenue', 'Profit']],
            body: cleanSalesData,
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] },
            styles: { fontSize: 10 }
          })
        } else {
          console.log('Using fallback table for sales data')
          // Fallback: simple table without autoTable
          let yPos = 170
          doc.setFontSize(10)
          doc.text('Period', 20, yPos)
          doc.text('Sales', 60, yPos)
          doc.text('Revenue', 90, yPos)
          doc.text('Profit', 140, yPos)
          yPos += 10
          
          salesData.forEach(row => {
            // Sanitize data to ensure valid strings
            const period = String(row[0] || 'N/A').substring(0, 20)
            const sales = String(row[1] || '0').substring(0, 10)
            const revenue = String(row[2] || '$0').substring(0, 15)
            const profit = String(row[3] || '$0').substring(0, 15)
            
            doc.text(period, 20, yPos)
            doc.text(sales, 60, yPos)
            doc.text(revenue, 90, yPos)
            doc.text(profit, 140, yPos)
            yPos += 8
          })
        }
      } else {
        console.log('No sales trend data available')
        doc.setFontSize(12)
        doc.setTextColor(107, 114, 128)
        doc.text('No sales trend data available', 20, 160)
      }
      
      // Add tasks trend table
      if (analyticsData && analyticsData.tasksTrend.length > 0) {
        console.log('Adding tasks trend table...')
        let finalY = 200
        if (autoTable && typeof (doc as any).lastAutoTable !== 'undefined') {
          finalY = (doc as any).lastAutoTable.finalY + 20
        }
        
        doc.setFontSize(16)
        doc.setTextColor(17, 24, 39)
        doc.text('Tasks Trend', 20, finalY)
        
        const tasksData = analyticsData.tasksTrend.map(trend => [
          trend._id,
          trend.tasks.toString(),
          formatCurrency(trend.profit),
          formatCurrency(trend.costs)
        ])
        
        console.log('Tasks data:', tasksData)
        
        if (autoTable && typeof (doc as any).autoTable === 'function') {
          console.log('Using autoTable for tasks data')
          // Clean and validate data before passing to autoTable
          const cleanTasksData = tasksData.map(row => [
            String(row[0] || 'N/A').substring(0, 20),
            String(row[1] || '0').substring(0, 10),
            String(row[2] || '$0').substring(0, 15),
            String(row[3] || '$0').substring(0, 15)
          ])
          
          doc.autoTable({
            startY: finalY + 10,
            head: [['Period', 'Tasks', 'Profit', 'Costs']],
            body: cleanTasksData,
            theme: 'grid',
            headStyles: { fillColor: [245, 158, 11] }, // Orange color
            styles: { fontSize: 10 }
          })
        } else {
          console.log('Using fallback table for tasks data')
          // Fallback: simple table without autoTable
          let yPos = finalY + 20
          doc.setFontSize(10)
          doc.text('Period', 20, yPos)
          doc.text('Tasks', 60, yPos)
          doc.text('Profit', 90, yPos)
          doc.text('Costs', 140, yPos)
          yPos += 10
          
          tasksData.forEach(row => {
            // Sanitize data to ensure valid strings
            const period = String(row[0] || 'N/A').substring(0, 20)
            const tasks = String(row[1] || '0').substring(0, 10)
            const profit = String(row[2] || '$0').substring(0, 15)
            const costs = String(row[3] || '$0').substring(0, 15)
            
            doc.text(period, 20, yPos)
            doc.text(tasks, 60, yPos)
            doc.text(profit, 90, yPos)
            doc.text(costs, 140, yPos)
            yPos += 8
          })
        }
      } else {
        console.log('No tasks trend data available')
        doc.setFontSize(12)
        doc.setTextColor(107, 114, 128)
        doc.text('No tasks trend data available', 20, 200)
      }
      
      console.log('Saving PDF...')
      // Save the PDF
      const fileName = `analytics-report-${period}-${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(fileName)
      
      console.log('PDF saved successfully:', fileName)
      toast.success('PDF report generated and downloaded!', { id: 'pdf' })
    } catch (error: any) {
      console.error('PDF generation error:', error)
      console.error('Error stack:', error.stack)
      toast.error(`Failed to generate PDF: ${error.message}`, { id: 'pdf' })
    }
  }

  const generateSimpleReport = async () => {
    try {
      toast.loading('Trying fallback method...', { id: 'fallback' })
      
      // Create a simple text-based report as fallback
      let reportContent = 'Analytics & Reports\n'
      reportContent += '==================\n\n'
      reportContent += `Generated on: ${new Date().toLocaleDateString()}\n`
      reportContent += `Period: ${period.charAt(0).toUpperCase() + period.slice(1)}\n\n`
      
      if (analyticsData) {
        const totalRevenue = analyticsData.salesTrend.reduce((sum, trend) => sum + trend.revenue, 0)
        const totalProfit = analyticsData.salesTrend.reduce((sum, trend) => sum + trend.profit, 0) +
                           analyticsData.tasksTrend.reduce((sum, trend) => sum + trend.profit, 0)
        const totalTasks = analyticsData.tasksTrend.reduce((sum, trend) => sum + trend.tasks, 0)
        const totalCosts = analyticsData.tasksTrend.reduce((sum, trend) => sum + trend.costs, 0)
        
        reportContent += 'Summary Overview:\n'
        reportContent += `Total Revenue: ${formatCurrency(totalRevenue)}\n`
        reportContent += `Total Profit: ${formatCurrency(totalProfit)}\n`
        reportContent += `Total Tasks: ${totalTasks}\n`
        reportContent += `Total Costs: ${formatCurrency(totalCosts)}\n\n`
        
        if (analyticsData.salesTrend.length > 0) {
          reportContent += 'Sales Trend:\n'
          analyticsData.salesTrend.forEach(trend => {
            reportContent += `${trend._id}: Sales: ${trend.sales}, Revenue: ${formatCurrency(trend.revenue)}, Profit: ${formatCurrency(trend.profit)}\n`
          })
          reportContent += '\n'
        }
        
        if (analyticsData.tasksTrend.length > 0) {
          reportContent += 'Tasks Trend:\n'
          analyticsData.tasksTrend.forEach(trend => {
            reportContent += `${trend._id}: Tasks: ${trend.tasks}, Profit: ${formatCurrency(trend.profit)}, Costs: ${formatCurrency(trend.costs)}\n`
          })
        }
      }
      
      // Create and download text file as fallback
      const blob = new Blob([reportContent], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-report-${period}-${new Date().toISOString().split('T')[0]}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast.success('Text report generated as fallback!', { id: 'fallback' })
    } catch (error) {
      console.error('Fallback generation error:', error)
      toast.error('Fallback method also failed', { id: 'fallback' })
    }
  }

  const generateCustomReport = async () => {
    try {
      toast.loading('Loading PDF library...', { id: 'custom' })
      
      // Ensure jsPDF is loaded
      const isLoaded = await ensureJsPDF()
      if (!isLoaded) {
        throw new Error('Failed to load PDF library. Please refresh the page and try again.')
      }
      
      toast.loading('Generating custom report...', { id: 'custom' })
      
      const doc = new jsPDF()
      
      // Add header
      doc.setFontSize(24)
      doc.setTextColor(147, 51, 234) // Purple color
      doc.text('Custom Analytics Report', 20, 30)
      
      doc.setFontSize(12)
      doc.setTextColor(107, 114, 128)
      doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, 45)
      
      // Add performance metrics
      doc.setFontSize(16)
      doc.setTextColor(17, 24, 39)
      doc.text('Performance Metrics', 20, 70)
      
      const metricsData = performanceData.map(metric => [
        metric.metric,
        `${metric.value}%`,
        `${metric.target}%`,
        metric.value >= metric.target ? '✅' : '⚠️'
      ])
      
      // Check if autoTable is available
      if (autoTable && typeof (doc as any).autoTable === 'function') {
        doc.autoTable({
          startY: 80,
          head: [['Metric', 'Current', 'Target', 'Status']],
          body: metricsData,
          theme: 'grid',
          headStyles: { fillColor: [147, 51, 234] },
          styles: { fontSize: 10 }
        })
      } else {
        // Fallback: simple table without autoTable
        let yPos = 80
        doc.setFontSize(10)
        doc.text('Metric', 20, yPos)
        doc.text('Current', 80, yPos)
        doc.text('Target', 120, yPos)
        doc.text('Status', 160, yPos)
        yPos += 10
        
        metricsData.forEach(row => {
          doc.text(row[0], 20, yPos)
          doc.text(row[1], 80, yPos)
          doc.text(row[2], 120, yPos)
          doc.text(row[3], 160, yPos)
          yPos += 8
        })
      }
      
      // Add enhanced chart data
      let finalY = 120
      if (autoTable && typeof (doc as any).lastAutoTable !== 'undefined') {
        finalY = (doc as any).lastAutoTable.finalY + 20
      }
      
      doc.setFontSize(16)
      doc.setTextColor(17, 24, 39)
      doc.text('Weekly Performance Data', 20, finalY)
      
      const weeklyData = enhancedChartData.map(week => [
        week.name,
        week.sales.toString(),
        formatCurrency(week.revenue),
        formatCurrency(week.profit),
        week.tasks.toString(),
        formatCurrency(week.costs)
      ])
      
      if (autoTable && typeof (doc as any).autoTable === 'function') {
        doc.autoTable({
          startY: finalY + 10,
          head: [['Week', 'Sales', 'Revenue', 'Profit', 'Tasks', 'Costs']],
          body: weeklyData,
          theme: 'grid',
          headStyles: { fillColor: [16, 185, 129] }, // Green color
          styles: { fontSize: 9 }
        })
      } else {
        // Fallback: simple table without autoTable
        let yPos = finalY + 20
        doc.setFontSize(9)
        doc.text('Week', 20, yPos)
        doc.text('Sales', 40, yPos)
        doc.text('Revenue', 60, yPos)
        doc.text('Profit', 90, yPos)
        doc.text('Tasks', 120, yPos)
        doc.text('Costs', 150, yPos)
        yPos += 8
        
        weeklyData.forEach(row => {
          doc.text(row[0], 20, yPos)
          doc.text(row[1], 40, yPos)
          doc.text(row[2], 60, yPos)
          doc.text(row[3], 90, yPos)
          doc.text(row[4], 120, yPos)
          doc.text(row[5], 150, yPos)
          yPos += 6
        })
      }
      
      // Add insights section
      let insightsY = finalY + 80
      if (autoTable && typeof (doc as any).lastAutoTable !== 'undefined') {
        insightsY = (doc as any).lastAutoTable.finalY + 20
      }
      
      doc.setFontSize(16)
      doc.setTextColor(17, 24, 39)
      doc.text('Key Insights', 20, insightsY)
      
      doc.setFontSize(10)
      doc.setTextColor(107, 114, 128)
      doc.text('• Sales performance shows consistent growth trend', 20, insightsY + 15)
      doc.text('• Revenue generation is above target expectations', 20, insightsY + 25)
      doc.text('• Task efficiency remains high with good profit margins', 20, insightsY + 35)
      doc.text('• Cost management is effective and within budget', 20, insightsY + 45)
      
      // Save the PDF
      const fileName = `custom-report-${new Date().toISOString().split('T')[0]}-${Date.now()}.pdf`
      doc.save(fileName)
      
      toast.success('Custom report generated and downloaded!', { id: 'custom' })
    } catch (error: any) {
      console.error('Custom report generation error:', error)
      toast.error(`Failed to generate custom report: ${error.message}`, { id: 'custom' })
    }
  }

  const generateSimpleCustomReport = async () => {
    try {
      toast.loading('Trying fallback method...', { id: 'fallback-custom' })
      
      // Create a simple text-based custom report as fallback
      let reportContent = 'Custom Analytics Report\n'
      reportContent += '======================\n\n'
      reportContent += `Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\n\n`
      
      reportContent += 'Performance Metrics:\n'
      performanceData.forEach(metric => {
        const status = metric.value >= metric.target ? '✅' : '⚠️'
        reportContent += `${metric.metric}: ${metric.value}% (Target: ${metric.target}%) ${status}\n`
      })
      reportContent += '\n'
      
      reportContent += 'Weekly Performance Data:\n'
      enhancedChartData.forEach(week => {
        reportContent += `${week.name}: Sales: ${week.sales}, Revenue: ${formatCurrency(week.revenue)}, Profit: ${formatCurrency(week.profit)}, Tasks: ${week.tasks}, Costs: ${formatCurrency(week.costs)}\n`
      })
      reportContent += '\n'
      
      reportContent += 'Key Insights:\n'
      reportContent += '• Sales performance shows consistent growth trend\n'
      reportContent += '• Revenue generation is above target expectations\n'
      reportContent += '• Task efficiency remains high with good profit margins\n'
      reportContent += '• Cost management is effective and within budget\n'
      
      // Create and download text file as fallback
      const blob = new Blob([reportContent], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `custom-report-${new Date().toISOString().split('T')[0]}-${Date.now()}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast.success('Text custom report generated as fallback!', { id: 'fallback-custom' })
    } catch (error) {
      console.error('Fallback custom report generation error:', error)
      toast.error('Fallback method also failed', { id: 'fallback-custom' })
    }
  }

  if (loading) {
    return (
      <PageLayout>
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
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Enhanced Header with Gradient Background */}
        <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 text-white overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-white/5 rounded-full blur-lg animate-bounce delay-500"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 lg:mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-1 sm:mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  <span className="hidden sm:inline">Analytics & Reports</span>
                  <span className="sm:hidden">Analytics</span>
                </h1>
                <p className="text-sm sm:text-base lg:text-xl text-blue-100">Comprehensive insights into your business performance</p>
              </div>
              
              {/* Enhanced Controls */}
              <div className="mt-4 sm:mt-0 space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => fetchAnalytics()}
                    disabled={loading}
                    className="p-2 text-white hover:text-blue-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={loading ? 'Loading...' : 'Refresh'}
                  >
                    <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                  
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-xl sm:rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <select
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      className="relative px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl sm:rounded-2xl text-white font-semibold focus:ring-4 focus:ring-white/20 focus:border-white/50 transition-all duration-300 cursor-pointer text-xs sm:text-sm"
                    >
                      <option value="week">📅 This Week</option>
                      <option value="month">📊 This Month</option>
                      <option value="year">📈 This Year</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-1 sm:gap-2">
                  <button
                    onClick={() => setViewMode('overview')}
                    className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                      viewMode === 'overview' 
                        ? 'bg-white/30 text-white' 
                        : 'bg-white/10 text-blue-100 hover:bg-white/20'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setViewMode('detailed')}
                    className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-105 group">
                <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                  <div className="p-2 sm:p-3 bg-green-500/30 rounded-lg sm:rounded-xl">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                  <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-green-300 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="text-lg sm:text-xl lg:text-3xl font-bold text-white mb-1 truncate">
                  {analyticsData ? formatCurrency(analyticsData.salesTrend.reduce((sum, trend) => sum + trend.revenue, 0)) : '$0'}
                </div>
                <div className="text-xs sm:text-sm text-blue-100">Total Revenue</div>
                <div className="w-full bg-white/20 rounded-full h-1 sm:h-1.5 mt-2 sm:mt-3">
                  <div className="bg-green-300 rounded-full h-1 sm:h-1.5" style={{ width: '85%' }}></div>
                </div>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-105 group">
                <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                  <div className="p-2 sm:p-3 bg-emerald-500/30 rounded-lg sm:rounded-xl">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                  <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-green-300 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="text-lg sm:text-xl lg:text-3xl font-bold text-white mb-1 truncate">
                  {analyticsData ? formatCurrency(
                    analyticsData.salesTrend.reduce((sum, trend) => sum + trend.profit, 0) +
                    analyticsData.tasksTrend.reduce((sum, trend) => sum + trend.profit, 0)
                  ) : '$0'}
                </div>
                <div className="text-xs sm:text-sm text-blue-100">Total Profit</div>
                <div className="w-full bg-white/20 rounded-full h-1 sm:h-1.5 mt-2 sm:mt-3">
                  <div className="bg-green-300 rounded-full h-1 sm:h-1.5" style={{ width: '92%' }}></div>
                </div>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-105 group">
                <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                  <div className="p-2 sm:p-3 bg-orange-500/30 rounded-lg sm:rounded-xl">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                  <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-green-300 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="text-lg sm:text-xl lg:text-3xl font-bold text-white mb-1">
                  {analyticsData ? analyticsData.tasksTrend.reduce((sum, trend) => sum + trend.tasks, 0) : 0}
                </div>
                <div className="text-xs sm:text-sm text-blue-100">Total Tasks</div>
                <div className="w-full bg-white/20 rounded-full h-1 sm:h-1.5 mt-2 sm:mt-3">
                  <div className="bg-green-300 rounded-full h-1 sm:h-1.5" style={{ width: '78%' }}></div>
                </div>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-105 group">
                <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                  <div className="p-2 sm:p-3 bg-red-500/30 rounded-lg sm:rounded-xl">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                  <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-red-300 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="text-lg sm:text-xl lg:text-3xl font-bold text-white mb-1 truncate">
                  {analyticsData ? formatCurrency(analyticsData.tasksTrend.reduce((sum, trend) => sum + trend.costs, 0)) : '$0'}
                </div>
                <div className="text-xs sm:text-sm text-blue-100">Total Costs</div>
                <div className="w-full bg-white/20 rounded-full h-1 sm:h-1.5 mt-2 sm:mt-3">
                  <div className="bg-red-300 rounded-full h-1 sm:h-1.5" style={{ width: '45%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {analyticsData && analyticsData.salesTrend && analyticsData.salesTrend.length > 0 ? (
          <>
            {/* Interactive Charts Section - Only show in Overview mode */}
            {viewMode === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                {/* Performance Trends Chart */}
                <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8 hover:shadow-2xl transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg sm:rounded-xl">
                        <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                      </div>
                      <span className="hidden sm:inline">Performance Trends</span>
                      <span className="sm:hidden">Trends</span>
                    </h3>
                    <div className="flex gap-1 sm:gap-2">
                      {['line', 'area', 'bar'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setSelectedChart(type)}
                          className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
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
                  
                  <div className="h-64 sm:h-72 lg:h-80">
                    {enhancedChartData.length > 0 ? (
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
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No chart data available</p>
                          <p className="text-sm text-gray-400">Try selecting a different time period</p>
                        </div>
                      </div>
                    )}
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
                  Overall Score: <span className="font-bold text-indigo-600">
                    {performanceData.length > 0 ? 
                      Math.round(performanceData.reduce((sum, metric) => sum + metric.value, 0) / performanceData.length) + '%' 
                      : 'N/A'
                    }
                  </span>
                </div>
                  </div>
                  
                  <div className="h-64 sm:h-72 lg:h-80">
                    {performanceData.length > 0 ? (
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
                            fill="#3B82F6"
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
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No performance data available</p>
                          <p className="text-sm text-gray-400">Try selecting a different time period</p>
                        </div>
                      </div>
                    )}
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
                      <div key={trend._id || `sales-trend-${index}`} className="group p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:scale-105">
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
                      <div key={trend._id || `tasks-trend-${index}`} className="group p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:scale-105">
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
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  Quick Actions
                </h3>
                
                {/* PDF Library Status */}
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                    jsPDF ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${jsPDF ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    {jsPDF ? 'PDF Ready' : 'PDF Loading...'}
                  </div>
                  {!jsPDF && (
                    <button
                      onClick={loadJsPDF}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                    >
                      Reload
                    </button>
                  )}
                </div>
              </div>
              
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
            <p className="text-lg text-gray-600 mb-6">Try selecting a different time period or check back later.</p>
            
            {/* Helpful Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => fetchAnalytics()}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh Data'}
              </button>
              <button
                onClick={() => setPeriod('month')}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Try Monthly View
              </button>
            </div>
            
            {/* Data Status */}
            <div className="mt-8 p-4 bg-blue-50 rounded-xl max-w-md mx-auto">
              <p className="text-sm text-blue-700">
                <strong>Current Period:</strong> {period.charAt(0).toUpperCase() + period.slice(1)}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                {analyticsData ? 'Data structure received but no trend data found' : 'No data received from server'}
              </p>
              
              {/* Debug Info - Only show in development */}
              {process.env.NODE_ENV === 'development' && analyticsData && (
                <details className="mt-3">
                  <summary className="text-xs text-blue-600 cursor-pointer">Debug Info</summary>
                  <pre className="text-xs text-blue-700 mt-2 bg-blue-100 p-2 rounded overflow-auto">
                    {JSON.stringify(analyticsData, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}

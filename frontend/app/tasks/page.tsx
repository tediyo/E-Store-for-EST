'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Search, ClipboardList, Calendar, TrendingUp, MapPin, Clock, AlertCircle, CheckCircle, XCircle, Edit, Trash2 } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import PageLayout from '../../components/layout/PageLayout'

interface Task {
  _id: string
  clientStatus: 'unsuccessful' | 'annoying' | 'blocked'
  clientPhone: string
  behavioralDetails: string
  cause: string
  preferredShoeType: string
  notes?: string
  taxiCost?: number
  otherCosts?: number
  totalCost?: number
  createdBy: {
    username: string
  }
  taskDate: string
}

interface Reminder {
  _id: string
  title: string
  actionType: 'follow_up' | 'meeting' | 'delivery' | 'pickup' | 'payment' | 'inspection' | 'other'
  description?: string
  place?: string
  actionAt: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  sent: boolean
}

export default function TasksPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showReminderForm, setShowReminderForm] = useState(false)
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [taskFilter, setTaskFilter] = useState<'all' | 'client_issues' | 'sales'>('all')
  
  // Reminder form state
  const [reminderTitle, setReminderTitle] = useState('')
  const [reminderActionType, setReminderActionType] = useState<'follow_up' | 'meeting' | 'delivery' | 'pickup' | 'payment' | 'inspection' | 'other'>('follow_up')
  const [reminderDescription, setReminderDescription] = useState('')
  const [reminderPlace, setReminderPlace] = useState('')
  const [reminderActionAt, setReminderActionAt] = useState('')
  const [reminderPriority, setReminderPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')

  // Client registration form state
  const [showClientForm, setShowClientForm] = useState(false)
  const [clientStatus, setClientStatus] = useState<'unsuccessful' | 'annoying' | 'blocked'>('unsuccessful')
  const [clientPhone, setClientPhone] = useState('')
  const [behavioralDetails, setBehavioralDetails] = useState('')
  const [cause, setCause] = useState('')
  const [preferredShoeType, setPreferredShoeType] = useState('')
  const [clientNotes, setClientNotes] = useState('')
  const [taxiCost, setTaxiCost] = useState(0)
  const [otherCosts, setOtherCosts] = useState(0)

  useEffect(() => {
    fetchTasks()
    fetchReminders()
    requestNotificationPermission()
    const intervalId = setInterval(() => {
      pollDueReminders()
    }, 30000)
    return () => clearInterval(intervalId)
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tasks')
      setTasks(response.data.tasks)
    } catch (error) {
      toast.error('Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  const fetchReminders = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/reminders', { params: { upcoming: true } })
      setReminders(response.data.reminders)
    } catch (error) {
      // silent
    }
  }

  const requestNotificationPermission = async () => {
    try {
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission()
      }
    } catch {}
  }

  const showNotification = (title: string, body?: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body })
    } else {
      toast.success(title + (body ? ` — ${body}` : ''))
    }
  }

  const pollDueReminders = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/reminders/due', { windowMinutes: 1 })
      const due: Reminder[] = response.data.reminders
      if (due && due.length) {
        due.forEach(r => showNotification(r.title, new Date(r.actionAt).toLocaleString()))
        // refresh list to reflect sent ones
        fetchReminders()
      }
    } catch {}
  }

  const createReminder = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!reminderTitle || !reminderActionAt) {
        toast.error('Title and date/time are required')
        return
      }
      const iso = new Date(reminderActionAt).toISOString()
      await axios.post('http://localhost:5000/api/reminders', {
        title: reminderTitle,
        actionType: reminderActionType,
        description: reminderDescription || undefined,
        place: reminderPlace || undefined,
        actionAt: iso,
        priority: reminderPriority
      })
      toast.success('Action day created successfully!')
      setReminderTitle('')
      setReminderActionType('follow_up')
      setReminderDescription('')
      setReminderPlace('')
      setReminderActionAt('')
      setReminderPriority('medium')
      setShowReminderForm(false)
      fetchReminders()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create action day')
    }
  }

  const createClientTask = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!clientPhone || !behavioralDetails || !cause || !preferredShoeType) {
        toast.error('Phone number, behavioral details, cause, and preferred shoe type are required')
        return
      }

      await axios.post('http://localhost:5000/api/tasks', {
        clientStatus,
        clientPhone,
        behavioralDetails,
        cause,
        preferredShoeType,
        notes: clientNotes || undefined,
        taxiCost,
        otherCosts
      })

      toast.success('Client registered successfully!')
      setClientStatus('unsuccessful')
      setClientPhone('')
      setBehavioralDetails('')
      setCause('')
      setPreferredShoeType('')
      setClientNotes('')
      setTaxiCost(0)
      setOtherCosts(0)
      setShowClientForm(false)
      fetchTasks()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to register client')
    }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.clientPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.behavioralDetails.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.cause.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.preferredShoeType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.notes && task.notes.toLowerCase().includes(searchTerm.toLowerCase()))

    if (taskFilter === 'unsuccessful') {
      return matchesSearch && task.clientStatus === 'unsuccessful'
    } else if (taskFilter === 'annoying') {
      return matchesSearch && task.clientStatus === 'annoying'
    } else if (taskFilter === 'blocked') {
      return matchesSearch && task.clientStatus === 'blocked'
    }
    
    return matchesSearch
  })

  const getLocationColor = (location: string) => {
    return location === 'store' ? 'text-success-600 bg-success-50' : 'text-warning-600 bg-warning-50'
  }

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return '$0.00'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getActionTypeIcon = (type: string) => {
    const icons = {
      follow_up: '📞',
      meeting: '🤝',
      delivery: '📦',
      pickup: '🚚',
      payment: '💰',
      inspection: '🔍',
      other: '📋'
    }
    return icons[type as keyof typeof icons] || '📋'
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'text-gray-600 bg-gray-100',
      medium: 'text-blue-600 bg-blue-100',
      high: 'text-orange-600 bg-orange-100',
      urgent: 'text-red-600 bg-red-100'
    }
    return colors[priority as keyof typeof colors] || 'text-gray-600 bg-gray-100'
  }

  const getActionTypeColor = (type: string) => {
    const colors = {
      follow_up: 'text-blue-600 bg-blue-50',
      meeting: 'text-purple-600 bg-purple-50',
      delivery: 'text-green-600 bg-green-50',
      pickup: 'text-yellow-600 bg-yellow-50',
      payment: 'text-emerald-600 bg-emerald-50',
      inspection: 'text-indigo-600 bg-indigo-50',
      other: 'text-gray-600 bg-gray-50'
    }
    return colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-50'
  }

  const getClientStatusColor = (status: string) => {
    const colors = {
      unsuccessful: 'text-orange-600 bg-orange-50',
      annoying: 'text-red-600 bg-red-50',
      blocked: 'text-gray-600 bg-gray-50'
    }
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-50'
  }

  const getTaskIcon = (task: Task) => {
    if (task.clientStatus === 'unsuccessful') {
      return <AlertCircle className="h-8 w-8 text-orange-600" />
    } else if (task.clientStatus === 'annoying') {
      return <AlertCircle className="h-8 w-8 text-red-600" />
    } else if (task.clientStatus === 'blocked') {
      return <XCircle className="h-8 w-8 text-gray-600" />
    }
    return <AlertCircle className="h-8 w-8 text-red-600" />
  }

  const getTaskBorderColor = (task: Task) => {
    if (task.clientStatus === 'unsuccessful') {
      return 'border-orange-200 hover:border-orange-300'
    } else if (task.clientStatus === 'annoying') {
      return 'border-red-200 hover:border-red-300'
    } else if (task.clientStatus === 'blocked') {
      return 'border-gray-200 hover:border-gray-300'
    }
    return 'border-gray-100 hover:border-gray-200'
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="space-y-8">

          
          {/* Search Skeleton */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded-2xl mb-6"></div>
              <div className="flex gap-6">
                <div className="h-16 bg-gray-200 rounded-2xl w-48"></div>
                <div className="h-16 bg-gray-200 rounded-2xl w-32"></div>
              </div>
            </div>
          </div>
          
          {/* Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-3xl shadow-lg border p-6 animate-pulse">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-2xl mr-4"></div>
                    <div>
                      <div className="h-6 bg-gray-200 rounded mb-2 w-32"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="w-24 h-8 bg-gray-200 rounded-full"></div>
                </div>
                <div className="space-y-4 mb-6">
                  <div className="h-12 bg-gray-200 rounded-2xl"></div>
                  <div className="h-12 bg-gray-200 rounded-2xl"></div>
                </div>
                <div className="space-y-4 mb-6">
                  <div className="h-12 bg-gray-200 rounded-2xl"></div>
                  <div className="h-12 bg-gray-200 rounded-2xl"></div>
                  <div className="h-16 bg-gray-200 rounded-2xl"></div>
                </div>
                <div className="border-t border-gray-100 pt-6">
                  <div className="h-12 bg-gray-200 rounded-xl"></div>
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
      {/* Header */}
        <div className="relative bg-gradient-to-br from-red-500 via-orange-500 to-red-600 rounded-3xl p-8 text-white overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-white/5 rounded-full blur-lg animate-bounce delay-500"></div>
          </div>
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-6 sm:mb-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
                  <AlertCircle className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent">
                  Client Registry
                </h1>
              </div>
              <p className="text-xl text-white/90 mb-6">Track and manage problematic clients with ease</p>
              
              {/* Enhanced Statistics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-105">
                  <div className="text-3xl font-bold text-white mb-1">{tasks.length}</div>
                  <div className="text-sm text-white/80">Total Clients</div>
                  <div className="w-full bg-white/20 rounded-full h-1 mt-2">
                    <div className="bg-white rounded-full h-1" style={{ width: `${Math.min((tasks.length / 10) * 100, 100)}%` }}></div>
                  </div>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-105">
                  <div className="text-3xl font-bold text-orange-200 mb-1">{tasks.filter(t => t.clientStatus === 'annoying').length}</div>
                  <div className="text-sm text-white/80">Annoying</div>
                  <div className="w-full bg-white/20 rounded-full h-1 mt-2">
                    <div className="bg-orange-300 rounded-full h-1" style={{ width: `${tasks.length > 0 ? (tasks.filter(t => t.clientStatus === 'annoying').length / tasks.length) * 100 : 0}%` }}></div>
                  </div>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-105">
                  <div className="text-3xl font-bold text-red-200 mb-1">{tasks.filter(t => t.clientStatus === 'blocked').length}</div>
                  <div className="text-sm text-white/80">Blocked</div>
                  <div className="w-full bg-white/20 rounded-full h-1 mt-2">
                    <div className="bg-red-300 rounded-full h-1" style={{ width: `${tasks.length > 0 ? (tasks.filter(t => t.clientStatus === 'blocked').length / tasks.length) * 100 : 0}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowClientForm(true)}
                className="group bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-2xl px-8 py-4 flex items-center font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-white/20"
              >
                <div className="p-2 bg-red-500 rounded-xl mr-3 group-hover:bg-red-600 transition-colors">
                  <AlertCircle size={24} className="text-white" />
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold">Register Client</div>
                  <div className="text-sm text-white/80">Add new entry</div>
                </div>
              </button>
              
              <button
                onClick={() => setShowReminderForm(true)}
                className="group bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-2xl px-8 py-4 flex items-center font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-white/20"
              >
                <div className="p-2 bg-blue-500 rounded-xl mr-3 group-hover:bg-blue-600 transition-colors">
                  <Calendar size={24} className="text-white" />
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold">Add Action Day</div>
                  <div className="text-sm text-white/80">Schedule reminder</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Action Days Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-8 py-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <Calendar className="h-8 w-8 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Upcoming Action Days</h2>
                  <p className="text-gray-600">Your scheduled tasks and reminders</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-emerald-600">{reminders.length}</div>
                <div className="text-sm text-gray-500">Active</div>
              </div>
            </div>
        </div>
        
          <div className="p-8">
            {reminders.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming action days</h3>
                <p className="text-gray-500 mb-6">Start planning by adding your first action day</p>
        <button
                  onClick={() => setShowReminderForm(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  Add Action Day
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {reminders.map((reminder) => (
                  <div key={reminder._id} className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{getActionTypeIcon(reminder.actionType)}</div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{reminder.title}</h3>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActionTypeColor(reminder.actionType)}`}>
                              {reminder.actionType.replace('_', ' ')}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(reminder.priority)}`}>
                              {reminder.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">Action Time</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {new Date(reminder.actionAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(reminder.actionAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    
                    {(reminder.description || reminder.place) && (
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        {reminder.description && (
                          <div className="flex items-start gap-2">
                            <ClipboardList className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-sm font-medium text-gray-700 mb-1">Notes</div>
                              <p className="text-sm text-gray-600">{reminder.description}</p>
                            </div>
                          </div>
                        )}
                        {reminder.place && (
                          <div className="flex items-start gap-2">
                            <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-sm font-medium text-gray-700 mb-1">Location</div>
                              <p className="text-sm text-gray-600">{reminder.place}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Created by {user?.username}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit size={16} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={16} />
        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
      </div>

        {/* Enhanced Search and Filters */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search Input */}
            <div className="relative flex-1 group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" size={20} />
                <input
                  type="text"
                  placeholder="Search by client phone, behavior, cause, shoe type, or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg"
                />
              </div>
            </div>
            
            {/* Filter Dropdown */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative">
                <select
                  value={taskFilter}
                  onChange={(e) => setTaskFilter(e.target.value as any)}
                  className="px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 text-lg font-medium bg-white min-w-[180px] cursor-pointer"
                >
                  <option value="all">🔍 All Clients</option>
                  <option value="unsuccessful">❌ Unsuccessful</option>
                  <option value="annoying">😤 Annoying</option>
                  <option value="blocked">🚫 Blocked</option>
                </select>
              </div>
            </div>
            
            {/* Clear Button */}
            <button
              onClick={() => {
                setSearchTerm('')
                setTaskFilter('all')
              }}
              className="group px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-2xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors"></div>
                Clear All
              </div>
            </button>
          </div>
          
          {/* Active Filters Display */}
          {(searchTerm || taskFilter !== 'all') && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-700">Active Filters:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-1">
                    🔍 "{searchTerm}"
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                )}
                {taskFilter !== 'all' && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium flex items-center gap-1">
                    {taskFilter === 'unsuccessful' ? '❌' : taskFilter === 'annoying' ? '😤' : '🚫'} {taskFilter}
                    <button 
                      onClick={() => setTaskFilter('all')}
                      className="ml-1 hover:bg-orange-200 rounded-full p-0.5 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-8 right-8 z-40">
          <button
            onClick={() => setShowClientForm(true)}
            className="group bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white w-16 h-16 rounded-full shadow-2xl hover:shadow-red-500/50 transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center"
          >
            <AlertCircle className="h-8 w-8 group-hover:rotate-12 transition-transform duration-300" />
          </button>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
            Register New Client
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>

        {/* Enhanced Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredTasks.map((task, index) => (
          <div 
            key={task._id} 
            className={`group bg-white rounded-3xl shadow-lg border p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 ${getTaskBorderColor(task)} transform-gpu animate-in slide-in-from-bottom-4 duration-500`}
            style={{ 
              animationDelay: `${index * 150}ms`,
              animationFillMode: 'both'
            }}
          >
            {/* Card Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center">
                <div className={`p-4 rounded-2xl mr-4 group-hover:scale-110 transition-transform duration-300 ${
                  task.clientStatus === 'unsuccessful' 
                    ? 'bg-gradient-to-br from-orange-100 to-orange-200' 
                    : task.clientStatus === 'annoying'
                    ? 'bg-gradient-to-br from-red-100 to-red-200'
                    : 'bg-gradient-to-br from-gray-100 to-gray-200'
                }`}>
                  {getTaskIcon(task)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-300">
                    {task.preferredShoeType}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium">Status: {task.clientStatus}</p>
                </div>
              </div>
              
              {/* Status Badge */}
              <div className="relative">
                <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${getClientStatusColor(task.clientStatus)} group-hover:scale-110 transition-transform duration-300`}>
                  {task.clientStatus === 'unsuccessful' ? '❌ Unsuccessful' :
                   task.clientStatus === 'annoying' ? '😤 Annoying' :
                   '🚫 Blocked'}
                </span>
                {/* Animated ring */}
                <div className={`absolute inset-0 rounded-full border-2 border-dashed opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                  task.clientStatus === 'unsuccessful' ? 'border-orange-400' :
                  task.clientStatus === 'annoying' ? 'border-red-400' :
                  'border-gray-400'
                }`}></div>
              </div>
            </div>

            {/* Client Information */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl group-hover:from-blue-100 group-hover:to-indigo-100 transition-all duration-300">
                <span className="text-gray-600 font-medium">📱 Phone:</span>
                <span className="font-bold text-lg text-blue-600 group-hover:text-blue-700 transition-colors">
                  {task.clientPhone}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl group-hover:from-green-100 group-hover:to-emerald-100 transition-all duration-300">
                <span className="text-gray-600 font-medium">👟 Shoe Type:</span>
                <span className="font-bold text-lg text-green-600 group-hover:text-green-700 transition-colors">
                  {task.preferredShoeType}
                </span>
              </div>
            </div>

            {/* Cost Information with Animations */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl group-hover:from-red-100 group-hover:to-pink-100 transition-all duration-300">
                <span className="text-gray-600 font-medium">🚕 Taxi Cost:</span>
                <span className="font-bold text-lg text-red-600 group-hover:text-red-700 transition-colors">
                  {formatCurrency(task.taxiCost)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl group-hover:from-purple-100 group-hover:to-violet-100 transition-all duration-300">
                <span className="text-gray-600 font-medium">💰 Other Costs:</span>
                <span className="font-bold text-lg text-purple-600 group-hover:text-purple-700 transition-colors">
                  {formatCurrency(task.otherCosts)}
                </span>
              </div>
              
              {/* Total Cost with Special Styling */}
              <div className="relative overflow-hidden">
                <div className="flex justify-between items-center py-4 px-6 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl text-white group-hover:from-gray-800 group-hover:to-gray-700 transition-all duration-300">
                  <span className="font-bold text-lg">💸 Total Cost:</span>
                  <span className="font-bold text-2xl text-yellow-300 group-hover:text-yellow-200 transition-colors">
                    {formatCurrency(task.totalCost)}
                  </span>
                </div>
                {/* Animated shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </div>
            </div>

            {/* Client Details */}
            <div className="border-t border-gray-100 pt-6 mb-6">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                Client Details
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-start p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl group-hover:from-red-100 group-hover:to-orange-100 transition-all duration-300">
                  <span className="text-gray-600 font-medium">😤 Behavior:</span>
                  <span className="font-medium text-gray-800 text-right max-w-[200px] leading-relaxed">
                    {task.behavioralDetails}
                  </span>
                </div>
                <div className="flex justify-between items-start p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl group-hover:from-orange-100 group-hover:to-yellow-100 transition-all duration-300">
                  <span className="text-gray-600 font-medium">🚨 Cause:</span>
                  <span className="font-medium text-gray-800 text-right max-w-[200px] leading-relaxed">
                    {task.cause}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            {task.notes && (
              <div className="border-t border-gray-100 pt-6 mb-6">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-lg">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                  Notes
                </h4>
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl group-hover:from-purple-100 group-hover:to-pink-100 transition-all duration-300">
                  <p className="text-gray-700 leading-relaxed">{task.notes}</p>
                </div>
              </div>
            )}

            {/* Footer with Actions */}
            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Created by {task.createdBy.username}
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  {new Date(task.taskDate).toLocaleDateString()}
                </span>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button className="flex-1 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95">
                  <div className="flex items-center justify-center gap-2">
                    <Edit size={16} />
                    Edit
                  </div>
                </button>
                <button className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95">
                  <div className="flex items-center justify-center gap-2">
                    <Trash2 size={16} />
                    Delete
                  </div>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-10 left-10 w-32 h-32 bg-blue-100 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-10 right-10 w-24 h-24 bg-purple-100 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>
            
            <div className="relative z-10">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                <AlertCircle className="h-16 w-16 text-blue-500" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                No clients found
              </h3>
              <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                {searchTerm ? 'Try adjusting your search terms or filters.' : 'Get started by registering your first problematic client to keep track of difficult interactions.'}
              </p>
              
              {!searchTerm && (
                <button
                  onClick={() => setShowClientForm(true)}
                  className="group bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                    Register First Client
                  </div>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Add Action Day Modal */}
        {showReminderForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Add Action Day</h2>
                <p className="text-gray-600">Schedule your next important task or reminder</p>
              </div>
              
              <form onSubmit={createReminder} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    value={reminderTitle}
                    onChange={(e) => setReminderTitle(e.target.value)}
                    placeholder="Follow up with client"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Action Type *</label>
                    <select
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      value={reminderActionType}
                      onChange={(e) => setReminderActionType(e.target.value as any)}
                    >
                      <option value="follow_up">📞 Follow Up</option>
                      <option value="meeting">🤝 Meeting</option>
                      <option value="delivery">📦 Delivery</option>
                      <option value="pickup">🚚 Pickup</option>
                      <option value="payment">💰 Payment</option>
                      <option value="inspection">🔍 Inspection</option>
                      <option value="other">📋 Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      value={reminderPriority}
                      onChange={(e) => setReminderPriority(e.target.value as any)}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      value={reminderPlace}
                      onChange={(e) => setReminderPlace(e.target.value)}
                      placeholder="Store, client office, etc."
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date & Time *</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="datetime-local"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      value={reminderActionAt}
                      onChange={(e) => setReminderActionAt(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 min-h-[100px] resize-none"
                    value={reminderDescription}
                    onChange={(e) => setReminderDescription(e.target.value)}
                    placeholder="Additional details, instructions, or context..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowReminderForm(false)} 
                    className="py-3 px-6 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit" 
                    className="py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
                  >
                    Create Action Day
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Enhanced Client Registration Modal */}
        {showClientForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
              {/* Modal Header */}
              <div className="text-center mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-orange-50 rounded-3xl -m-8 p-8 -z-10"></div>
                <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <AlertCircle className="h-10 w-10 text-red-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  Register Problematic Client
                </h2>
                <p className="text-gray-600 text-lg">Track difficult clients to avoid future issues</p>
              </div>
              
              <form onSubmit={createClientTask} className="space-y-6">
                {/* Client Status */}
                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-3 text-lg">Client Status *</label>
                  <div className="relative">
                    <select
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 text-lg font-medium bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-white cursor-pointer"
                      value={clientStatus}
                      onChange={(e) => setClientStatus(e.target.value as any)}
                      required
                    >
                      <option value="unsuccessful">❌ Unsuccessful - Client didn't complete transaction</option>
                      <option value="annoying">😤 Annoying - Client was difficult to work with</option>
                      <option value="blocked">🚫 Blocked - Client is banned from future interactions</option>
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-red-500 transition-colors">
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </div>
                </div>
                
                {/* Phone Number */}
                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-3 text-lg">📱 Phone Number *</label>
                  <div className="relative">
                    <input
                      type="tel"
                      className="w-full pl-12 pr-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 text-lg bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-white"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-red-500 transition-colors">
                      📱
                    </div>
                  </div>
                </div>
                
                {/* Behavioral Details */}
                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-3 text-lg">😤 Behavioral Details *</label>
                  <textarea
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 text-lg min-h-[120px] resize-none bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-white"
                    value={behavioralDetails}
                    onChange={(e) => setBehavioralDetails(e.target.value)}
                    placeholder="Describe the client's behavior, attitude, or problematic actions in detail..."
                    required
                  />
                </div>
                
                {/* Cause */}
                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-3 text-lg">🚨 Cause *</label>
                  <textarea
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 text-lg min-h-[100px] resize-none bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-white"
                    value={cause}
                    onChange={(e) => setCause(e.target.value)}
                    placeholder="What caused this situation? (e.g., payment issues, rude behavior, unreasonable demands, etc.)"
                    required
                  />
                </div>
                
                {/* Preferred Shoe Type */}
                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-3 text-lg">👟 Preferred Shoe Type *</label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full pl-12 pr-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 text-lg bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-white"
                      value={preferredShoeType}
                      onChange={(e) => setPreferredShoeType(e.target.value)}
                      placeholder="e.g., Nike Air Max 270, Adidas Ultraboost 22, etc."
                      required
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-red-500 transition-colors">
                      👟
                    </div>
                  </div>
                </div>
                
                {/* Cost Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-sm font-bold text-gray-700 mb-3 text-lg">🚕 Taxi Cost</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-full pl-12 pr-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 text-lg bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-white"
                        value={taxiCost}
                        onChange={(e) => setTaxiCost(Number(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-red-500 transition-colors">
                        💰
                      </div>
                    </div>
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-bold text-gray-700 mb-3 text-lg">💰 Other Costs</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-full pl-12 pr-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 text-lg bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-white"
                        value={otherCosts}
                        onChange={(e) => setOtherCosts(Number(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-red-500 transition-colors">
                        💸
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Additional Notes */}
                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-3 text-lg">📝 Additional Notes</label>
                  <textarea
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 text-lg min-h-[100px] resize-none bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-white"
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                    placeholder="Any other relevant information about this client, future warnings, or special notes..."
                  />
                </div>
                
                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4 pt-6">
                  <button 
                    type="button" 
                    onClick={() => setShowClientForm(false)} 
                    className="py-4 px-8 border-2 border-gray-200 text-gray-700 rounded-2xl font-bold text-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit" 
                    className="py-4 px-8 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Register Client
                    </div>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
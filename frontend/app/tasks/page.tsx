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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <PageLayout>
      <div className="space-y-8">
      {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Client Registration System</h1>
              <p className="text-blue-100 text-lg">Track and manage problematic clients</p>
              <div className="flex gap-4 mt-4">
                <div className="bg-white/20 rounded-lg px-4 py-2">
                  <div className="text-2xl font-bold">{tasks.length}</div>
                  <div className="text-sm text-blue-100">Total Clients</div>
                </div>
                <div className="bg-white/20 rounded-lg px-4 py-2">
                  <div className="text-2xl font-bold">{tasks.filter(t => t.clientStatus === 'annoying').length}</div>
                  <div className="text-sm text-blue-100">Annoying Clients</div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-4 sm:mt-0">
              <button
                onClick={() => setShowClientForm(true)}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl px-6 py-3 flex items-center font-medium transition-all duration-200 hover:scale-105"
              >
                <AlertCircle size={20} className="mr-2" />
                Register Client
              </button>
              <button
                onClick={() => setShowReminderForm(true)}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl px-6 py-3 flex items-center font-medium transition-all duration-200 hover:scale-105"
              >
                <Calendar size={20} className="mr-2" />
                Add Action Day
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

      {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by client phone, behavior, cause, shoe type, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
        <select
          value={taskFilter}
          onChange={(e) => setTaskFilter(e.target.value as any)}
          className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        >
          <option value="all">All Clients</option>
          <option value="unsuccessful">Unsuccessful</option>
          <option value="annoying">Annoying</option>
          <option value="blocked">Blocked</option>
        </select>
        <button
          onClick={() => {
            setSearchTerm('')
            setTaskFilter('all')
          }}
          className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
        >
          Clear All
        </button>
      </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <div key={task._id} className={`bg-white rounded-2xl shadow-lg border p-6 hover:shadow-xl transition-all duration-200 ${getTaskBorderColor(task)}`}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-xl mr-4 ${
                  task.clientStatus === 'unsuccessful' 
                    ? 'bg-orange-100' 
                    : task.clientStatus === 'annoying'
                    ? 'bg-red-100'
                    : 'bg-gray-100'
                }`}>
                  {getTaskIcon(task)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{task.preferredShoeType}</h3>
                  <p className="text-sm text-gray-500">Client Status: {task.clientStatus}</p>
                </div>
              </div>
              <span className={`px-3 py-2 rounded-full text-xs font-medium ${getClientStatusColor(task.clientStatus)}`}>
                {task.clientStatus === 'unsuccessful' ? '❌ Unsuccessful' :
                 task.clientStatus === 'annoying' ? '😤 Annoying' :
                 '🚫 Blocked'}
              </span>
            </div>

            {/* Client Information */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Phone Number:</span>
                <span className="font-semibold text-lg">{task.clientPhone}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Preferred Shoe:</span>
                <span className="font-semibold text-lg text-blue-600">{task.preferredShoeType}</span>
              </div>
            </div>

            {/* Cost Information */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Taxi Cost:</span>
                <span className="font-semibold text-lg text-red-600">{formatCurrency(task.taxiCost)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Other Costs:</span>
                <span className="font-semibold text-lg text-red-600">{formatCurrency(task.otherCosts)}</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-gradient-to-r from-gray-50 to-white rounded-xl px-4">
                <span className="text-gray-900 font-bold text-lg">Total Cost:</span>
                <span className="font-bold text-2xl text-red-600">{formatCurrency(task.totalCost)}</span>
              </div>
            </div>

            {/* Client Details */}
            <div className="border-t border-gray-100 pt-6 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Client Details
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Behavior:</span>
                  <span className="font-medium">{task.behavioralDetails}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cause:</span>
                  <span className="font-medium">{task.cause}</span>
                </div>
              </div>
            </div>

            {task.notes && (
              <div className="border-t border-gray-100 pt-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Notes
                </h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{task.notes}</p>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
              <span>Created by {task.createdBy.username}</span>
              <span>{new Date(task.taskDate).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No clients found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by registering your first problematic client.'}
            </p>
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

        {/* Client Registration Modal */}
        {showClientForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Register Client</h2>
                <p className="text-gray-600">Record details of unsuccessful or problematic clients</p>
              </div>
              
              <form onSubmit={createClientTask} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client Status *</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    value={clientStatus}
                    onChange={(e) => setClientStatus(e.target.value as any)}
                    required
                  >
                    <option value="unsuccessful">❌ Unsuccessful</option>
                    <option value="annoying">😤 Annoying</option>
                    <option value="blocked">🚫 Blocked</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Behavioral Details *</label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 min-h-[100px] resize-none"
                    value={behavioralDetails}
                    onChange={(e) => setBehavioralDetails(e.target.value)}
                    placeholder="Describe the client's behavior, attitude, or problematic actions..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cause *</label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 min-h-[80px] resize-none"
                    value={cause}
                    onChange={(e) => setCause(e.target.value)}
                    placeholder="What caused this situation? (e.g., payment issues, rude behavior, etc.)"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Shoe Type</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    value={preferredShoeType}
                    onChange={(e) => setPreferredShoeType(e.target.value)}
                    placeholder="e.g., Nike Air Max, Adidas Ultraboost, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 min-h-[80px] resize-none"
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                    placeholder="Any other relevant information about this client..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Taxi Cost</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                      value={taxiCost}
                      onChange={(e) => setTaxiCost(Number(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Other Costs</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                      value={otherCosts}
                      onChange={(e) => setOtherCosts(Number(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowClientForm(false)} 
                    className="py-3 px-6 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit" 
                    className="py-3 px-6 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                  >
                    Register Client
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
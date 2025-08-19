'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Search, ClipboardList, Calendar, TrendingUp } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

interface Task {
  _id: string
  shoeType: string
  saleLocation: 'store' | 'out_of_store'
  basePrice: number
  profitGained: number
  taxiCost: number
  otherCosts: number
  supplier: string
  totalCost: number
  netProfit: number
  clientDetails?: {
    phone?: string
    address?: string
    intentionalBehaviour?: string
  }
  notes?: string
  createdBy: {
    username: string
  }
  taskDate: string
}

export default function TasksPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    fetchTasks()
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

  const filteredTasks = tasks.filter(task =>
    task.shoeType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.saleLocation.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getLocationColor = (location: string) => {
    return location === 'store' ? 'text-success-600 bg-success-50' : 'text-warning-600 bg-warning-50'
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Daily Task Counter</h1>
          <p className="text-gray-600">Track your daily tasks and costs</p>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Create Task
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search tasks by shoe type, supplier, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <div key={task._id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <ClipboardList className="h-8 w-8 text-primary-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{task.shoeType}</h3>
                  <p className="text-sm text-gray-500">Supplier: {task.supplier}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLocationColor(task.saleLocation)}`}>
                {task.saleLocation.replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Base Price:</span>
                <span className="font-semibold">{formatCurrency(task.basePrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Profit Gained:</span>
                <span className="font-semibold text-success-600">{formatCurrency(task.profitGained)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taxi Cost:</span>
                <span className="font-semibold text-danger-600">{formatCurrency(task.taxiCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Other Costs:</span>
                <span className="font-semibold text-danger-600">{formatCurrency(task.otherCosts)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Cost:</span>
                <span className="font-semibold text-danger-600">{formatCurrency(task.totalCost)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2">
                <span className="text-gray-900 font-medium">Net Profit:</span>
                <span className={`font-bold ${task.netProfit >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                  {formatCurrency(task.netProfit)}
                </span>
              </div>
            </div>

            {task.clientDetails && (
              <div className="border-t border-gray-200 pt-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Client Details</h4>
                <div className="space-y-1 text-sm">
                  {task.clientDetails.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span>{task.clientDetails.phone}</span>
                    </div>
                  )}
                  {task.clientDetails.address && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Address:</span>
                      <span>{task.clientDetails.address}</span>
                    </div>
                  )}
                  {task.clientDetails.intentionalBehaviour && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Behavior:</span>
                      <span>{task.clientDetails.intentionalBehaviour}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {task.notes && (
              <div className="border-t border-gray-200 pt-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                <p className="text-sm text-gray-600">{task.notes}</p>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Created by {task.createdBy.username}</span>
              <span>{new Date(task.taskDate).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <ClipboardList className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first task.'}
          </p>
        </div>
      )}

      {/* Add Task Modal would go here */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Create New Task</h2>
            <p className="text-gray-600 mb-4">Task form will be implemented here.</p>
            <button
              onClick={() => setShowAddForm(false)}
              className="btn btn-secondary w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

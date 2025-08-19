'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

interface Item {
  _id: string
  name: string
  shoeType: string
  basePrice: number
  sellingPrice: number
  quantity: number
  supplier: string
  status: string
  description?: string
  addedBy: {
    username: string
  }
  createdAt: string
}

export default function InventoryPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/items')
      setItems(response.data.items)
    } catch (error) {
      toast.error('Failed to fetch items')
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.shoeType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'text-success-600 bg-success-50'
      case 'low_stock': return 'text-warning-600 bg-warning-50'
      case 'out_of_stock': return 'text-danger-600 bg-danger-50'
      default: return 'text-gray-600 bg-gray-50'
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Manage your store items and stock levels</p>
        </div>
        
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Add New Item
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search items by name, type, or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={item._id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-primary-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.shoeType}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                {item.status.replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Base Price:</span>
                <span className="font-semibold">${item.basePrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Selling Price:</span>
                <span className="font-semibold">${item.sellingPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-semibold">{item.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Supplier:</span>
                <span className="font-semibold">{item.supplier}</span>
              </div>
            </div>

            {item.description && (
              <p className="text-sm text-gray-600 mb-4">{item.description}</p>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Added by {item.addedBy.username}</span>
              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
            </div>

            {user?.role === 'admin' && (
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setEditingItem(item)}
                  className="btn btn-secondary flex-1 flex items-center justify-center"
                >
                  <Edit size={16} className="mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteItem(item._id)}
                  className="btn btn-danger flex-1 flex items-center justify-center"
                >
                  <Trash2 size={16} className="mr-1" />
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first item.'}
          </p>
        </div>
      )}

      {/* Add/Edit Item Modal would go here */}
      {/* For now, just show a placeholder */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Add New Item</h2>
            <p className="text-gray-600 mb-4">Item form will be implemented here.</p>
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

// Placeholder function for delete
const handleDeleteItem = (id: string) => {
  // Implementation would go here
  console.log('Delete item:', id)
}

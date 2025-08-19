'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Search, Edit, Trash2, Package, Filter, SortAsc, SortDesc } from 'lucide-react'
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
  image?: string
  addedBy: {
    username: string
  }
  createdAt: string
}

interface ItemFormData {
  name: string
  shoeType: string
  basePrice: number
  sellingPrice: number
  quantity: number
  supplier: string
  description: string
  image?: File | null
}

export default function InventoryPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [statusFilter, setStatusFilter] = useState('all')
  const [shoeTypeFilter, setShoeTypeFilter] = useState('all')

  const [formData, setFormData] = useState<ItemFormData>({
    name: '',
    shoeType: '',
    basePrice: 0,
    sellingPrice: 0,
    quantity: 0,
    supplier: '',
    description: '',
    image: null
  })

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData()
      
      // Add text fields
      formDataToSend.append('name', formData.name)
      formDataToSend.append('shoeType', formData.shoeType)
      formDataToSend.append('basePrice', formData.basePrice.toString())
      formDataToSend.append('sellingPrice', formData.sellingPrice.toString())
      formDataToSend.append('quantity', formData.quantity.toString())
      formDataToSend.append('supplier', formData.supplier)
      formDataToSend.append('description', formData.description)
      
      // Add image if selected
      if (formData.image) {
        formDataToSend.append('image', formData.image)
      }
      
      console.log('Submitting form data:', formData)
      console.log('Auth token:', localStorage.getItem('token'))
      console.log('Axios headers:', axios.defaults.headers.common)
      
      if (editingItem) {
        const response = await axios.put(`http://localhost:5000/api/items/${editingItem._id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        toast.success('Item updated successfully!')
        console.log('Update response:', response.data)
      } else {
        const response = await axios.post('http://localhost:5000/api/items', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        toast.success('Item added successfully!')
        console.log('Create response:', response.data)
      }
      
      fetchItems()
      resetForm()
      setShowAddForm(false)
      setEditingItem(null)
    } catch (error: any) {
      console.error('Error details:', error)
      console.error('Response data:', error.response?.data)
      console.error('Status:', error.response?.status)
      
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please log in again.')
      } else if (error.response?.status === 403) {
        toast.error('Access denied. Admin role required.')
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.errors?.[0]?.msg || 
                           error.response?.data?.message || 
                           'Validation failed'
        toast.error(errorMessage)
      } else {
        toast.error(error.response?.data?.message || 'Operation failed')
      }
    }
  }

  const handleEdit = (item: Item) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      shoeType: item.shoeType,
      basePrice: item.basePrice,
      sellingPrice: item.sellingPrice,
      quantity: item.quantity,
      supplier: item.supplier,
      description: item.description || '',
      image: null // Reset image for edit
    })
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`http://localhost:5000/api/items/${id}`)
        toast.success('Item deleted successfully!')
        fetchItems()
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete item')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      shoeType: '',
      basePrice: 0,
      sellingPrice: 0,
      quantity: 0,
      supplier: '',
      description: '',
      image: null
    })
  }

  const closeModal = () => {
    setShowAddForm(false)
    setEditingItem(null)
    resetForm()
  }

  // Filtering and sorting
  let filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.shoeType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    const matchesType = shoeTypeFilter === 'all' || item.shoeType === shoeTypeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  // Sorting
  filteredItems.sort((a, b) => {
    let aValue = a[sortBy as keyof Item]
    let bValue = b[sortBy as keyof Item]
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'text-success-600 bg-success-50'
      case 'low_stock': return 'text-warning-600 bg-warning-50'
      case 'out_of_stock': return 'text-danger-600 bg-danger-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusText = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
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
      <div className="space-y-4">
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

        {/* Advanced Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <span className="text-sm text-gray-600">Filters:</span>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input text-sm py-2"
          >
            <option value="all">All Status</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>

          <select
            value={shoeTypeFilter}
            onChange={(e) => setShoeTypeFilter(e.target.value)}
            className="input text-sm py-2"
          >
            <option value="all">All Types</option>
            <option value="sneakers">Sneakers</option>
            <option value="formal">Formal</option>
            <option value="casual">Casual</option>
            <option value="sports">Sports</option>
            <option value="boots">Boots</option>
          </select>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input text-sm py-2"
            >
              <option value="name">Name</option>
              <option value="quantity">Quantity</option>
              <option value="basePrice">Base Price</option>
              <option value="sellingPrice">Selling Price</option>
              <option value="createdAt">Date Added</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 hover:bg-gray-100 rounded"
            >
              {sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{items.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-success-100 rounded-full flex items-center justify-center mr-3">
              <div className="h-4 w-4 bg-success-600 rounded-full"></div>
            </div>
            <div>
              <p className="text-sm text-gray-600">In Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {items.filter(item => item.status === 'in_stock').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-warning-100 rounded-full flex items-center justify-center mr-3">
              <div className="h-4 w-4 bg-warning-600 rounded-full"></div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {items.filter(item => item.status === 'low_stock').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-danger-100 rounded-full flex items-center justify-center mr-3">
              <div className="h-4 w-4 bg-danger-600 rounded-full"></div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {items.filter(item => item.status === 'out_of_stock').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={item._id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-primary-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.shoeType}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                {getStatusText(item.status)}
              </span>
            </div>

            {/* Product Image */}
            {item.image && (
              <div className="mb-4">
                <img 
                  src={`http://localhost:5000${item.image}`} 
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}

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
                  onClick={() => handleEdit(item)}
                  className="btn btn-secondary flex-1 flex items-center justify-center"
                >
                  <Edit size={16} className="mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
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
            {searchTerm || statusFilter !== 'all' || shoeTypeFilter !== 'all' 
              ? 'Try adjusting your search terms or filters.' 
              : 'Get started by adding your first item.'}
          </p>
        </div>
      )}

      {/* Add/Edit Item Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input w-full"
                    placeholder="Enter item name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shoe Type *
                  </label>
                  <select
                    required
                    value={formData.shoeType}
                    onChange={(e) => setFormData({...formData, shoeType: e.target.value})}
                    className="input w-full"
                  >
                    <option value="">Select shoe type</option>
                    <option value="sneakers">Sneakers</option>
                    <option value="formal">Formal</option>
                    <option value="casual">Casual</option>
                    <option value="sports">Sports</option>
                    <option value="boots">Boots</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Price *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({...formData, basePrice: parseFloat(e.target.value)})}
                    className="input w-full"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selling Price *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({...formData, sellingPrice: parseFloat(e.target.value)})}
                    className="input w-full"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                    className="input w-full"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supplier *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.supplier}
                    onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                    className="input w-full"
                    placeholder="Enter supplier name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image (Optional)
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({...formData, image: e.target.files?.[0] || null})}
                    className="input w-full"
                  />
                  <p className="text-xs text-gray-500">
                    Supported formats: JPG, PNG, GIF. Max size: 5MB
                  </p>
                  {formData.image && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Selected: {formData.image.name}</p>
                      <img 
                        src={URL.createObjectURL(formData.image)} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded border mt-2"
                      />
                    </div>
                  )}
                  {editingItem && editingItem.image && !formData.image && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Current image:</p>
                      <img 
                        src={`http://localhost:5000${editingItem.image}`} 
                        alt="Current" 
                        className="w-32 h-32 object-cover rounded border mt-2"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="input w-full"
                  rows={3}
                  placeholder="Enter item description (optional)"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                >
                  {editingItem ? 'Update Item' : 'Add Item'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

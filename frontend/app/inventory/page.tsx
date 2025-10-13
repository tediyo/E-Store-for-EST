'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Search, Edit, Trash2, Package, Filter, SortAsc, SortDesc, TrendingUp, TrendingDown, Eye, Grid3X3, List } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import PageLayout from '../../components/layout/PageLayout'
import { api } from '../../lib/api'

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedItems, setSelectedItems] = useState<string[]>([])

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
      // Ensure token is set in axios headers
      const token = localStorage.getItem('token')
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
      
      const response = await axios.get(api.endpoints.items)
      setItems(response.data.items)
    } catch (error) {
      console.error('Error fetching items:', error)
      toast.error('Failed to fetch items')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if user is logged in
    if (!user) {
      toast.error('Please log in to add items')
      return
    }
    
    try {
      // Ensure token is set in axios headers
      const token = localStorage.getItem('token')
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        console.log('Token set in axios headers:', axios.defaults.headers.common['Authorization'])
      } else {
        console.error('No token found in localStorage')
        toast.error('Please log in again')
        return
      }
      
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
      console.log('Auth token:', token)
      console.log('API endpoint:', api.endpoints.items)
      
      if (editingItem) {
        const response = await axios.put(`${api.endpoints.items}/${editingItem._id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        toast.success('Item updated successfully!')
        console.log('Update response:', response.data)
      } else {
        const response = await axios.post(api.endpoints.items, formDataToSend, {
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
        toast.error('Access denied. Please try again.')
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
        // Ensure token is set in axios headers
        const token = localStorage.getItem('token')
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        }
        
        await axios.delete(`${api.endpoints.items}/${id}`)
        toast.success('Item deleted successfully!')
        fetchItems()
      } catch (error: any) {
        console.error('Error deleting item:', error)
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
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
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
      case 'in_stock': return 'text-emerald-700 bg-emerald-100 border-emerald-200'
      case 'low_stock': return 'text-amber-700 bg-amber-100 border-amber-200'
      case 'out_of_stock': return 'text-red-700 bg-red-100 border-red-200'
      default: return 'text-gray-700 bg-gray-100 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getProfitMargin = (basePrice: number, sellingPrice: number) => {
    if (basePrice === 0) return 0
    return ((sellingPrice - basePrice) / basePrice) * 100
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin mx-auto absolute top-0 left-0 animate-pulse"></div>
          </div>
          <p className="mt-4 text-lg text-gray-600 font-medium">Loading inventory...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access the inventory management system.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-end gap-4">
            <button
              onClick={() => setShowAddForm(true)}
              className="group relative inline-flex items-center justify-center px-6 py-2.5 text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 hover:from-blue-700 hover:to-indigo-700"
            >
              <Plus size={20} className="mr-2 group-hover:rotate-90 transition-transform duration-200" />
              Add New Item
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-4 mb-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search items by name, type, or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-base bg-white/80 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
              />
            </div>

            {/* Advanced Filters and Controls */}
            <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2 text-gray-600">
                  <Filter size={18} />
                  <span className="font-medium text-sm">Filters:</span>
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-white/80 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="in_stock">In Stock</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>

                <select
                  value={shoeTypeFilter}
                  onChange={(e) => setShoeTypeFilter(e.target.value)}
                  className="px-3 py-2 bg-white/80 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="sneakers">Sneakers</option>
                  <option value="formal">Formal</option>
                  <option value="casual">Casual</option>
                  <option value="sports">Sports</option>
                  <option value="boots">Boots</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
                <div className="flex bg-white/80 rounded-lg p-1 border border-gray-200">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-all duration-200 ${
                      viewMode === 'grid' 
                        ? 'bg-blue-500 text-white shadow-md' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Grid3X3 size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-all duration-200 ${
                      viewMode === 'list' 
                        ? 'bg-blue-500 text-white shadow-md' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <List size={18} />
                  </button>
                </div>

                {/* Sort Controls */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 font-medium">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-2 py-1.5 bg-white/80 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="name">Name</option>
                    <option value="quantity">Quantity</option>
                    <option value="basePrice">Base Price</option>
                    <option value="sellingPrice">Selling Price</option>
                    <option value="createdAt">Date Added</option>
                  </select>
                  
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-1.5 bg-white/80 border border-gray-200 rounded-lg hover:bg-white transition-all duration-200"
                  >
                    {sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Items</p>
                <p className="text-3xl font-bold">{items.length}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <Package className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-blue-100 text-sm">
              <TrendingUp size={16} className="mr-1" />
              <span>All categories</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">In Stock</p>
                <p className="text-3xl font-bold">
                  {items.filter(item => item.status === 'in_stock').length}
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <div className="h-8 w-8 bg-emerald-300 rounded-full"></div>
              </div>
            </div>
            <div className="mt-4 flex items-center text-emerald-100 text-sm">
              <TrendingUp size={16} className="mr-1" />
              <span>Available</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Low Stock</p>
                <p className="text-3xl font-bold">
                  {items.filter(item => item.status === 'low_stock').length}
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <div className="h-8 w-8 bg-amber-300 rounded-full"></div>
              </div>
            </div>
            <div className="mt-4 flex items-center text-amber-100 text-sm">
              <TrendingDown size={16} className="mr-1" />
              <span>Need attention</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Out of Stock</p>
                <p className="text-3xl font-bold">
                  {items.filter(item => item.status === 'out_of_stock').length}
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <div className="h-8 w-8 bg-red-300 rounded-full"></div>
              </div>
            </div>
            <div className="mt-4 flex items-center text-red-100 text-sm">
              <TrendingDown size={16} className="mr-1" />
              <span>Restock needed</span>
            </div>
          </div>
        </div>

        {/* Items Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item, index) => (
              <div 
                key={item._id} 
                className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden transform hover:scale-105 hover:shadow-2xl transition-all duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Product Image */}
                {item.image ? (
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={`${api.baseURL}${item.image}`} 
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <Package className="h-16 w-16 text-gray-400" />
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(item.status)}`}>
                    {getStatusText(item.status)}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">
                      {item.shoeType}
                    </p>
                  </div>

                  {/* Price and Quantity Info */}
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Base Price:</span>
                      <span className="font-semibold text-gray-900">${item.basePrice}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Selling Price:</span>
                      <span className="font-semibold text-gray-900">${item.sellingPrice}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Quantity:</span>
                      <span className="font-semibold text-gray-900">{item.quantity}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Profit Margin:</span>
                      <span className={`font-semibold ${
                        getProfitMargin(item.basePrice, item.sellingPrice) > 0 
                          ? 'text-emerald-600' 
                          : 'text-red-600'
                      }`}>
                        {getProfitMargin(item.basePrice, item.sellingPrice).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                  )}

                  {/* Supplier and Date */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>by {item.addedBy.username}</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200 font-medium"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200 font-medium"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prices</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50">
                  {filteredItems.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50/50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {item.image ? (
                            <img 
                              src={`${api.baseURL}${item.image}`} 
                              alt={item.name}
                              className="h-12 w-12 rounded-lg object-cover mr-3"
                            />
                          ) : (
                            <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">{item.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {item.shoeType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div>Base: ${item.basePrice}</div>
                          <div>Selling: ${item.sellingPrice}</div>
                          <div className={`text-xs ${
                            getProfitMargin(item.basePrice, item.sellingPrice) > 0 
                              ? 'text-emerald-600' 
                              : 'text-red-600'
                          }`}>
                            {getProfitMargin(item.basePrice, item.sellingPrice).toFixed(1)}% margin
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{item.quantity}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                          {getStatusText(item.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{item.supplier}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-500 text-lg max-w-md mx-auto">
              {searchTerm || statusFilter !== 'all' || shoeTypeFilter !== 'all' 
                ? 'Try adjusting your search terms or filters to find what you\'re looking for.' 
                : 'Get started by adding your first inventory item to the system.'}
            </p>
            {!searchTerm && statusFilter === 'all' && shoeTypeFilter === 'all' && (
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="mr-2" size={20} />
                Add Your First Item
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Item Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white rounded-t-3xl px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {editingItem ? 'Edit Item' : 'Add New Item'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                    placeholder="Enter item name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Shoe Type *
                  </label>
                  <select
                    required
                    value={formData.shoeType}
                    onChange={(e) => setFormData({...formData, shoeType: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Base Price *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({...formData, basePrice: parseFloat(e.target.value)})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Selling Price *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({...formData, sellingPrice: parseFloat(e.target.value)})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Supplier *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.supplier}
                    onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                    placeholder="Enter supplier name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Product Image (Optional)
                </label>
                <div className="space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({...formData, image: e.target.files?.[0] || null})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-sm text-gray-500">
                    Supported formats: JPG, PNG, GIF. Max size: 5MB
                  </p>
                  
                  {formData.image && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Selected: {formData.image.name}</p>
                      <img 
                        src={URL.createObjectURL(formData.image)} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200"
                      />
                    </div>
                  )}
                  
                  {editingItem && editingItem.image && !formData.image && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Current image:</p>
                      <img 
                        src={`${api.baseURL}${editingItem.image}`} 
                        alt="Current" 
                        className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                  rows={4}
                  placeholder="Enter item description (optional)"
                />
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {editingItem ? 'Update Item' : 'Add Item'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200"
                >
                  Cancel
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

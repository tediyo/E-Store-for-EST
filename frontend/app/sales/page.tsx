'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Search, ShoppingCart, Calendar, DollarSign, TrendingUp, Users, Store, Truck, X, Edit, Trash2 } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

interface Item {
  _id: string
  name: string
  shoeType: string
  basePrice: number
  quantity: number
  status: string
}

interface Sale {
  _id: string
  item: {
    _id: string
    name: string
    shoeType: string
    basePrice: number
  }
  quantity: number
  sellingPrice: number
  totalAmount: number
  profit: number
  saleType: 'store' | 'out_of_store'
  clientDetails?: {
    phone?: string
    address?: string
    intentionalBehaviour?: string
  }
  soldBy: {
    username: string
  }
  saleDate: string
}

interface SaleFormData {
  itemId: string
  quantity: number
  sellingPrice: number
  saleType: 'store' | 'out_of_store'
  clientDetails: {
    phone: string
    address: string
    intentionalBehaviour: string
  }
}

export default function SalesPage() {
  const { user } = useAuth()
  const [sales, setSales] = useState<Sale[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingSale, setEditingSale] = useState<Sale | null>(null)
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalProfit: 0,
    storeSales: 0,
    outOfStoreSales: 0
  })

  const [formData, setFormData] = useState<SaleFormData>({
    itemId: '',
    quantity: 1,
    sellingPrice: 0,
    saleType: 'store',
    clientDetails: {
      phone: '',
      address: '',
      intentionalBehaviour: ''
    }
  })

  useEffect(() => {
    fetchSales()
    fetchItems()
    fetchStats()
  }, [])

  const fetchSales = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/sales')
      setSales(response.data.sales)
    } catch (error) {
      toast.error('Failed to fetch sales')
    } finally {
      setLoading(false)
    }
  }

  const fetchItems = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/items?limit=1000')
      setItems(response.data.items.filter((item: Item) => item.quantity > 0))
    } catch (error) {
      toast.error('Failed to fetch items')
    }
  }

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/sales/stats/overview')
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof SaleFormData],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleItemSelect = (itemId: string) => {
    const selectedItem = items.find(item => item._id === itemId)
    if (selectedItem) {
      setFormData(prev => ({
        ...prev,
        itemId,
        sellingPrice: selectedItem.basePrice
      }))
    }
  }

  const calculateProfit = () => {
    const selectedItem = items.find(item => item._id === formData.itemId)
    if (selectedItem && formData.quantity && formData.sellingPrice) {
      return (formData.sellingPrice - selectedItem.basePrice) * formData.quantity
    }
    return 0
  }

  const calculateTotal = () => {
    return formData.quantity * formData.sellingPrice
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.itemId || !formData.quantity || !formData.sellingPrice) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      if (editingSale) {
        await axios.put(`http://localhost:5000/api/sales/${editingSale._id}`, {
          sellingPrice: formData.sellingPrice,
          clientDetails: formData.clientDetails
        })
        toast.success('Sale updated successfully!')
      } else {
        await axios.post('http://localhost:5000/api/sales', formData)
        toast.success('Sale recorded successfully!')
      }
      
      resetForm()
      fetchSales()
      fetchStats()
      fetchItems() // Refresh items to get updated quantities
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save sale')
    }
  }

  const handleDelete = async (saleId: string) => {
    if (!confirm('Are you sure you want to delete this sale?')) return
    
    try {
      await axios.delete(`http://localhost:5000/api/sales/${saleId}`)
      toast.success('Sale deleted successfully!')
      fetchSales()
      fetchStats()
      fetchItems()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete sale')
    }
  }

  const resetForm = () => {
    setFormData({
      itemId: '',
      quantity: 1,
      sellingPrice: 0,
      saleType: 'store',
      clientDetails: {
        phone: '',
        address: '',
        intentionalBehaviour: ''
      }
    })
    setEditingSale(null)
    setShowAddForm(false)
  }

  const filteredSales = sales.filter(sale =>
    sale.item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.item.shoeType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.saleType.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getSaleTypeColor = (type: string) => {
    return type === 'store' 
      ? 'text-success-600 bg-success-50 border-success-200' 
      : 'text-warning-600 bg-warning-50 border-warning-200'
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
            Sales Management
          </h1>
          <p className="text-gray-600 mt-2">Track your sales, profits, and client information</p>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <Plus size={20} />
          Record Sale
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Sales</p>
              <p className="text-2xl font-bold text-blue-900">{stats.totalSales}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Revenue</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-600 text-sm font-medium">Profit</p>
              <p className="text-2xl font-bold text-emerald-900">{formatCurrency(stats.totalProfit)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-emerald-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Store Sales</p>
              <p className="text-2xl font-bold text-purple-900">{stats.storeSales}</p>
            </div>
            <Store className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Out of Store</p>
              <p className="text-2xl font-bold text-orange-900">{stats.outOfStoreSales}</p>
            </div>
            <Truck className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search sales by item name, type, or sale type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full rounded-xl border-gray-200 focus:border-primary-500 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Sales Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSales.map((sale) => (
          <div key={sale._id} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg mr-3">
                  <ShoppingCart className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{sale.item.name}</h3>
                  <p className="text-sm text-gray-500">{sale.item.shoeType}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSaleTypeColor(sale.saleType)}`}>
                {sale.saleType === 'store' ? 'Store' : 'Out of Store'}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-semibold bg-gray-100 px-2 py-1 rounded">{sale.quantity}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Selling Price:</span>
                <span className="font-semibold">{formatCurrency(sale.sellingPrice)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-semibold text-primary-600 text-lg">{formatCurrency(sale.totalAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Profit:</span>
                <span className="font-semibold text-success-600 text-lg">{formatCurrency(sale.profit)}</span>
              </div>
            </div>

            {sale.clientDetails && (Object.values(sale.clientDetails).some(val => val)) && (
              <div className="border-t border-gray-200 pt-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Client Details
                </h4>
                <div className="space-y-2 text-sm">
                  {sale.clientDetails.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{sale.clientDetails.phone}</span>
                    </div>
                  )}
                  {sale.clientDetails.address && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Address:</span>
                      <span className="font-medium">{sale.clientDetails.address}</span>
                    </div>
                  )}
                  {sale.clientDetails.intentionalBehaviour && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Behavior:</span>
                      <span className="font-medium">{sale.clientDetails.intentionalBehaviour}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <span>Sold by {sale.soldBy.username}</span>
              <span>{new Date(sale.saleDate).toLocaleDateString()}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingSale(sale)
                  setFormData({
                    itemId: sale.item._id,
                    quantity: sale.quantity,
                    sellingPrice: sale.sellingPrice,
                    saleType: sale.saleType,
                    clientDetails: sale.clientDetails || { phone: '', address: '', intentionalBehaviour: '' }
                  })
                  setShowAddForm(true)
                }}
                className="flex-1 btn btn-outline btn-sm gap-2"
              >
                <Edit size={14} />
                Edit
              </button>
              <button
                onClick={() => handleDelete(sale._id)}
                className="btn btn-outline btn-error btn-sm gap-2"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredSales.length === 0 && (
        <div className="text-center py-16">
          <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <ShoppingCart className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No sales found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by recording your first sale.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary"
            >
              Record Your First Sale
            </button>
          )}
        </div>
      )}

      {/* Add/Edit Sale Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingSale ? 'Edit Sale' : 'Record New Sale'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Item Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Item *
                </label>
                <select
                  value={formData.itemId}
                  onChange={(e) => handleItemSelect(e.target.value)}
                  className="select select-bordered w-full"
                  required
                >
                  <option value="">Choose an item...</option>
                  {items.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name} - {item.shoeType} (Stock: {item.quantity})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity and Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', parseInt(e.target.value))}
                    className="input input-bordered w-full"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selling Price *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.sellingPrice}
                    onChange={(e) => handleInputChange('sellingPrice', parseFloat(e.target.value))}
                    className="input input-bordered w-full"
                    required
                  />
                </div>
              </div>

              {/* Sale Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sale Type *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="saleType"
                      value="store"
                      checked={formData.saleType === 'store'}
                      onChange={(e) => handleInputChange('saleType', e.target.value)}
                      className="radio radio-primary mr-2"
                    />
                    <span>Store Sale</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="saleType"
                      value="out_of_store"
                      checked={formData.saleType === 'out_of_store'}
                      onChange={(e) => handleInputChange('saleType', e.target.value)}
                      className="radio radio-primary mr-2"
                    />
                    <span>Out of Store</span>
                  </label>
                </div>
              </div>

              {/* Client Details */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Client Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.clientDetails.phone}
                      onChange={(e) => handleInputChange('clientDetails.phone', e.target.value)}
                      className="input input-bordered w-full"
                      placeholder="+1234567890"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={formData.clientDetails.address}
                      onChange={(e) => handleInputChange('clientDetails.address', e.target.value)}
                      className="input input-bordered w-full"
                      placeholder="123 Main St, City"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Intentional Behavior
                  </label>
                  <textarea
                    value={formData.clientDetails.intentionalBehaviour}
                    onChange={(e) => handleInputChange('clientDetails.intentionalBehaviour', e.target.value)}
                    className="textarea textarea-bordered w-full"
                    rows={3}
                    placeholder="Notes about client behavior, preferences, etc."
                  />
                </div>
              </div>

              {/* Summary */}
              {formData.itemId && formData.quantity && formData.sellingPrice && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="font-medium text-gray-900 mb-3">Sale Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="float-right font-semibold text-primary-600">
                        {formatCurrency(calculateTotal())}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Profit:</span>
                      <span className="float-right font-semibold text-success-600">
                        {formatCurrency(calculateProfit())}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                >
                  {editingSale ? 'Update Sale' : 'Record Sale'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

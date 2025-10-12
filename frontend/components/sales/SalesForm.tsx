'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { X, ShoppingCart, User, MapPin, Phone, Info, DollarSign, Package, TrendingUp, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Item {
  _id: string
  name: string
  shoeType: string
  basePrice: number
  quantity: number
  status: string
}

interface SalesFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface FormData {
  itemId: string
  quantity: number
  sellingPrice: number
  basePrice: number // Base price for both sale types
  saleType: 'store' | 'out_of_store'
  fromWhom: string // New field for out-of-store sales
  shoeType: string // For out-of-store sales
  clientDetails: {
    phone: string
    address: string
    intentionalBehaviour: string
  }
}

export default function SalesForm({ isOpen, onClose, onSuccess }: SalesFormProps) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [formData, setFormData] = useState<FormData>({
    itemId: '',
    quantity: 1,
    sellingPrice: 0,
    basePrice: 0,
    saleType: 'store',
    fromWhom: '',
    shoeType: '',
    clientDetails: {
      phone: '',
      address: '',
      intentionalBehaviour: ''
    }
  })

  useEffect(() => {
    if (isOpen) {
      fetchItems()
    }
  }, [isOpen])

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:5000/api/items?limit=1000', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setItems(response.data.items.filter((item: Item) => item.quantity > 0))
    } catch (error) {
      toast.error('Failed to fetch items')
    }
  }

  const handleItemChange = (itemId: string) => {
    const item = items.find(i => i._id === itemId)
    setSelectedItem(item || null)
    setFormData(prev => ({
      ...prev,
      itemId,
      basePrice: item ? item.basePrice : 0,
      sellingPrice: item ? item.basePrice : 0
    }))
  }

  const calculateProfit = () => {
    if (formData.saleType === 'store' && selectedItem) {
      return (formData.sellingPrice - selectedItem.basePrice) * formData.quantity
    } else if (formData.saleType === 'out_of_store') {
      // For out-of-store sales, profit is selling price minus base price
      return (formData.sellingPrice - formData.basePrice) * formData.quantity
    }
    return 0
  }

  const calculateTotal = () => {
    return formData.sellingPrice * formData.quantity
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.saleType === 'store') {
      if (!formData.itemId) {
        toast.error('Please select an item from inventory')
        return
      }
      
      if (selectedItem && formData.quantity > selectedItem.quantity) {
        toast.error('Quantity exceeds available stock')
        return
      }
    } else {
      // Out-of-store sale validation
      if (!formData.itemId.trim()) {
        toast.error('Please enter item name')
        return
      }
      
      if (!formData.shoeType.trim()) {
        toast.error('Please enter item type')
        return
      }
      
      if (!formData.fromWhom.trim()) {
        toast.error('Please enter who you got the item from')
        return
      }
      
      if (formData.basePrice <= 0) {
        toast.error('Please enter a valid base price')
        return
      }
    }

    if (formData.quantity <= 0) {
      toast.error('Quantity must be greater than 0')
      return
    }

    if (formData.sellingPrice <= 0) {
      toast.error('Selling price must be greater than 0')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      await axios.post('http://localhost:5000/api/sales', formData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Sale recorded successfully!')
      onSuccess()
      onClose()
      resetForm()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to record sale')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      itemId: '',
      quantity: 1,
      sellingPrice: 0,
      basePrice: 0,
      saleType: 'store',
      fromWhom: '',
      shoeType: '',
      clientDetails: {
        phone: '',
        address: '',
        intentionalBehaviour: ''
      }
    })
    setSelectedItem(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700 animate-scale-in">
        {/* Enhanced Header */}
        <div className="relative flex items-center justify-between p-8 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-t-2xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-pattern-dots opacity-5 rounded-t-3xl"></div>
          
          <div className="relative z-10 flex items-center">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg mr-4">
                <ShoppingCart className="h-7 w-7 text-white" />
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl blur-lg opacity-20"></div>
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 dark:from-white dark:to-blue-200 bg-clip-text text-transparent">
                Record New Sale
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Add a new sale transaction to your system</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="relative z-10 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <X size={24} />
          </button>
        </div>

        {/* Enhanced Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Sale Type Selection - Enhanced */}
          <div className="space-y-4">
            <label className="block text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-3">
                <Package className="h-4 w-4 text-white" />
              </div>
              Sale Type *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ 
                  ...prev, 
                  saleType: 'store',
                  itemId: '',
                  fromWhom: '',
                  shoeType: '',
                  basePrice: 0
                }))}
                className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                  formData.saleType === 'store'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600'
                }`}
              >
                <div className="flex items-center mb-2">
                  <div className={`w-6 h-6 rounded-full border-2 mr-3 ${
                    formData.saleType === 'store' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                    {formData.saleType === 'store' && (
                      <div className="w-2 h-2 bg-white rounded-full m-auto"></div>
                    )}
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">Store Sale</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sell items from your inventory</p>
              </button>
              
              <button
                type="button"
                onClick={() => setFormData(prev => ({ 
                  ...prev, 
                  saleType: 'out_of_store',
                  itemId: '',
                  fromWhom: '',
                  shoeType: '',
                  basePrice: 0
                }))}
                className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                  formData.saleType === 'out_of_store'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg shadow-purple-500/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600'
                }`}
              >
                <div className="flex items-center mb-2">
                  <div className={`w-6 h-6 rounded-full border-2 mr-3 ${
                    formData.saleType === 'out_of_store' ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                  }`}>
                    {formData.saleType === 'out_of_store' && (
                      <div className="w-2 h-2 bg-white rounded-full m-auto"></div>
                    )}
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">Out of Store</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sell items not in inventory</p>
              </button>
            </div>
          </div>

          {/* Conditional Fields Based on Sale Type */}
          {formData.saleType === 'store' ? (
            /* Store Sale - Enhanced Item Selection */
            <div className="space-y-4">
              <label className="block text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-3">
                  <Package className="h-4 w-4 text-white" />
                </div>
                Select Item from Inventory *
              </label>
              <div className="relative">
                <select
                  value={formData.itemId}
                  onChange={(e) => handleItemChange(e.target.value)}
                  className="input w-full text-lg py-4"
                  required
                >
                  <option value="">Choose an item from your inventory...</option>
                  {items.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name} - {item.shoeType} (Stock: {item.quantity})
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <Package className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          ) : (
            /* Out of Store Sale - Enhanced Item Details */
            <div className="space-y-6">
              <label className="block text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-3">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                Item Details *
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={formData.itemId}
                    onChange={(e) => setFormData(prev => ({ ...prev, itemId: e.target.value }))}
                    className="input"
                    placeholder="Enter item name"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Item Type *
                  </label>
                  <input
                    type="text"
                    value={formData.shoeType || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, shoeType: e.target.value }))}
                    className="input"
                    placeholder="e.g., Sneakers, Boots, etc."
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Base Price *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.basePrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
                      className="input pr-12"
                      placeholder="Cost from supplier"
                      required
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    From Whom *
                  </label>
                  <input
                    type="text"
                    value={formData.fromWhom}
                    onChange={(e) => setFormData(prev => ({ ...prev, fromWhom: e.target.value }))}
                    className="input"
                    placeholder="Who did you get this item from?"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Item Details - Only for Store Sales */}
          {formData.saleType === 'store' && selectedItem && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/30">
              <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-4 flex items-center">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
                  <Info className="h-3 w-3 text-white" />
                </div>
                Item Details
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-blue-800/30 rounded-xl">
                  <span className="text-blue-700 dark:text-blue-300 font-medium">Base Price:</span>
                  <span className="font-bold text-blue-900 dark:text-blue-100">${selectedItem.basePrice}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-blue-800/30 rounded-xl">
                  <span className="text-blue-700 dark:text-blue-300 font-medium">Available Stock:</span>
                  <span className={`font-bold ${
                    selectedItem.status === 'low_stock' ? 'text-yellow-600 dark:text-yellow-400' :
                    selectedItem.status === 'out_of_stock' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                  }`}>
                    {selectedItem.quantity}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-blue-800/30 rounded-xl col-span-2">
                  <span className="text-blue-700 dark:text-blue-300 font-medium">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedItem.status === 'low_stock' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    selectedItem.status === 'out_of_stock' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {selectedItem.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Sale Details */}
          <div className="space-y-4">
            <label className="block text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
              Sale Details *
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  max={formData.saleType === 'store' ? (selectedItem?.quantity || 999) : 999}
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  className="input"
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Selling Price *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, sellingPrice: parseFloat(e.target.value) || 0 }))}
                    className="input pr-12"
                    required
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Calculations */}
          {formData.quantity > 0 && formData.sellingPrice > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200/50 dark:border-green-700/30">
              <h4 className="font-semibold text-green-900 dark:text-green-200 mb-4 flex items-center">
                <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                  <TrendingUp className="h-3 w-3 text-white" />
                </div>
                Sale Summary
              </h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="bg-white/50 dark:bg-green-800/30 rounded-xl p-3 text-center">
                  <div className="text-green-700 dark:text-green-300 font-medium mb-1">Total Amount</div>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">${calculateTotal()}</div>
                </div>
                <div className="bg-white/50 dark:bg-green-800/30 rounded-xl p-3 text-center">
                  <div className="text-green-700 dark:text-green-300 font-medium mb-1">Profit</div>
                  <div className={`text-2xl font-bold ${
                    calculateProfit() >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    ${calculateProfit()}
                  </div>
                </div>
                <div className="bg-white/50 dark:bg-green-800/30 rounded-xl p-3 text-center">
                  <div className="text-green-700 dark:text-green-300 font-medium mb-1">Profit Margin</div>
                  <div className={`text-2xl font-bold ${
                    calculateProfit() >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {((calculateProfit() / calculateTotal()) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Client Details */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mr-3">
                <User className="h-4 w-4 text-white" />
              </div>
              Client Details (Optional)
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.clientDetails.phone}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    clientDetails: { ...prev.clientDetails, phone: e.target.value }
                  }))}
                  className="input"
                  placeholder="Client phone number"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  Address
                </label>
                <input
                  type="text"
                  value={formData.clientDetails.address}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    clientDetails: { ...prev.clientDetails, address: e.target.value }
                  }))}
                  className="input"
                  placeholder="Client address"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                <Info className="h-4 w-4 mr-2 text-gray-500" />
                Intentional Behaviour
              </label>
              <textarea
                value={formData.clientDetails.intentionalBehaviour}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  clientDetails: { ...prev.clientDetails, intentionalBehaviour: e.target.value }
                }))}
                className="input"
                rows={3}
                placeholder="Notes about client behavior or preferences..."
              />
            </div>
          </div>

          {/* Enhanced Actions */}
          <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1 group"
              disabled={loading}
            >
              <X size={18} className="mr-2 group-hover:scale-110 transition-transform duration-200" />
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1 group"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Recording Sale...
                </>
              ) : (
                <>
                  <ShoppingCart size={18} className="mr-2 group-hover:scale-110 transition-transform duration-200" />
                  Record Sale
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

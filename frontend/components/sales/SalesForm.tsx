'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { X, ShoppingCart, User, MapPin, Phone, Info } from 'lucide-react'
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <ShoppingCart className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Record New Sale</h2>
              <p className="text-gray-600">Add a new sale transaction</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Sale Type Selection - Move to top */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Sale Type *
            </label>
            <select
              value={formData.saleType}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                saleType: e.target.value as 'store' | 'out_of_store',
                itemId: '', // Reset item selection when changing sale type
                fromWhom: '', // Reset from whom when changing sale type
                shoeType: '', // Reset shoe type when changing sale type
                basePrice: 0 // Reset base price when changing sale type
              }))}
              className="input w-full"
              required
            >
              <option value="store">Store Sale</option>
              <option value="out_of_store">Out of Store Sale</option>
            </select>
          </div>

          {/* Conditional Fields Based on Sale Type */}
          {formData.saleType === 'store' ? (
            /* Store Sale - Item Selection */
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Item from Inventory *
              </label>
              <select
                value={formData.itemId}
                onChange={(e) => handleItemChange(e.target.value)}
                className="input w-full"
                required
              >
                <option value="">Choose an item from your inventory...</option>
                {items.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name} - {item.shoeType} (Stock: {item.quantity})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            /* Out of Store Sale - Item Details + From Whom */
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={formData.itemId}
                    onChange={(e) => setFormData(prev => ({ ...prev, itemId: e.target.value }))}
                    className="input w-full"
                    placeholder="Enter item name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Item Type *
                  </label>
                  <input
                    type="text"
                    value={formData.shoeType || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, shoeType: e.target.value }))}
                    className="input w-full"
                    placeholder="e.g., Sneakers, Boots, etc."
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Base Price *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
                    className="input w-full"
                    placeholder="Cost from supplier"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    From Whom *
                  </label>
                  <input
                    type="text"
                    value={formData.fromWhom}
                    onChange={(e) => setFormData(prev => ({ ...prev, fromWhom: e.target.value }))}
                    className="input w-full"
                    placeholder="Who did you get this item from?"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Item Details - Only for Store Sales */}
          {formData.saleType === 'store' && selectedItem && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-gray-900">Item Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Base Price:</span>
                  <span className="ml-2 font-medium">${selectedItem.basePrice}</span>
                </div>
                <div>
                  <span className="text-gray-600">Available Stock:</span>
                  <span className={`ml-2 font-medium ${
                    selectedItem.status === 'low_stock' ? 'text-warning-600' :
                    selectedItem.status === 'out_of_stock' ? 'text-danger-600' : 'text-success-600'
                  }`}>
                    {selectedItem.quantity}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    selectedItem.status === 'low_stock' ? 'bg-warning-100 text-warning-800' :
                    selectedItem.status === 'out_of_stock' ? 'bg-danger-100 text-danger-800' :
                    'bg-success-100 text-success-800'
                  }`}>
                    {selectedItem.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Sale Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
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

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Selling Price *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.sellingPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, sellingPrice: parseFloat(e.target.value) || 0 }))}
                className="input"
                required
              />
            </div>
          </div>

          {/* Calculations */}
          {formData.quantity > 0 && formData.sellingPrice > 0 && (
            <div className="bg-primary-50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-primary-900">Sale Summary</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-primary-600">Total Amount:</span>
                  <span className="ml-2 font-bold text-primary-900">${calculateTotal()}</span>
                </div>
                <div>
                  <span className="text-primary-600">Profit:</span>
                  <span className={`ml-2 font-bold ${
                    calculateProfit() >= 0 ? 'text-success-600' : 'text-danger-600'
                  }`}>
                    ${calculateProfit()}
                  </span>
                </div>
                <div>
                  <span className="text-primary-600">Profit Margin:</span>
                  <span className={`ml-2 font-bold ${
                    calculateProfit() >= 0 ? 'text-success-600' : 'text-danger-600'
                  }`}>
                    {((calculateProfit() / calculateTotal()) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Client Details */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center">
              <User className="h-5 w-5 mr-2 text-primary-600" />
              Client Details (Optional)
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
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

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
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

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
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

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={loading}
            >
              {loading ? 'Recording Sale...' : 'Record Sale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Package } from 'lucide-react'

interface ItemFormData {
  name: string
  shoeType: string
  basePrice: number
  sellingPrice: number
  quantity: number
  supplier: string
  description: string
}

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

interface InventoryFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ItemFormData) => void
  editingItem?: Item | null
}

export default function InventoryForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingItem 
}: InventoryFormProps) {
  const [formData, setFormData] = useState<ItemFormData>({
    name: '',
    shoeType: '',
    basePrice: 0,
    sellingPrice: 0,
    quantity: 0,
    supplier: '',
    description: ''
  })

  const [errors, setErrors] = useState<Partial<ItemFormData>>({})

  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name,
        shoeType: editingItem.shoeType,
        basePrice: editingItem.basePrice,
        sellingPrice: editingItem.sellingPrice,
        quantity: editingItem.quantity,
        supplier: editingItem.supplier,
        description: editingItem.description || ''
      })
    } else {
      resetForm()
    }
  }, [editingItem])

  const resetForm = () => {
    setFormData({
      name: '',
      shoeType: '',
      basePrice: 0,
      sellingPrice: 0,
      quantity: 0,
      supplier: '',
      description: ''
    })
    setErrors({})
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<ItemFormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required'
    }

    if (!formData.shoeType) {
      newErrors.shoeType = 'Shoe type is required'
    }

    if (formData.basePrice <= 0) {
      newErrors.basePrice = 'Base price must be greater than 0'
    }

    if (formData.sellingPrice <= 0) {
      newErrors.sellingPrice = 'Selling price must be greater than 0'
    }

    if (formData.sellingPrice < formData.basePrice) {
      newErrors.sellingPrice = 'Selling price cannot be less than base price'
    }

    if (formData.quantity < 0) {
      newErrors.quantity = 'Quantity cannot be negative'
    }

    if (!formData.supplier.trim()) {
      newErrors.supplier = 'Supplier is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <Package className="h-6 w-6 text-white" />
            </div>
            {editingItem ? 'Edit Item' : 'Add New Item'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-3xl p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Item Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className={`input w-full ${errors.name ? 'border-danger-500' : ''}`}
                placeholder="Enter item name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-2 font-medium">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Shoe Type *
              </label>
              <select
                value={formData.shoeType}
                onChange={(e) => setFormData({...formData, shoeType: e.target.value})}
                className={`input w-full ${errors.shoeType ? 'border-danger-500' : ''}`}
              >
                <option value="">Select shoe type</option>
                <option value="sneakers">Sneakers</option>
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
                <option value="sports">Sports</option>
                <option value="boots">Boots</option>
                <option value="sandals">Sandals</option>
                <option value="loafers">Loafers</option>
                <option value="heels">Heels</option>
              </select>
              {errors.shoeType && (
                <p className="text-red-500 text-sm mt-2 font-medium">{errors.shoeType}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Base Price *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.basePrice}
                onChange={(e) => setFormData({...formData, basePrice: parseFloat(e.target.value) || 0})}
                className={`input w-full ${errors.basePrice ? 'border-danger-500' : ''}`}
                placeholder="0.00"
              />
              {errors.basePrice && (
                <p className="text-red-500 text-sm mt-2 font-medium">{errors.basePrice}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Selling Price *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({...formData, sellingPrice: parseFloat(e.target.value) || 0})}
                className={`input w-full ${errors.sellingPrice ? 'border-danger-500' : ''}`}
                placeholder="0.00"
              />
              {errors.sellingPrice && (
                <p className="text-red-500 text-sm mt-2 font-medium">{errors.sellingPrice}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Quantity *
              </label>
              <input
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                className={`input w-full ${errors.quantity ? 'border-danger-500' : ''}`}
                placeholder="0"
              />
              {errors.quantity && (
                <p className="text-red-500 text-sm mt-2 font-medium">{errors.quantity}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Supplier *
              </label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                className={`input w-full ${errors.supplier ? 'border-danger-500' : ''}`}
                placeholder="Enter supplier name"
              />
              {errors.supplier && (
                <p className="text-red-500 text-sm mt-2 font-medium">{errors.supplier}</p>
              )}
            </div>
          </div>

          <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
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

          {/* Profit Calculation Display */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Profit Analysis</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Profit per item:</span>
                <span className="ml-2 font-semibold text-success-600">
                  ${(formData.sellingPrice - formData.basePrice).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Total potential profit:</span>
                <span className="ml-2 font-semibold text-success-600">
                  ${((formData.sellingPrice - formData.basePrice) * formData.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              className="btn btn-primary flex-1 py-3 text-lg font-semibold"
            >
              {editingItem ? 'Update Item' : 'Add Item'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-secondary flex-1 py-3 text-lg font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

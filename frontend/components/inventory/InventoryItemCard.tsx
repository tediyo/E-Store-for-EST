'use client'

import { Edit, Trash2, Package, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

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

interface InventoryItemCardProps {
  item: Item
  onEdit: (item: Item) => void
  onDelete: (id: string) => void
  isAdmin: boolean
}

export default function InventoryItemCard({ 
  item, 
  onEdit, 
  onDelete, 
  isAdmin 
}: InventoryItemCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700'
      case 'low_stock': return 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700'
      case 'out_of_stock': return 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700'
      default: return 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock': return <CheckCircle className="h-4 w-4" />
      case 'low_stock': return <AlertTriangle className="h-4 w-4" />
      case 'out_of_stock': return <XCircle className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  const getStatusText = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const calculateProfit = () => {
    return item.sellingPrice - item.basePrice
  }

  const getProfitColor = () => {
    const profit = calculateProfit()
    if (profit > 0) return 'text-green-600 dark:text-green-400'
    if (profit < 0) return 'text-red-600 dark:text-red-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  const getProfitIcon = () => {
    const profit = calculateProfit()
    if (profit > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (profit < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return null
  }

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 dark:border-gray-700 p-6 transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-pattern-dots opacity-5 rounded-2xl"></div>
      
      {/* Status Badge */}
      <div className="absolute top-4 right-4">
        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(item.status)}`}>
          {getStatusIcon(item.status)}
          <span className="ml-1.5">{getStatusText(item.status)}</span>
        </span>
      </div>

      {/* Header Section */}
      <div className="flex items-start mb-6">
        <div className="flex items-center flex-1">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg mr-4">
              <Package className="h-6 w-6 text-white" />
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
              {item.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{item.shoeType}</p>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Base Price</span>
            <span className="font-bold text-gray-900 dark:text-white">${item.basePrice}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Selling Price</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">${item.sellingPrice}</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Quantity</span>
            <span className="font-bold text-green-600 dark:text-green-400">{item.quantity}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Profit</span>
            <div className="flex items-center space-x-1">
              {getProfitIcon()}
              <span className={`font-bold ${getProfitColor()}`}>${calculateProfit()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Supplier Info */}
      <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200/50 dark:border-amber-700/30">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Supplier</span>
          <span className="font-semibold text-amber-800 dark:text-amber-200">{item.supplier}</span>
        </div>
      </div>

      {/* Description */}
      {item.description && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{item.description}</p>
        </div>
      )}

      {/* Footer Section */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          <span>Added by <span className="font-medium text-gray-700 dark:text-gray-300">{item.addedBy.username}</span></span>
        </div>
        <span className="font-medium">{new Date(item.createdAt).toLocaleDateString()}</span>
      </div>

      {/* Action Buttons */}
      {isAdmin && (
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={() => onEdit(item)}
            className="btn btn-secondary flex-1 flex items-center justify-center group"
          >
            <Edit size={16} className="mr-2 group-hover:scale-110 transition-transform duration-200" />
            Edit
          </button>
          <button
            onClick={() => onDelete(item._id)}
            className="btn btn-danger flex-1 flex items-center justify-center group"
          >
            <Trash2 size={16} className="mr-2 group-hover:scale-110 transition-transform duration-200" />
            Delete
          </button>
        </div>
      )}

      {/* Hover Effects */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/0 to-purple-600/0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  )
}

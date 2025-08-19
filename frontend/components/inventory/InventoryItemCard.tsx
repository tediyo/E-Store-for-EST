'use client'

import { Edit, Trash2, Package } from 'lucide-react'

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
      case 'in_stock': return 'text-success-600 bg-success-50'
      case 'low_stock': return 'text-warning-600 bg-warning-50'
      case 'out_of_stock': return 'text-danger-600 bg-danger-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusText = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
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

      {isAdmin && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => onEdit(item)}
            className="btn btn-secondary flex-1 flex items-center justify-center"
          >
            <Edit size={16} className="mr-1" />
            Edit
          </button>
          <button
            onClick={() => onDelete(item._id)}
            className="btn btn-danger flex-1 flex items-center justify-center"
          >
            <Trash2 size={16} className="mr-1" />
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

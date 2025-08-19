'use client'

import { Package, TrendingUp, AlertTriangle, XCircle } from 'lucide-react'

interface InventoryStatsProps {
  totalItems: number
  inStock: number
  lowStock: number
  outOfStock: number
}

export default function InventoryStats({ totalItems, inStock, lowStock, outOfStock }: InventoryStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex items-center">
          <Package className="h-8 w-8 text-primary-600 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Total Items</p>
            <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-success-100 rounded-full flex items-center justify-center mr-3">
            <TrendingUp className="h-4 w-4 text-success-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">In Stock</p>
            <p className="text-2xl font-bold text-gray-900">{inStock}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-warning-100 rounded-full flex items-center justify-center mr-3">
            <AlertTriangle className="h-4 w-4 text-warning-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Low Stock</p>
            <p className="text-2xl font-bold text-gray-900">{lowStock}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-danger-100 rounded-full flex items-center justify-center mr-3">
            <XCircle className="h-4 w-4 text-danger-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Out of Stock</p>
            <p className="text-2xl font-bold text-gray-900">{outOfStock}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

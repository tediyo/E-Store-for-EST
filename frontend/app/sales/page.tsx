'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Search, ShoppingCart, Calendar, DollarSign } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

interface Sale {
  _id: string
  item: {
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

export default function SalesPage() {
  const { user } = useAuth()
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    fetchSales()
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

  const filteredSales = sales.filter(sale =>
    sale.item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.item.shoeType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.saleType.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getSaleTypeColor = (type: string) => {
    return type === 'store' ? 'text-success-600 bg-success-50' : 'text-warning-600 bg-warning-50'
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Management</h1>
          <p className="text-gray-600">Track your sales and client information</p>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Record Sale
        </button>
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
            className="input pl-10"
          />
        </div>
      </div>

      {/* Sales Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSales.map((sale) => (
          <div key={sale._id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <ShoppingCart className="h-8 w-8 text-primary-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{sale.item.name}</h3>
                  <p className="text-sm text-gray-500">{sale.item.shoeType}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSaleTypeColor(sale.saleType)}`}>
                {sale.saleType.replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-semibold">{sale.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Selling Price:</span>
                <span className="font-semibold">{formatCurrency(sale.sellingPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-semibold text-primary-600">{formatCurrency(sale.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Profit:</span>
                <span className="font-semibold text-success-600">{formatCurrency(sale.profit)}</span>
              </div>
            </div>

            {sale.clientDetails && (
              <div className="border-t border-gray-200 pt-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Client Details</h4>
                <div className="space-y-1 text-sm">
                  {sale.clientDetails.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span>{sale.clientDetails.phone}</span>
                    </div>
                  )}
                  {sale.clientDetails.address && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Address:</span>
                      <span>{sale.clientDetails.address}</span>
                    </div>
                  )}
                  {sale.clientDetails.intentionalBehaviour && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Behavior:</span>
                      <span>{sale.clientDetails.intentionalBehaviour}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Sold by {sale.soldBy.username}</span>
              <span>{new Date(sale.saleDate).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredSales.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sales found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by recording your first sale.'}
          </p>
        </div>
      )}

      {/* Add Sale Modal would go here */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Record New Sale</h2>
            <p className="text-gray-600 mb-4">Sale form will be implemented here.</p>
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

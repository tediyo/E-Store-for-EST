'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, ShoppingCart, Calendar, DollarSign, Trash2, Edit, Eye, X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import SalesForm from '../../components/sales/SalesForm'
import SalesStats from '../../components/sales/SalesStats'
import SalesFilters from '../../components/sales/SalesFilters'

interface Sale {
  _id: string
  item: {
    _id: string
    name: string
    shoeType: string
    basePrice: number
  }
  quantity: number
  basePrice: number
  sellingPrice: number
  totalAmount: number
  profit: number
  saleType: 'store' | 'out_of_store'
  fromWhom?: string
  clientDetails?: {
    phone?: string
    address?: string
    intentionalBehaviour?: string
  }
  soldBy: {
    _id: string
    username: string
  }
  saleDate: string
}

export default function SalesPage() {
  const { user } = useAuth()
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [saleType, setSaleType] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalSales, setTotalSales] = useState(0)

  useEffect(() => {
    fetchSales()
  }, [currentPage, searchTerm, saleType, startDate, endDate])

  const fetchSales = async () => {
    try {
      setLoading(true)
      let url = `http://localhost:5000/api/sales?page=${currentPage}&limit=12`
      
      if (searchTerm) url += `&search=${searchTerm}`
      if (saleType) url += `&saleType=${saleType}`
      if (startDate) url += `&startDate=${startDate}`
      if (endDate) url += `&endDate=${endDate}`

      const token = localStorage.getItem('token')
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSales(response.data.sales)
      setTotalPages(response.data.totalPages)
      setTotalSales(response.data.total)
    } catch (error) {
      toast.error('Failed to fetch sales')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSale = async (saleId: string) => {
    if (!confirm('Are you sure you want to delete this sale? This will restore the item quantity.')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`http://localhost:5000/api/sales/${saleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Sale deleted successfully')
      fetchSales()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete sale')
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSaleType('')
    setStartDate('')
    setEndDate('')
    setCurrentPage(1)
  }

  const filteredSales = sales.filter(sale =>
    sale.item && sale.item.name && sale.item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.item && sale.item.shoeType && sale.item.shoeType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.saleType && sale.saleType.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getSaleTypeColor = (type: string) => {
    if (!type) return 'text-gray-600 bg-gray-50 border-gray-200'
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading && sales.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">Sales Management</h1>
          <p className="text-gray-600">Track your sales, revenue, and client information</p>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary flex items-center mt-4 sm:mt-0"
        >
          <Plus size={20} className="mr-2" />
          Record Sale
        </button>
      </div>

      {/* Sales Statistics */}
      <SalesStats />

      {/* Filters */}
      <SalesFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        saleType={saleType}
        onSaleTypeChange={setSaleType}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        onClearFilters={clearFilters}
      />

      {/* Sales Grid */}
      <div className="space-y-6">
        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            Showing {sales.length} of {totalSales} sales
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="btn btn-secondary text-sm px-3 py-1 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="btn btn-secondary text-sm px-3 py-1 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Sales Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSales.map((sale) => (
            <div key={sale._id} className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-4 border-b border-primary-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <ShoppingCart className="h-8 w-8 text-primary-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {sale.item?.name || 'Unknown Item'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {sale.item?.shoeType || 'Unknown Type'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSaleTypeColor(sale.saleType)}`}>
                    {sale.saleType?.replace('_', ' ') || 'Unknown'}
                  </span>
                </div>
              </div>

              {/* Sale Details */}
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-semibold">{sale.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Price:</span>
                    <span className="font-semibold">{formatCurrency(sale.basePrice)}</span>
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
                    <span className={`font-semibold ${
                      sale.profit >= 0 ? 'text-success-600' : 'text-danger-600'
                    }`}>
                      {formatCurrency(sale.profit)}
                    </span>
                  </div>
                </div>

                {/* From Whom - Only for Out of Store Sales */}
                {sale.saleType === 'out_of_store' && sale.fromWhom && (
                  <div className="border-t border-gray-200 pt-3">
                    <h4 className="font-medium text-gray-900 mb-2 text-sm">Source Information</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">From Whom:</span>
                        <span className="font-medium">{sale.fromWhom}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Client Details */}
                {sale.clientDetails && (sale.clientDetails.phone || sale.clientDetails.address) && (
                  <div className="border-t border-gray-200 pt-3">
                    <h4 className="font-medium text-gray-900 mb-2 text-sm">Client Details</h4>
                    <div className="space-y-1 text-xs">
                      {sale.clientDetails.phone && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-medium">{sale.clientDetails.phone}</span>
                        </div>
                      )}
                      {sale.clientDetails.address && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Address:</span>
                          <span className="font-medium truncate ml-2">{sale.clientDetails.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>Sold by {sale.soldBy.username}</span>
                    <span>{formatDate(sale.saleDate)}</span>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedSale(sale)
                        setShowViewModal(true)
                      }}
                      className="btn btn-secondary flex-1 text-xs py-2"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteSale(sale._id)}
                      className="btn btn-danger text-xs py-2 px-3"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredSales.length === 0 && (
          <div className="text-center py-16">
            <ShoppingCart className="h-20 w-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No sales found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || saleType || startDate || endDate 
                ? 'Try adjusting your search terms or filters.' 
                : 'Get started by recording your first sale.'}
            </p>
            {!searchTerm && !saleType && !startDate && !endDate && (
              <button
                onClick={() => setShowAddForm(true)}
                className="btn btn-primary"
              >
                Record Your First Sale
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Sale Modal */}
      {showAddForm && (
        <SalesForm
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          onSuccess={fetchSales}
        />
      )}

      {/* View Sale Modal */}
      {showViewModal && selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Sale Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-6">
                                 {/* Item Information */}
                 <div className="bg-gray-50 rounded-lg p-4">
                   <h3 className="font-semibold text-gray-900 mb-3">Item Information</h3>
                   <div className="grid grid-cols-2 gap-4 text-sm">
                     <div>
                       <span className="text-gray-600">Name:</span>
                       <span className="ml-2 font-medium">{selectedSale.item?.name || 'Unknown'}</span>
                     </div>
                     <div>
                       <span className="text-gray-600">Type:</span>
                       <span className="ml-2 font-medium">{selectedSale.item?.shoeType || 'Unknown'}</span>
                     </div>
                     <div>
                       <span className="text-gray-600">Base Price:</span>
                       <span className="ml-2 font-medium">{formatCurrency(selectedSale.item?.basePrice || 0)}</span>
                     </div>
                     <div>
                       <span className="text-gray-600">Sale Type:</span>
                       <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getSaleTypeColor(selectedSale.saleType)}`}>
                         {selectedSale.saleType?.replace('_', ' ') || 'Unknown'}
                       </span>
                     </div>
                   </div>
                 </div>

                {/* Sale Details */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-3">Sale Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-600">Quantity:</span>
                      <span className="ml-2 font-medium text-blue-900">{selectedSale.quantity}</span>
                    </div>
                    <div>
                      <span className="text-blue-600">Base Price:</span>
                      <span className="ml-2 font-medium text-blue-900">{formatCurrency(selectedSale.basePrice)}</span>
                    </div>
                    <div>
                      <span className="text-blue-600">Selling Price:</span>
                      <span className="ml-2 font-medium text-blue-900">{formatCurrency(selectedSale.sellingPrice)}</span>
                    </div>
                    <div>
                      <span className="text-blue-600">Total Amount:</span>
                      <span className="ml-2 font-medium text-blue-900">{formatCurrency(selectedSale.totalAmount)}</span>
                    </div>
                    <div>
                      <span className="text-blue-600">Profit:</span>
                      <span className={`ml-2 font-medium ${
                        selectedSale.profit >= 0 ? 'text-success-600' : 'text-danger-600'
                      }`}>
                        {formatCurrency(selectedSale.profit)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Source Information - Only for Out of Store Sales */}
                {selectedSale.saleType === 'out_of_store' && selectedSale.fromWhom && (
                  <div className="bg-orange-50 rounded-lg p-4">
                    <h3 className="font-semibold text-orange-900 mb-3">Source Information</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-orange-600">From Whom:</span>
                        <span className="ml-2 font-medium text-orange-900">{selectedSale.fromWhom}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Client Details */}
                {selectedSale.clientDetails && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-3">Client Details</h3>
                    <div className="space-y-2 text-sm">
                      {selectedSale.clientDetails.phone && (
                        <div>
                          <span className="text-green-600">Phone:</span>
                          <span className="ml-2 font-medium text-green-900">{selectedSale.clientDetails.phone}</span>
                        </div>
                      )}
                      {selectedSale.clientDetails.address && (
                        <div>
                          <span className="text-green-600">Address:</span>
                          <span className="ml-2 font-medium text-green-900">{selectedSale.clientDetails.address}</span>
                        </div>
                      )}
                      {selectedSale.clientDetails.intentionalBehaviour && (
                        <div>
                          <span className="text-green-600">Behavior Notes:</span>
                          <span className="ml-2 font-medium text-green-900">{selectedSale.clientDetails.intentionalBehaviour}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sale Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Sale Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Sold By:</span>
                      <span className="ml-2 font-medium">{selectedSale.soldBy.username}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <span className="ml-2 font-medium">{formatDate(selectedSale.saleDate)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="btn btn-secondary w-full"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

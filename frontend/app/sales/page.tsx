'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, ShoppingCart, Calendar, DollarSign, Trash2, Edit, Eye, X, User, Table, Grid3X3, Download } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import SalesForm from '../../components/sales/SalesForm'
import SalesStats from '../../components/sales/SalesStats'
import SalesFilters from '../../components/sales/SalesFilters'
import PageLayout from '../../components/layout/PageLayout'

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
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [sortField, setSortField] = useState<string>('saleDate')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

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

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filteredSales = sales.filter(sale =>
    sale.item && sale.item.name && sale.item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.item && sale.item.shoeType && sale.item.shoeType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.saleType && sale.saleType.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedSales = [...filteredSales].sort((a, b) => {
    let aValue: any
    let bValue: any

    switch (sortField) {
      case 'saleDate':
        aValue = new Date(a.saleDate)
        bValue = new Date(b.saleDate)
        break
      case 'itemName':
        aValue = a.item?.name || ''
        bValue = b.item?.name || ''
        break
      case 'profit':
        aValue = a.profit
        bValue = b.profit
        break
      case 'totalAmount':
        aValue = a.totalAmount
        bValue = b.totalAmount
        break
      case 'quantity':
        aValue = a.quantity
        bValue = b.quantity
        break
      default:
        aValue = a[sortField as keyof Sale]
        bValue = b[sortField as keyof Sale]
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const generateCSV = (sales: Sale[]) => {
    const headers = ['Item Name', 'Item Type', 'Sale Type', 'Quantity', 'Base Price', 'Selling Price', 'Total Amount', 'Profit', 'Date', 'Sold By', 'From Whom']
    const rows = sales.map(sale => [
      sale.item?.name || 'Unknown',
      sale.item?.shoeType || 'Unknown',
      sale.saleType?.replace('_', ' ') || 'Unknown',
      sale.quantity,
      sale.basePrice,
      sale.sellingPrice,
      sale.totalAmount,
      sale.profit,
      formatDate(sale.saleDate),
      sale.soldBy?.username || 'Unknown',
      sale.fromWhom || ''
    ])
    
    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
  }

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

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
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-primary-600 mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Sales...</h3>
          <p className="text-gray-600">Please wait while we fetch your sales data</p>
        </div>
      </div>
    )
  }

  return (
    <PageLayout>
      <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">Sales Management</h1>
            <p className="text-primary-100 text-lg">Track your sales, revenue, and client information</p>
            <div className="flex items-center space-x-4 pt-2">
              <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
                <span className="text-sm text-primary-100">Total Sales</span>
                <div className="text-2xl font-bold">{totalSales}</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
                <span className="text-sm text-primary-100">This Month</span>
                <div className="text-2xl font-bold">{sales.filter(s => new Date(s.saleDate).getMonth() === new Date().getMonth()).length}</div>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="btn bg-white text-primary-600 hover:bg-primary-50 border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center mt-6 sm:mt-0 px-6 py-3 text-lg font-semibold rounded-xl"
          >
            <Plus size={24} className="mr-3" />
            Record New Sale
          </button>
        </div>
      </div>

      {/* Sales Statistics */}
      <SalesStats />

      {/* Filters and View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
        
        {/* View Mode Toggle */}
        <div className="flex items-center bg-white rounded-xl shadow-lg border border-gray-100 p-2">
          <button
            onClick={() => setViewMode('cards')}
            className={`p-3 rounded-lg transition-all duration-200 ${
              viewMode === 'cards'
                ? 'bg-primary-100 text-primary-600 shadow-md'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            title="Card View"
          >
            <Grid3X3 className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-3 rounded-lg transition-all duration-200 ${
              viewMode === 'table'
                ? 'bg-primary-100 text-primary-600 shadow-md'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            title="Table View"
          >
            <Table className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">View Options</h3>
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'cards'
                  ? 'bg-white text-primary-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Card View"
            >
              <Grid3X3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'table'
                  ? 'bg-white text-primary-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Table View"
            >
              <Table className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Sales Grid */}
      <div className="space-y-6">
        {/* Results Summary */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-primary-100 rounded-full p-3">
                <ShoppingCart className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Sales Overview</h3>
                <p className="text-gray-600">
                  Showing {sales.length} of {totalSales} sales
                </p>
              </div>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="btn btn-secondary text-sm px-4 py-2 disabled:opacity-50 rounded-lg hover:shadow-md transition-all duration-200"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600 px-4 py-2 bg-white rounded-lg shadow-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="btn btn-secondary text-sm px-4 py-2 disabled:opacity-50 rounded-lg hover:shadow-md transition-all duration-200"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sales Cards */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedSales.map((sale, index) => (
              <div 
                key={sale._id} 
                className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden transform hover:scale-105 cursor-pointer group animate-fade-in-up"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'both'
                }}
                onClick={() => {
                  setSelectedSale(sale)
                  setShowViewModal(true)
                }}
              >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 border-b border-primary-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className="bg-white bg-opacity-20 rounded-full p-3 mr-4">
                        <ShoppingCart className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {sale.item?.name || 'Unknown Item'}
                        </h3>
                        <p className="text-primary-100 text-sm">
                          {sale.item?.shoeType || 'Unknown Type'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-xs font-bold border-2 border-white text-white bg-white bg-opacity-20 backdrop-blur-sm ${getSaleTypeColor(sale.saleType)}`}>
                      {sale.saleType?.replace('_', ' ') || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sale Details */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="text-gray-500 text-xs uppercase tracking-wide">Quantity</span>
                    <div className="text-lg font-bold text-gray-900 mt-1">{sale.quantity}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="text-gray-500 text-xs uppercase tracking-wide">Base Price</span>
                    <div className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(sale.basePrice)}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="text-gray-500 text-xs uppercase tracking-wide">Selling Price</span>
                    <div className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(sale.sellingPrice)}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="text-gray-500 text-xs uppercase tracking-wide">Total Amount</span>
                    <div className="text-xl font-bold text-primary-600 mt-1">{formatCurrency(sale.totalAmount)}</div>
                  </div>
                </div>
                
                {/* Profit Highlight */}
                <div className="bg-gradient-to-r from-success-50 to-success-100 rounded-xl p-4 border border-success-200">
                  <div className="flex items-center justify-between">
                    <span className="text-success-700 font-semibold">Profit</span>
                    <span className={`text-2xl font-bold ${
                      sale.profit >= 0 ? 'text-success-600' : 'text-danger-600'
                    }`}>
                      {formatCurrency(sale.profit)}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-success-600">
                    {((sale.profit / sale.totalAmount) * 100).toFixed(1)}% margin
                  </div>
                </div>

                {/* From Whom - Only for Out of Store Sales */}
                {sale.saleType === 'out_of_store' && sale.fromWhom && (
                  <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                    <h4 className="font-semibold text-orange-800 mb-3 text-sm flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Source Information
                    </h4>
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-orange-700 text-sm font-medium">From Whom:</span>
                        <span className="font-bold text-orange-900">{sale.fromWhom}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Client Details */}
                {sale.clientDetails && (sale.clientDetails.phone || sale.clientDetails.address) && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-3 text-sm flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Client Details
                    </h4>
                    <div className="space-y-2">
                      {sale.clientDetails.phone && (
                        <div className="bg-white rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <span className="text-blue-700 text-sm font-medium">Phone:</span>
                            <span className="font-bold text-blue-900">{sale.clientDetails.phone}</span>
                          </div>
                        </div>
                      )}
                      {sale.clientDetails.address && (
                        <div className="bg-white rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <span className="text-blue-700 text-sm font-medium">Address:</span>
                            <span className="font-bold text-blue-900 truncate ml-2">{sale.clientDetails.address}</span>
                          </div>
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
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Table Header with Export */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Sales Table</h3>
                <button
                  onClick={() => {
                    const csvContent = generateCSV(sortedSales)
                    downloadCSV(csvContent, 'sales-export.csv')
                  }}
                  className="btn btn-secondary px-4 py-2 text-sm rounded-lg hover:shadow-md transition-all duration-200"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
                  <tr>
                    <th 
                      className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-primary-500 transition-colors"
                      onClick={() => handleSort('itemName')}
                    >
                      <div className="flex items-center">
                        Item
                        {sortField === 'itemName' && (
                          <span className="ml-2 text-primary-200">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Sale Type</th>
                    <th 
                      className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-primary-500 transition-colors"
                      onClick={() => handleSort('quantity')}
                    >
                      <div className="flex items-center">
                        Quantity
                        {sortField === 'quantity' && (
                          <span className="ml-2 text-primary-200">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Base Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Selling Price</th>
                    <th 
                      className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-primary-500 transition-colors"
                      onClick={() => handleSort('totalAmount')}
                    >
                      <div className="flex items-center">
                        Total
                        {sortField === 'totalAmount' && (
                          <span className="ml-2 text-primary-200">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-primary-500 transition-colors"
                      onClick={() => handleSort('profit')}
                    >
                      <div className="flex items-center">
                        Profit
                        {sortField === 'profit' && (
                          <span className="ml-2 text-primary-200">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-primary-500 transition-colors"
                      onClick={() => handleSort('saleDate')}
                    >
                      <div className="flex items-center">
                        Date
                        {sortField === 'saleDate' && (
                          <span className="ml-2 text-primary-200">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedSales.map((sale) => (
                    <tr key={sale._id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-primary-100 rounded-full p-2 mr-3">
                            <ShoppingCart className="h-4 w-4 text-primary-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {sale.item?.name || 'Unknown Item'}
                            </div>
                            {sale.saleType === 'out_of_store' && sale.fromWhom && (
                              <div className="text-xs text-gray-500">From: {sale.fromWhom}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {sale.item?.shoeType || 'Unknown Type'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSaleTypeColor(sale.saleType)}`}>
                          {sale.saleType?.replace('_', ' ') || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {sale.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(sale.basePrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(sale.sellingPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-primary-600">
                        {formatCurrency(sale.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-semibold ${
                          sale.profit >= 0 ? 'text-success-600' : 'text-danger-600'
                        }`}>
                          {formatCurrency(sale.profit)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(sale.saleDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedSale(sale)
                              setShowViewModal(true)
                            }}
                            className="btn btn-secondary text-xs py-1 px-2 hover:bg-blue-600 hover:text-white transition-colors"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteSale(sale._id)}
                            className="btn btn-danger text-xs py-1 px-2 hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* Summary Row */}
                <tfoot className="bg-gray-50">
                  <tr className="font-semibold text-gray-900">
                    <td className="px-6 py-4 text-sm">Total</td>
                    <td className="px-6 py-4 text-sm"></td>
                    <td className="px-6 py-4 text-sm"></td>
                    <td className="px-6 py-4 text-sm">
                      {sortedSales.reduce((sum, sale) => sum + sale.quantity, 0)}
                    </td>
                    <td className="px-6 py-4 text-sm"></td>
                    <td className="px-6 py-4 text-sm"></td>
                    <td className="px-6 py-4 text-sm text-primary-600">
                      {formatCurrency(sortedSales.reduce((sum, sale) => sum + sale.totalAmount, 0))}
                    </td>
                    <td className="px-6 py-4 text-sm text-success-600">
                      {formatCurrency(sortedSales.reduce((sum, sale) => sum + sale.profit, 0))}
                    </td>
                    <td className="px-6 py-4 text-sm"></td>
                    <td className="px-6 py-4 text-sm"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredSales.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="bg-gray-100 rounded-full p-8 w-32 h-32 mx-auto mb-8 flex items-center justify-center animate-pulse">
              <ShoppingCart className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No sales found</h3>
            <p className="text-gray-500 mb-8 text-lg">
              {searchTerm || saleType || startDate || endDate 
                ? 'Try adjusting your search terms or filters.' 
                : 'Get started by recording your first sale.'}
            </p>
            {!searchTerm && !saleType && !startDate && !endDate && (
              <button
                onClick={() => setShowAddForm(true)}
                className="btn btn-primary px-8 py-4 text-lg rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto transform animate-fade-in-up">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary-100 rounded-full p-3">
                    <ShoppingCart className="h-8 w-8 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Sale Details</h2>
                    <p className="text-gray-600">Complete transaction information</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
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
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                  <h3 className="font-bold text-blue-900 mb-4 text-lg flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Sale Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white rounded-xl p-4">
                      <span className="text-blue-600 text-xs uppercase tracking-wide">Quantity</span>
                      <div className="text-lg font-bold text-blue-900 mt-1">{selectedSale.quantity}</div>
                    </div>
                    <div className="bg-white rounded-xl p-4">
                      <span className="text-blue-600 text-xs uppercase tracking-wide">Base Price</span>
                      <div className="text-lg font-bold text-blue-900 mt-1">{formatCurrency(selectedSale.basePrice)}</div>
                    </div>
                    <div className="bg-white rounded-xl p-4">
                      <span className="text-blue-600 text-xs uppercase tracking-wide">Selling Price</span>
                      <div className="text-lg font-bold text-blue-900 mt-1">{formatCurrency(selectedSale.sellingPrice)}</div>
                    </div>
                    <div className="bg-white rounded-xl p-4">
                      <span className="text-blue-600 text-xs uppercase tracking-wide">Total Amount</span>
                      <div className="text-xl font-bold text-blue-900 mt-1">{formatCurrency(selectedSale.totalAmount)}</div>
                    </div>
                  </div>
                  
                  {/* Profit Highlight */}
                  <div className="mt-4 bg-gradient-to-r from-success-50 to-success-100 rounded-xl p-4 border border-success-200">
                    <div className="flex items-center justify-between">
                      <span className="text-success-700 font-semibold">Profit</span>
                      <span className={`text-2xl font-bold ${
                        selectedSale.profit >= 0 ? 'text-success-600' : 'text-danger-600'
                      }`}>
                        {formatCurrency(selectedSale.profit)}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-success-600">
                      {((selectedSale.profit / selectedSale.totalAmount) * 100).toFixed(1)}% margin
                    </div>
                  </div>
                </div>

                {/* Source Information - Only for Out of Store Sales */}
                {selectedSale.saleType === 'out_of_store' && selectedSale.fromWhom && (
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
                    <h3 className="font-bold text-orange-900 mb-4 text-lg flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Source Information
                    </h3>
                    <div className="bg-white rounded-xl p-4">
                      <span className="text-orange-600 text-xs uppercase tracking-wide">From Whom</span>
                      <div className="text-lg font-bold text-orange-900 mt-1">{selectedSale.fromWhom}</div>
                    </div>
                  </div>
                )}

                {/* Client Details */}
                {selectedSale.clientDetails && (
                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                    <h3 className="font-bold text-green-900 mb-4 text-lg flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Client Details
                    </h3>
                    <div className="space-y-3">
                      {selectedSale.clientDetails.phone && (
                        <div className="bg-white rounded-xl p-4">
                          <span className="text-green-600 text-xs uppercase tracking-wide">Phone</span>
                          <div className="text-lg font-bold text-green-900 mt-1">{selectedSale.clientDetails.phone}</div>
                        </div>
                      )}
                      {selectedSale.clientDetails.address && (
                        <div className="bg-white rounded-xl p-4">
                          <span className="text-green-600 text-xs uppercase tracking-wide">Address</span>
                          <div className="text-lg font-bold text-green-900 mt-1">{selectedSale.clientDetails.address}</div>
                        </div>
                      )}
                      {selectedSale.clientDetails.intentionalBehaviour && (
                        <div className="bg-white rounded-xl p-4">
                          <span className="text-green-600 text-xs uppercase tracking-wide">Behavior Notes</span>
                          <div className="text-lg font-bold text-green-900 mt-1">{selectedSale.clientDetails.intentionalBehaviour}</div>
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
    </PageLayout>
  )
}

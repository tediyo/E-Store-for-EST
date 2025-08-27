'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '../../hooks/useAuth'
import {
  Home,
  Package,
  ShoppingCart,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Users,
  Shield
} from 'lucide-react'

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const pathname = usePathname()

  const navigation = [
    // Main Dashboard
    { name: 'Dashboard', href: '/', icon: Home, description: 'Overview & analytics', category: 'main' },
    
    // Core Business Operations
    { name: 'Inventory', href: '/inventory', icon: Package, description: 'Manage stock items', category: 'operations' },
    { name: 'Sales', href: '/sales', icon: ShoppingCart, description: 'Track transactions', category: 'operations' },
    { name: 'Tasks', href: '/tasks', icon: ClipboardList, description: 'Manage activities', category: 'operations' },
    
    // Insights & Reports
    { name: 'Analytics', href: '/analytics', icon: BarChart3, description: 'Detailed reports', category: 'insights' },
    
    // System & Configuration
    { name: 'Settings', href: '/settings', icon: Settings, description: 'System configuration', category: 'system' },
  ]

  const handleLogout = () => {
    logout()
  }

  return (
    <>
      {/* Enhanced Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative p-3 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
          
          {isOpen ? (
            <X size={24} className="relative text-white" />
          ) : (
            <Menu size={24} className="relative text-white" />
          )}
          
          {/* Pulse effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 opacity-75 animate-ping"></div>
        </button>
      </div>

      {/* Enhanced Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-72 shadow-2xl transform transition-transform duration-500 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `} style={{backgroundColor: '#000000'}}>
        <div className="flex flex-col h-full relative">
          {/* Logo Section at Top */}
          <div className="flex-shrink-0 px-6 pt-8 pb-6">
            <div className="relative flex flex-col items-center justify-center h-36 overflow-hidden rounded-2xl border border-gray-700/50" style={{backgroundColor: '#000000'}}>
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-pattern-dots opacity-5"></div>
              
              {/* Main Logo Container */}
              <div className="relative z-10 text-center">
                {/* Primary Logo */}
                <div className="relative mb-2">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/25 mx-auto border-2 border-yellow-400">
                    {/* Logo Image */}
                    <img 
                      src="/esho.jpg"
                      alt="E Store Logo" 
                      className="w-16 h-16 object-contain rounded-xl"
                      style={{ 
                        border: '1px solid #ffffff',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                      }}
                      onError={(e) => {
                        console.error('Logo failed to load:', e);
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    
                    {/* Fallback Text Logo */}
                    <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg hidden">
                      <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        ES
                      </span>
                    </div>
                  </div>
                  
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 rounded-2xl blur-lg opacity-20 animate-pulse"></div>
                </div>
                
                {/* Company Name */}
                <h1 className="text-lg font-bold text-white mb-1">
                  E Store
                </h1>
                <p className="text-xs text-gray-300 font-medium">
                  Business Management System
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Section */}
          <nav className="px-6 py-2 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative flex items-center px-4 py-3 rounded-xl transition-all duration-300 ease-out ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30 shadow-lg shadow-blue-500/20 backdrop-blur-sm'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white hover:shadow-md hover:shadow-gray-500/10'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-400 to-purple-400 rounded-r-full"></div>
                  )}
                  
                  {/* Icon */}
                  <div className={`p-2 rounded-lg mr-3 transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg' 
                      : 'bg-gray-700/50 group-hover:bg-gray-600/50'
                  }`}>
                    <Icon size={18} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'} />
                  </div>
                  
                  {/* Text Content */}
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{item.name}</div>
                    <div className={`text-xs transition-all duration-300 ${
                      isActive ? 'text-blue-200' : 'text-gray-500 group-hover:text-gray-300'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                  
                  {/* Hover Effect */}
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/0 to-purple-600/0 transition-all duration-300 ${
                    isActive ? 'from-blue-600/10 to-purple-600/10' : 'group-hover:from-blue-600/5 group-hover:to-purple-600/5'
                  }`}></div>
                </Link>
              )
            })}

            {/* Logout Button Below Navigation */}
            <div className="pt-4">
              <button
                onClick={handleLogout}
                className="group w-full flex items-center justify-center px-4 py-3 text-sm text-gray-300 rounded-2xl hover:bg-gradient-to-r hover:from-red-600/20 hover:to-pink-600/20 hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 border border-gray-600/30 hover:border-red-500/30"
              >
                <LogOut size={18} className="mr-3 group-hover:scale-110 transition-transform duration-300" />
                Sign out
              </button>
            </div>
          </nav>



          {/* Enhanced User Section */}
          
        </div>
        
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-indigo-600/5 pointer-events-none"></div>
        <div className="absolute top-1/4 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-full blur-2xl"></div>
      </div>

      {/* Enhanced Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

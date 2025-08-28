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
        bg-blue-900
      `}>
        <div className="flex flex-col h-full relative overflow-hidden">
          {/* Logo Section - Fixed at Top */}
          <div className="flex-shrink-0 px-6 pt-8 pb-6">
            <div className="flex flex-col items-center justify-center">
              {/* Logo Image */}
              <img 
                src="/esho.jpg"
                alt="E Store Logo" 
                className="w-32 h-32 object-contain rounded-2xl shadow-xl border-2 border-white bg-white/10"
                onError={(e) => {
                  console.error('Logo failed to load:', e);
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              
              {/* Company Name */}
              <h1 className="text-xl font-bold text-white mt-4 mb-2">
                E Store
              </h1>
              <p className="text-sm text-blue-100 font-medium">
                Business Management System
              </p>
            </div>
          </div>

          {/* Navigation Section - Takes remaining space */}
          <nav className="flex-1 px-6 py-2 space-y-1 overflow-y-auto">
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
                      : 'text-blue-100 hover:bg-white/20 hover:text-white hover:shadow-md hover:shadow-white/20'
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
                      : 'bg-blue-800/50 group-hover:bg-blue-700/50'
                  }`}>
                    <Icon size={18} className={isActive ? 'text-white' : 'text-blue-200 group-hover:text-white'} />
                  </div>
                  
                  {/* Text Content */}
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{item.name}</div>
                    <div className={`text-xs transition-all duration-300 ${
                      isActive ? 'text-blue-200' : 'text-blue-300 group-hover:text-blue-200'
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
          </nav>

          {/* Logout Button - Fixed at Bottom */}
          <div className="flex-shrink-0 px-6 pb-6 border-t border-blue-800/50 pt-4">
            <button
              onClick={handleLogout}
              className="group w-full flex items-center justify-center px-4 py-3 text-sm text-white rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 border border-red-500/30 hover:border-red-400/50"
            >
              <LogOut size={18} className="mr-3 group-hover:scale-110 transition-transform duration-300" />
              Sign out
            </button>
          </div>
        </div>
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

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '../../hooks/useAuth'
import ThemeToggle from './ThemeToggle'
import {
  Home,
  Package,
  ShoppingCart,
  ClipboardList,
  BarChart3,
  Settings,
  Palette,
  LogOut,
  Menu,
  X
} from 'lucide-react'

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Sales', href: '/sales', icon: ShoppingCart },
    { name: 'Tasks', href: '/tasks', icon: ClipboardList },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Theme Demo', href: '/theme-demo', icon: Palette },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const handleLogout = () => {
    logout()
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
          {isOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-900 shadow-2xl transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header with Logo */}
          <div className="flex flex-col items-center justify-center h-24 px-4 border-b border-blue-700/50">
            {/* Logo */}
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  IMS
                </span>
              </div>
            </div>
            {/* App Name */}
            <h1 className="text-lg font-bold text-white">Inventory Management</h1>
            <p className="text-xs text-blue-200">System</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-white/20 text-white border-r-2 border-blue-300 shadow-lg backdrop-blur-sm'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white hover:shadow-md'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon size={20} className="mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Theme Toggle */}
          <div className="px-4 py-3 border-t border-blue-700/50">
            <ThemeToggle />
          </div>

          {/* User section */}
          <div className="px-4 py-4 border-t border-blue-700/50">
            <div className="flex items-center mb-4 p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user?.username}</p>
                <p className="text-xs text-blue-200 capitalize">{user?.role}</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm text-blue-100 rounded-xl hover:bg-white/10 hover:text-white transition-all duration-200 hover:shadow-md"
            >
              <LogOut size={18} className="mr-3" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

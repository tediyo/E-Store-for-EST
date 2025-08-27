'use client'

import { useTheme } from '../../hooks/useTheme'
import ThemeToggle from './ThemeToggle'
import { BarChart3, Bell, Search, User } from 'lucide-react'

export default function Header() {
  const { resolvedTheme } = useTheme()

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-gray-500/5">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section - Logo & Title */}
        <div className="flex items-center space-x-6">
          {/* Enhanced Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              {/* Animated glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-2xl blur-xl opacity-20 animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                E Store Dashboard
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Inventory Management System
              </p>
            </div>
          </div>
          
          {/* Enhanced Status Indicator */}
          <div className="hidden lg:flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-700/30">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700 dark:text-green-300">System Online</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span className="capitalize">{resolvedTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
          </div>
        </div>
        
        {/* Center Section - Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search inventory, sales, tasks..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>
        </div>
        
        {/* Right Section - Actions & Theme Toggle */}
        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <button className="relative p-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            <Bell className="h-5 w-5" />
            {/* Notification Badge */}
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
          </button>
          
          {/* User Profile */}
          <button className="flex items-center space-x-2 p-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
          </button>
          
          {/* Enhanced Theme Toggle */}
          <div className="relative">
            <ThemeToggle />
          </div>
        </div>
      </div>
      
      {/* Enhanced Bottom Border */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
    </header>
  )
}

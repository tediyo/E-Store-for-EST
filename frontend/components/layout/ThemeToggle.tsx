'use client'

import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../../hooks/useTheme'
import { Sun, Moon, Monitor, ChevronDown, Sparkles } from 'lucide-react'

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const themes = [
    { value: 'light' as const, label: 'Light Mode', icon: Sun, description: 'Bright and clean interface', color: 'from-yellow-400 to-orange-500' },
    { value: 'dark' as const, label: 'Dark Mode', icon: Moon, description: 'Easy on the eyes', color: 'from-gray-700 to-gray-900' },
    { value: 'auto' as const, label: 'Auto', icon: Monitor, description: 'Follows system preference', color: 'from-blue-500 to-purple-600' },
  ]

  const currentTheme = themes.find(t => t.value === theme)
  const CurrentIcon = currentTheme?.icon || Monitor

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 text-white dark:text-gray-900 transition-all duration-300 backdrop-blur-md border border-white/30 hover:border-white/50 dark:border-gray-200/30 dark:hover:border-gray-200/50 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/30 dark:focus:ring-gray-700/30 focus:ring-offset-2 focus:ring-offset-transparent"
        aria-label="Toggle theme"
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Icon with glow effect */}
        <div className="relative z-10">
          <div className={`w-6 h-6 bg-gradient-to-r ${currentTheme?.color} rounded-lg flex items-center justify-center shadow-lg`}>
            <CurrentIcon size={16} className="text-white" />
          </div>
          {/* Pulse effect for auto theme */}
          {theme === 'auto' && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg opacity-75 animate-ping"></div>
          )}
        </div>
        
        {/* Text content */}
        <div className="relative z-10 text-left">
          <span className="hidden sm:block text-sm font-semibold">
            {currentTheme?.label}
          </span>
          <span className="hidden lg:block text-xs text-white/70 dark:text-gray-600">
            {currentTheme?.description}
          </span>
        </div>
        
        {/* Chevron with animation */}
        <ChevronDown 
          size={16} 
          className={`relative z-10 transition-all duration-300 ${isOpen ? 'rotate-180 scale-110' : 'scale-100'}`}
        />
        
        {/* Hover glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      </button>

      {/* Enhanced Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 py-2 z-50 animate-fade-in-down">
          {/* Dropdown header */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Choose Theme</span>
            </div>
          </div>
          
          {/* Theme options */}
          {themes.map((themeOption) => {
            const Icon = themeOption.icon
            const isActive = theme === themeOption.value
            
            return (
              <button
                key={themeOption.value}
                onClick={() => {
                  setTheme(themeOption.value)
                  setIsOpen(false)
                }}
                className={`group w-full flex items-center gap-4 px-4 py-3 text-left transition-all duration-200 hover:scale-[1.02] ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                {/* Icon with enhanced styling */}
                <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 scale-110' 
                    : `bg-gradient-to-r ${themeOption.color} group-hover:scale-105`
                }`}>
                  <Icon size={18} className="text-white" />
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                  )}
                </div>
                
                {/* Text content */}
                <div className="flex-1">
                  <div className={`font-semibold text-sm ${isActive ? 'text-blue-800 dark:text-blue-200' : ''}`}>
                    {themeOption.label}
                  </div>
                  <div className={`text-xs ${isActive ? 'text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}>
                    {themeOption.description}
                  </div>
                </div>
                
                {/* Active checkmark */}
                {isActive && (
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </button>
            )
          })}
          
          {/* Dropdown footer */}
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 mt-2">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Current: <span className="font-medium text-gray-700 dark:text-gray-300">{resolvedTheme}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

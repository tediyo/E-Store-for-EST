'use client'

import { useTheme } from '../../hooks/useTheme'
import { Sun, Moon, Monitor } from 'lucide-react'

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const themes = [
    { value: 'light' as const, icon: Sun, color: 'from-yellow-400 to-orange-500', label: 'Light Mode' },
    { value: 'dark' as const, icon: Moon, color: 'from-gray-700 to-gray-900', label: 'Dark Mode' },
    { value: 'auto' as const, icon: Monitor, color: 'from-blue-500 to-purple-600', label: 'Auto Mode' },
  ]

  const currentTheme = themes.find(t => t.value === theme)
  const CurrentIcon = currentTheme?.icon || Monitor

  const handleThemeClick = () => {
    // Cycle through themes: light -> dark -> auto -> light
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('auto')
    } else {
      setTheme('light')
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleThemeClick}
        className="relative w-10 h-10 rounded-xl bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 transition-all duration-300 backdrop-blur-md border border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-transparent"
        aria-label="Toggle theme"
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Icon with glow effect */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <div className={`w-6 h-6 bg-gradient-to-r ${currentTheme?.color} rounded-lg flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 relative`}>
            <CurrentIcon size={16} className="text-white" />
            {/* Active theme indicator */}
            <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full border-2 border-white ${
              theme === 'light' ? 'bg-yellow-400' : 
              theme === 'dark' ? 'bg-gray-600' : 
              'bg-blue-500'
            }`}></div>
          </div>
          {/* Pulse effect for auto theme */}
          {theme === 'auto' && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg opacity-75 animate-ping"></div>
          )}
        </div>
        
        {/* Hover glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      </button>
    </div>
  )
}

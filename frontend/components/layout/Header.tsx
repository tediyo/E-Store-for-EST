'use client'

import { useTheme } from '../../hooks/useTheme'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  const { resolvedTheme } = useTheme()

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-gray-500/5">
      <div className="flex items-center justify-end px-6 py-4">
        {/* Theme Toggle Only */}
        <div className="relative">
          <ThemeToggle />
        </div>
      </div>
      
      {/* Enhanced Bottom Border */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
    </header>
  )
}

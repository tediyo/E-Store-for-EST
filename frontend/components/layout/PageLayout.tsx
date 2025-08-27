'use client'

import { ReactNode } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import ThemeToggle from './ThemeToggle'

interface PageLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
  actions?: ReactNode
  showHeader?: boolean
  showSidebar?: boolean
}

export default function PageLayout({ 
  children, 
  title, 
  subtitle, 
  actions,
  showHeader = false,
  showSidebar = true
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-pattern-dots opacity-5 pointer-events-none"></div>
      
      {/* Decorative Elements */}
      <div className="fixed bottom-0 right-1/4 w-80 h-80 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
      
      {showHeader && <Header />}
      {showSidebar && <Sidebar />}
      
      {/* Theme Selector - Top Right Corner */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-lg shadow-gray-500/10 p-0 w-fit">
          <ThemeToggle />
        </div>
      </div>
      
      <main className={`transition-all duration-300 ${showSidebar ? 'lg:ml-72' : ''} ${showHeader ? 'pt-20' : 'pt-0'}`}>
        <div className="min-h-screen">
          {/* Main Content */}
          <div className="px-8 py-8">
            <div className="animate-fade-in-up">
              {children}
            </div>
          </div>
        </div>
      </main>
      

    </div>
  )
}

// Enhanced Section Components
export function PageSection({ 
  children, 
  className = '', 
  title,
  subtitle,
  actions,
  variant = 'default'
}: {
  children: ReactNode
  className?: string
  title?: string
  subtitle?: string
  actions?: ReactNode
  variant?: 'default' | 'glass' | 'gradient'
}) {
  const variantClasses = {
    default: "bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700",
    glass: "bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20",
    gradient: "bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50"
  }
  
  return (
    <section className={`${variantClasses[variant]} p-8 mb-8 transition-all duration-300 hover:shadow-2xl ${className}`}>
      {/* Section Header */}
      {(title || subtitle || actions) && (
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex-1">
            {title && (
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                {subtitle}
              </p>
            )}
          </div>
          
          {actions && (
            <div className="flex flex-wrap gap-3">
              {actions}
            </div>
          )}
        </div>
      )}
      
      {/* Section Content */}
      <div className="animate-fade-in-up">
        {children}
      </div>
    </section>
  )
}

export function ContentGrid({ 
  children, 
  className = '', 
  cols = 1,
  gap = 'default'
}: {
  children: ReactNode
  className?: string
  cols?: 1 | 2 | 3 | 4
  gap?: 'small' | 'default' | 'large'
}) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 lg:grid-cols-2',
    3: 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3',
    4: 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
  }
  
  const gapClasses = {
    small: 'gap-4',
    default: 'gap-6',
    large: 'gap-8'
  }
  
  return (
    <div className={`grid ${gridCols[cols]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  )
}

export function LoadingState({ 
  message = 'Loading...',
  className = ''
}: {
  message?: string
  className?: string
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-20 ${className}`}>
      <div className="relative">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/25">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
      </div>
      
      <div className="mt-6 text-center">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {message}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait while we load your data...
        </p>
      </div>
    </div>
  )
}

export function EmptyState({ 
  icon: Icon,
  title,
  description,
  action,
  className = ''
}: {
  icon: any
  title: string
  description: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={`text-center py-20 ${className}`}>
      <div className="relative inline-block mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center shadow-lg">
          <Icon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
        </div>
        {/* Subtle glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full blur-xl opacity-50"></div>
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        {title}
      </h3>
      
      <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
        {description}
      </p>
      
      {action && (
        <div className="animate-bounce-in">
          {action}
        </div>
      )}
    </div>
  )
}

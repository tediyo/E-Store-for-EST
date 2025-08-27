import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'glass' | 'gradient' | 'elevated'
  hover?: boolean
  animated?: boolean
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

interface CardTitleProps {
  children: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

interface CardContentProps {
  children: ReactNode
  className?: string
}

export function Card({ 
  children, 
  className = '', 
  variant = 'default',
  hover = false,
  animated = false
}: CardProps) {
  const baseClasses = "relative overflow-hidden transition-all duration-300 ease-out"
  
  const variantClasses = {
    default: "bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700",
    glass: "bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20",
    gradient: "bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50",
    elevated: "bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700"
  }
  
  const hoverClasses = hover ? "hover:shadow-2xl hover:shadow-gray-500/10 hover:-translate-y-1" : ""
  const animatedClasses = animated ? "animate-fade-in-up" : ""
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${animatedClasses} ${className}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-pattern-dots opacity-5 pointer-events-none"></div>
      
      {/* Hover Effects */}
      {hover && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-purple-600/0 opacity-0 hover:opacity-5 transition-opacity duration-300 pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 via-purple-600/0 to-indigo-600/0 opacity-0 hover:opacity-3 transition-opacity duration-300 pointer-events-none"></div>
        </>
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`px-6 py-6 border-b border-gray-100 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  )
}

export function CardTitle({ 
  children, 
  className = '', 
  size = 'lg' 
}: CardTitleProps) {
  const sizeClasses = {
    sm: "text-lg font-semibold",
    md: "text-xl font-semibold", 
    lg: "text-2xl font-bold",
    xl: "text-3xl font-bold"
  }
  
  return (
    <h3 className={`${sizeClasses[size]} text-gray-900 dark:text-white ${className}`}>
      {children}
    </h3>
  )
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`px-6 py-6 ${className}`}>
      {children}
    </div>
  )
}

// Enhanced Card Variants
export function StatsCard({ 
  children, 
  className = '', 
  icon: Icon,
  title,
  value,
  change,
  trend = 'up'
}: {
  children?: ReactNode
  className?: string
  icon: any
  title: string
  value: string | number
  change?: string | number
  trend?: 'up' | 'down' | 'neutral'
}) {
  const trendColors = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400'
  }
  
  const trendIcons = {
    up: '↗',
    down: '↘',
    neutral: '→'
  }
  
  return (
    <Card className={`p-6 ${className}`} hover animated>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg">
          <Icon className="h-6 w-6 text-white" />
        </div>
        {change && (
          <div className={`flex items-center space-x-1 text-sm font-medium ${trendColors[trend]}`}>
            <span>{trendIcons[trend]}</span>
            <span>{change}</span>
          </div>
        )}
      </div>
      
      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
        {value}
      </div>
      
      <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
        {title}
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-4">
        <div 
          className={`h-1 rounded-full transition-all duration-1000 ${
            trend === 'up' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
            trend === 'down' ? 'bg-gradient-to-r from-red-500 to-pink-500' :
            'bg-gradient-to-r from-gray-500 to-gray-600'
          }`}
          style={{ width: trend === 'up' ? '75%' : trend === 'down' ? '45%' : '60%' }}
        ></div>
      </div>
      
      {children}
    </Card>
  )
}

export function MetricCard({ 
  children, 
  className = '', 
  icon: Icon,
  title,
  value,
  subtitle,
  color = 'blue'
}: {
  children?: ReactNode
  className?: string
  icon: any
  title: string
  value: string | number
  subtitle?: string
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-indigo-500',
    green: 'from-green-500 to-emerald-500',
    purple: 'from-purple-500 to-pink-500',
    orange: 'from-orange-500 to-yellow-500',
    red: 'from-red-500 to-pink-500'
  }
  
  return (
    <Card className={`p-6 ${className}`} hover animated>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 bg-gradient-to-br ${colorClasses[color]} rounded-xl shadow-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {value}
      </div>
      
      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
        {title}
      </div>
      
      {subtitle && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {subtitle}
        </div>
      )}
      
      {children}
    </Card>
  )
}

'use client'
// Updated for Vercel deployment

import { useState, useEffect, Suspense, lazy, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import MobileDebug from '../components/debug/MobileDebug'

// Lazy load components for better performance
const LoginForm = lazy(() => import('../components/auth/LoginForm'))
const RegisterForm = lazy(() => import('../components/auth/RegisterForm'))
const Dashboard = lazy(() => import('../components/dashboard/Dashboard'))
const PageLayout = lazy(() => import('../components/layout/PageLayout'))

export default function Home() {
  const [showLogin, setShowLogin] = useState(true)
  const { user, loading } = useAuth()
  const router = useRouter()

  // Debug authentication state
  useEffect(() => {
    console.log('Auth state changed:', { user, loading })
  }, [user, loading])

  const toggleForm = useCallback(() => {
    setShowLogin(prev => !prev)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading application..." />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Inventory Management System
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Manage your shoe store inventory efficiently
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200 dark:border-gray-700">
            <div className="flex mb-6">
              <button
                onClick={() => setShowLogin(true)}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors duration-200 ${
                  showLogin
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setShowLogin(false)}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors duration-200 ${
                  !showLogin
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Register
              </button>
            </div>
            
            <Suspense fallback={
              <div className="flex justify-center py-8">
                <LoadingSpinner size="md" text="Loading form..." />
              </div>
            }>
              {showLogin ? <LoginForm /> : <RegisterForm />}
            </Suspense>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading dashboard..." />
        </div>
      }>
        <PageLayout>
          <Dashboard />
        </PageLayout>
      </Suspense>
      
      {/* Mobile Debug Component - only in development */}
      <MobileDebug />
    </>
  )
}

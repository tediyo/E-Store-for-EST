'use client'
// Updated for Vercel deployment

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LoginForm from '../components/auth/LoginForm'
import RegisterForm from '../components/auth/RegisterForm'
import Dashboard from '../components/dashboard/Dashboard'
import PageLayout from '../components/layout/PageLayout'
import { useAuth } from '../hooks/useAuth'

export default function Home() {
  const [showLogin, setShowLogin] = useState(true)
  const { user, loading } = useAuth()
  const router = useRouter()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
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
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md ${
                  showLogin
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setShowLogin(false)}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md ${
                  !showLogin
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Register
              </button>
            </div>
            
            {showLogin ? <LoginForm /> : <RegisterForm />}
          </div>
        </div>
      </div>
    )
  }

  return (
    <PageLayout>
      <Dashboard />
    </PageLayout>
  )
}

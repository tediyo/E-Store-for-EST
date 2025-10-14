'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../../../hooks/useAuth'
import toast from 'react-hot-toast'
import axios from 'axios'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  const handleAuthCallback = useCallback(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')
    const provider = searchParams.get('provider')

    if (error) {
      setStatus('error')
      toast.error('Authentication failed. Please try again.')
      setTimeout(() => router.push('/'), 2000)
      return
    }

    if (token) {
      // Store the token and redirect to dashboard
      localStorage.setItem('token', token)
      
      // Set the token in axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      setStatus('success')
      toast.success(`Successfully signed in with Google!`)
      
      // Redirect to dashboard
      setTimeout(() => router.push('/'), 1000)
    } else {
      setStatus('error')
      toast.error('No authentication token received')
      setTimeout(() => router.push('/'), 2000)
    }
  }, [searchParams, router])

  useEffect(() => {
    // Use requestIdleCallback for better performance
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(handleAuthCallback)
    } else {
      setTimeout(handleAuthCallback, 0)
    }
  }, [handleAuthCallback])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Completing Authentication
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we complete your sign-in...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Authentication Successful!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Redirecting you to the dashboard...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Authentication Failed
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Redirecting you back to the login page...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

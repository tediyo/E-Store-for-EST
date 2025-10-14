'use client'

import { FcGoogle } from 'react-icons/fc'
import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { api } from '../../lib/api'

interface SocialLoginProps {
  onSuccess?: (provider: string) => void
  onError?: (error: string) => void
}

export default function SocialLogin({ onSuccess, onError }: SocialLoginProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleGoogleLogin = useCallback(() => {
    setIsLoading('google')
    try {
      const url = api.endpoints.auth.google
      
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime()
      const urlWithTimestamp = `${url}?t=${timestamp}`
      
      console.log('Redirecting to OAuth:', urlWithTimestamp)
      
      // Always use full-page redirect to avoid mobile popup issues
      window.location.href = urlWithTimestamp
    } catch (error) {
      console.error('OAuth error:', error)
      toast.error('Unable to connect to authentication service')
      onError?.('Unable to connect to authentication service')
      setIsLoading(null)
    }
  }, [onError])

  return (
    <div className="space-y-4">
      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
            Or continue with
          </span>
        </div>
      </div>

      {/* Social Login Button */}
      <div className="flex justify-center">
        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading === 'google'}
          className={`flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${
            isLoading === 'google' ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading === 'google' ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-2"></div>
          ) : (
            <FcGoogle className="h-5 w-5 mr-2" />
          )}
          <span className="text-sm font-medium">
            {isLoading === 'google' ? 'Connecting...' : 'Continue with Google'}
          </span>
        </button>
      </div>

      {/* Info Text */}
      <p className="text-xs text-center text-gray-500 dark:text-gray-400">
        {/* By continuing, you agree to our Terms of Service and Privacy Policy */}
      </p>
    </div>
  )
}

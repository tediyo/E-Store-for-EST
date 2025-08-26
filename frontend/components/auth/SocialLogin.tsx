'use client'

import { FcGoogle } from 'react-icons/fc'
import { FaGithub } from 'react-icons/fa'

interface SocialLoginProps {
  onSuccess?: (provider: string) => void
  onError?: (error: string) => void
}

export default function SocialLogin({ onSuccess, onError }: SocialLoginProps) {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google'
  }

  const handleGitHubLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/github'
  }

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

      {/* Social Login Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          <FcGoogle className="h-5 w-5 mr-2" />
          <span className="text-sm font-medium">Google</span>
        </button>

        {/* GitHub Login */}
        <button
          onClick={handleGitHubLogin}
          className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          <FaGithub className="h-5 w-5 mr-2" />
          <span className="text-sm font-medium">GitHub</span>
        </button>
      </div>

      {/* Info Text */}
      <p className="text-xs text-center text-gray-500 dark:text-gray-400">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  )
}

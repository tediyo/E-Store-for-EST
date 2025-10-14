'use client'

import { useState, useCallback, memo } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import SocialLogin from './SocialLogin'

interface LoginFormData {
  email: string
  password: string
}

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>()

  const onSubmit = useCallback(async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      await login(data.email, data.password)
      toast.success('Login successful!')
      // Redirect to dashboard after successful login
      setTimeout(() => {
        window.location.href = '/inventory'
      }, 1000)
    } catch (error: any) {
      toast.error(error.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }, [login])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Brand header */}
      <div className="flex flex-col items-center mb-2">
        <img src="/esho.png" alt="Ermi Shoe" width={56} height={56} className="w-14 h-14 object-contain rounded-xl shadow-md border-2 border-gray-200 dark:border-gray-700 bg-white/90" />
        <span className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">Ermi Shoe</span>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Email address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          })}
          className="input w-full"
          placeholder="Enter your email"
        />
        {errors.email && (
          <p className="mt-2 text-sm text-red-500 font-medium">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters'
            }
          })}
          className="input mt-1"
          placeholder="Enter your password"
        />
        {errors.password && (
          <p className="mt-2 text-sm text-red-500 font-medium">{errors.password.message}</p>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </div>

      {/* Social Login */}
      <SocialLogin />
    </form>
  )
}

export default memo(LoginForm)

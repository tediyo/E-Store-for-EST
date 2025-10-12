'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import SocialLogin from './SocialLogin'

interface RegisterFormData {
  username: string
  email: string
  password: string
  confirmPassword: string
  role: 'user' | 'admin'
}

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { register: registerUser } = useAuth()
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegisterFormData>()

  const password = watch('password')

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    try {
      await registerUser(data.username, data.email, data.password, data.role)
      toast.success('Registration successful! Please login.')
    } catch (error: any) {
      toast.error(error.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="username" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Username
        </label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          {...register('username', {
            required: 'Username is required',
            minLength: {
              value: 3,
              message: 'Username must be at least 3 characters'
            }
          })}
          className="input mt-1"
          placeholder="Enter your username"
        />
        {errors.username && (
          <p className="mt-2 text-sm text-red-500 font-medium">{errors.username.message}</p>
        )}
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
          className="input mt-1"
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
          autoComplete="new-password"
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
        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: value => value === password || 'Passwords do not match'
          })}
          className="input mt-1"
          placeholder="Confirm your password"
        />
        {errors.confirmPassword && (
          <p className="mt-2 text-sm text-red-500 font-medium">{errors.confirmPassword.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Role
        </label>
        <select
          id="role"
          {...register('role', { required: 'Role is required' })}
          className="input mt-1"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        {errors.role && (
          <p className="mt-2 text-sm text-red-500 font-medium">{errors.role.message}</p>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>
      </div>

      {/* Social Login */}
      <SocialLogin />
    </form>
  )
}

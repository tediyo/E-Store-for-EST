'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react'
import axios from 'axios'
import { api } from '../lib/api'

interface User {
  id: string
  username: string
  email: string
  role: 'admin'
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string, role: 'admin') => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Memoize the checkAuthStatus function to prevent unnecessary re-renders
  const checkAuthStatus = useCallback(async () => {
    try {
      console.log('Checking auth status...')
      const token = localStorage.getItem('token')
      console.log('Current token:', token ? token.substring(0, 20) + '...' : 'No token')
      
      const response = await axios.get(api.endpoints.auth.profile)
      console.log('Profile response:', response.data)
      setUser(response.data.user)
    } catch (error) {
      console.error('Auth check failed:', error)
      // Clear invalid token
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Use requestIdleCallback for better performance
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        checkAuthStatus()
      } else {
        setLoading(false)
      }
    }

    // Use requestIdleCallback if available, otherwise use setTimeout
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(checkAuth)
    } else {
      setTimeout(checkAuth, 0)
    }
  }, [checkAuthStatus])

  const login = useCallback(async (email: string, password: string) => {
    try {
      console.log('Attempting login with:', { email, password: '***' })
      const response = await axios.post(api.endpoints.auth.login, {
        email,
        password
      })
      
      console.log('Login response:', response.data)
      const { user, token } = response.data
      
      if (!user) {
        throw new Error('No user data received from server')
      }
      
      if (!token) {
        throw new Error('No token received from server')
      }
      
      setUser(user)
      
      // Store token and set axios header
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      console.log('Login successful, token stored:', token.substring(0, 20) + '...')
    } catch (error: any) {
      console.error('Login error:', error)
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  }, [])

  const register = useCallback(async (username: string, email: string, password: string, role: 'admin') => {
    try {
      await axios.post(api.endpoints.auth.register, {
        username,
        email,
        password,
        role
      })
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed')
    }
  }, [])

  const logout = useCallback(() => {
    console.log('Logout function called')
    setUser(null)
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    console.log('User logged out, redirecting to home page')
    // Redirect to login page after logout
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }, [])

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout
  }), [user, loading, login, register, logout])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

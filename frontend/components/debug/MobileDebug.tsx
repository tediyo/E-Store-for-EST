'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { api } from '../../lib/api'

export default function MobileDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testAPI = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      console.log('Mobile Debug - Token:', token ? token.substring(0, 20) + '...' : 'No token')
      
      // Test profile endpoint
      const profileResponse = await axios.get(api.endpoints.auth.profile, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      // Test dashboard endpoint
      const dashboardResponse = await axios.get(`${api.endpoints.dashboard}/overview`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      setDebugInfo({
        profile: profileResponse.data,
        dashboard: dashboardResponse.data,
        token: token ? token.substring(0, 20) + '...' : 'No token',
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      })
    } catch (error: any) {
      console.error('Mobile Debug Error:', error)
      setDebugInfo({
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        token: localStorage.getItem('token') ? localStorage.getItem('token')?.substring(0, 20) + '...' : 'No token',
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg max-w-xs text-xs z-50">
      <h3 className="font-bold mb-2">Mobile Debug</h3>
      <button 
        onClick={testAPI}
        disabled={isLoading}
        className="bg-blue-500 text-white px-2 py-1 rounded text-xs mb-2"
      >
        {isLoading ? 'Testing...' : 'Test API'}
      </button>
      {debugInfo && (
        <pre className="whitespace-pre-wrap text-xs overflow-auto max-h-40">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      )}
    </div>
  )
}

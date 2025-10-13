import axios from 'axios'

// API Configuration
const getAPIBaseURL = () => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'https://e-store-for-est.onrender.com'
  }
  
  // Check if we're in development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000'
  }
  
  // Production URLs - try multiple options for better mobile compatibility
  const productionURLs = [
    process.env.NEXT_PUBLIC_API_URL,
    'https://e-store-for-est.onrender.com',
    'https://e-store-backend-1234.onrender.com'
  ].filter(Boolean)
  
  return productionURLs[0] || 'https://e-store-for-est.onrender.com'
}

const API_BASE_URL = getAPIBaseURL()

// Configure axios defaults for mobile compatibility
if (typeof window !== 'undefined') {
  axios.defaults.timeout = 10000 // 10 second timeout
  axios.defaults.headers.common['Content-Type'] = 'application/json'
  axios.defaults.headers.common['Accept'] = 'application/json'
}

export const api = {
  baseURL: API_BASE_URL,
  endpoints: {
    auth: {
      login: `${API_BASE_URL}/api/auth/login`,
      register: `${API_BASE_URL}/api/auth/register`,
      profile: `${API_BASE_URL}/api/auth/profile`,
      google: `${API_BASE_URL}/api/auth/google`,
      github: `${API_BASE_URL}/api/auth/github`,
    },
    items: `${API_BASE_URL}/api/items`,
    tasks: `${API_BASE_URL}/api/tasks`,
    reminders: `${API_BASE_URL}/api/reminders`,
    sales: `${API_BASE_URL}/api/sales`,
    dashboard: `${API_BASE_URL}/api/dashboard`,
  }
}

export default api

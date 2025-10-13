// API Configuration
const isDevelopment = process.env.NODE_ENV === 'development'

// Use local IP for mobile access, localhost for desktop
const getLocalAPIUrl = () => {
  if (typeof window !== 'undefined') {
    // Check if we're on mobile or if localhost fails
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    
    // If on mobile or not on localhost, use the local IP
    if (isMobile || !isLocalhost) {
      return 'http://172.24.194.149:5000'
    }
    return 'http://localhost:5000'
  }
  return 'http://localhost:5000'
}

export const API_BASE_URL = isDevelopment 
  ? getLocalAPIUrl()
  : process.env.NEXT_PUBLIC_API_URL || 'https://e-store-backend-1234.onrender.com'

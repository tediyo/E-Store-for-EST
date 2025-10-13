// API Configuration
const isDevelopment = process.env.NODE_ENV === 'development'

export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:5000' 
  : process.env.NEXT_PUBLIC_API_URL || 'https://e-store-backend-1234.onrender.com'

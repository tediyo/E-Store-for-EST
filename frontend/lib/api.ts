// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://e-store-for-est.onrender.com'

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

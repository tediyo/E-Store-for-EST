'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { api } from '../../lib/api'
import { 
  User, 
  Settings, 
  Shield, 
  Key, 
  Mail, 
  Bell, 
  Palette, 
  Lock, 
  Eye, 
  EyeOff,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Download,
  Upload,
  Trash2,
  Plus,
  Edit3,
  Camera,
  Globe,
  Moon,
  Sun,
  Monitor
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'
import toast from 'react-hot-toast'
import PageLayout from '../../components/layout/PageLayout'

interface UserProfile {
  id: string
  username: string
  email: string
  role: 'admin'
}

interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  salesAlerts: boolean
  inventoryAlerts: boolean
  weeklyReports: boolean
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'auto'
  language: string
  timezone: string
  dateFormat: string
}

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  })
  
  // Enhanced settings states
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    salesAlerts: true,
    inventoryAlerts: true,
    weeklyReports: false
  })
  
  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: theme,
    language: 'English',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY'
  })

  useEffect(() => {
    if (user) {
      setProfile(user)
      setFormData({
        username: user.username,
        email: user.email
      })
      setLoading(false)
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleNotificationToggle = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleAppearanceChange = (key: keyof AppearanceSettings, value: string) => {
    if (key === 'theme') {
      setTheme(value as 'light' | 'dark' | 'auto')
    }
    setAppearance(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await axios.put(`${api.baseURL}/api/auth/profile`, formData)
      setProfile(response.data.user)
      setEditing(false)
      toast.success('Profile updated successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    
    try {
      await axios.put(`${api.baseURL}/api/auth/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      toast.success('Password updated successfully')
      setShowPasswordModal(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update password')
    }
  }

  const handleExportData = () => {
    const data = {
      profile,
      notifications,
      appearance,
      exportDate: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `user-settings-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    toast.success('Settings exported successfully')
  }

  const handleDeleteAccount = async () => {
    try {
      await axios.delete(`${api.baseURL}/api/auth/account`)
      toast.success('Account deleted successfully')
      logout()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete account')
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="space-y-8">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Settings & Preferences</h1>
              <p className="text-blue-100 text-lg">Manage your account, security, and personalization</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleExportData}
                className="px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl text-white font-semibold hover:bg-white/30 transition-all duration-300"
              >
                <Download className="h-5 w-5 inline mr-2" />
                Export Settings
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-2">
          <div className="flex space-x-2 p-2">
            {[
              { id: 'profile', name: 'Profile', icon: User },
              { id: 'security', name: 'Security', icon: Shield },
              { id: 'notifications', name: 'Notifications', icon: Bell },
              { id: 'appearance', name: 'Appearance', icon: Palette },
              { id: 'advanced', name: 'Advanced', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-3 rounded-2xl font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <div className="flex items-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mr-6">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                  <p className="text-gray-600">Update your personal information and account details</p>
                </div>
              </div>

              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-3">
                        Username
                      </label>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button
                      type="submit"
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:shadow-lg transition-all duration-200 hover:scale-105"
                    >
                      <Save className="h-5 w-5 inline mr-2" />
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false)
                        setFormData({
                          username: profile?.username || '',
                          email: profile?.email || ''
                        })
                      }}
                      className="px-8 py-3 bg-gray-100 text-gray-700 font-semibold rounded-2xl hover:bg-gray-200 transition-all duration-200"
                    >
                      <X className="h-5 w-5 inline mr-2" />
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-gray-50 rounded-2xl">
                      <div className="text-sm text-gray-500 mb-2">Username</div>
                      <div className="text-lg font-semibold text-gray-900">{profile?.username}</div>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-2xl">
                      <div className="text-sm text-gray-500 mb-2">Email</div>
                      <div className="text-lg font-semibold text-gray-900">{profile?.email}</div>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-2xl">
                      <div className="text-sm text-gray-500 mb-2">Role</div>
                      <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-xl text-sm font-semibold capitalize inline-block">
                        {profile?.role}
                      </div>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-2xl">
                      <div className="text-sm text-gray-500 mb-2">Member Since</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {new Date().toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setEditing(true)}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    <Edit3 className="h-5 w-5 inline mr-2" />
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <div className="flex items-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mr-6">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
                  <p className="text-gray-600">Manage your password and account security</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-6 bg-gray-50 rounded-2xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Password</h3>
                    <p className="text-gray-600 mb-4">Update your password to keep your account secure</p>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
                    >
                      <Key className="h-5 w-5 inline mr-2" />
                      Change Password
                    </button>
                  </div>

                  <div className="p-6 bg-gray-50 rounded-2xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Two-Factor Authentication</h3>
                    <p className="text-gray-600 mb-4">Add an extra layer of security to your account</p>
                    <button className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all duration-200">
                      <Lock className="h-5 w-5 inline mr-2" />
                      Enable 2FA
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-gray-50 rounded-2xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Deletion</h3>
                    <p className="text-gray-600 mb-4">Permanently delete your account and all data</p>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="px-6 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-all duration-200"
                    >
                      <Trash2 className="h-5 w-5 inline mr-2" />
                      Delete Account
                    </button>
                  </div>

                  <div className="p-6 bg-gray-50 rounded-2xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Login History</h3>
                    <p className="text-gray-600 mb-4">View recent login attempts and locations</p>
                    <button className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all duration-200">
                      <Eye className="h-5 w-5 inline mr-2" />
                      View History
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <div className="flex items-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mr-6">
                  <Bell className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Notification Preferences</h2>
                  <p className="text-gray-600">Customize how and when you receive notifications</p>
                </div>
              </div>

              <div className="space-y-6">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h3>
                      <p className="text-gray-600">
                        Receive notifications about {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleNotificationToggle(key as keyof NotificationSettings)}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 ${
                        value ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-200 ${
                          value ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <div className="flex items-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-6">
                  <Palette className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Appearance & Language</h2>
                  <p className="text-gray-600">Customize the look and feel of your application</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Theme</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'light', icon: Sun, label: 'Light' },
                        { value: 'dark', icon: Moon, label: 'Dark' },
                        { value: 'auto', icon: Monitor, label: 'Auto' }
                      ].map((theme) => {
                        const Icon = theme.icon
                        return (
                          <button
                            key={theme.value}
                            onClick={() => handleAppearanceChange('theme', theme.value)}
                            className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                              appearance.theme === theme.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Icon className={`h-6 w-6 mx-auto mb-2 ${
                              appearance.theme === theme.value ? 'text-blue-600' : 'text-gray-600'
                            }`} />
                            <div className={`text-sm font-medium ${
                              appearance.theme === theme.value ? 'text-blue-600' : 'text-gray-700'
                            }`}>
                              {theme.label}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Language</label>
                    <select
                      value={appearance.language}
                      onChange={(e) => handleAppearanceChange('language', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Timezone</label>
                    <select
                      value={appearance.timezone}
                      onChange={(e) => handleAppearanceChange('timezone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="UTC">UTC</option>
                      <option value="EST">Eastern Time</option>
                      <option value="PST">Pacific Time</option>
                      <option value="GMT">GMT</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Date Format</label>
                    <select
                      value={appearance.dateFormat}
                      onChange={(e) => handleAppearanceChange('dateFormat', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>

                {/* Social Accounts Section */}
                <div className="mt-8 p-6 bg-gray-50 rounded-2xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Accounts</h3>
                  <p className="text-gray-600 mb-4">Connect your social media accounts for easy login</p>
                  
                  <div className="space-y-3">
                    {/* Google Account */}
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-sm font-bold">G</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Google</p>
                          <p className="text-sm text-gray-500">Sign in with Google account</p>
                        </div>
                      </div>
                      <button
                        onClick={() => window.location.href = `${api.baseURL}/api/auth/google`}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        Connect
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <div className="flex items-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mr-6">
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Advanced Settings</h2>
                  <p className="text-gray-600">Advanced configuration and system preferences</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-6 bg-gray-50 rounded-2xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Export</h3>
                    <p className="text-gray-600 mb-4">Export all your data and settings</p>
                    <button
                      onClick={handleExportData}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
                    >
                      <Download className="h-5 w-5 inline mr-2" />
                      Export Data
                    </button>
                  </div>

                  <div className="p-6 bg-gray-50 rounded-2xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>Version: 1.0.0</div>
                      <div>Last Updated: {new Date().toLocaleDateString()}</div>
                      <div>Browser: {navigator.userAgent.split(' ')[0]}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-gray-50 rounded-2xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Cache Management</h3>
                    <p className="text-gray-600 mb-4">Clear application cache and temporary data</p>
                    <button className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all duration-200">
                      <Trash2 className="h-5 w-5 inline mr-2" />
                      Clear Cache
                    </button>
                  </div>

                  <div className="p-6 bg-gray-50 rounded-2xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">API Keys</h3>
                    <p className="text-gray-600 mb-4">Manage your API keys and integrations</p>
                    <button className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all duration-200">
                      <Key className="h-5 w-5 inline mr-2" />
                      Manage Keys
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Change Password</h3>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:shadow-lg transition-all duration-200"
                >
                  Update Password
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-2xl hover:bg-gray-200 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Delete Account</h3>
              <p className="text-gray-600 mb-6">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 px-6 py-3 bg-red-500 text-white font-semibold rounded-2xl hover:bg-red-600 transition-all duration-200"
                >
                  Delete Account
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-2xl hover:bg-gray-200 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  )
}

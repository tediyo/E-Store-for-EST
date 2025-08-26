'use client'

import PageLayout from '../../components/layout/PageLayout'
import { useTheme } from '../../hooks/useTheme'

export default function ThemeDemo() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Theme Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Current theme: <span className="font-semibold text-primary-600 dark:text-primary-400">{theme}</span> 
            (resolved: <span className="font-semibold text-primary-600 dark:text-primary-400">{resolvedTheme}</span>)
          </p>
        </div>

        {/* Theme Controls */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Theme Controls</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setTheme('light')}
              className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Light Theme
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Dark Theme
            </button>
            <button
              onClick={() => setTheme('auto')}
              className={`btn ${theme === 'auto' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Auto Theme
            </button>
          </div>
        </div>

        {/* Component Examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cards */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Card Component</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This is an example card component that adapts to the current theme.
            </p>
            <div className="space-y-2">
              <button className="btn btn-primary">Primary Button</button>
              <button className="btn btn-secondary">Secondary Button</button>
              <button className="btn btn-danger">Danger Button</button>
            </div>
          </div>

          {/* Forms */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Form Elements</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Input Field
                </label>
                <input
                  type="text"
                  placeholder="Enter some text..."
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Option
                </label>
                <select className="input">
                  <option>Option 1</option>
                  <option>Option 2</option>
                  <option>Option 3</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Color Palette */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-lg mx-auto mb-2"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Primary</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-success-600 rounded-lg mx-auto mb-2"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Success</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-warning-600 rounded-lg mx-auto mb-2"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Warning</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-danger-600 rounded-lg mx-auto mb-2"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Danger</p>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">System Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">User Preference:</span> {theme}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">Resolved Theme:</span> {resolvedTheme}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">System Preference:</span> {typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark' : 'Light'}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">Color Scheme:</span> {typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

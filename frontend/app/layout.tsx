import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '../hooks/useAuth'
import { ThemeProvider } from '../hooks/useTheme'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Ermi Shoe',
  description: 'Full-stack inventory management system for shoe store',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/Es.png', sizes: '32x32', type: 'image/png' },
      { url: '/Es.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/Es.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  other: {
    'msapplication-TileImage': '/Es.png',
    'msapplication-TileColor': '#ffffff',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Explicit favicon links with cache busting */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico?v=2" />
        <link rel="icon" type="image/png" sizes="32x32" href="/Es.png?v=2" />
        <link rel="icon" type="image/png" sizes="16x16" href="/Es.png?v=2" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" />
        <link rel="apple-touch-icon" sizes="180x180" href="/Es.png?v=2" />
        
        {/* Additional meta tags for better favicon support */}
        <meta name="msapplication-TileImage" content="/Es.png" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://e-store-for-est.onrender.com" />
        {/* Preload critical CSS */}
        <style dangerouslySetInnerHTML={{
          __html: `
            .loading-spinner {
              animation: spin 1s linear infinite;
            }
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `
        }} />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

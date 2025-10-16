import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '../hooks/useAuth'
import { ThemeProvider } from '../hooks/useTheme'
import '../lib/console-filter'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Ermi Shoe',
  description: 'Full-stack inventory management system for Ermi shoe store',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/esho.png', type: 'image/png', sizes: '192x192' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/esho.png', type: 'image/png', sizes: '180x180' },
    ],
  },
  manifest: '/site.webmanifest',
  other: {
    'msapplication-TileImage': '/esho.png',
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
        {/* Explicit favicon links to avoid browser-specific fallbacks */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/esho.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/esho.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/esho.png" sizes="180x180" />
        <meta name="msapplication-TileImage" content="/esho.png" />
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

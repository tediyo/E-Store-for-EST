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
      { url: '/Es.png', sizes: '32x32', type: 'image/png' },
      { url: '/Es.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/Es.png',
    apple: [
      { url: '/Es.png', sizes: '180x180', type: 'image/png' },
    ],
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
        {/* Favicon - Multiple formats for better compatibility */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/Es.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/Es.png" type="image/png" sizes="16x16" />
        <link rel="shortcut icon" href="/Es.png" type="image/png" />
        <link rel="apple-touch-icon" href="/Es.png" sizes="180x180" />
        <link rel="apple-touch-icon" href="/Es.png" sizes="152x152" />
        <link rel="apple-touch-icon" href="/Es.png" sizes="144x144" />
        <link rel="apple-touch-icon" href="/Es.png" sizes="120x120" />
        <link rel="apple-touch-icon" href="/Es.png" sizes="114x114" />
        <link rel="apple-touch-icon" href="/Es.png" sizes="76x76" />
        <link rel="apple-touch-icon" href="/Es.png" sizes="72x72" />
        <link rel="apple-touch-icon" href="/Es.png" sizes="60x60" />
        <link rel="apple-touch-icon" href="/Es.png" sizes="57x57" />
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

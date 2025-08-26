'use client'

import { ReactNode } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

interface PageLayoutProps {
  children: ReactNode
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

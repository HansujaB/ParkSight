'use client'

import { useState, useEffect } from 'react'
import Dashboard from '../components/Dashboard'
import Sidebar from '../components/Sidebar'
import { Menu } from 'lucide-react'

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">

      {/* Sidebar (fixed on left) */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content (shifted right on desktop) */}
      <div className="flex-1 lg:ml-80">

        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            ParkSight
          </h1>
          <div className="w-10" />
        </div>

        {/* Dashboard at top */}
        <div className="p-4">
          <Dashboard />
        </div>

      </div>
    </div>
  )
}

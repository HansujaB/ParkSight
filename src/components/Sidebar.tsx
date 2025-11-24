'use client'

import { useParkingContext } from '../contexts/ParkingContext'
import FileUpload from './FileUpload'
import CameraSelector from './CameraSelector'
import SettingsPanel from './SettingsPanel'
import { X, Car, Settings, BarChart3 } from 'lucide-react'
import Link from 'next/link'

interface SidebarProps {
  onClose: () => void
}

export default function Sidebar({ onClose }: SidebarProps) {
  const { clearHistory, sessionHistory } = useParkingContext()

  return (
    <div className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Car className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Smart Parking
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Dashboard
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Camera Selection */}
        <div>
          <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            Camera Selection
          </h2>
          <CameraSelector />
        </div>

        {/* File Upload */}
        <div>
          <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            Upload Image
          </h2>
          <FileUpload />
        </div>

        {/* Quick Settings */}
        <div>
          <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            Quick Settings
          </h2>
          <SettingsPanel />
        </div>

        {/* Session Analytics */}
        {sessionHistory.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Session Data
              </h2>
              <button
                onClick={clearHistory}
                className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Clear
              </button>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {sessionHistory.length} data points
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Session started {new Date(sessionHistory[0]?.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700">
        <Link
          href="/settings"
          className="flex items-center gap-3 w-full p-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Settings className="h-5 w-5" />
          <span className="font-medium">Settings</span>
        </Link>
      </div>
    </div>
  )
}

'use client'

import { useParkingContext } from '../contexts/ParkingContext'
import LiveView from './LiveView'
import Counters from './Counters'
import SpotTable from './SpotTable'
import StatusBar from './StatusBar'
import TrendChart from './TrendChart'

export default function Dashboard() {
  const { currentData, sessionHistory } = useParkingContext()

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Status Bar */}
      <StatusBar />

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Live View - Takes up 2 columns on xl screens */}
        <div className="xl:col-span-2">
          <LiveView />
        </div>

        {/* Counters */}
        <div>
          <Counters />
        </div>
      </div>

      {/* Analytics Section */}
      {sessionHistory.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div>
            <TrendChart />
          </div>
          <div>
            <SpotTable />
          </div>
        </div>
      )}

      {/* Spot Table - Full width when no analytics */}
      {sessionHistory.length === 0 && currentData && (
        <div>
          <SpotTable />
        </div>
      )}

      {/* Welcome Message */}
      {!currentData && (
        <div className="card p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Welcome to Smart Parking Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Upload a parking lot image to start analyzing parking spots and get real-time occupancy data.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Use the upload panel on the left to get started, or configure your cameras in settings.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

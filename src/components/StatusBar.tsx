'use client'

import { useParkingContext } from '../contexts/ParkingContext'
import { Wifi, WifiOff, Clock, Zap, AlertCircle } from 'lucide-react'

export default function StatusBar() {
  const { isConnected, lastError, lastLatency, currentData } = useParkingContext()

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="status-indicator status-connected">
                  Connected
                </span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="status-indicator status-error">
                  {lastError ? 'Error' : 'Disconnected'}
                </span>
              </>
            )}
          </div>

          {/* Last Update */}
          {currentData && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Last update: {new Date(currentData.timestamp).toLocaleTimeString()}
              </span>
            </div>
          )}

          {/* Latency */}
          {lastLatency && (
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {lastLatency}ms
              </span>
            </div>
          )}
        </div>

        {/* Error Message */}
        {lastError && (
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">
              {lastError}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

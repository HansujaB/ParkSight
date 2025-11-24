'use client'

import { useParkingContext } from '../contexts/ParkingContext'
import { CheckCircle, XCircle, TrendingUp, TrendingDown } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function SpotTable() {
  const { currentData, settings, sessionHistory } = useParkingContext()
  const [previousStatus, setPreviousStatus] = useState<boolean[]>([])

  useEffect(() => {
    if (currentData && previousStatus.length > 0) {
      // Update previous status after a delay to show trends
      const timer = setTimeout(() => {
        setPreviousStatus(currentData.perSpotStatus)
      }, 2000)
      return () => clearTimeout(timer)
    } else if (currentData) {
      setPreviousStatus(currentData.perSpotStatus)
    }
  }, [currentData])

  if (!currentData) {
    return (
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Spot Details
        </h2>
        <div className="text-center py-8">
          <div className="text-gray-400 dark:text-gray-500 mb-2">
            <CheckCircle className="h-8 w-8 mx-auto opacity-50" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No spot data available
          </p>
        </div>
      </div>
    )
  }

  const getTrendIcon = (spotIndex: number, currentStatus: boolean) => {
    if (!settings.showTrends || previousStatus.length === 0) return null
    
    const prevStatus = previousStatus[spotIndex]
    if (prevStatus === undefined || prevStatus === currentStatus) return null
    
    if (currentStatus && !prevStatus) {
      return <TrendingUp className="h-4 w-4 text-red-500" title="Just became occupied" />
    } else if (!currentStatus && prevStatus) {
      return <TrendingDown className="h-4 w-4 text-green-500" title="Just became free" />
    }
    
    return null
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Spot Details
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {currentData.perSpotStatus.length} spots total
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                Spot
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                Status
              </th>
              {settings.showConfidence && (
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                  Confidence
                </th>
              )}
              {settings.showTrends && (
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                  Trend
                </th>
              )}
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                Updated
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {currentData.perSpotStatus.map((isOccupied, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="py-3 px-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                  #{index + 1}
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    {isOccupied ? (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-700 dark:text-red-400 font-medium">
                          Occupied
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-700 dark:text-green-400 font-medium">
                          Free
                        </span>
                      </>
                    )}
                  </div>
                </td>
                {settings.showConfidence && (
                  <td className="py-3 px-2 text-sm text-gray-600 dark:text-gray-400">
                    {currentData.confidence?.[index] 
                      ? `${(currentData.confidence[index] * 100).toFixed(1)}%`
                      : 'N/A'
                    }
                  </td>
                )}
                {settings.showTrends && (
                  <td className="py-3 px-2">
                    {getTrendIcon(index, isOccupied)}
                  </td>
                )}
                <td className="py-3 px-2 text-sm text-gray-500 dark:text-gray-400">
                  {new Date(currentData.timestamp).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {currentData.perSpotStatus.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No individual spot data available
          </p>
        </div>
      )}
    </div>
  )
}

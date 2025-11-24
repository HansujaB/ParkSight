'use client'

import { useParkingContext } from '../contexts/ParkingContext'
import { Car, CheckCircle, XCircle, BarChart } from 'lucide-react'

export default function Counters() {
  const { currentData } = useParkingContext()

  const totalSpots = currentData ? currentData.occupiedCount + currentData.freeCount : 0
  const utilization = totalSpots > 0 ? (currentData?.occupiedCount || 0) / totalSpots * 100 : 0

  const counters = [
    {
      label: 'Total Spots',
      value: totalSpots,
      icon: Car,
      color: 'blue',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      textColor: 'text-blue-900 dark:text-blue-100'
    },
    {
      label: 'Free Spots',
      value: currentData?.freeCount || 0,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
      textColor: 'text-green-900 dark:text-green-100'
    },
    {
      label: 'Occupied',
      value: currentData?.occupiedCount || 0,
      icon: XCircle,
      color: 'red',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      iconColor: 'text-red-600 dark:text-red-400',
      textColor: 'text-red-900 dark:text-red-100'
    },
    {
      label: 'Utilization',
      value: `${utilization.toFixed(1)}%`,
      icon: BarChart,
      color: 'yellow',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      textColor: 'text-yellow-900 dark:text-yellow-100'
    }
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Real-time Counters
      </h2>
      
      <div className="grid grid-cols-1 gap-4">
        {counters.map((counter) => {
          const Icon = counter.icon
          return (
            <div
              key={counter.label}
              className={`card p-6 ${counter.bgColor} border-l-4 border-l-${counter.color}-500`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${counter.textColor} opacity-75`}>
                    {counter.label}
                  </p>
                  <p className={`text-2xl font-bold ${counter.textColor} mt-1`}>
                    {counter.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${counter.bgColor}`}>
                  <Icon className={`h-6 w-6 ${counter.iconColor}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {!currentData && (
        <div className="card p-6 text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-2">
            <BarChart className="h-8 w-8 mx-auto opacity-50" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Upload an image to see live counters
          </p>
        </div>
      )}
    </div>
  )
}

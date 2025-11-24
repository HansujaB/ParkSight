'use client'

import { useParkingContext } from '../contexts/ParkingContext'
import { Clock, Image as ImageIcon } from 'lucide-react'

export default function LiveView() {
  const { currentData, isLoading } = useParkingContext()

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Live Parking View
        </h2>
        {currentData && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            <span>
              Updated {new Date(currentData.timestamp).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      <div className="relative bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden min-h-[400px] flex items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Processing image...
              </p>
            </div>
          </div>
        )}

        {currentData?.annotatedImageB64 ? (
          <img
            src={`data:image/png;base64,${currentData.annotatedImageB64}`}
            alt="Annotated parking lot view"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No image available</p>
            <p className="text-sm">
              Upload an image to see the annotated parking view
            </p>
          </div>
        )}
      </div>

      {currentData && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Free spots</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Occupied spots</span>
            </div>
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            Total: {currentData.occupiedCount + currentData.freeCount} spots
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useParkingContext } from '../contexts/ParkingContext'
import { CheckCircle, XCircle } from 'lucide-react'

export default function SpotTable() {
  const { currentData } = useParkingContext()

  if (!currentData) {
    return (
      <div className="card p-6 text-center text-gray-300">
        No spot data available
      </div>
    )
  }

  const total = currentData.perSpotStatus.length
  const occupied = currentData.perSpotStatus.filter(s => s).length
  const available = total - occupied

  return (
    <div className="card p-6">
      <h2 className="text-2xl font-semibold text-center mb-2 text-white">
        Interactive Parking Grid
      </h2>
      <p className="text-center text-gray-400 mb-8">
        Click on any available slot to book instantly
      </p>

      {/* GRID */}
      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-4 mx-auto">
        {currentData.perSpotStatus.map((isOccupied, i) => (
          <div
            key={i}
            className={`rounded-xl p-4 text-center shadow-lg cursor-pointer border-2 transition-all
              ${isOccupied 
                ? 'bg-red-500 border-red-300 hover:bg-red-600'
                : 'bg-green-500 border-green-300 hover:bg-green-600'
              }
            `}
          >
            <div className="text-xl font-bold text-white">{i + 1}</div>
            <div className="text-sm text-white opacity-90 flex items-center justify-center gap-1">
              {isOccupied ? (
                <>
                  <XCircle className="h-4 w-4" />
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-10 mt-10 text-white text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500"></div>
          Available ({available} slots)
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500"></div>
          Occupied ({occupied} slots)
        </div>
      </div>
    </div>
  )
}

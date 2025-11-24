'use client'

import { useParkingContext } from '../contexts/ParkingContext'
import { Camera } from 'lucide-react'

export default function CameraSelector() {
  const { settings, updateSettings } = useParkingContext()

  const handleCameraChange = (cameraId: string) => {
    updateSettings({
      ...settings,
      selectedCamera: cameraId
    })
  }

  if (settings.cameras.length === 0) {
    return (
      <div className="text-center py-4">
        <Camera className="h-8 w-8 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No cameras configured
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Add cameras in settings
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Camera className="h-4 w-4" />
        <span>Active Camera</span>
      </div>
      
      <select
        value={settings.selectedCamera}
        onChange={(e) => handleCameraChange(e.target.value)}
        className="input-field"
      >
        {settings.cameras.map((camera) => (
          <option key={camera.id} value={camera.id}>
            {camera.name}
          </option>
        ))}
      </select>

      <div className="text-xs text-gray-500 dark:text-gray-400">
        Selected: {settings.cameras.find(c => c.id === settings.selectedCamera)?.name || 'Unknown'}
      </div>
    </div>
  )
}

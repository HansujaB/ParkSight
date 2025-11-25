'use client'
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react'
import { useParkingContext } from '../../contexts/ParkingContext'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function Settings() {
  const { settings, updateSettings } = useParkingContext()
  const [localSettings, setLocalSettings] = useState(settings)
  const [newCameraName, setNewCameraName] = useState('')
  const [newCameraId, setNewCameraId] = useState('')

  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  const handleSave = () => {
    updateSettings(localSettings)
    toast.success('Settings saved successfully!')
  }

  const addCamera = () => {
    if (!newCameraName.trim() || !newCameraId.trim()) {
      toast.error('Please enter both camera name and ID')
      return
    }

    const newCamera = {
      id: newCameraId.trim(),
      name: newCameraName.trim()
    }

    setLocalSettings(prev => ({
      ...prev,
      cameras: [...prev.cameras, newCamera]
    }))

    setNewCameraName('')
    setNewCameraId('')
    toast.success('Camera added successfully!')
  }

  const removeCamera = (cameraId: string) => {
    setLocalSettings(prev => ({
      ...prev,
      cameras: prev.cameras.filter(cam => cam.id !== cameraId),
      selectedCamera: prev.selectedCamera === cameraId ? prev.cameras[0]?.id || '' : prev.selectedCamera
    }))
    toast.success('Camera removed successfully!')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/"
            className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Settings
          </h1>
        </div>

        <div className="grid gap-8">
          {/* Camera Configuration */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Camera Configuration
            </h2>

            {/* Add New Camera */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Add New Camera
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Camera Name
                  </label>
                  <input
                    type="text"
                    value={newCameraName}
                    onChange={(e) => setNewCameraName(e.target.value)}
                    placeholder="e.g., Main Entrance"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Camera ID
                  </label>
                  <input
                    type="text"
                    value={newCameraId}
                    onChange={(e) => setNewCameraId(e.target.value)}
                    placeholder="e.g., cam_001"
                    className="input-field"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={addCamera}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Camera
                  </button>
                </div>
              </div>
            </div>

            {/* Existing Cameras */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Configured Cameras
              </h3>
              {localSettings.cameras.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No cameras configured. Add your first camera above.
                </p>
              ) : (
                <div className="space-y-3">
                  {localSettings.cameras.map((camera) => (
                    <div
                      key={camera.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {camera.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {camera.id}
                        </p>
                      </div>
                      <button
                        onClick={() => removeCamera(camera.id)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        aria-label={`Remove ${camera.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* API Configuration */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              API Configuration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API Endpoint
                </label>
                <input
                  type="url"
                  value={localSettings.apiEndpoint}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, apiEndpoint: e.target.value }))}
                  className="input-field"
                  placeholder="https://parksight.onrender.com/detect"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Request Timeout (seconds)
                </label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={localSettings.requestTimeout}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, requestTimeout: parseInt(e.target.value) }))}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Display Settings */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Display Settings
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    Show Confidence Scores
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Display confidence percentages in the spot table
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showConfidence}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, showConfidence: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    Show Trend Indicators
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Display arrows when spot status changes
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showTrends}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, showTrends: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="btn-primary flex items-center gap-2 px-6 py-3"
            >
              <Save className="h-4 w-4" />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

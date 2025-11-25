'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface Camera {
  id: string
  name: string
}

export interface ParkingData {
  annotatedImageB64: string
  occupiedCount: number
  freeCount: number
  perSpotStatus: boolean[]
  timestamp: string
  confidence?: number[]
}

export interface Settings {
  cameras: Camera[]
  selectedCamera: string
  apiEndpoint: string
  requestTimeout: number
  showConfidence: boolean
  showTrends: boolean
}

export interface SessionData {
  timestamp: string
  occupiedCount: number
  freeCount: number
  utilization: number
}

interface ParkingContextType {
  // Data
  currentData: ParkingData | null
  sessionHistory: SessionData[]
  
  // Settings
  settings: Settings
  updateSettings: (newSettings: Settings) => void
  
  // Status
  isConnected: boolean
  lastError: string | null
  isLoading: boolean
  lastLatency: number | null
  
  // Actions
  uploadImage: (file: File) => Promise<void>
  clearHistory: () => void
}

const defaultSettings: Settings = {
  cameras: [
    { id: 'default', name: 'Default Camera' }
  ],
  selectedCamera: 'default',
  apiEndpoint: 'http://localhost:5000/detect',
  requestTimeout: 30,
  showConfidence: true,
  showTrends: true
}

const ParkingContext = createContext<ParkingContextType | undefined>(undefined)

export function ParkingProvider({ children }: { children: ReactNode }) {
  const [currentData, setCurrentData] = useState<ParkingData | null>(null)
  const [sessionHistory, setSessionHistory] = useState<SessionData[]>([])
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [isConnected, setIsConnected] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastLatency, setLastLatency] = useState<number | null>(null)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('parkingSettings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsed })
      } catch (error) {
        console.error('Failed to parse saved settings:', error)
      }
    }
  }, [])

  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings)
    localStorage.setItem('parkingSettings', JSON.stringify(newSettings))
  }

  const uploadImage = async (file: File) => {
    setIsLoading(true)
    setLastError(null)
    const startTime = Date.now()

    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('camera_id', settings.selectedCamera)

      const response = await fetch(settings.apiEndpoint, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(settings.requestTimeout * 1000)
      })

      const latency = Date.now() - startTime
      setLastLatency(latency)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      const stats = data.statistics ?? {}
      const detections = Array.isArray(stats.detections) ? stats.detections : []

      const perSpotStatus = detections.length > 0
        ? detections.map((det: any) => det?.class === 'space-occupied')
        : Array.isArray(data.per_spot)
          ? data.per_spot
          : []

      const confidence = detections.length > 0
        ? detections.map((det: any) =>
            typeof det?.confidence === 'number' ? det.confidence : 0
          )
        : Array.isArray(data.confidence)
          ? data.confidence
          : []

      const occupiedCount = typeof stats.occupied_spaces === 'number'
        ? stats.occupied_spaces
        : data.occupied_count ?? 0

      const freeCount = typeof stats.empty_spaces === 'number'
        ? stats.empty_spaces
        : data.free_count ?? 0

      const annotatedImageB64 = data.image_base64
        ?? data.annotated_image_b64
        ?? ''

      const timestamp = data.timestamp ?? new Date().toISOString()

      const parkingData: ParkingData = {
        annotatedImageB64,
        occupiedCount,
        freeCount,
        perSpotStatus,
        timestamp,
        confidence
      }

      setCurrentData(parkingData)
      setIsConnected(true)

      // Add to session history
      const totalSpots = parkingData.occupiedCount + parkingData.freeCount
      const utilization = totalSpots > 0 ? (parkingData.occupiedCount / totalSpots) * 100 : 0

      const sessionEntry: SessionData = {
        timestamp: parkingData.timestamp,
        occupiedCount: parkingData.occupiedCount,
        freeCount: parkingData.freeCount,
        utilization
      }

      setSessionHistory(prev => [...prev, sessionEntry].slice(-100)) // Keep last 100 entries

    } catch (error) {
      console.error('Upload failed:', error)
      setLastError(error instanceof Error ? error.message : 'Upload failed')
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  const clearHistory = () => {
    setSessionHistory([])
    setCurrentData(null)
  }

  const value: ParkingContextType = {
    currentData,
    sessionHistory,
    settings,
    updateSettings,
    isConnected,
    lastError,
    isLoading,
    lastLatency,
    uploadImage,
    clearHistory
  }

  return (
    <ParkingContext.Provider value={value}>
      {children}
    </ParkingContext.Provider>
  )
}

export function useParkingContext() {
  const context = useContext(ParkingContext)
  if (context === undefined) {
    throw new Error('useParkingContext must be used within a ParkingProvider')
  }
  return context
}

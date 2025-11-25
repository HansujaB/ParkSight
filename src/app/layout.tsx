import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '../components/ThemeProvider'
import { ParkingProvider } from '../contexts/ParkingContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ParkSight',
  description: 'Real-time parking spot detection and analysis dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ParkingProvider>
          <ThemeProvider>
            {children}
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                className: 'dark:bg-gray-800 dark:text-white',
              }}
            />
          </ThemeProvider>
        </ParkingProvider>
      </body>
    </html>
  )
}

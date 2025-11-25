'use client'

import { useParkingContext } from '../contexts/ParkingContext'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default function TrendChart() {
  const { sessionHistory } = useParkingContext()

  if (sessionHistory.length < 2) {
    return (
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Occupancy Trends
        </h2>
        <div className="text-center py-8">
          <div className="text-gray-400 dark:text-gray-500 mb-2">
            <svg className="h-8 w-8 mx-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Upload more images to see trends
          </p>
        </div>
      </div>
    )
  }

  const labels = sessionHistory.map(entry => 
    new Date(entry.timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  )

  const data = {
    labels,
    datasets: [
      {
        label: 'Occupied Spots',
        data: sessionHistory.map(entry => entry.occupiedCount),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Free Spots',
        data: sessionHistory.map(entry => entry.freeCount),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Utilization %',
        data: sessionHistory.map(entry => entry.utilization),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  }

  const options: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 20,
        color: 'rgb(107, 114, 128)'
      }
    },
    title: {
      display: false
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: 'white',
      bodyColor: 'white',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1
    }
  },
  scales: {
    x: {
      display: true,
      grid: {
        color: 'rgba(107, 114, 128, 0.1)'
      },
      ticks: {
        color: 'rgb(107, 114, 128)',
        maxTicksLimit: 8
      }
    },
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      beginAtZero: true,    // ✅ moved here
      grid: {
        color: 'rgba(107, 114, 128, 0.1)'
      },
      ticks: {
        color: 'rgb(107, 114, 128)'
        // ❌ removed beginAtZero from ticks
      },
      title: {
        display: true,
        text: 'Number of Spots',
        color: 'rgb(107, 114, 128)'
      }
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      beginAtZero: true,   // already correct
      grid: {
        drawOnChartArea: false
      },
      max: 100,
      ticks: {
        color: 'rgb(107, 114, 128)'
      },
      title: {
        display: true,
        text: 'Utilization %',
        color: 'rgb(107, 114, 128)'
      }
    }
  },
  interaction: {
    mode: 'nearest',
    axis: 'x',
    intersect: false
  }
}


  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Occupancy Trends
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {sessionHistory.length} data points
        </div>
      </div>
      
      <div className="h-64">
        <Line data={data} options={options} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Average Occupied</p>
          <p className="text-lg font-semibold text-red-600 dark:text-red-400">
            {(sessionHistory.reduce((sum, entry) => sum + entry.occupiedCount, 0) / sessionHistory.length).toFixed(1)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Average Free</p>
          <p className="text-lg font-semibold text-green-600 dark:text-green-400">
            {(sessionHistory.reduce((sum, entry) => sum + entry.freeCount, 0) / sessionHistory.length).toFixed(1)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Average Utilization</p>
          <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
            {(sessionHistory.reduce((sum, entry) => sum + entry.utilization, 0) / sessionHistory.length).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  )
}

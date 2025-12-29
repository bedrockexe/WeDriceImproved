import React, { useState, useEffect, useMemo } from 'react'
import { Car, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import axios from 'axios'

export function FleetUtilization() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5001"

  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const fetchCars = async () => {
      try {
        setLoading(true)
        const res = await axios.get(`${API}/api/cars`, {withCredentials: true})
        if (isMounted) setCars(res.data.cars || [])
      } catch (err) {
        console.error("FleetUtilization error:", err)
        if (isMounted) setError("Failed to load fleet data")
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchCars()

    return () => {
      isMounted = false
    }
  }, [])

  const mappedCars = useMemo(() => (
    cars.map((car, index) => ({
      id: index + 1,
      model: car.name,
      plateNumber: car.carId,
      status: car.status,
      currentBooking: car.currentBooking || null,
    }))
  ), [cars])

  const availableCount = mappedCars.filter(v => v.status === 'available').length
  const rentedCount = mappedCars.filter(v => v.status === 'rented').length
  const maintenanceCount = mappedCars.filter(v => v.status === 'maintenance').length

  const utilizationRate =
    mappedCars.length === 0
      ? 0
      : Math.round((rentedCount / mappedCars.length) * 100)

  const getStatusConfig = (status) => {
    switch (status) {
      case 'available':
        return {
          icon: CheckCircle,
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          label: 'Available',
        }
      case 'rented':
        return {
          icon: Clock,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          label: 'Rented',
        }
      case 'maintenance':
        return {
          icon: AlertCircle,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          label: 'Maintenance',
        }
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          label: 'Unknown',
        }
    }
  }

  // ⏳ Loading State
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse h-80" />
    )
  }

  // ❌ Error State
  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 px-4 py-2 text-sm bg-emerald-600 text-white rounded"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Fleet Utilization
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Current vehicle status overview
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {utilizationRate}%
          </div>
          <div className="text-xs text-gray-500">Utilization Rate</div>
        </div>
        <Link
          to="/dashboard/fleet"
          className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
        >
          See all →
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Stat label="Available" value={availableCount} color="emerald" Icon={CheckCircle} />
        <Stat label="Rented" value={rentedCount} color="blue" Icon={Clock} />
        <Stat label="Maintenance" value={maintenanceCount} color="amber" Icon={AlertCircle} />
      </div>

      {/* Vehicle List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {mappedCars.map(vehicle => {
          const config = getStatusConfig(vehicle.status)
          const StatusIcon = config.icon

          return (
            <div
              key={vehicle.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${config.borderColor} ${config.bgColor}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2 rounded-lg bg-white border ${config.borderColor}`}>
                  <Car className={`w-4 h-4 ${config.color}`} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{vehicle.model}</div>
                  <div className="text-xs text-gray-500">{vehicle.plateNumber}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <StatusIcon className={`w-4 h-4 ${config.color}`} />
                <span className={`text-xs font-medium ${config.color}`}>
                  {config.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Stat({ label, value, Icon, color }) {
  return (
    <div className={`bg-${color}-50 rounded-lg p-3 border border-${color}-100`}>
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 text-${color}-600`} />
        <span className={`text-xs font-medium text-${color}-700`}>
          {label}
        </span>
      </div>
      <div className={`text-xl font-bold text-${color}-900 mt-1`}>
        {value}
      </div>
    </div>
  )
}

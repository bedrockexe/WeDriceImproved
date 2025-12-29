import React from 'react'
import { StarIcon, ShieldCheckIcon } from 'lucide-react'
import { Link } from 'react-router-dom'


const CarCard = ({ car }) => {
  const isVerified = true
  return (
    <Link to={`/dashboard/car/${car.carId}`} className="block">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 transition-all hover:shadow-md">
        <div className="h-40 overflow-hidden relative">
          <img
            src={car.mainImage}
            alt={car.name}
            className="w-full h-full object-cover"
          />
          {!isVerified && (
            <div className="absolute inset-0 bg-black flex items-center justify-center">
              <div className="bg-white rounded-lg px-3 py-1.5 flex items-center shadow-lg">
                <ShieldCheckIcon size={14} className="text-yellow-600 mr-1.5" />
                <span className="text-xs font-medium text-gray-900">
                  Currently Unavailable
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-gray-800">{car.name}</h3>
              <p className="text-xs text-gray-500">{car.category}</p>
            </div>
            <div className="flex items-center">
              <StarIcon size={16} className="text-yellow-400 fill-current" />
              <span className="text-sm ml-1 font-medium">5.0</span>
            </div>
          </div>
          <div className="mt-3 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-bold text-gray-800">
                  ₱{car.pricePerDay}
                </span>{' '}
                / day
              </p>
            </div>
            <span className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded-md transition-colors">
              View Details
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
export default CarCard

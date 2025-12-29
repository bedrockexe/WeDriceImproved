import React, { useEffect } from 'react'
import {
  X,
  UsersIcon,
  CogIcon,
  FuelIcon,
  GaugeIcon,
  CheckCircleIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'

export function CarDetailModal({ car, isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])
  if (!isOpen) return null
  const specs = car.specs || {
    passengers: 5,
    transmission: 'Automatic',
    fuel: 'Gasoline',
    topSpeed: '180 km/h',
  }
  const features = car.features || [
    'Air Conditioning',
    'Bluetooth Connectivity',
    'Backup Camera',
    'Cruise Control',
    'GPS Navigation',
    'Premium Sound System',
  ]
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: 'modalSlideIn 0.3s ease-out',
        }}
      >
        <style>{`
          @keyframes modalSlideIn {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}</style>

        {/* Header */}
        <div className="relative">
          <img
            src={car.image}
            alt={car.name}
            className="w-full h-64 md:h-96 object-cover rounded-t-2xl"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors shadow-lg"
          >
            <X size={24} className="text-gray-800" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {car.name}
            </h2>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#1AB759]">
                ₱{car.price}
              </span>
              <span className="text-white/90">/day</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          {/* Description */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              About This Vehicle
            </h3>
            <p className="text-gray-600 leading-relaxed">{car.description}</p>
          </div>

          {/* Specifications */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Specifications
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                <UsersIcon className="text-[#1AB759] mb-2" size={28} />
                <span className="text-sm text-gray-500">Passengers</span>
                <span className="font-bold text-gray-800">
                  {specs.passengers}
                </span>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                <CogIcon className="text-[#1AB759] mb-2" size={28} />
                <span className="text-sm text-gray-500">Transmission</span>
                <span className="font-bold text-gray-800">
                  {specs.transmission}
                </span>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                <FuelIcon className="text-[#1AB759] mb-2" size={28} />
                <span className="text-sm text-gray-500">Fuel Type</span>
                <span className="font-bold text-gray-800">{specs.fuel}</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                <GaugeIcon className="text-[#1AB759] mb-2" size={28} />
                <span className="text-sm text-gray-500">Top Speed</span>
                <span className="font-bold text-gray-800">
                  {specs.topSpeed}
                </span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Features & Amenities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircleIcon
                    className="text-[#1AB759] flex-shrink-0"
                    size={20}
                  />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to={`/dashboard/car/${car.carid}`} className="flex-1 py-3 bg-[#1AB759] text-center text-white rounded-lg font-medium hover:bg-[#159a4b] transition-colors">
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

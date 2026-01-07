import React, { useState } from 'react'
import { CarDetailModal } from "../Dashboard/components/UI/CarDetailModal"
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'

function CarSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md">
      {/* Image skeleton */}
      <div className="h-56 w-full bg-gray-200 animate-pulse"></div>

      <div className="p-6 space-y-4">
        {/* Title + Price */}
        <div className="flex justify-between items-center">
          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <div className="h-10 flex-1 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="h-10 flex-1 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

export function FeaturedCars() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const { data: cars = [], isLoading, error } = useQuery({
    queryKey: ["cars"],
    queryFn: async () => {
      const res = await axios.get(`${API}/api/cars/`);
      return res.data.cars;
    },
    staleTime: 1000 * 60 * 5,
  });

  const featuredCars = cars.map((car, index) => {
    return {
      carid: car.carId,
      id: index + 1,
      name: car.name,
      image: car.mainImage,
      price: car.pricePerDay,
      description: car.description,
      specs: {
        passengers: car.seats,
        transmission: car.transmission,
        fuel: car.fuelType,
        topSpeed: '100 km/h',
      },
      features: car.features
    }
  })
  const [selectedCar, setSelectedCar] = useState(null)
  return (
    <section className="py-16 bg-gray-50" id='cars'>
      
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
              Popular Rentals
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our most sought-after vehicles, ready for your next
              adventure.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCars.map((car) => (
              <div
                key={car.id}
                className="bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl group"
              >
                <div className="h-56 overflow-hidden">
                  <img
                    src={car.image}
                    alt={car.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-bold text-gray-800">
                      {car.name}
                    </h3>
                    <div className="text-[#1AB759] font-bold">
                      ₱{car.price}
                      <span className="text-sm text-gray-500">/day</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{car.description}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedCar(car)}
                      className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:border-[#1AB759] hover:text-[#1AB759] transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      

      <CarDetailModal
        car={selectedCar}
        isOpen={!!selectedCar}
        onClose={() => setSelectedCar(null)}
      />
    </section>
  )
}

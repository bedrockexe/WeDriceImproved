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


// const featuredCars = [
//   {
//     id: 1,
//     name: 'Tesla Model 3',
//     image:
//       'https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
//     price: 89,
//     description:
//       'Electric sedan with autopilot features and long range battery.',
//     specs: {
//       passengers: 5,
//       transmission: 'Automatic',
//       fuel: 'Electric',
//       topSpeed: '225 km/h',
//     },
//     features: [
//       'Autopilot',
//       'Premium Sound System',
//       'Glass Roof',
//       'Heated Seats',
//       'Supercharger Access',
//       'Over-the-Air Updates',
//     ],
//   },
//   {
//     id: 2,
//     name: 'BMW X5',
//     image:
//       'https://images.unsplash.com/photo-1580274455191-1c62238fa333?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2064&q=80',
//     price: 120,
//     description: 'Luxury SUV with spacious interior and premium features.',
//     specs: {
//       passengers: 7,
//       transmission: 'Automatic',
//       fuel: 'Gasoline',
//       topSpeed: '210 km/h',
//     },
//     features: [
//       'Panoramic Sunroof',
//       'Leather Interior',
//       'Adaptive Cruise Control',
//       'Parking Assist',
//       'Premium Audio',
//       '360° Camera',
//     ],
//   },
//   {
//     id: 3,
//     name: 'Mercedes C-Class',
//     image:
//       'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
//     price: 110,
//     description: 'Elegant sedan with cutting-edge technology and comfort.',
//     specs: {
//       passengers: 5,
//       transmission: 'Automatic',
//       fuel: 'Gasoline',
//       topSpeed: '250 km/h',
//     },
//     features: [
//       'MBUX Infotainment',
//       'Ambient Lighting',
//       'Wireless Charging',
//       'Burmester Sound',
//       'Active Brake Assist',
//       'Keyless Entry',
//     ],
//   },
//   {
//     id: 4,
//     name: 'Toyota RAV4',
//     image:
//       'https://images.unsplash.com/photo-1581540222194-0def2dda95b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2187&q=80',
//     price: 75,
//     description: 'Reliable SUV with excellent fuel economy and cargo space.',
//     specs: {
//       passengers: 5,
//       transmission: 'Automatic',
//       fuel: 'Hybrid',
//       topSpeed: '180 km/h',
//     },
//     features: [
//       'All-Wheel Drive',
//       'Apple CarPlay',
//       'Lane Departure Alert',
//       'Blind Spot Monitor',
//       'Roof Rails',
//       'Power Liftgate',
//     ],
//   },
//   {
//     id: 5,
//     name: 'Audi A4',
//     image:
//       'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
//     price: 95,
//     description:
//       'Sporty sedan with Quattro all-wheel drive and refined interior.',
//     specs: {
//       passengers: 5,
//       transmission: 'Automatic',
//       fuel: 'Gasoline',
//       topSpeed: '240 km/h',
//     },
//     features: [
//       'Quattro AWD',
//       'Virtual Cockpit',
//       'Matrix LED Headlights',
//       'Bang & Olufsen Audio',
//       'Adaptive Suspension',
//       'Wireless CarPlay',
//     ],
//   },
//   {
//     id: 6,
//     name: 'Ford Mustang',
//     image:
//       'https://images.unsplash.com/photo-1584345604476-8ec5f82d6873?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
//     price: 105,
//     description:
//       'Iconic American muscle car with powerful engine and bold styling.',
//     specs: {
//       passengers: 4,
//       transmission: 'Manual/Auto',
//       fuel: 'Gasoline',
//       topSpeed: '250 km/h',
//     },
//     features: [
//       'Performance Package',
//       'Track Apps',
//       'Selectable Drive Modes',
//       'Premium Sound',
//       'Launch Control',
//       'Sport Exhaust',
//     ],
//   },
// ]
export function FeaturedCars() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const { data: cars = [], isLoading, error } = useQuery({
    queryKey: ["cars"],
    queryFn: async () => {
      const res = await axios.get(`${API}/api/cars/`);
      console.log("API responded:", res.data.cars); // TESTING ONLY
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

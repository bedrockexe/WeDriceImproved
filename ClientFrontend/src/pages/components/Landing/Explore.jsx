import { useState } from "react"
import { ChevronLeft, ChevronRight, Phone, MessageSquare, MapPin, Zap, Users, Fuel } from "lucide-react"
import { imageUrls } from "./imageConfig"


export default function Explore() {
  const [currentSlide, setCurrentSlide] = useState(2)

  const cars = [
    {
      id: 1,
      name: "Ford Fiesta",
      year: "2014",
      image: imageUrls.explore[0],
      price: "₱45/day",
      transmission: "Automatic",
      seats: "5 Seats",
      fuel: "50KM/MPG",
    },
    {
      id: 2,
      name: "Honda Civic",
      year: "2015",
      image: imageUrls.explore[1],
      price: "₱50/day",
      transmission: "Automatic",
      seats: "5 Seats",
      fuel: "48KM/MPG",
    },
    {
      id: 3,
      name: "Toyota Corolla",
      year: "2016",
      image: imageUrls.explore[2],
      price: "₱48/day",
      transmission: "Automatic",
      seats: "5 Seats",
      fuel: "52KM/MPG",
    },
    {
      id: 4,
      name: "Mazda 3",
      year: "2017",
      image: imageUrls.explore[3],
      price: "₱52/day",
      transmission: "Automatic",
      seats: "5 Seats",
      fuel: "51KM/MPG",
    },
    {
      id: 5,
      name: "Hyundai Elantra",
      year: "2018",
      image: imageUrls.explore[4],
      price: "₱49/day",
      transmission: "Automatic",
      seats: "5 Seats",
      fuel: "49KM/MPG",
    },
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % cars.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + cars.length) % cars.length)
  }

  const getVisibleCars = () => {
    const visible = []
    for (let i = -2; i <= 2; i++) {
      visible.push(cars[(currentSlide + i + cars.length) % cars.length])
    }
    return visible
  }

  return (
    <section className="bg-green-50 py-20">
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-black mb-2">Explore</h2>
          <p className="text-gray-600 text-lg">Cars showcase to you by WeDrive Rentals</p>
        </div>

        {/* Carousel */}
        <div className="relative mb-8">
          <div className="flex gap-4 justify-center items-center overflow-hidden">
            {getVisibleCars().map((car, index) => (
              <div
                key={`${car.id}-${index}`}
                className={`flex-shrink-0 transition-all duration-300 ${
                  index === 2 ? "w-96 scale-100" : "w-56 scale-75 opacity-50"
                }`}
              >
                <div
                  className={`rounded-2xl overflow-hidden transition-all ${index === 2 ? "ring-4 ring-green-600" : ""}`}
                >
                  <div className="relative">
                    <img src={car.image || "/placeholder-car.svg"} alt={car.name} className="w-full h-64 object-cover" />
                    {index === 2 && (
                      <div className="absolute bottom-0 left-0 p-4 text-white">
                        <h3 className="font-bold text-xl">{car.name}</h3>
                        <p className="text-gray-200">{car.year}</p>
                      </div>
                    )}
                  </div>

                  {index === 2 ? (
                    <div className="bg-green-400 px-4 py-3 flex justify-around items-center">
                      <div className="flex flex-col items-center gap-1">
                        <Zap size={20} className="text-green-700" />
                        <span className="text-xs font-semibold text-green-900">{car.transmission}</span>
                      </div>
                      <div className="w-px h-8 bg-green-600"></div>
                      <div className="flex flex-col items-center gap-1">
                        <Users size={20} className="text-green-700" />
                        <span className="text-xs font-semibold text-green-900">{car.seats}</span>
                      </div>
                      <div className="w-px h-8 bg-green-600"></div>
                      <div className="flex flex-col items-center gap-1">
                        <Fuel size={20} className="text-green-700" />
                        <span className="text-xs font-semibold text-green-900">{car.fuel}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-100">
                      <h3 className="font-bold text-lg">{car.name}</h3>
                      <p className="text-gray-600">{car.year}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/3 -translate-y-1/2 -translate-x-6 bg-green-600 text-white p-2 rounded-full hover:bg-green-700 z-10"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/3 -translate-y-1/2 translate-x-6 bg-green-600 text-white p-2 rounded-full hover:bg-green-700 z-10"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mb-12">
          {cars.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? "bg-green-600 w-8" : "bg-gray-400"
              }`}
            />
          ))}
        </div>

        {/* Featured Car Details */}
        <div className="bg-white rounded-2xl p-8 mb-12">
          <div className="grid grid-cols-3 gap-8">
            <div className="flex items-center gap-4">
              <Phone size={32} className="text-green-600" />
              <div>
                <p className="text-gray-600 text-sm">Call Us</p>
                <p className="font-bold text-lg">+1 (555) 123-4567</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <MessageSquare size={32} className="text-green-600" />
              <div>
                <p className="text-gray-600 text-sm">Message Us</p>
                <p className="font-bold text-lg">support@wedrive.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <MapPin size={32} className="text-green-600" />
              <div>
                <p className="text-gray-600 text-sm">Visit Us</p>
                <p className="font-bold text-lg">123 Main Street</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Squares */}
      <div className="absolute top-20 right-20 w-8 h-8 bg-green-600 rounded"></div>
      <div className="absolute top-32 right-12 w-8 h-8 bg-green-600 rounded"></div>
      <div className="absolute top-40 right-32 w-8 h-8 bg-green-600 rounded"></div>
    </section>
  )
}

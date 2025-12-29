import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { imageUrls } from "./imageConfig"

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      id: 1,
      image: imageUrls.hero[0],
      title: "Premium SUV",
    },
    {
      id: 2,
      image: imageUrls.hero[1],
      title: "Luxury Sedan",
    },
    {
      id: 3,
      image: imageUrls.hero[2],
      title: "City Car",
    },
    {
      id: 4,
      image: imageUrls.hero[3],
      title: "Family Van",
    },
    {
      id: 5,
      image: imageUrls.hero[4],
      title: "Sports Car",
    },
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <section id="home" className="bg-gradient-to-b from-green-50 to-white pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h1 className="text-5xl font-bold text-black mb-2">WeDrive</h1>
            <p className="text-xl text-gray-600 mb-6">Car Rentals</p>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              "Drive freedom, not just miles — rent the car you need, when you need it."
            </p>
            <div className="flex gap-4">
              <button className="bg-blue-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-blue-300 font-medium">
                Browse Cars
              </button>
              <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium">
                Rent now!
              </button>
            </div>
          </div>

          {/* Right Carousel */}
          <div className="relative">
            <div className="relative bg-gradient-to-b from-blue-400 to-blue-300 rounded-3xl overflow-hidden h-96">
              <img
                src={slides[currentSlide].image || "/placeholder.svg"}
                alt={slides[currentSlide].title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Carousel Controls */}
            <div className="flex justify-center items-center mt-6">
              <button onClick={prevSlide} className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-900">
                <ChevronLeft size={24} />
              </button>

              {/* Dots */}
              <div className="flex gap-2 mx-4">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentSlide ? "bg-yellow-400 w-8" : "bg-gray-400"
                    }`}
                  />
                ))}
              </div>

              <button onClick={nextSlide} className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-900">
                <ChevronRight size={24} />
              </button>
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

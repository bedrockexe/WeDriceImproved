import React from 'react'
import { CalendarIcon, MapPinIcon, SearchIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-16">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1AB759]/80 to-[#007bff]/60 mix-blend-multiply"></div>
        <img
          src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          alt="Luxury car on city street"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="container mx-auto px-4 py-20 z-10 text-white">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Rent Your Dream Car — Fast, Easy, and Affordable.
          </h1>
          <p className="text-lg md:text-xl opacity-90 mb-8">
            Choose from a wide selection of vehicles and book online in minutes.
          </p>
          <div className="flex flex-wrap gap-4 mb-12">
            <Link to="/dashboard/cars" className="px-8 py-3 bg-[#1AB759] text-white rounded-full font-medium hover:bg-[#159a4b] transition-colors">
              Book Now
            </Link>
            <a href="#cars" className="px-8 py-3 border-2 border-white text-white rounded-full font-medium hover:bg-white hover:text-[#1AB759] transition-colors">
              View Cars
            </a>
          </div>
          {/* Search Bar */}
          <div className="bg-white rounded-lg p-4 shadow-lg max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <MapPinIcon
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Pickup Location"
                  className="w-full pl-10 pr-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1AB759] text-gray-700"
                />
              </div>
              <div className="relative">
                <CalendarIcon
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Pick-up Date"
                  className="w-full pl-10 pr-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1AB759] text-gray-700"
                />
              </div>
              <div className="relative">
                <CalendarIcon
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Return Date"
                  className="w-full pl-10 pr-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1AB759] text-gray-700"
                />
              </div>
            </div>
            <a href='#cars' className="w-full mt-4 py-3 bg-[#1AB759] text-white rounded-md font-medium hover:bg-[#159a4b] transition-colors flex items-center justify-center gap-2">
              <SearchIcon size={20} />
              Search Available Cars
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

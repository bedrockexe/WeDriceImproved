import React, { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeftIcon,
  StarIcon,
  UsersIcon,
  GaugeIcon,
  FuelIcon,
  CalendarIcon,
  MapPinIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  AlertCircleIcon,
} from 'lucide-react'
import axios from 'axios'
import { useEffect } from 'react'

const CarDetails = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [car, setCar] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0)
  const [isVerified, setIsVerified] = useState(null) 
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchCar = async () => {
      const res = await axios.get(`${API}/api/cars/${id}`);
      setCar(res.data.car);
    };
    fetchCar();

    axios.get(`${API}/api/users/me`, { withCredentials: true })
      .then(res => {
        const u = res.data.user;
        setUser(u);
        setIsVerified(u?.verificationStatus === "verified");
      })
      .catch(err => console.log(err));

  }, [id]);


  if (!car) return <p>Loading...</p>;

  const handleBookNow = () => {
    navigate('/dashboard/book-car', {
      state: {
        car,
      },
    })
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard/cars')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon size={20} className="mr-2" />
              <span className="font-medium">Back to Cars</span>
            </button>
            <Link to="/" className="text-xl font-bold text-gray-800">
              <span className="text-green-500">We</span>Drive
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Image */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="relative h-96 bg-gray-100">
                <img
                  src={car.images[selectedImage]}
                  alt={car.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Thumbnail Images */}
              <div className="p-4 flex gap-3">
                {car.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-20 w-24 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <img
                      src={image}
                      alt={`${car.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Car Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {car.brand} {car.model}
                  </h1>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <StarIcon
                        size={18}
                        className="text-yellow-400 fill-current"
                      />
                      <span className="ml-1 font-semibold text-gray-900">
                        5.0
                      </span>
                      <span className="ml-1 text-gray-500">
                        (10 reviews)
                      </span>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      {car.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Specifications Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center text-gray-500 mb-2">
                    <CalendarIcon size={18} className="mr-2" />
                    <span className="text-sm font-medium">Year</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{car.year}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center text-gray-500 mb-2">
                    <GaugeIcon size={18} className="mr-2" />
                    <span className="text-sm font-medium">Transmission</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {/* Make the first letter uppercase */}
                    {car.transmission.charAt(0).toUpperCase() + car.transmission.slice(1)}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center text-gray-500 mb-2">
                    <UsersIcon size={18} className="mr-2" />
                    <span className="text-sm font-medium">Seats</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {car.seats} People
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center text-gray-500 mb-2">
                    <FuelIcon size={18} className="mr-2" />
                    <span className="text-sm font-medium">Fuel Type</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {car.fuelType}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  About this car
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {car.description}
                </p>
              </div>

              {/* Features */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Features & Amenities
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {car.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center text-gray-700"
                    >
                      <CheckCircleIcon
                        size={18}
                        className="text-green-500 mr-2 flex-shrink-0"
                      />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
              <div className="mb-6">
                <div className="flex items-baseline mb-2">
                  <span className="text-4xl font-bold text-gray-900">
                    ₱{car.pricePerDay}
                  </span>
                  <span className="text-gray-600 ml-2">/ day</span>
                </div>
                <p className="text-sm text-gray-500">Best price guaranteed</p>
              </div>

              {/* Quick Info */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Brand & Model</span>
                  <span className="font-semibold text-gray-900">
                    {car.brand} {car.model}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Year</span>
                  <span className="font-semibold text-gray-900">
                    {car.year}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Transmission</span>
                  <span className="font-semibold text-gray-900">
                    {car.transmission.charAt(0).toUpperCase() + car.transmission.slice(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Fuel Type</span>
                  <span className="font-semibold text-gray-900">
                    {car.fuelType}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Capacity</span>
                  <span className="font-semibold text-gray-900">
                    {car.seats} Seats
                  </span>
                </div>
              </div>

              {/* Verification Notice */}
              {!isVerified && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <AlertCircleIcon
                      size={18}
                      className="text-yellow-600 mr-2 mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <p className="text-sm font-medium text-yellow-900 mb-1">
                        Verification Required
                      </p>
                      <p className="text-xs text-yellow-700">
                        You'll need to verify your identity before booking
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Book Button */}
              <button
                onClick={handleBookNow}
                disabled={car.status != "available" || !isVerified}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {car.status != "available" || !isVerified ? 'Currently Unavailable' : 'Book Now'}
              </button>

              {/* Trust Indicators */}
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircleIcon
                    size={16}
                    className="text-green-500 mr-2 flex-shrink-0"
                  />
                  <span>Free cancellation up to 24 hours</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircleIcon
                    size={16}
                    className="text-green-500 mr-2 flex-shrink-0"
                  />
                  <span>Instant booking confirmation</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <ShieldCheckIcon
                    size={16}
                    className="text-green-500 mr-2 flex-shrink-0"
                  />
                  <span>Comprehensive insurance included</span>
                </div>
              </div>

              {/* Contact Support */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">
                  Questions about this car?
                </p>
                <Link
                  to="/dashboard/support"
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  Contact Support →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default CarDetails

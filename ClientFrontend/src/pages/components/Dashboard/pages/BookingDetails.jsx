import React from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeftIcon,
  CalendarIcon,
  MapPinIcon,
  CarIcon,
  CreditCardIcon,
  FileTextIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  DownloadIcon,
} from 'lucide-react'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useQuery } from "@tanstack/react-query";


const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
};


const BookingDetails = () => {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const {
    data: currentBooking,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () =>
      axios
        .get(`${API}/api/bookings/${bookingId}`, { withCredentials: true })
        .then(res => res.data.booking),
    retry: false,
  });


  const {
    data: currentCar,
    isLoading: isCarLoading,
    isError: isCarError,
    error: carError,
  } = useQuery({
    queryKey: ["car", currentBooking?.carId],
    queryFn: () =>
      axios
        .get(`${API}/api/cars/${currentBooking.carId}`)
        .then(res => res.data.car),
    enabled: !!currentBooking,
    retry: false,
  });


  const {
    data: currentPayment,
    isLoading: isPaymentLoading,
    isError: isPaymentError,
    error: paymentError,
  } = useQuery({
    queryKey: ["payment", currentBooking?.bookingId],
    queryFn: () =>
      axios
        .get(`${API}/api/transactions/booking/${currentBooking.bookingId}`)
        .then(res => res.data.transactions[0]),
    enabled: !!currentBooking,
    retry: false,
  });


  if (isLoading || isCarLoading || isPaymentLoading) {
    return (
      <div className="p-12 text-center text-gray-500">
        Loading booking details...
      </div>
    );
  }

  if (isError) {
  const status = error?.response?.status;

  // 🔍 Booking does not exist
  if (status === 404) {
    return (
      <div className="p-12 text-center">
        <AlertCircleIcon size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Booking Not Found</h2>
        <p className="text-gray-500 mb-6">
          The booking you’re looking for does not exist or was removed.
        </p>
        <Link
          to="/dashboard/bookings"
          className="px-6 py-3 bg-green-500 text-white rounded-lg"
        >
          Back to My Bookings
        </Link>
      </div>
    );
  }

  // 🔒 Booking is not yours
  if (status === 403) {
    return (
      <div className="p-12 text-center">
        <AlertCircleIcon size={48} className="mx-auto text-red-300 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-gray-500 mb-6">
          You are not authorized to view this booking.
        </p>
        <Link
          to="/dashboard/bookings"
          className="px-6 py-3 bg-green-500 text-white rounded-lg"
        >
          Back to My Bookings
        </Link>
      </div>
    );
  }

  // ❓ Fallback
    return (
      <div className="p-12 text-center text-red-500">
        Something went wrong. Please try again later.
      </div>
    );
  }

  if (isCarError) {
    const status = carError?.response?.status;

    return (
      <div className="p-12 text-center">
        <AlertCircleIcon size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Car Information Unavailable</h2>
        <p className="text-gray-500 mb-6">
          {status === 404
            ? "The vehicle associated with this booking no longer exists."
            : "Unable to load vehicle details."}
        </p>
        <Link
          to="/dashboard/bookings"
          className="px-6 py-3 bg-green-500 text-white rounded-lg"
        >
          Back to My Bookings
        </Link>
      </div>
    );
  }

  if (isPaymentError || !currentPayment) {
    return (
      <div className="p-12 text-center">
        <AlertCircleIcon size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Payment Information Missing</h2>
        <p className="text-gray-500 mb-6">
          We couldn’t retrieve the payment details for this booking.
        </p>
        <Link
          to="/dashboard/support"
          className="px-6 py-3 bg-green-500 text-white rounded-lg"
        >
          Contact Support
        </Link>
      </div>
    );
  }

  const booking = {
    id: currentBooking.bookingId,
    userid: currentPayment.userId,
    status: currentBooking.status,
    carName: currentCar.name,
    carImage: currentCar.mainImage,
    pickupDate: formatDate(currentBooking.startDate),
    pickupTime: '10:00 AM',
    returnDate: formatDate(currentBooking.endDate),
    returnTime: '10:00 AM',
    pickupLocation: currentBooking.pickupLocation,
    returnLocation: currentBooking.returnLocation,
    paymentMethod: currentPayment.paymentMethod,
    proofOfPayment: currentPayment.paymentProof,
    rentalDays: (new Date(currentBooking.endDate) - new Date(currentBooking.startDate)) / (1000 * 60 * 60 * 24),
    pricePerDay: currentCar.pricePerDay,
    insurance: 0,
    reservationfee: 500,
    totalPrice: ((new Date(currentBooking.endDate) - new Date(currentBooking.startDate)) / (1000 * 60 * 60 * 24)) * currentCar.pricePerDay,
    submittedDate: formatDate(currentBooking.createdAt)
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const startDate = new Date(booking.pickupDate)
  startDate.setHours(0, 0, 0, 0)

  
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'declined':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'completed':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'ongoing':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircleIcon size={20} className="text-green-600" />
      case 'pending':
        return <ClockIcon size={20} className="text-yellow-600" />
      case 'declined':
        return <AlertCircleIcon size={20} className="text-red-600" />
      case 'completed':
        return <CheckCircleIcon size={20} className="text-blue-600" />
      case 'ongoing':
        return <ClockIcon size={20} className="text-purple-600" />
      case 'cancelled':
        return <AlertCircleIcon size={20} className="text-red-600" />
      default:
        return <AlertCircleIcon size={20} className="text-gray-600" />
    }
  }
  return (
    <div>
      <div className="flex items-center mb-6">
        <Link to="/dashboard/bookings" className="mr-4 text-gray-600 hover:text-gray-900">
          <ArrowLeftIcon size={20} />
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Booking Details
        </h1>
      </div>

      {/* Status Banner */}
      <div
        className={`rounded-lg border-2 p-6 mb-6 ${getStatusColor(booking.status)}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {getStatusIcon(booking.status)}
            <div className="ml-3">
              <h3 className="font-semibold text-lg">
                Booking {booking.status}
              </h3>
              <p className="text-sm opacity-90">
                {booking.status.toLowerCase() === 'pending'
                  ? 'Your payment is being verified. You will receive a confirmation email within 24 hours.'
                  : ''}
                {booking.status.toLowerCase() === 'approved'
                  ? 'Your booking is confirmed! We look forward to serving you.'
                  : ''}
                {booking.status.toLowerCase() === 'ongoing'
                  ? 'Your rental is currently ongoing. Enjoy your ride!'
                  : ''}
                {booking.status.toLowerCase() === 'declined'
                  ? <>Unfortunately, your booking was declined. Reason: <b>{currentBooking.declineReason || 'Not specified'}</b>. Please contact support for more information.</>
                  : ''}
                {booking.status.toLowerCase() === 'completed' &&
                  'This booking has been successfully completed. Thank you for choosing our service.'}
                {booking.status.toLowerCase() === 'cancelled' &&
                  'This booking has been cancelled. If you have any questions, please contact support.'}
              </p>
            </div>
          </div>
          <span className="text-2xl font-bold">{booking.id}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Car Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <CarIcon size={20} className="text-green-500 mr-2" />
              Vehicle Information
            </h2>
            <div className="flex items-center">
              <img
                src={booking.carImage}
                alt={booking.carName}
                className="w-32 h-24 object-cover rounded-lg mr-4"
              />
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {booking.carName}
                </h3>
                <p className="text-sm text-gray-600">
                  ₱{booking.pricePerDay} per day
                </p>
              </div>
            </div>
          </div>

          {/* Rental Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <CalendarIcon size={20} className="text-green-500 mr-2" />
              Rental Period
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Pickup</p>
                <p className="font-medium text-gray-800">
                  {booking.pickupDate}
                </p>
                <p className="text-sm text-gray-600">{booking.pickupTime}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Return</p>
                <p className="font-medium text-gray-800">
                  {booking.returnDate}
                </p>
                <p className="text-sm text-gray-600">{booking.returnTime}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">Total Rental Duration</p>
              <p className="text-lg font-semibold text-gray-800">
                {booking.rentalDays} Days
              </p>
            </div>
          </div>

          {/* Location Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <MapPinIcon size={20} className="text-green-500 mr-2" />
              Locations
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Pickup Location</p>
                <p className="font-medium text-gray-800">
                  {booking.pickupLocation}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Return Location</p>
                <p className="font-medium text-gray-800">
                  {booking.returnLocation}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <CreditCardIcon size={20} className="text-green-500 mr-2" />
              Payment Information
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-medium text-gray-800">
                  {booking.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Proof of Payment</span>
                <a
                  href={`${booking.proofOfPayment.replace(
                    `/upload/${booking.userid}`,
                    `/upload/${booking.userid}/fl_attachment:payment_proofs/`
                  )}`}
                  download
                  className="flex items-center text-green-600 hover:text-green-700 font-medium text-sm"
                >
                  <FileTextIcon size={16} className="mr-1" />
                  Download Proof
                  <DownloadIcon size={14} className="ml-1" />
                </a>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Submitted On</span>
                <span className="font-medium text-gray-800">
                  {booking.submittedDate}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Price Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Price Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Rental ({booking.rentalDays} days)
                </span>
                <span className="text-gray-800">
                  ₱{booking.pricePerDay * booking.rentalDays}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Insurance</span>
                <span className="text-gray-800">Free</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Reservation Fee</span>
                <span className="text-gray-800">₱{booking.reservationfee}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-800">Total</span>
                  <span className="font-bold text-2xl text-green-600">
                    ₱{booking.totalPrice + booking.reservationfee}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              {booking.status.toLowerCase() === 'approved' && startDate > today && (
                <button
                  onClick={() => navigate(`/dashboard/bookingdetails/modify/${currentBooking.bookingId}`)}
                  className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  Modify Booking
                </button>
              )}
              {booking.status.toLowerCase() === 'approved' && startDate > today && (
                <button
                  onClick={() =>
                    navigate(`/dashboard/bookings/${currentBooking._id}/cancel`)
                  }
                  className="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  Cancel Booking
                </button>
              )}
              <button className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                Download Receipt
              </button>
              <Link
                to="/dashboard/support"
                className="block w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center"
              >
                Contact Support
              </Link>
            </div>

            {/* Important Notes */}
            {booking.status.toLowerCase() === 'pending' && (
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-xs font-medium text-yellow-900 mb-1">
                  ⏳ Pending Verification
                </p>
                <p className="text-xs text-yellow-800">
                  We're verifying your payment. This usually takes less than 24
                  hours. You'll receive an email once confirmed.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
export default BookingDetails

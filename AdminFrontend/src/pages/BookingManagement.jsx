import React, { useState, useEffect } from 'react'
import {
  SearchIcon,
  FilterIcon,
  CalendarIcon,
  MapPinIcon,
  UserIcon,
  CarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  FileTextIcon,
  ZoomInIcon,
  MailIcon,
  PhoneIcon,
  DollarSignIcon,
  AlertCircleIcon,
} from 'lucide-react'
import { ConfirmationModal } from './ConfirmationModal'
import { toast, Toaster } from 'sonner'
import { useSearchParams } from "react-router-dom"
import axios from 'axios'

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString("en-us", options)
}

const AdminBookingManagement = () => {
  const [searchParams] = useSearchParams()
  const API = import.meta.env.VITE_API_URL || "http://localhost:5001";
  const [bookings, setBookings] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState(
    'pending',
  )
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [declineReason, setDeclineReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const bookingId = searchParams.get("bookingId")

  useEffect(() => {
    const fetchBookings = async () => {
    try {
      const response = await axios.get(`${API}/api/bookings`, {withCredentials: true});
      const bookings = response.data.bookings;
      console.log("Fetched Bookings:", bookings);

      // Build all booking data in parallel
      const detailedBookings = await Promise.all(
        bookings.map(async (currentBooking) => {
          const renterFetch = await axios.get(`${API}/api/users/${currentBooking.renterId}`, {withCredentials: true});
          const renter = renterFetch.data.user;

          const carFetch = await axios.get(`${API}/api/cars/${currentBooking.carId}`, {withCredentials: true});
          const car = carFetch.data.car;

          const paymentFetch = await axios.get(`${API}/api/payments/${currentBooking.transactions[currentBooking.modifiedCount]}`, {withCredentials: true});
          const payment = paymentFetch.data.payment;

          const rentalDays =
            (new Date(currentBooking.endDate) - new Date(currentBooking.startDate)) / (1000 * 60 * 60 * 24);

          return {
            bookingid: currentBooking._id,
            id: currentBooking.bookingId,
            userId: renter.userId,
            userName: `${renter.firstName} ${renter.lastName}`,
            userEmail: renter.email,
            userPhone: renter.phoneNumber,
            carName: car.name,
            carImage: car.mainImage,
            carId: car.carId,
            pickupDate: formatDate(currentBooking.startDate),
            pickupTime: "10:00 AM",
            returnDate: formatDate(currentBooking.endDate),
            returnTime: "10:00 AM",
            pickupLocation: currentBooking.pickupLocation,
            returnLocation: currentBooking.returnLocation,
            rentalDays,
            pricePerDay: car.pricePerDay,
            insurance: "FREE",
            reservationFee: 500,
            totalPrice: currentBooking.totalPrice,
            paymentMethod: payment.paymentMethod,
            proofOfPayment: 'proof_of_payment.jpg',
            proofOfPaymentUrl: payment.paymentProof,
            submittedDate: currentBooking.createdAt,
            status: currentBooking.status,
            history: currentBooking.history.length,
          };
        })
      );

      setBookings(detailedBookings);
    } catch (error) {
      toast.error('Failed to fetch bookings');
      console.error('Error fetching bookings:', error);
    }
  };

  fetchBookings();
}, []);

  if (bookingId && !selectedBooking) {
    console.log("Searching for bookingId from URL:", bookingId);
    const booking = bookings.find((b) => b.id === bookingId)
    if (booking) {
      console.log("Found booking from URL:", booking)
      setSelectedBooking(booking)
    }
  }


  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.carName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      filterStatus === 'all' || booking.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status) => {
  const configs = {
    pending: {
      label: 'Pending Review',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    approved: {
      label: 'Approved',
      color: 'bg-green-100 text-green-800 border-green-200',
    },
    declined: {
      label: 'Declined',
      color: 'bg-red-100 text-red-800 border-red-200',
    },
    completed: {
      label: 'Completed',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    ongoing: {
      label: 'Ongoing',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    cancelled: {
      label: 'Cancelled',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
    },
  }

  const config = configs[status.toLowerCase()] || {
    label: status,
    color: 'bg-gray-100 text-gray-800 border-gray-200',
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}
    >
      {config.label}
    </span>
  )
  }

  const handleApprove = async () => {
    if (!selectedBooking) return
    setIsProcessing(true)
    try {
      await axios.put(`${API}/api/bookings/approve/${selectedBooking.bookingid}`, {}, {withCredentials: true});
      toast.success(`Booking ${selectedBooking.id} approved successfully!`)
    } catch (error) {
       toast.error('Failed to approve booking');
      console.error(error);
    }
    setTimeout(() => {
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === selectedBooking.id
            ? {
                ...booking,
                status: 'approved',
              }
            : booking,
        ),
      )
      setIsProcessing(false)
      setShowApproveModal(false)
      setSelectedBooking(null)
    }, 1500)
  }

  const handleDecline = async () => {
    if (!selectedBooking || !declineReason.trim()) {
      toast.error('Please provide a reason for declining')
      return
    }
    try {
      await axios.put(
        `${API}/api/bookings/decline/${selectedBooking.bookingid}`,
        { declineReason: declineReason.trim() },
        {withCredentials: true}
      );
    } catch (error) {
      toast.error(error.response.data.message);
      console.error(error);
    }
    setIsProcessing(true)
    setTimeout(() => {
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === selectedBooking.id
            ? {
                ...booking,
                status: 'declined',
              }
            : booking,
        ),
      )
      toast.success(`Booking ${selectedBooking.id} declined`)
      setIsProcessing(false)
      setShowDeclineModal(false)
      setSelectedBooking(null)
      setDeclineReason('')
    }, 1500)
  }

  const statsData = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status.toLowerCase() === 'pending').length,
    approved: bookings.filter((b) => b.status.toLowerCase() === 'approved').length,
    declined: bookings.filter((b) => b.status.toLowerCase() === 'declined').length,
    ongoing: bookings.filter((b) => b.status.toLowerCase() === 'ongoing').length,
    completed: bookings.filter((b) => b.status.toLowerCase() === 'completed').length,
  }

  return (
    <>
      <Toaster position="top-right" richColors />
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Booking Management
            </h1>
            <p className="text-gray-600 mt-1">
              Review and manage customer bookings
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Total Bookings
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {statsData.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <CalendarIcon size={24} className="text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700 font-medium">
                  Pending Review
                </p>
                <p className="text-3xl font-bold text-yellow-900 mt-1">
                  {statsData.pending}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <ClockIcon size={24} className="text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Approved</p>
                <p className="text-3xl font-bold text-green-900 mt-1">
                  {statsData.approved}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircleIcon size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">
                  Ongoing
                </p>
                <p className="text-3xl font-bold text-blue-900 mt-1">
                  {statsData.ongoing}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <CarIcon size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-teal-700 font-medium">Completed</p>
                <p className="text-3xl font-bold text-teal-900 mt-1">
                  {statsData.completed}
                </p>
              </div>
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <CheckCircleIcon size={24} className="text-teal-600" />
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 font-medium">Declined</p>
                <p className="text-3xl font-bold text-red-900 mt-1">
                  {statsData.declined}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircleIcon size={24} className="text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <SearchIcon
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by customer name, email, booking ID, or car..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="declined">Declined</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="ongoing">Ongoing</option>
            </select>
          </div>
        </div>

        {/* Bookings List/Detail View */}
        {selectedBooking ? (
          // Detailed View
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-white">
                  <button
                    onClick={() => {
                      setSelectedBooking(null)
                      searchParams.delete("bookingId")
                    }}
                    className="mr-4 hover:bg-white/20 p-2 rounded-lg transition-colors"
                  >
                    ←
                  </button>
                  <div>
                    <h2 className="text-xl font-bold">Booking Details</h2>
                    <p className="text-green-100 text-sm">
                      ID: {selectedBooking.id}
                    </p>
                  </div>
                </div>
                <div className='flex items-center space-x-2'>
                  {getStatusBadge(selectedBooking.status)}
                  {(selectedBooking.history > 0) && (
                    <span className="px-3 py-1 text-xs font-medium rounded-full
                                    bg-blue-100 text-blue-700 border border-blue-200">
                      Modify Booking
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - 2 columns */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Customer Information */}
                  <div className="bg-gray-50 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <UserIcon size={20} className="text-green-500 mr-2" />
                      Customer Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Full Name</p>
                        <p className="font-medium text-gray-800">
                          {selectedBooking.userName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Email</p>
                        <p className="font-medium text-gray-800 flex items-center text-sm">
                          <MailIcon size={14} className="mr-1 text-gray-400" />
                          {selectedBooking.userEmail}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Phone</p>
                        <p className="font-medium text-gray-800 flex items-center text-sm">
                          <PhoneIcon size={14} className="mr-1 text-gray-400" />
                          {selectedBooking.userPhone}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">User ID</p>
                        <p className="font-medium text-gray-800">
                          {selectedBooking.userId}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <CarIcon size={20} className="text-green-500 mr-2" />
                      Vehicle Information
                    </h3>
                    <div className="flex items-center">
                      <img
                        src={selectedBooking.carImage}
                        alt={selectedBooking.carName}
                        className="w-32 h-24 object-cover rounded-lg mr-4"
                      />
                      <div>
                        <h4 className="text-xl font-semibold text-gray-800">
                          {selectedBooking.carName}
                        </h4>
                        {/* <p className="text-sm text-gray-600">
                          Car ID: {selectedBooking.carId}
                        </p> */}
                        <p className="text-sm text-gray-600">
                          ₱{selectedBooking.pricePerDay} per day
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Rental Details */}
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <CalendarIcon size={20} className="text-green-500 mr-2" />
                      Rental Period
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Pickup</p>
                        <p className="font-medium text-gray-800">
                          {selectedBooking.pickupDate}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedBooking.pickupTime}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Return</p>
                        <p className="font-medium text-gray-800">
                          {selectedBooking.returnDate}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedBooking.returnTime}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500">Total Duration</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {selectedBooking.rentalDays} Days
                      </p>
                    </div>
                  </div>

                  {/* Locations */}
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <MapPinIcon size={20} className="text-green-500 mr-2" />
                      Locations
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Pickup Location
                        </p>
                        <p className="font-medium text-gray-800">
                          {selectedBooking.pickupLocation}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Return Location
                        </p>
                        <p className="font-medium text-gray-800">
                          {selectedBooking.returnLocation}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Proof */}
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <FileTextIcon size={20} className="text-green-500 mr-2" />
                      Payment Proof
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Payment Method
                        </span>
                        <span className="font-medium text-gray-800">
                          {selectedBooking.paymentMethod}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-2">
                          Uploaded Document
                        </p>
                        <div className="relative group">
                          <img
                            src={selectedBooking.proofOfPaymentUrl}
                            alt="Payment Proof"
                            className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <button
                            onClick={() =>
                              setImagePreview({
                                url: selectedBooking.proofOfPaymentUrl,
                                title: 'Payment Proof',
                              })
                            }
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg"
                          >
                            <ZoomInIcon size={32} className="text-white" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          File: {selectedBooking.proofOfPayment}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar - 1 column */}
                <div className="lg:col-span-1">
                  <div className="bg-white border border-gray-200 rounded-lg p-5 sticky top-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Price Summary
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Rental ({selectedBooking.rentalDays} days)
                        </span>
                        <span className="text-gray-800">
                          ₱
                          {selectedBooking.pricePerDay *
                            selectedBooking.rentalDays}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Insurance</span>
                        <span className="text-gray-800">
                          {selectedBooking.insurance}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Reservation Fee</span>
                        <span className="text-gray-800">
                          ₱{selectedBooking.reservationFee}
                        </span>
                      </div>
                      <div className="border-t border-gray-200 pt-3 mt-3">
                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-800">
                            Total
                          </span>
                          <span className="font-bold text-2xl text-green-600">
                            ₱{selectedBooking.totalPrice}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Submitted On</p>
                      <p className="font-medium text-gray-800 mb-4">
                        {new Date(selectedBooking.submittedDate).toLocaleString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                          timeZone: "Asia/Manila",
                        })}
                      </p>

                      {selectedBooking.status.toLowerCase() === 'pending' && (
                        <div className="space-y-3">
                          <button
                            onClick={() => setShowApproveModal(true)}
                            className="w-full flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                          >
                            <CheckCircleIcon size={18} className="mr-2" />
                            Approve Booking
                          </button>
                          <button
                            onClick={() => setShowDeclineModal(true)}
                            className="w-full flex items-center justify-center px-4 py-3 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                          >
                            <XCircleIcon size={18} className="mr-2" />
                            Decline Booking
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // List View
          <div className="space-y-4">
            {filteredBookings.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
                <AlertCircleIcon
                  size={48}
                  className="text-gray-300 mx-auto mb-4"
                />
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  No bookings found
                </h3>
                <p className="text-gray-500">
                  {searchQuery
                    ? 'Try adjusting your search or filters'
                    : 'No bookings to display'}
                </p>
              </div>
            ) : (
              filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedBooking(booking)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={booking.carImage}
                        alt={booking.carName}
                        className="w-20 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {booking.carName}
                        </h3>
                        <p className="text-sm text-gray-500">Booking ID: {booking.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(booking.status)}
                      {(booking.history > 0) && (
                        <span className="px-3 py-1 text-xs font-medium rounded-full
                                        bg-blue-100 text-blue-700 border border-blue-200">
                          Modify Booking
                        </span>
                      )}
                    </div> 
                    
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Customer</p>
                      <p className="font-medium text-gray-800">
                        {booking.userName}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Pickup Date</p>
                      <p className="font-medium text-gray-800">
                        {booking.pickupDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Duration</p>
                      <p className="font-medium text-gray-800">
                        {booking.rentalDays} days
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Total Amount</p>
                      <p className="font-bold text-green-600">
                        ₱{booking.totalPrice}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {imagePreview && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setImagePreview(null)}
        >
          <div className="max-w-4xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-xl font-semibold">
                {imagePreview.title}
              </h3>
              <button
                onClick={() => setImagePreview(null)}
                className="text-white hover:text-gray-300 text-2xl"
              >
                ×
              </button>
            </div>
            <img
              src={imagePreview.url}
              alt={imagePreview.title}
              className="w-full h-auto rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      <ConfirmationModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApprove}
        title="Approve Booking"
        message={`Are you sure you want to approve booking ${selectedBooking?.id} for ${selectedBooking?.userName}? The customer will receive a confirmation email.`}
        confirmText="Yes, Approve"
        cancelText="Cancel"
        variant="success"
        isLoading={isProcessing}
      />

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Decline Booking
            </h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for declining booking{' '}
              {selectedBooking?.id}. This will be sent to the customer.
            </p>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Enter decline reason..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowDeclineModal(false)
                  setDeclineReason('')
                }}
                disabled={isProcessing}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDecline}
                disabled={isProcessing || !declineReason.trim()}
                className="flex items-center px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-2"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Declining...
                  </>
                ) : (
                  'Decline Booking'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
export default AdminBookingManagement

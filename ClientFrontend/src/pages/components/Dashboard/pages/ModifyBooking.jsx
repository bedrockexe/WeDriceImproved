import React, { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeftIcon,
  CalendarIcon,
  MapPinIcon,
  HomeIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  SaveIcon,
  CreditCardIcon,
  UploadIcon,
  FileTextIcon,
  DollarSignIcon,
  ArrowRightIcon
} from 'lucide-react'
import { toast, Toaster } from 'sonner'
import { ConfirmationModal } from '../components/UI/ConfirmationModal'
import axios from 'axios'
import { useQuery, useQueryClient } from '@tanstack/react-query';
import DatePicker from 'react-datepicker';
import { useAuth } from "@/authentication/AuthContext"


const ModifyBooking = () => {
  const { bookingId } = useParams()
  const {user} = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState({})
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const userHomeAddress = user.address
  const [currentStep, setCurrentStep] = useState(1);
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const {
    data: originalBooking,
    isLoading,
    isError,
    error: bookingError
  } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: async () => {
      const res = await axios.get(`${API}/api/bookings/modify-check/${bookingId}`, {
        withCredentials: true
      });
      return res.data.booking;
    },
    retry: false
  });


  const {
    data: currentCar,
    isLoading: carLoading,
    isError: carError
  } = useQuery({
    queryKey: ["car", originalBooking?.carId],
    queryFn: async () => {
      const res = await axios.get(`${API}/api/cars/${originalBooking.carId}`);
      return res.data.car;
    },
    enabled: !!originalBooking?.carId,
    retry: false
  });


  const {
    data: carBookings,
    isError: carBookingsError
  } = useQuery({
    queryKey: ["carBookings", currentCar?.carId, bookingId],
    queryFn: () =>
      axios
        .get(`${API}/api/bookings/car/${currentCar.carId}/exclude/${bookingId}`)
        .then(res => res.data.bookings),
    enabled: !!currentCar?.carId,
    retry: false
  });

  if (isLoading || carLoading) {
    return <div className="p-12 text-center">Loading booking...</div>;
  } 

  if (isError) {
    const status = bookingError?.response?.status;

    return (
      <div className="p-12 text-center">
        <AlertCircleIcon size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold mb-2">
          {status === 403
            ? "Access Denied"
            : "Booking Not Found"}
        </h2>
        <p className="text-gray-500 mb-6">
          {status === 403
            ? "You are not allowed to modify this booking."
            : "The booking does not exist or was removed."}
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

  const nonEditableStatuses = ["completed", "ongoing", "cancelled"];

  if (nonEditableStatuses.includes(originalBooking.status)) {
    return (
      <div className="p-12 text-center">
        <AlertCircleIcon size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold mb-2">
          Booking Cannot Be Modified
        </h2>
        <p className="text-gray-500 mb-6">
          This booking is already <strong>{originalBooking.status}</strong> and can no longer be modified.
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

  if (!currentCar || carError) {
    return (
      <div className="p-12 text-center">
        <AlertCircleIcon size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold mb-2">
          Vehicle Unavailable
        </h2>
        <p className="text-gray-500 mb-6">
          The vehicle associated with this booking no longer exists.
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





  const [bookingData, setBookingData] = useState(originalBooking)

  useEffect(() => {
    if (originalBooking) {
      setBookingData({
        pickupDate: originalBooking.startDate,
        returnDate: originalBooking.endDate,
        pickupLocationType: originalBooking.pickupLocationType || '',
        returnLocationType: originalBooking.returnLocationType || '',
        pickupLocation: originalBooking.pickupLocation || '',
        returnLocation: originalBooking.returnLocation || '',
        paymentMethod: '',
        proofOfPayment: null,
      });
    }
  }, [originalBooking]);


  const disabledRanges = carBookings?.map(b => ({
    start: new Date(b.startDate),
    end: new Date(b.endDate)
  })) || [];

  const calculatePriceDifference = () => {
    return calculateTotal() - originalBooking.totalPrice
  }

  const getMinimumAvailableDate = () => {
    const base = new Date();
    base.setDate(base.getDate() + 1);

    // If tomorrow is inside any disabled range, return the day AFTER that range
    for (const range of disabledRanges) {
      if (base >= range.start && base <= range.end) {
        const nextAvailable = new Date(range.end);
        nextAvailable.setDate(nextAvailable.getDate() + 1);
        return nextAvailable;
      }
    }

    return base;
  };

  const getPickupMaxDate = () => {
    if (!disabledRanges.length) return null;

    // Sort ranges
    const sorted = [...disabledRanges].sort((a, b) => a.start - b.start);

    // Find the FIRST booked range that is AFTER tomorrow
    const base = getMinimumAvailableDate();
    const upcoming = sorted.find(range => range.start > base);

    if (!upcoming) return null;

    // Last available date is the day before the next booking starts
    const max = new Date(upcoming.start);
    max.setDate(max.getDate() - 1);
    return max;
  };

  const getReturnMinDate = () => {
    if (!bookingData.pickupDate) return null;
    const d = new Date(bookingData.pickupDate);
    d.setDate(d.getDate() + 1);
    return d;
  };

  const getReturnMaxDate = () => {
  if (!bookingData.pickupDate) return null;

  const pickup = new Date(bookingData.pickupDate);

  // Sort booked ranges
  const sorted = [...disabledRanges].sort((a, b) => a.start - b.start);

  // Find the first booking that starts AFTER pickup date
  const nextBooking = sorted.find(range => range.start > pickup);

  if (!nextBooking) return null; // no upcoming booking

  // Return the day before next booking start
  const max = new Date(nextBooking.start);
  max.setDate(max.getDate() - 1);
  return max;
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const calculateTotal = () => {
    if (!bookingData.pickupDate || !bookingData.returnDate) return 0
    const days = Math.ceil(
      (new Date(bookingData.returnDate).getTime() -
        new Date(bookingData.pickupDate).getTime()) /
        (1000 * 60 * 60 * 24),
    )
    return days * currentCar.pricePerDay
  }

  const originalDays = Math.ceil(
    (new Date(originalBooking.endDate) - new Date(originalBooking.startDate)) /
      (1000 * 60 * 60 * 24)
  );

  const newDays = bookingData.pickupDate && bookingData.returnDate
    ? Math.ceil(
        (new Date(bookingData.returnDate) - new Date(bookingData.pickupDate)) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  const isExtendingBooking = () => newDays > originalDays;

  const priceDifference = () => {
    const originalTotal = originalDays * currentCar.pricePerDay;
    const newTotal = calculateTotal();
    return newTotal - originalTotal;
  };


  const getDayClass = (date) => {
    const d = new Date(date);
    d.setHours(0,0,0,0);

    // Loop through disabled ranges
    for (const range of disabledRanges) {
      const start = new Date(range.start);
      const end = new Date(range.end);
      start.setHours(0,0,0,0);
      end.setHours(0,0,0,0);

      if (d >= start && d <= end) {
        return "react-datepicker__day--booked"; // ⭐ highlight red
      }
    }

    return "";
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const validateForm = () => {
    const newErrors = {}
    if (!bookingData.pickupDate) {
      newErrors.pickupDate = 'Pickup date is required'
    }
    if (!bookingData.returnDate) {
      newErrors.returnDate = 'Return date is required'
    }
    if (bookingData.pickupDate && bookingData.returnDate) {
      if (new Date(bookingData.returnDate) <= new Date(bookingData.pickupDate)) {
        newErrors.returnDate = 'Return date must be after pickup date'
      }
    }
    if (!bookingData.pickupLocationType) {
      newErrors.pickupLocation = 'Please select a pickup location type'
    }
    if (bookingData.pickupLocationType === 'custom' && !bookingData.pickupLocation) {
      newErrors.pickupLocation = 'Please enter pickup location'
    }
    if (!bookingData.returnLocationType) {
      newErrors.returnLocation = 'Please select a return location type'
    }
    if (bookingData.returnLocationType === 'custom' && !bookingData.returnLocation) {
      newErrors.returnLocation = 'Please enter return location'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before continuing");
      return;
    }

    if (isExtendingBooking()) {
      // Go to payment step
      setCurrentStep(2);
    } else {
      // Shortening or same price → direct confirmation
      setShowConfirmModal(true);
    }
  };

  const hasChanges = () => {
    return (
      bookingData.pickupDate !== originalBooking.startDate ||
      bookingData.returnDate !== originalBooking.endDate ||
      bookingData.pickupLocation !== originalBooking.pickupLocation ||
      bookingData.returnLocation !== originalBooking.returnLocation
    )
  }

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      setBookingData({
        ...bookingData,
        proofOfPayment: file,
      })
    }
  }

  const handleNext = () => {
      if (!validateForm()) {
        toast.error('Please fix the errors before continuing')
        return
      }
      // If extending booking, go to payment step
      if (isExtendingBooking()) {
        setCurrentStep(2)
      } else {
        // If shortening, show refund confirmation
        setShowConfirmModal(true)
      }
  }

  const handlePaymentSubmit = () => {
    if (!bookingData.paymentMethod || !bookingData.proofOfPayment) {
      toast.error('Please select payment method and upload proof of payment')
      return
    }
    setShowConfirmModal(true)
  }

  const handleConfirmModification = async () => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("startDate", bookingData.pickupDate);
      formData.append("endDate", bookingData.returnDate);
      formData.append("pickupLocation", bookingData.pickupLocation);
      formData.append("returnLocation", bookingData.returnLocation);
      formData.append("amountPaid", calculateTotal());

      if (bookingData.paymentMethod) {
        formData.append("paymentMethod", bookingData.paymentMethod);
      }

      if (bookingData.proofOfPayment) {
        formData.append("proofOfPayment", bookingData.proofOfPayment);
      }

      await axios.put(
        `${API}/api/bookings/modify/${bookingId}`,
        formData,
        { withCredentials: true }
      );

      queryClient.invalidateQueries({ queryKey: ["carBookings"] })
      queryClient.invalidateQueries({ queryKey: ["currentCar"] })
      queryClient.invalidateQueries({ queryKey: ["booking"] })


      toast.success("Booking modification submitted for approval");

      setShowConfirmModal(false);

      setTimeout(() => {
        navigate(`/dashboard/bookingdetails/${bookingId}`);
      }, 1500);

    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to modify booking"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!originalBooking) {
    return (
      <div>
        <div className="flex items-center mb-6">
          <Link
            to="/dashboard/bookings"
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon size={20} />
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Modify Booking
          </h1>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
          <AlertCircleIcon size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Booking Not Found
          </h3>
          <p className="text-gray-500 mb-6">
            The booking you're trying to modify doesn't exist.
          </p>
          <Link
            to="/dashboard/bookings"
            className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            Back to My Bookings
          </Link>
        </div>
      </div>
    )
  }

  const paymentMethods = [
    'Bank Transfer',
    'GCash',
    'PayMaya',
    'Credit Card',
    'Debit Card',
    'Cash',
  ]

  return (
    <>
      <Toaster position="top-right" richColors />
      <div>
        <div className="flex items-center mb-6">
          <Link
            to={`/dashboard/bookings`}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon size={20} />
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Modify Booking
          </h1>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircleIcon
              size={20}
              className="text-blue-600 mr-3 mt-0.5 flex-shrink-0"
            />
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">
                Important Information
              </p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Modifications are subject to availability</li>
                <li>• Price may change based on new dates</li>
                <li>
                  • Changes made less than 48 hours before pickup may incur fees
                </li>
              </ul>
            </div>
          </div>
        </div>

        {currentStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-lg shadow-sm border border-gray-100 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Booking Details
              </h2>

              {/* Current Booking Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center mb-3">
                  <img
                    src={currentCar.mainImage}
                    alt={currentCar.name}
                    className="w-20 h-14 object-cover rounded-md mr-3"
                  />
                  <div>
                    <p className="font-medium text-gray-800">
                      {currentCar.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Booking ID: {originalBooking.bookingId}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <CalendarIcon size={18} className="text-green-500 mr-2" />
                  Rental Period
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pickup Date
                    </label>
                    <DatePicker
                      selected={bookingData.pickupDate ? new Date(bookingData.pickupDate) : null}
                      onChange={(date) =>
                        setBookingData({
                          ...bookingData,
                          pickupDate: formatDate(date),
                          returnDate: ""
                        })
                      }
                      minDate={getMinimumAvailableDate()}
                      maxDate={getPickupMaxDate()}
                      excludeDateIntervals={disabledRanges}
                      dayClassName={getDayClass}
                      placeholderText="Choose a pickup date"
                      dateFormat="MMMM d, yyyy"
                      className="w-full bg-white pl-4 pr-10 py-2 border border-gray-300 rounded-md 
                                focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    {errors.pickupDate && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.pickupDate}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Return Date
                    </label>
                    <DatePicker
                      selected={bookingData.returnDate ? new Date(bookingData.returnDate) : null}
                      onChange={(date) =>
                        setBookingData({
                          ...bookingData,
                          returnDate: formatDate(date),
                        })
                      }
                      minDate={getReturnMinDate()}
                      maxDate={getReturnMaxDate()}
                      excludeDateIntervals={disabledRanges}
                      placeholderText="Choose a return date"
                      dateFormat="MMMM d, yyyy"
                      className="w-full bg-white pl-4 pr-10 py-2 border border-gray-300 rounded-md 
                                focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      disabled={!bookingData.pickupDate}
                    />
                    {errors.returnDate && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.returnDate}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Pickup Location */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <MapPinIcon size={18} className="text-green-500 mr-2" />
                  Pickup Location
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() =>
                      setBookingData({
                        ...bookingData,
                        pickupLocationType: 'home',
                        pickupLocation: userHomeAddress,
                      })
                    }
                    className={`p-4 border-2 rounded-lg transition-all text-left ${bookingData.pickupLocationType === 'home' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="flex items-start">
                      <div
                        className={`p-2 rounded-lg ${bookingData.pickupLocationType === 'home' ? 'bg-green-100' : 'bg-gray-100'}`}
                      >
                        <HomeIcon
                          size={20}
                          className={
                            bookingData.pickupLocationType === 'home'
                              ? 'text-green-600'
                              : 'text-gray-600'
                          }
                        />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="font-medium text-gray-900">
                          Home Address
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {userHomeAddress}
                        </p>
                      </div>
                      {bookingData.pickupLocationType === 'home' && (
                        <CheckCircleIcon
                          size={20}
                          className="text-green-500 flex-shrink-0"
                        />
                      )}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setBookingData({
                        ...bookingData,
                        pickupLocationType: 'custom',
                      })
                    }
                    className={`p-4 border-2 rounded-lg transition-all text-left ${bookingData.pickupLocationType === 'custom' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="flex items-start">
                      <div
                        className={`p-2 rounded-lg ${bookingData.pickupLocationType === 'custom' ? 'bg-green-100' : 'bg-gray-100'}`}
                      >
                        <MapPinIcon
                          size={20}
                          className={
                            bookingData.pickupLocationType === 'custom'
                              ? 'text-green-600'
                              : 'text-gray-600'
                          }
                        />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="font-medium text-gray-900">
                          Custom Address
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Enter a different address
                        </p>
                      </div>
                      {bookingData.pickupLocationType === 'custom' && (
                        <CheckCircleIcon
                          size={20}
                          className="text-green-500 flex-shrink-0"
                        />
                      )}
                    </div>
                  </button>
                </div>

                {bookingData.pickupLocationType === 'custom' && (
                  <div>
                    <input
                      type="text"
                      placeholder="Enter pickup address"
                      value={bookingData.pickupLocation}
                      onChange={(e) => {
                        setBookingData({
                          ...bookingData,
                          pickupLocation: e.target.value,
                        })
                        if (errors.pickupLocation)
                          setErrors({
                            ...errors,
                            pickupLocation: '',
                          })
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.pickupLocation ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                    />
                    {errors.pickupLocation && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.pickupLocation}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Return Location */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Return Location
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() =>
                      setBookingData({
                        ...bookingData,
                        returnLocationType: 'home',
                        returnLocation: userHomeAddress,
                      })
                    }
                    className={`p-4 border-2 rounded-lg transition-all text-left ${bookingData.returnLocationType === 'home' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="flex items-start">
                      <div
                        className={`p-2 rounded-lg ${bookingData.returnLocationType === 'home' ? 'bg-green-100' : 'bg-gray-100'}`}
                      >
                        <HomeIcon
                          size={20}
                          className={
                            bookingData.returnLocationType === 'home'
                              ? 'text-green-600'
                              : 'text-gray-600'
                          }
                        />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="font-medium text-gray-900">
                          Home Address
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {userHomeAddress}
                        </p>
                      </div>
                      {bookingData.returnLocationType === 'home' && (
                        <CheckCircleIcon
                          size={20}
                          className="text-green-500 flex-shrink-0"
                        />
                      )}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setBookingData({
                        ...bookingData,
                        returnLocationType: 'custom',
                      })
                    }
                    className={`p-4 border-2 rounded-lg transition-all text-left ${bookingData.returnLocationType === 'custom' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="flex items-start">
                      <div
                        className={`p-2 rounded-lg ${bookingData.returnLocationType === 'custom' ? 'bg-green-100' : 'bg-gray-100'}`}
                      >
                        <MapPinIcon
                          size={20}
                          className={
                            bookingData.returnLocationType === 'custom'
                              ? 'text-green-600'
                              : 'text-gray-600'
                          }
                        />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="font-medium text-gray-900">
                          Custom Address
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Enter a different address
                        </p>
                      </div>
                      {bookingData.returnLocationType === 'custom' && (
                        <CheckCircleIcon
                          size={20}
                          className="text-green-500 flex-shrink-0"
                        />
                      )}
                    </div>
                  </button>
                </div>

                {bookingData.returnLocationType === 'custom' && (
                  <div>
                    <input
                      type="text"
                      placeholder="Enter return address"
                      value={bookingData.returnLocation}
                      onChange={(e) => {
                        setBookingData({
                          ...bookingData,
                          returnLocation: e.target.value,
                        })
                        if (errors.returnLocation)
                          setErrors({
                            ...errors,
                            returnLocation: '',
                          })
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.returnLocation ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                    />
                    {errors.returnLocation && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.returnLocation}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <Link
                  to={`/bookings/${bookingId}`}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </Link>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!hasChanges()}
                  className="flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                  <ArrowRightIcon size={18} className="ml-2" />
                </button>
              </div>
            </form>
          </div>


          {/* Sidebar - Price Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Price Comparison
              </h2>

              {/* Original Booking */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Original Booking</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {originalDays} days
                  </span>
                  <span className="text-gray-800">
                    ₱{originalBooking.totalPrice}
                  </span>
                </div>
              </div>
                {/* New Booking */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Rental (
                    {bookingData.pickupDate && bookingData.returnDate
                      ? Math.ceil(
                          (new Date(bookingData.returnDate).getTime() -
                            new Date(bookingData.pickupDate).getTime()) /
                            (1000 * 60 * 60 * 24),
                        )
                      : 0}{' '}
                    days)
                  </span>
                  <span className="text-gray-800">₱{calculateTotal()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Insurance</span>
                  <span className="text-gray-800">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Reservation Fee</span>
                  <span className="text-gray-800">₱500</span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-800">
                      New Total
                    </span>
                    <span className="font-bold text-2xl text-green-600">
                      ₱{calculateTotal() + 500}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Difference Indicator */}
                {hasChanges() && bookingData.pickupDate && bookingData.returnDate && (
                  <div className="mt-4">
                    {isExtendingBooking() ? (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-orange-900">
                            Additional Payment
                          </span>
                          <span className="text-lg font-bold text-orange-600">
                            +₱{Math.abs(calculatePriceDifference())}
                          </span>
                        </div>
                        <p className="text-xs text-orange-800 mt-1">
                          Payment required for extended rental period
                        </p>
                      </div>
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-900">
                            Refund Amount
                          </span>
                          <span className="text-lg font-bold text-green-600">
                            ₱{Math.abs(calculatePriceDifference())}
                          </span>
                        </div>
                        <p className="text-xs text-green-800 mt-1">
                          Will be refunded to your original payment method
                        </p>
                      </div>
                    )}
                  </div>
                )}
            </div>
          </div>
        </div>
        )}
        
        {/* Step 2: Payment (only if extending) */}
        {currentStep === 2 && isExtendingBooking() && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Additional Payment Required
            </h2>

            {/* Payment Instructions */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-5 mb-6">
              <h3 className="font-semibold text-orange-900 mb-2">
                Payment Instructions
              </h3>
              <p className="text-sm text-orange-800 mb-3">
                You're extending your booking by{' '}
                {newDays - originalDays} day(s).
                Please pay the additional amount to confirm your modification.
              </p>
              <ol className="text-sm text-orange-800 space-y-1 list-decimal list-inside">
                <li>Select your payment method below</li>
                <li>Complete the payment for the additional amount</li>
                <li>Upload proof of payment (screenshot or receipt)</li>
                <li>We'll verify and update your booking within 24 hours</li>
              </ol>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <select
                value={bookingData.paymentMethod}
                onChange={(e) =>
                  setBookingData({
                    ...bookingData,
                    paymentMethod: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select payment method</option>
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>

            {/* Proof of Payment Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proof of Payment <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Upload a screenshot or photo of your payment receipt
              </p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors">
                <input
                  type="file"
                  id="payment-proof"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="payment-proof" className="cursor-pointer">
                  {bookingData.proofOfPayment ? (
                    <div className="flex flex-col items-center">
                      <FileTextIcon size={40} className="text-green-500 mb-3" />
                      <span className="text-sm font-medium text-gray-700 mb-1">
                        {bookingData.proofOfPayment.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        Click to change file
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <UploadIcon size={40} className="text-gray-400 mb-3" />
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG or PDF (max. 10MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Payment Amount */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">
                  Additional Amount to Pay
                </span>
                <span className="text-2xl font-bold text-orange-600">
                  ₱{Math.abs(calculatePriceDifference())}
                </span>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                <ArrowLeftIcon size={18} className="mr-2" />
                Back
              </button>
              <button
                onClick={handlePaymentSubmit}
                className="flex items-center px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                Submit Modification
                <CheckCircleIcon size={18} className="ml-2" />
              </button>
            </div>
          </div>
        )}
      
      
      
      </div>




      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmModification}
        title="Confirm Booking Modification"
        message={
          isExtendingBooking()
            ? `You are extending your booking. An additional payment of ₱${Math.abs(priceDifference())} is required.`
            : `You are shortening your booking. A refund of ₱${Math.abs(priceDifference())} will be processed.`
        }
        confirmText="Yes, Modify Booking"
        cancelText="Review Changes"
        variant="primary"
        isLoading={isSubmitting}
      />
    </>
  )
}
export default ModifyBooking

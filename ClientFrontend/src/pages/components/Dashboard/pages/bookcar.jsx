import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  CalendarIcon,
  MapPinIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  UploadIcon,
  FileTextIcon,
  HomeIcon
} from 'lucide-react'
import axios from 'axios'
import { useQueryClient } from "@tanstack/react-query";
import {ConfirmationModal} from "../components/UI/ConfirmationModal"
import { useQuery } from '@tanstack/react-query';
import { toast, Toaster } from 'sonner'
import DatePicker from 'react-datepicker';


const BookCar = () => {
  const navigate = useNavigate()
  const location = useLocation();
  const queryClient = useQueryClient();
  const selectedCar = location.state?.car;
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1)
  const [isVerified, setIsVerified] = useState(false)
  const [user, setUser] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    axios.get(`${API}/api/users/me`, { withCredentials: true })
      .then(res => {
        setUser(res.data.user);
        setIsVerified(res.data.user?.verificationStatus === "verified");
      })
      .catch(err => console.log(err));
  }, []);

  const { data: carBooking } = useQuery({
    queryKey: ["carBookings", selectedCar.carId],
    queryFn: () =>
      axios.get(`${API}/api/bookings/car/${selectedCar.carId}`).then(res => res.data.bookings),
    enabled: !!selectedCar?.carId
  });

  const disabledRanges = carBooking?.map(b => ({
    start: new Date(b.startDate),
    end: new Date(b.endDate)
  })) || [];

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


  const [bookingData, setBookingData] = useState({
    pickupDate: '',
    returnDate: '',
    pickupLocationType: '',
    returnLocationType: '',
    pickupLocation: '',
    returnLocation: '',
    paymentMethod: '',
    proofOfPayment: null,
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const paymentMethods = [
    'Bank Transfer',
    'GCash',
    'PayMaya',
    'Credit Card',
    'Debit Card',
    'Cash',
  ]

  const steps = [
    { number: 1, name: 'Dates', icon: CalendarIcon },
    { number: 2, name: 'Review', icon: CheckCircleIcon },
    { number: 3, name: 'Payment', icon: CreditCardIcon },
    { number: 4, name: 'Confirmation', icon: ShieldCheckIcon },
  ];

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



  // 🟩 Calculate rental total
  const calculateTotal = () => {
    if (!bookingData.pickupDate || !bookingData.returnDate) return 0
    const days = Math.ceil(
      (new Date(bookingData.returnDate) - new Date(bookingData.pickupDate)) /
        (1000 * 60 * 60 * 24)
    )
    return (days * selectedCar.pricePerDay) + 500 // + reservation fee
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
    if (currentStep === 1) {
      if (!bookingData.pickupDate || !bookingData.returnDate) {
        toast.error("Please choose your pickup and return dates.", { duration: 4000 });
        return;
      }

      const start = new Date(bookingData.pickupDate);
      const end = new Date(bookingData.returnDate);

      const overlaps = disabledRanges.some(range =>
        start <= range.end && end >= range.start
      );

      if (overlaps) {
        toast.error("Your selected dates overlap with an existing booking. Please choose another date range.", { duration: 4000 });
        return;
      }
    }
    if (currentStep === 3) {
      if (!bookingData.paymentMethod || !bookingData.proofOfPayment) {
        toast.error("Please complete all payment fields.", { duration: 4000 });
        return
      }
    }
    setCurrentStep(currentStep + 1)
  }

  const handleBack = () => setCurrentStep(currentStep - 1)

  // 🟩 Submit booking to backend
  const handleSubmit = async () => {
    setShowConfirmModal(true)
  };

  const handleConfirmBooking = async () => {
    setSubmitting(true)
    // Simulate API call
    try {
      const bookingFormData = new FormData();

      bookingFormData.append('renter', user.userId);
      bookingFormData.append('carid', selectedCar.carId);
      bookingFormData.append('startDate', bookingData.pickupDate);
      bookingFormData.append('endDate', bookingData.returnDate);
      bookingFormData.append('pickupLocation', bookingData.pickupLocationType === 'home' ? user.address : bookingData.pickupLocation);
      bookingFormData.append('returnLocation', bookingData.returnLocationType === 'home' ? user.address : bookingData.returnLocation);
      bookingFormData.append('paymentMethod', bookingData.paymentMethod);
      bookingFormData.append('proofOfPayment', bookingData.proofOfPayment);


      const res = await axios.post(`${API}/api/bookings/create`, bookingFormData, {
        withCredentials: true,
      });

      setBookingData(prev => ({
        ...prev,
        bookingID: res.data.booking.bookingId,
      }));

      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["currentuser"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    } catch (err) {
      console.log(err);
      alert("Booking failed.");
      setSubmitting(false);
    }
    setTimeout(() => {
      setSubmitting(false)
      setShowConfirmModal(false)
      setCurrentStep(4)
    }, 1500)
  }

  // 🟨 If user is NOT verified
  if (!isVerified) {
    return (
      <div>
        <div className="flex items-center mb-6">
          <button onClick={() => navigate('/dashboard/cars')} className="mr-4 text-gray-600 hover:text-gray-900">
            <ArrowLeftIcon size={20} />
          </button>
          <h1 className="text-2xl font-bold">Book a Car</h1>
        </div>

        <div className="bg-white border-2 border-yellow-300 rounded-lg p-8 text-center">
          <AlertCircleIcon size={48} className="text-yellow-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Identity Verification Required</h2>
          <p className="text-gray-600 mb-6">
            You must verify your identity before booking a car.
          </p>
          <Link
            to="/dashboard/verify-identity"
            className="px-6 py-3 bg-yellow-600 text-white rounded-md"
          >
            Verify Now
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
    <Toaster richColors />
    <div>
      {/* HEADER */}
      <div className="flex items-center mb-6">
        <button onClick={() => navigate('/dashboard/cars')} className="mr-4 text-gray-600 hover:text-gray-900">
          <ArrowLeftIcon size={20} />
        </button>
        <h1 className="text-2xl font-bold">Book a Car</h1>
      </div>

      {/* STEP INDICATOR */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === step.number
            const isCompleted = currentStep > step.number
            return (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isActive
                        ? 'bg-green-100 text-green-600 border-2 border-green-500'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircleIcon size={24} /> : <Icon size={24} />}
                  </div>
                  <p className={`text-xs mt-2 ${isActive ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                    {step.name}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* STEP 1 — Dates */}
      {currentStep === 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Select Dates and Location
          </h2>

          

          {/* Dates */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                    returnDate: "" // reset return date
                  })
                }
                minDate={getMinimumAvailableDate()}
                // maxDate={getPickupMaxDate()}
                excludeDateIntervals={disabledRanges}
                dayClassName={getDayClass}
                placeholderText="Choose a pickup date"
                dateFormat="MMMM d, yyyy"
                className="w-full bg-white pl-4 pr-10 py-2 border border-gray-300 rounded-md 
                          focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
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
            </div>

          </div>

          {/* Pickup Location */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Pickup Location
            </label>

            {/* Location Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <button
                type="button"
                onClick={() =>
                  setBookingData({
                    ...bookingData,
                    pickupLocationType: 'home',
                    pickupLocation: user.address,
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
                    <p className="font-medium text-gray-900">Home Address</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {user.address}
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
                    <p className="font-medium text-gray-900">Custom Address</p>
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

            {/* Custom Address Input */}
            {bookingData.pickupLocationType === 'custom' && (
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Enter pickup address"
                  value={bookingData.pickupLocation}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      pickupLocation: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Return Location */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Return Location
            </label>

            {/* Location Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <button
                type="button"
                onClick={() =>
                  setBookingData({
                    ...bookingData,
                    returnLocationType: 'home',
                    returnLocation: user.address,
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
                    <p className="font-medium text-gray-900">Home Address</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {user.address}
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
                    <p className="font-medium text-gray-900">Custom Address</p>
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

            {/* Custom Address Input */}
            {bookingData.returnLocationType === 'custom' && (
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Enter return address"
                  value={bookingData.returnLocation}
                  onChange={(e) => 
                    setBookingData({
                      ...bookingData,
                      returnLocation: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          
          {/* Selected Car */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-900 mb-2">Selected Car</h4>
            <div className="flex items-center">
              <img
                src={selectedCar.mainImage}
                alt={selectedCar.name}
                className="w-20 h-14 object-cover rounded-md mr-4"
              />
              <div>
                <p className="font-medium text-gray-800">
                  {selectedCar.name}
                </p>
                <p className="text-sm text-gray-600">
                  ₱{selectedCar.pricePerDay} per day
                </p>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <div className="flex justify-end">
            <button
              onClick={handleNext}
              className="flex items-center px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Continue
              <ArrowRightIcon size={18} className="ml-2" />
            </button>
          </div>
        </div>
      )}


      {/* STEP 2 — Review */}
      {currentStep === 2 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Review Booking Details
          </h2>

          <div className="mb-6">
            <div className="flex items-center mb-4">
              <img
                src={selectedCar.mainImage}
                alt={selectedCar.name}
                className="w-32 h-24 object-cover rounded-lg mr-4"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {selectedCar.name}
                </h3>
                <p className="text-sm text-gray-600">
                  ₱{selectedCar.pricePerDay} per day
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-start pb-4 border-b border-gray-100">
              <CalendarIcon size={20} className="text-gray-400 mr-3 mt-0.5" />
              <div className="flex-1">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pickup</p>
                    <p className="font-medium text-gray-800">
                      {bookingData.pickupDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Return</p>
                    <p className="font-medium text-gray-800">
                      {bookingData.returnDate}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start pb-4 border-b border-gray-100">
              <MapPinIcon size={20} className="text-gray-400 mr-3 mt-0.5" />
              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Pickup Location
                    </p>
                    <p className="font-medium text-gray-800">
                      {bookingData.pickupLocation}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Return Location
                    </p>
                    <p className="font-medium text-gray-800">
                      {bookingData.returnLocation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-800 mb-3">Price Breakdown</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Rental (
                  {Math.ceil(
                    (new Date(bookingData.returnDate).getTime() -
                      new Date(bookingData.pickupDate).getTime()) /
                      (1000 * 60 * 60 * 24),
                  )}{' '}
                  days)
                </span>
                <span className="text-gray-800">₱{calculateTotal() - 500}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Insurance</span>
                <span className="text-gray-800">Free</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Reservation Fee</span>
                <span className="text-gray-800">₱500</span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-800">Total</span>
                  <span className="font-bold text-xl text-green-600">
                    ₱{calculateTotal()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={handleBack}
              className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              <ArrowLeftIcon size={18} className="mr-2" />
              Back
            </button>
            <button
              onClick={handleNext}
              className="flex items-center px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Continue to Payment
              <ArrowRightIcon size={18} className="ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 — Payment */}
      {currentStep === 3 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Payment Information
          </h2>

          {/* Payment Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">
              Payment Instructions
            </h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Select your payment method below</li>
              <li>Complete the payment using your chosen method</li>
              <li>Upload proof of payment (screenshot or receipt)</li>
              <li>Our team will verify your payment within 24 hours</li>
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
                accept="image/*"
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

          {/* Payment Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">
                Total Amount to Pay
              </span>
              <span className="text-2xl font-bold text-green-600">
                ₱{calculateTotal()}
              </span>
            </div>
          </div>

          {/* Important Note */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">Important:</span> Your booking
              will be confirmed once we verify your payment. You will receive a
              confirmation email within 24 hours.
            </p>
          </div>

          <div className="flex justify-between">
            <button
              onClick={handleBack}
              disabled={submitting}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeftIcon size={18} className="mr-2" />
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
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
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircleIcon size={18} className="mr-2" />
                  Submit Booking
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4 — Confirmation */}
      {currentStep === 4 && (
        <div className="bg-white rounded-lg border border-gray-100 p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon size={40} className="text-green-600" />
          </div>

          <h2 className="text-2xl font-bold mb-3">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-6">Your booking is complete.</p>

          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-semibold text-gray-800 mb-4">Booking Details</h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Booking ID</span>
                <span className="font-medium">{bookingData.bookingID}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Car</span>
                <span className="font-medium">{selectedCar.brand} {selectedCar.model}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Pickup Date</span>
                <span className="font-medium">{bookingData.pickupDate}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Return Date</span>
                <span className="font-medium">{bookingData.returnDate}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Total Paid</span>
                <span className="font-bold text-green-600">₱{calculateTotal()}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <Link to="/dashboard/bookings" className="px-6 py-3 bg-green-500 text-white rounded-md">
              View My Bookings
            </Link>

            <Link to="/dashboard" className="px-6 py-3 border rounded-md">
              Back to Dashboard
            </Link>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmBooking}
        title="Confirm Booking"
        message={`Are you sure you want to book the ${selectedCar.name} for ${Math.ceil((new Date(bookingData.returnDate).getTime() - new Date(bookingData.pickupDate).getTime()) / (1000 * 60 * 60 * 24))} days? The total amount is $${calculateTotal()}.`}
        confirmText="Yes, Book Now"
        cancelText="Review Details"
        variant="primary"
        isLoading={submitting}
      />
    </div>
    </>
    
  )
}

export default BookCar

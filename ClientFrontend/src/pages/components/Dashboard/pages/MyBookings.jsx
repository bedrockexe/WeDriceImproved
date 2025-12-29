import React, { useState } from "react";
import { CalendarIcon, MapPinIcon, ClockIcon, FilterIcon } from "lucide-react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

const BookingSkeleton = () => {
  return (
    <div>
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          My Bookings
        </h1>

        <div className="h-10 w-24 bg-gray-300 rounded-md relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r 
          from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="flex border-b border-gray-200">
          {["confirmed", "pending", "completed", "cancelled"].map((tab, i) => (
            <div
              key={i}
              className="px-6 py-4 w-1/4"
            >
              <div className="h-4 w-20 bg-gray-300 rounded-md relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r 
                from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Card Skeletons */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden p-6"
          >
            <div className="flex flex-col md:flex-row gap-6 animate-pulse">

              {/* Image */}
              <div className="relative w-full md:w-48 h-32 bg-gray-300 rounded-lg overflow-hidden">
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r 
                from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" />
              </div>

              {/* Details */}
              <div className="flex-1 space-y-4">
                {/* Title */}
                <div className="relative h-5 w-1/2 bg-gray-300 rounded-md overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r 
                  from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" />
                </div>

                {/* Booking ID */}
                <div className="relative h-4 w-1/3 bg-gray-300 rounded-md overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r 
                  from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" />
                </div>

                {/* Status Pill */}
                <div className="relative h-6 w-16 bg-gray-300 rounded-full overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r 
                  from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" />
                </div>

                {/* Grid Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="space-y-2">
                      <div className="relative h-3 w-20 bg-gray-300 rounded-md overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r 
                        from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" />
                      </div>
                      <div className="relative h-4 w-32 bg-gray-300 rounded-md overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r 
                        from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price + Buttons */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="space-y-2">
                    <div className="relative h-3 w-24 bg-gray-300 rounded-md overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r 
                      from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" />
                    </div>
                    <div className="relative h-6 w-32 bg-gray-300 rounded-md overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r 
                      from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" />
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <div className="relative h-9 w-20 bg-gray-300 rounded-md overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r 
                      from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" />
                    </div>
                    <div className="relative h-9 w-20 bg-gray-300 rounded-md overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r 
                      from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
};

const MyBookings = () => {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  const [activeTab, setActiveTab] = useState("approved");

  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ["currentuser"],
    queryFn: async () => {
      return axios
        .get(`${API}/api/users/me`, { withCredentials: true })
        .then((res) => res.data.user)
    },
      
    staleTime: 1000 * 60 * 5,
  });

  const bookingIds = user?.bookings ?? [];
  const hasBookings = bookingIds.length > 0;

  const {
    data: bookings = [],
    isLoading: loadingBookings,
    isFetching: fetchingBookings,
  } = useQuery({
    queryKey: ["bookings", bookingIds],
    enabled: hasBookings,
    queryFn: async () => {
      const myBookings = axios.get(`${API}/api/bookings/user/me`, { withCredentials: true }).then((res) => res.data.bookings);
      return myBookings;
    },
    staleTime: 1000 * 60 * 3,
  });

  const { data: cars = [] } = useQuery({
    queryKey: ["cars"],
    queryFn: () =>
      axios.get(`${API}/api/cars`).then((res) => res.data.cars),
    staleTime: 1000 * 60 * 5,
  });

  if (loadingUser || (hasBookings && (loadingBookings || fetchingBookings))) {
    return (
      <div className="space-y-4">
        <BookingSkeleton />
      </div>
    );
  }
  console.log("Bookings:", bookings);
  console.log("Cars:", cars);

  const merged = bookings.map((b) => {
    const car = cars.find((c) => c.carId === b.carId);
    return { ...b, car: car || null };
  });

  // ----------------------------
  // 5️⃣ Categorize bookings
  // ----------------------------
  const categorized = {
    approved: merged.filter((b) => b.status?.toLowerCase() === "approved"),
    pending: merged.filter((b) => b.status?.toLowerCase() === "pending"),
    declined: merged.filter((b) => b.status?.toLowerCase() === "declined"),
    completed: merged.filter((b) => b.status?.toLowerCase() === "completed"),
    ongoing: merged.filter((b) => b.status?.toLowerCase() === "ongoing"),
  };


  const currentBookings = categorized[activeTab] ?? [];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      case "declined":
        return "bg-red-100 text-red-700";
      case "ongoing":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // ----------------------------
  // 6️⃣ UI
  // ----------------------------
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          My Bookings
        </h1>
        <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
          <FilterIcon size={18} className="mr-2" />
          Filter
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="flex border-b border-gray-200">
          {["approved", "pending", "completed", "declined", "ongoing"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === tab
                  ? "border-b-2 border-green-500 text-green-600"
                  : "text-gray-500"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} (
              {categorized[tab]?.length ?? 0})
            </button>
          ))}
        </div>
      </div>

      {/* Booking List */}
      <div className="space-y-4">
        {currentBookings.map((booking) => (
          <div
            key={booking._id}
            className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Car Image */}
                <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden bg-gray-100">
                  {booking.car?.mainImage ? (
                    <img
                      src={booking.car.mainImage}
                      alt={booking.car.model}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                      No Image
                    </div>
                  )}
                </div>

                {/* Booking Details */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {booking.car
                          ? `${booking.car.brand} ${booking.car.model}`
                          : "Car Deleted"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Booking ID: {booking.bookingId}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <CalendarIcon className="text-gray-400 mr-2" size={18} />
                      <div>
                        <p className="text-xs text-gray-500">Pickup</p>
                        <p className="text-sm font-medium text-gray-800">
                          {formatDate(booking.startDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <CalendarIcon className="text-gray-400 mr-2" size={18} />
                      <div>
                        <p className="text-xs text-gray-500">Return</p>
                        <p className="text-sm font-medium text-gray-800">
                          {formatDate(booking.endDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <MapPinIcon
                        size={18}
                        className="text-gray-400 mr-2 mt-0.5"
                      />
                      <div>
                        <p className="text-xs text-gray-500">Pickup Location</p>
                        <p className="text-sm font-medium text-gray-800">
                          {booking.pickupLocation ? booking.pickupLocation : "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <MapPinIcon
                        size={18}
                        className="text-gray-400 mr-2 mt-0.5"
                      />
                      <div>
                        <p className="text-xs text-gray-500">Return Location</p>
                        <p className="text-sm font-medium text-gray-800">
                          {booking.returnLocation ? booking.returnLocation : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  

                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-sm text-gray-500">Total Price</p>
                      <p className="text-xl font-bold text-gray-800">
                        ₱{booking.totalPrice}
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      {/* {booking.status === 'Confirmed' ? (
                        <>
                          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm">
                            Modify
                          </button>
                          <button className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 text-sm">
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm">
                          View Details
                        </button>
                      )} */}
                      <Link to={`/dashboard/bookingdetails/${booking.bookingId}`} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {currentBookings.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center border-gray-100">
            <ClockIcon size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              No bookings found
            </h3>
            <p className="text-gray-500">
              You don’t have any {activeTab} bookings yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;

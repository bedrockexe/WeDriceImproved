import React from 'react';
import StatsCard from '../UI/StatsCard';
import axios from 'axios';
import { CalendarIcon, CarIcon, DollarSignIcon } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from 'react';

const DashboardSkeleton = () => {
  return (
    <div className="space-y-4">
      <div>
        <div className="h-6 w-48 bg-gray-300 rounded-md animate-pulse" />
        <div className="h-4 w-64 bg-gray-200 rounded-md animate-pulse mt-2" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-4 border border-gray-200 rounded-xl shadow-sm bg-white animate-pulse"
          >
            <div className="h-4 w-32 bg-gray-300 rounded-md" />
            <div className="h-8 w-20 bg-gray-300 rounded-md mt-3" />
            <div className="h-3 w-40 bg-gray-200 rounded-md mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
};

const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
};

const WelcomeSection = () => {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  // ----------------------------
  // 1️⃣ Fetch Current User
  // ----------------------------
  const {
    data: user,
    isLoading: loadingUser,
  } = useQuery({
    queryKey: ["currentuser"],
    queryFn: () =>
      axios.get(`${API}/api/users/me`).then((res) => res.data.user),
    staleTime: 1000 * 60 * 5,
  });

  // ----------------------------
  // 2️⃣ Fetch User Bookings (dependent query)
  // ----------------------------
  const {
    data: bookings,
    isLoading: loadingBookings,
  } = useQuery({
    queryKey: ["bookings", user?.bookings],
    queryFn: async () => {
      if (!user?.bookings || user.bookings.length === 0) return [];

      const responses = await axios.get(`${API}/api/bookings/user/me`).then(res => res.data.bookings);

      return responses;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
  });

  if ((loadingUser || loadingBookings)) {
    return <DashboardSkeleton />;
  }

  // ----------------------------
  // 3️⃣ Compute Stats
  // ----------------------------
  const totalRentals = bookings?.length || 0;
  const totalSpend = Number(user?.totalSpent || 0);

  const confirmed = bookings?.filter((b) => b.status.toLowerCase() === "approved") || [];

  const latestBooking =
    confirmed.length > 0
      ? confirmed.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )[0]
      : null;

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
        Welcome back, {user.firstName} {user.lastName}!
      </h1>

      <p className="text-gray-600 mt-1">
        Here's an overview of your rental activity
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">

        {/* Latest Booking */}
        <StatsCard
          title="Upcoming Booking"
          value={latestBooking ? formatDate(latestBooking.startDate) : "None"}
          icon={<CalendarIcon className="text-green-500" />}
          description={
            latestBooking
              ? `Booking ID: ${latestBooking.bookingId}`
              : "No confirmed bookings"
          }
        />

        {/* Total Rentals */}
        <StatsCard
          title="Total Rentals"
          value={totalRentals}
          icon={<CarIcon className="text-blue-500" />}
          description="Across your account"
        />

        {/* Total Spend */}
        <StatsCard
          title="Total Spent"
          value={`₱${totalSpend.toLocaleString()}`}
          icon={<DollarSignIcon className="text-purple-500" />}
          description="Lifetime spending"
        />

      </div>
    </div>
  );
};

export default WelcomeSection;

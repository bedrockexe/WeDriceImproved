import React from "react";
import ReservationCard from "../UI/ReservationCard";
import { Link } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const ActiveReservations = () => {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // -----------------------------
  // 1️⃣ Fetch Current User
  // -----------------------------
  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ["currentuser"],
    queryFn: () =>
      axios.get(`${API}/api/users/me`, { withCredentials: true })
        .then((res) => res.data.user),
    staleTime: 1000 * 60 * 5,
  });

  // -----------------------------
  // 2️⃣ Fetch all bookings for the user
  // -----------------------------
  const { data: bookings, isLoading: loadingBookings } = useQuery({
    queryKey: ["userBookings", user?.bookings],
    enabled: !!user, // only fetch when user is loaded
    queryFn: async () => {
      if (!user?.bookings || user.bookings.length === 0) return [];

      const bookingRequests = axios.get(`${API}/api/bookings/user/me`).then(res => res.data.bookings);

      return bookingRequests;
    },
    staleTime: 1000 * 60 * 3, // 3 minutes
  });

  // -----------------------------
  // 3️⃣ Fetch all cars (so we don't fetch each individually)
  // -----------------------------
  const { data: cars = [] } = useQuery({
    queryKey: ["cars"],
    queryFn: () =>
      axios.get(`${API}/api/cars`).then((res) => res.data.cars),
    staleTime: 1000 * 60 * 5,
  });

  if (loadingUser || loadingBookings) return <div>Loading...</div>;

  // -----------------------------
  // 4️⃣ Combine Bookings + Cars
  // -----------------------------
  const confirmedReservations = bookings
    ?.filter((b) => b.status.toLowerCase() === "approved" || b.status.toLowerCase() === "ongoing")
    .map((booking) => {
      const car = cars.find((c) => c.carId === booking.carId);

      return {
        id: booking.bookingId,
        carName: car ? `${car.brand} ${car.model}` : "Unknown Car",
        pickupDate: booking.startDate,
        returnDate: booking.endDate,
        location: booking.pickupLocation,
        status: booking.status,
        image: car?.mainImage || "",
      };
    });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Active Reservations</h2>
        <Link
          to="/dashboard/bookings"
          className="text-green-500 text-sm font-medium hover:text-green-600"
        >
          View All
        </Link>
      </div>

      <div className="space-y-4">
        {confirmedReservations?.length > 0 ? (
          confirmedReservations.map((res) => (
            <ReservationCard key={res.id} reservation={res} />
          ))
        ) : (
          <div className="text-gray-500 text-sm">No active reservations.</div>
        )}
      </div>
    </div>
  );
};

export default ActiveReservations;

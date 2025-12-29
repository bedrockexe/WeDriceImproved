import React, { useMemo, useState, useEffect } from 'react'
import { StatsCard } from '../components/dashboard/StatsCard'
import { RevenueChart } from '../components/dashboard/RevenueChart'
import { RecentBookings } from '../components/dashboard/RecentBookings'
import { QuickActions } from '../components/dashboard/QuickActions'
import { FleetUtilization } from '../components/dashboard/fleetUtilization'
import { BookingTimeline } from '../components/dashboard/bookingTimeline'
import { mockBookings } from '../components/utils/mockData.jsx'
import { CalendarDays, Clock, Car, DollarSign } from 'lucide-react'

import axios from 'axios'

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="h-28 bg-gray-200 animate-pulse rounded-lg"
        />
      ))}
    </div>
  );
}



export default function Dashboard() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5001";
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    let isMounted = true;

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/api/admin/dashboard`, { withCredentials: true });
        if (isMounted) setData(res.data);
      } catch (err) {
        console.error("Dashboard fetch failed:", err);
        if (isMounted) setError("Failed to load dashboard");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;





  console.log("Dashboard data:", data);

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-gray-500 sm:text-base">
              Welcome back! Here's what's happening with your car rental
              business today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatsCard
              title="Total Bookings"
              value={data.bookings.value}
              change={data.bookings.change}
              changeType={data.bookings.verdict}
              icon={CalendarDays}
              iconColor="text-emerald-600"
              iconBgColor="bg-emerald-100"
            />

            <StatsCard
              title="Pending Approvals"
              value={data.pendingBookings.value}
              change={data.pendingBookings.change}
              changeType={data.pendingBookings.verdict}
              icon={Clock}
              iconColor="text-amber-600"
              iconBgColor="bg-amber-100"
            />

            <StatsCard
              title="Active Rentals"
              value={data.ongoingBookings.value}
              change={data.ongoingBookings.change}
              changeType={data.ongoingBookings.verdict}
              icon={Car}
              iconColor="text-blue-600"
              iconBgColor="bg-blue-100"
            />

            <StatsCard
              title="Total Revenue"
              value={`₱${data.revenue.value}`}
              change={data.revenue.change}
              changeType={data.revenue.verdict}
              icon={DollarSign}
              iconColor="text-emerald-600"
              iconBgColor="bg-emerald-100"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <FleetUtilization />
            <BookingTimeline />
          </div>

          {/* Recent Bookings */}
          <RecentBookings />
        </div>
      </main>
    </div>
  )
}

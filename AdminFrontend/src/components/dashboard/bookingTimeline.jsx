import React from 'react'
import { Calendar, User } from 'lucide-react'
import { Badge } from '../dashboardui/Badge'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'



const formatDate = (date) => {
  const d = new Date(date);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
};


export function BookingTimeline() {
    const API = import.meta.env.VITE_API_URL || "http://localhost:5001";
    const allowedStatuses = ["pending", "ongoing", "approved"];
    const [bookings, setBookings] = useState([]);
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0);
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)
    const dateLabels = Array.from(
        {
            length: 7,
        },
        (_, i) => {
            const date = new Date(today)
            date.setDate(today.getDate() + i)
            return {
                date: date.toISOString().split('T')[0],
                label: date.toLocaleDateString('en-US', {
                weekday: 'short',
                day: 'numeric',
                }),
                isToday: i === 0,
            }
        },
    )
    useEffect(() => {
        axios.get(`${API}/api/bookings`, {withCredentials: true})
            .then((response) => {
                setBookings(response.data.bookings);
            })
            .catch((error) => {
                console.error("There was an error fetching the bookings!", error);
            });
    }, []);

    const bookingsTimeline = bookings
    .filter(booking => allowedStatuses.includes(booking.status))
    .map(booking => (
        {
            id: booking.bookingId,
            customerName: booking.customerName,
            carModel: booking.carName,
            startDate: formatDate(booking.startDate),
            endDate: formatDate(booking.endDate),
            status: booking.status,
        }
    ));

    console.log(bookingsTimeline);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Booking Timeline
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Upcoming reservations for the next 7 days
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-gray-400" />

          {/* 👉 See all bookings */}
          <Link
            to="/dashboard/bookings"
            className="px-3 py-1.5 text-xs font-medium rounded-md
                      bg-emerald-600 text-white hover:bg-emerald-700"
          >
            View bookings
          </Link>
          <span className="text-xs text-gray-500">
            {bookingsTimeline.length} bookings
          </span>


        </div>
      </div>


      {/* Timeline Header - Days */}
      <div className="mb-4 pb-3 border-b border-gray-200">
        <div className="grid grid-cols-7 gap-2 text-center">
          {dateLabels.map((day) => (
            <div
              key={day.date}
              className={`text-xs font-medium ${day.isToday ? 'text-emerald-600 bg-emerald-50 rounded-lg py-1' : 'text-gray-500'}`}
            >
              {day.label}
            </div>
          ))}
        </div>
      </div>

      {/* Bookings List with Timeline Indicators */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {bookingsTimeline.map((booking) => {
          const startDate = new Date(booking.startDate)
          startDate.setUTCHours(0, 0, 0, 0);
          const endDate = new Date(booking.endDate)
          endDate.setUTCHours(0, 0, 0, 0);
          // Calculate position and width for timeline bar
          const startDay = Math.floor((startDate - today) / (1000 * 60 * 60 * 24));
          const duration = Math.ceil(
            (endDate - startDate) / (1000 * 60 * 60 * 24),
          );
          // Only show if within the 7-day window
          if (startDay >= 7 || startDay + duration < 0) return null
          const adjustedStart = Math.max(0, startDay)
          const adjustedDuration = Math.min(7 - adjustedStart, duration)
          const getStatusColor = (status) => {
            switch (status) {
              case 'ongoing':
                return 'bg-blue-500'
              case 'approved':
                return 'bg-emerald-500'
              case 'pending':
                return 'bg-amber-500'
            }
          }
          return (
            <div key={booking.id} className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {booking.customerName}
                    </span>
                    <Badge status={booking.status} className="ml-auto" />
                  </div>
                  <div className="text-xs text-gray-500 ml-5 truncate">
                    {booking.carModel} • {booking.id}
                  </div>
                </div>
              </div>

              {/* Timeline Bar */}
              <div className="grid grid-cols-7 gap-2 h-2">
                {Array.from({
                  length: 7,
                }).map((_, index) => {
                  const isInRange =
                    index >= adjustedStart &&
                    index < adjustedStart + adjustedDuration
                  const isStart = index === adjustedStart
                  const isEnd = index === adjustedStart + adjustedDuration - 1
                  return (
                    <div
                      key={index}
                      className={`h-full ${isInRange ? `${getStatusColor(booking.status)} ${isStart ? 'rounded-l-full' : ''} ${isEnd ? 'rounded-r-full' : ''}` : 'bg-gray-100'}`}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-gray-600">Ongoing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="text-gray-600">Approved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span className="text-gray-600">Pending</span>
        </div>
      </div>
    </div>
  )
}

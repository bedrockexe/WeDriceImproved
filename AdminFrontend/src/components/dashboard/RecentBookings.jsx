import React from 'react';
import { Badge } from '../dashboardui/Badge';
import { Button } from '../dashboardui/Button';
import { Eye, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';


export function RecentBookings() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5001";
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    axios.get(`${API}/api/bookings/`, {withCredentials: true})
      .then(response => {
        setBookings(response.data.bookings);
      })
      .catch(error => {
        console.error("Error fetching recent bookings:", error);
      });
  }, []);
  return <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Bookings
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Latest reservation activity
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/bookings')} rightIcon={<ArrowRight className="w-4 h-4" />}>
          View All
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Car
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Start Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                End Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.slice(0, 5).map(booking => <tr key={booking.bookingId} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {booking.customerName}
                  </div>
                  <div className="text-xs text-gray-500">{booking.bookingId}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {booking.carName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {new Date(booking.startDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {new Date(booking.endDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge status={booking.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  ₱{booking.totalPrice.toFixed(2)}
                </td>
              </tr>)}
          </tbody>
        </table>
      </div>
    </div>;
}
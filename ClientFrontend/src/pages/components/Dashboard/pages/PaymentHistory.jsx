import React, { useState } from "react";
import {
  DownloadIcon,
  SearchIcon,
  CreditCardIcon,
  CheckCircleIcon,
  FileTextIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const PaymentHistory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["currentuser"],
    queryFn: () =>
      axios
        .get(`${API}/api/users/me`, { withCredentials: true })
        .then((res) => res.data.user),
    staleTime: 1000 * 60 * 5,
  });

  const userId = user?._id;

  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ["payments", userId],
    queryFn: async () => {
      const res = await axios.get(`${API}/api/transactions/user/me`, {
        withCredentials: true,
      });
      return res.data.transactions;
    },
    enabled: !!userId, // ensures this hook doesn't run early
    staleTime: 1000 * 60 * 5,
  });

  // ✔ FIX: only return AFTER all hooks are defined
  if (userLoading || paymentsLoading) {
    return (
      <div>
        {/* Title Skeleton */}
        <div className="h-8 w-48 bg-gray-300 rounded-md mb-6 relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r 
            from-transparent via-white/40 to-transparent animate-[shimmer_1.4s_infinite]" />
        </div>

        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 space-y-3 animate-pulse"
            >
              <div className="relative h-4 w-24 bg-gray-300 rounded-md overflow-hidden">
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r 
                  from-transparent via-white/40 to-transparent animate-[shimmer_1.4s_infinite]" />
              </div>

              <div className="relative h-6 w-32 bg-gray-300 rounded-md overflow-hidden">
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r 
                  from-transparent via-white/40 to-transparent animate-[shimmer_1.4s_infinite]" />
              </div>

              <div className="relative h-3 w-20 bg-gray-300 rounded-md overflow-hidden">
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r 
                  from-transparent via-white/40 to-transparent animate-[shimmer_1.4s_infinite]" />
              </div>
            </div>
          ))}
        </div>

        {/* Search Bar Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
          <div className="relative h-10 bg-gray-300 rounded-md overflow-hidden">
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r 
              from-transparent via-white/40 to-transparent animate-[shimmer_1.4s_infinite]" />
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50 h-10" />

          {/* 5 shimmer rows */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-gray-100 animate-pulse"
            >
              {[1, 2, 3, 4, 5, 6].map((col) => (
                <div
                  key={col}
                  className="relative h-4 bg-gray-300 rounded-md overflow-hidden"
                >
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r 
                    from-transparent via-white/40 to-transparent animate-[shimmer_1.4s_infinite]" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }


  if (!user) {
    return <div>No user found</div>;
  }


  // Search filter (carName, bookingId, transactionId)
  const filteredPayments = payments.filter((payment) =>
    payment.carName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Total Spent (Completed only)
  const totalSpent = payments
    .filter((p) => p.status.toLowerCase() === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "refunded":
        return "text-red-600 bg-red-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (paymentsLoading) {
    return (
      <div className="text-center py-12">
        <CreditCardIcon size={48} className="text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">Loading payment history...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
        Payment History
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Total Spent</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">₱{totalSpent}</p>
          <p className="text-xs text-green-600 mt-1">All time</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Total Transactions</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {payments.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Completed bookings</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Average Booking</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            ₱
            {payments.filter((p) => p.status.toLowerCase() === "completed").length > 0
              ? Math.round(
                  totalSpent /
                    payments.filter((p) => p.status.toLowerCase() === "completed").length
                )
              : 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">Per rental</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
        <div className="relative">
          <SearchIcon
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by car name, booking ID, or transaction ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-800">
                      {payment.carName}
                    </p>
                    <p className="text-xs text-gray-500">{payment.bookingId}</p>
                    <p className="text-xs text-gray-400">
                      {payment.transactionId}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-800">{payment.date}</p>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <CreditCardIcon
                        size={16}
                        className="text-gray-400 mr-2"
                      />
                      <p className="text-sm text-gray-800">
                        {payment.paymentMethod}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-gray-800">
                      ₱{payment.amount}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        payment.status
                      )}`}
                    >
                      {payment.status.toLowerCase() === "completed" && (
                        <CheckCircleIcon size={14} className="mr-1" />
                      )}
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <a
                        href={`${payment.paymentProof.replace(
                          `/upload/${payment.userId}`,
                          `/upload/${payment.userId}/fl_attachment:payment_proofs/`
                        )}`}
                        download
                        className="flex items-center text-green-600 hover:text-green-700 font-medium text-sm"
                      >
                        <FileTextIcon size={16} className="mr-1" />
                          Receipt
                        <DownloadIcon size={14} className="ml-1" />
                      </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="p-12 text-center">
            <CreditCardIcon
              size={48}
              className="text-gray-300 mx-auto mb-4"
            />
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              No payments found
            </h3>
            <p className="text-gray-500">Try adjusting your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;

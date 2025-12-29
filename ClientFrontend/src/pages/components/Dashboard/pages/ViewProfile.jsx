import React from 'react';
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  AlertCircleIcon,
  ClockIcon,
  XCircleIcon,
  CakeIcon,
  EyeIcon
} from 'lucide-react'
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useQuery } from "@tanstack/react-query";

function formatPHNumber(number) {
  // Remove spaces and dashes
  let cleaned = number.replace(/\D/g, "");

  // If it starts with 0 → replace with +63
  if (cleaned.startsWith("0")) {
    cleaned = "+63" + cleaned.slice(1);
  }

  // If it already starts with +63 → keep it
  else if (!cleaned.startsWith("+63")) {
    cleaned = "+63" + cleaned;
  }

  return cleaned;
}

const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
};

const ViewProfile = () => {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [showLicense, setShowLicense] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ["currentuser"],
    queryFn: () =>
      axios
        .get(`${API}/api/users/me`, { withCredentials: true })
        .then((res) => res.data.user),
    staleTime: 1000 * 60 * 5,
  });

  if (!user) return <div>Loading...</div>;

  const userInfo = {
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    phone: formatPHNumber(String(user.phoneNumber)),
    address: user.address ? `${user.address}` : '-',
    memberSince: user.createdAt ? formatDate(user.createdAt) : "-",
    licenseNumber: user.licenseNumber ? user.licenseNumber : '-',
    licenseImage: user.licenseImage,
    verificationStatus: user.verificationStatus,
    birthdate: user.birthdate ? formatDate(user.birthdate) : '-',
    rejectionReason: user.rejectionReason ? user.rejectionReason : 'Documents were unclear or invalid.',
  };

  const getVerificationStatusBadge = () => {
    switch (userInfo.verificationStatus) {
      case 'verified':
        return (
          <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            <ShieldCheckIcon size={16} className="mr-1.5" />
            Verified
          </div>
        )
      case 'pending':
        return (
          <div className="inline-flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
            <ClockIcon size={16} className="mr-1.5" />
            Pending Review
          </div>
        )
      case 'rejected':
        return (
          <div className="inline-flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
            <XCircleIcon size={16} className="mr-1.5" />
            Rejected
          </div>
        )
      default:
        return (
          <div className="inline-flex items-center bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
            <AlertCircleIcon size={16} className="mr-1.5" />
            Unverified
          </div>
        )
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            My Profile
          </h1>
          <div className="mt-2">{getVerificationStatusBadge()}</div>
        </div>
        <Link
          to="/dashboard/edit-account"
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm transition-colors text-center"
        >
          Edit Profile
        </Link>
      </div>

      {/* Verification Status Banner */}
      {userInfo.verificationStatus !== 'verified' && (
        <div className="mb-6 bg-white rounded-lg shadow-sm border-2 border-yellow-200 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 px-6 py-4 border-b border-yellow-100">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <AlertCircleIcon size={20} className="text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-base font-semibold text-gray-900">
                  {userInfo.verificationStatus === 'pending' &&
                    'Verification In Progress'}
                  {userInfo.verificationStatus === 'rejected' &&
                    'Verification Required'}
                  {userInfo.verificationStatus === 'unverified' &&
                    'Account Verification Required'}
                </h3>
                <p className="text-sm text-gray-600 mt-0.5">
                  {userInfo.verificationStatus === 'pending' &&
                    'We are reviewing your documents. This typically takes 24-48 hours.'}
                  {userInfo.verificationStatus === 'rejected' &&
                    'Your previous submission was rejected. Please submit new documents.'}
                  {userInfo.verificationStatus === 'unverified' &&
                    'You must verify your identity to book cars and access premium features.'}
                </p>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-sm text-gray-600">
                {userInfo.verificationStatus === 'unverified' && (
                  <>
                    <span className="font-medium text-gray-900">
                      Required for:
                    </span>{' '}
                    Booking cars, Premium rates, Priority support
                  </>
                )}
                {userInfo.verificationStatus === 'pending' && (
                  <>
                    <span className="font-medium text-gray-900">
                      Submitted:
                    </span>{' '}
                    {formatDate(user.verificationSubmittedAt) || 'N/A'}
                  </>
                )}
                {userInfo.verificationStatus === 'rejected' && (
                  <>
                    <span className="font-medium text-gray-900">Reason:</span>{' '}
                    {userInfo.rejectionReason || 'Documents were unclear or invalid.'}
                  </>
                )}
              </div>
              <Link
                to="/dashboard/verify-identity"
                className="inline-flex items-center justify-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                {userInfo.verificationStatus === 'unverified' &&
                  'Start Verification'}
                {userInfo.verificationStatus === 'pending' && 'View Status'}
                {userInfo.verificationStatus === 'rejected' &&
                  'Resubmit Documents'}
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-8">
          <div className="flex items-center">
            <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-md relative">
              <UserIcon size={40} className="text-green-500" />
              {userInfo.verificationStatus === 'verified' && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5 border-2 border-white shadow-sm">
                  <ShieldCheckIcon size={14} className="text-white" />
                </div>
              )}
            </div>
            <div className="ml-6 text-white">
              <h2 className="text-2xl font-bold">{userInfo.name}</h2>
              <p className="text-green-100 text-sm mt-1">
                {(userInfo.verificationStatus === 'verified') ? `Verified Customer since ${userInfo.memberSince}` : 'Unverified Customer'}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200">
                Personal Information
              </h3>
              <div className="flex items-start">
                <MailIcon size={18} className="text-gray-400 mr-3 mt-1" />
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Email Address
                  </p>
                  <p className="text-gray-900 mt-1">{userInfo.email}</p>
                </div>
              </div>
              <div className="flex items-start">
                <PhoneIcon size={18} className="text-gray-400 mr-3 mt-1" />
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Phone Number
                  </p>
                  <p className="text-gray-900 mt-1">{userInfo.phone}</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPinIcon size={18} className="text-gray-400 mr-3 mt-1" />
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Address
                  </p>
                  <p className="text-gray-900 mt-1">{userInfo.address}</p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200">
                Account Details
              </h3>
              <div className="flex items-start">
                <CreditCardIcon size={18} className="text-gray-400 mr-3 mt-1" />
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    License Number
                  </p>

                  <p className="text-gray-900 mt-1">{userInfo.licenseNumber}</p>

                  {userInfo.licenseImage && (
                    <button
                      onClick={() => setShowLicense(true)}
                      className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition cursor-pointer"
                    >
                      <EyeIcon className="h-3.5 w-3.5" />
                      View license
                    </button>
                  )}
                  {showLicense && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                      <div className="bg-white rounded-lg p-4 max-w-md w-full">
                        <img
                          src={userInfo.licenseImage}
                          alt="Driver License"
                          className="w-full rounded-md"
                        />

                        <button
                          onClick={() => setShowLicense(false)}
                          className="mt-4 w-full rounded-md bg-green-500 text-white py-2 text-sm hover:bg-green-700 cursor-pointer"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              <div className="flex items-start">
                <CakeIcon size={18} className="text-gray-400 mr-3 mt-1" />
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Birth Date
                  </p>
                  <p className="text-gray-900 mt-1">{userInfo.birthdate}</p>
                </div>
              </div>
              <div className="flex items-start">
                <ShieldCheckIcon
                  size={18}
                  className="text-gray-400 mr-3 mt-1"
                />
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Verification Status
                  </p>
                  <div className="mt-2">{getVerificationStatusBadge()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};

export default ViewProfile;
import React, { useState, useEffect } from 'react'
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  MailIcon,
  PhoneIcon,
  CalendarIcon,
  MapPinIcon,
  FileTextIcon,
  SearchIcon,
  FilterIcon,
  ZoomInIcon,
  AlertCircleIcon,
  ShieldCheckIcon,
} from 'lucide-react'
import { ConfirmationModal } from './ConfirmationModal'
import { toast, Toaster } from 'sonner'
import axios from 'axios'

const formatDate = (dateStr) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateStr).toLocaleDateString("en-us", options)
}

const AdminVerification = () => {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5001";
  const [requests, setRequests] = useState([])
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [filterStatus, setFilterStatus] = useState('pending')
  const [searchQuery, setSearchQuery] = useState('')
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [users, setUsers] = useState([])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `${API}/api/users/getallusers`, {withCredentials: true}
        )
        const mappedrequests = response.data.users.map((user) => ({
          id: user._id,
          userId: user.userId,
          userName: `${user.firstName} ${user.lastName}`,
          email: user.email,
          phone: user.phoneNumber || 'N/A',
          dateOfBirth: formatDate(user.birthdate) || 'N/A',
          address: user.address || 'N/A',
          submittedDate: formatDate(user.verificationSubmittedAt) || 'N/A',
          status: user.verificationStatus,
          documents: {
            license: user.licenseImage,
            selfie: user.licenseSelfie,
          },
          licenseDetails: {
            number: user.licenseNumber || 'N/A',
            expiryDate: user.licenseExpiry || 'N/A', 
          },
          rejectionReason: user.rejectionReason || '',
        }));
        setRequests(mappedrequests)
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }
    fetchUsers()
  }, [])


  const filteredRequests = requests.filter((req) => {
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus
    const matchesSearch =
      req.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.id.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const handleApprove = async () => {
    if (!selectedRequest) return
    setIsProcessing(true)
    console.log('Approving request:', selectedRequest.id)
    try {
      const res = await axios.put(`${API}/api/users/approve/${selectedRequest.id}`, {}, {withCredentials: true});
      toast.success(res.data.message);
    } catch (error) {
      console.error('Error approving verification:', error)
      toast.error('Failed to approve verification.')
    }
    setTimeout(() => {
      setRequests((prev) =>
        prev.map((req) =>
          req.id === selectedRequest.id
            ? {
                ...req,
                status: 'verified',
              }
            : req,
        ),
      )
      setIsProcessing(false)
      setShowApproveModal(false)
      setSelectedRequest(null)
    }, 1500)
  }

  // Reject Handler
  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }
    setIsProcessing(true)
    console.log('Rejecting request:', selectedRequest.id)
    // Simulate API call
    try {
      const res = await axios.put(`${API}/api/users/reject/${selectedRequest.id}`, { rejectionReason }, {withCredentials: true});
      toast.success(res.data.message);
    } catch (error) {
      toast.error('Failed to reject verification.')
      console.error('Error rejecting verification:', error)
    }
    setTimeout(() => {
      setRequests((prev) =>
        prev.map((req) =>
          req.id === selectedRequest.id
            ? {
                ...req,
                status: 'rejected',
              }
            : req,
        ),
      )
      setIsProcessing(false)
      setShowRejectModal(false)
      setSelectedRequest(null)
      setRejectionReason('')
    }, 1500)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon size={14} className="mr-1" />
            Pending
          </span>
        )
      case 'verified':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon size={14} className="mr-1" />
            Verified
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon size={14} className="mr-1" />
            Rejected
          </span>
        )
    }
  }

  const pendingCount = requests.filter((r) => r.status === 'pending').length
  const approvedCount = requests.filter((r) => r.status === 'verified').length
  const rejectedCount = requests.filter((r) => r.status === 'rejected').length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            User Verification
          </h1>
          <p className="text-gray-600 mt-1">
            Review and verify user identity documents
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <ShieldCheckIcon size={32} className="text-green-500" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700 font-medium">
                Pending Review
              </p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">
                {pendingCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <ClockIcon size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Approved</p>
              <p className="text-3xl font-bold text-green-900 mt-1">
                {approvedCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 font-medium">Rejected</p>
              <p className="text-3xl font-bold text-red-900 mt-1">
                {rejectedCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <XCircleIcon size={24} className="text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <SearchIcon
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <FilterIcon size={20} className="text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Verification Requests List */}
      {selectedRequest ? (
        // Detailed View
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-white">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="mr-4 hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  ←
                </button>
                <div>
                  <h2 className="text-xl font-bold">Verification Details</h2>
                  <p className="text-green-100 text-sm">
                    ID: {selectedRequest.userId}
                  </p>
                </div>
              </div>
              {getStatusBadge(selectedRequest.status)}
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <UserIcon size={20} className="text-green-500 mr-2" />
                  User Information
                </h3>
                <div className="space-y-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Full Name</p>
                    <p className="font-medium text-gray-800 flex items-center">
                      <UserIcon size={16} className="mr-2 text-gray-400" />
                      {selectedRequest.userName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="font-medium text-gray-800 flex items-center">
                      <MailIcon size={16} className="mr-2 text-gray-400" />
                      {selectedRequest.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Phone</p>
                    <p className="font-medium text-gray-800 flex items-center">
                      <PhoneIcon size={16} className="mr-2 text-gray-400" />
                      {selectedRequest.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Date of Birth</p>
                    <p className="font-medium text-gray-800 flex items-center">
                      <CalendarIcon size={16} className="mr-2 text-gray-400" />
                      {selectedRequest.dateOfBirth}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Address</p>
                    <p className="font-medium text-gray-800 flex items-start">
                      <MapPinIcon
                        size={16}
                        className="mr-2 mt-0.5 text-gray-400 flex-shrink-0"
                      />
                      {selectedRequest.address}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Submitted Date</p>
                    <p className="font-medium text-gray-800">
                      {selectedRequest.submittedDate}
                    </p>
                  </div>
                </div>
              </div>

              {/* License Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FileTextIcon size={20} className="text-green-500 mr-2" />
                  License Information
                </h3>
                <div className="space-y-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">License Number</p>
                    <p className="font-medium text-gray-800">
                      {selectedRequest.licenseDetails.number}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Expiry Date</p>
                    <p className="font-medium text-gray-800">
                      {selectedRequest.licenseDetails.expiryDate}
                    </p>
                  </div>
                </div>

                {(selectedRequest.status === 'rejected') && (
                  <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-3 text-sm">
                      Rejection Reason
                    </h4>
                    <p className="text-sm text-blue-800">
                      {selectedRequest.rejectionReason || 'No reason provided.'}
                    </p>
                  </div>
                )}

                {/* Verification Checklist */}
                {(selectedRequest.status === 'pending') && (
                  <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-3 text-sm">
                      Verification Checklist
                    </h4>
                    <div className="space-y-2 text-sm">
                      <label className="flex items-center text-blue-800">
                        <input type="checkbox" className="mr-2 rounded" />
                        License is valid and not expired
                      </label>
                      <label className="flex items-center text-blue-800">
                        <input type="checkbox" className="mr-2 rounded" />
                        All text is clearly visible
                      </label>
                      <label className="flex items-center text-blue-800">
                        <input type="checkbox" className="mr-2 rounded" />
                        Photo matches selfie
                      </label>
                      <label className="flex items-center text-blue-800">
                        <input type="checkbox" className="mr-2 rounded" />
                        No signs of tampering
                      </label>
                      <label className="flex items-center text-blue-800">
                        <input type="checkbox" className="mr-2 rounded" />
                        User details match license
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submitted Documents */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Submitted Documents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Driver's License */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Driver's License
                  </p>
                  <div className="relative group">
                    <img
                      src={selectedRequest.documents.license}
                      alt="Driver's License"
                      className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      onClick={() =>
                        setImagePreview({
                          url: selectedRequest.documents.license,
                          title: "Driver's License",
                        })
                      }
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg"
                    >
                      <ZoomInIcon size={32} className="text-white" />
                    </button>
                  </div>
                </div>

                {/* Selfie with ID */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Selfie with ID
                  </p>
                  <div className="relative group">
                    <img
                      src={selectedRequest.documents.selfie}
                      alt="Selfie with ID"
                      className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      onClick={() =>
                        setImagePreview({
                          url: selectedRequest.documents.selfie,
                          title: 'Selfie with ID',
                        })
                      }
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg"
                    >
                      <ZoomInIcon size={32} className="text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {selectedRequest.status === 'pending' && (
              <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end space-x-4">
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="flex items-center px-6 py-3 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                >
                  <XCircleIcon size={18} className="mr-2" />
                  Reject Verification
                </button>
                <button
                  onClick={() => setShowApproveModal(true)}
                  className="flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  <CheckCircleIcon size={18} className="mr-2" />
                  Approve Verification
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        // List View
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
              <AlertCircleIcon
                size={48}
                className="text-gray-300 mx-auto mb-4"
              />
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                No verification requests found
              </h3>
              <p className="text-gray-500">
                {searchQuery
                  ? 'Try adjusting your search or filters'
                  : 'There are no verification requests at the moment'}
              </p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedRequest(request)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <UserIcon size={24} className="text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {request.userName}
                      </h3>
                      <p className="text-sm text-gray-500">{request.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right hidden md:block">
                      <p className="text-xs text-gray-500">Submitted</p>
                      <p className="text-sm font-medium text-gray-800">
                        {request.submittedDate}
                      </p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Image Preview Modal */}
      {imagePreview && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setImagePreview(null)}
        >
          <div className="max-w-4xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-xl font-semibold">
                {imagePreview.title}
              </h3>
              <button
                onClick={() => setImagePreview(null)}
                className="text-white hover:text-gray-300 text-2xl"
              >
                ×
              </button>
            </div>
            <img
              src={imagePreview.url}
              alt={imagePreview.title}
              className="w-full h-auto rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      <ConfirmationModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApprove}
        title="Approve Verification"
        message={`Are you sure you want to approve the verification for ${selectedRequest?.userName}? This will grant them full access to all platform features.`}
        confirmText="Yes, Approve"
        cancelText="Cancel"
        variant="success"
        isLoading={isProcessing}
      />

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Reject Verification
            </h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting {selectedRequest?.userName}
              's verification. This will be sent to the user.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectionReason('')
                }}
                disabled={isProcessing}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing || !rejectionReason.trim()}
                className="flex items-center px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
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
                    Rejecting...
                  </>
                ) : (
                  'Reject Verification'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default AdminVerification

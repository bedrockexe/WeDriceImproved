import React, { useState } from 'react'
import {
  UploadIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  FileTextIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from "@/authentication/AuthContext";
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import DatePicker from 'react-datepicker';
import { format, subYears } from "date-fns";
import { toast, Toaster } from "sonner";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


const VerifyIdentity = () => {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(user.verificationStatus || 'unverified')
  const [submitting, setSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({
    license: null,
    selfie: null,
  })
  const [errors, setErrors] = useState({});
  const today = new Date();
  const maxBirthdate = subYears(today, 18); // must be at least 18
  const [previews, setPreviews] = useState({
    license: null,
    selfie: null,
  });

  useEffect(() => {
    return () => {
      Object.values(previews).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [previews]);



  const [formData, setFormData] = useState({
    address: "",
    birthdate: null,
    licenseNumber: "",
    licenseExpiry: null,
  });

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (type, event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed.");
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB.");
      return;
    }

    setUploadedFiles((prev) => ({
      ...prev,
      [type]: file,
    }));

    setPreviews((prev) => ({
      ...prev,
      [type]: URL.createObjectURL(file),
    }));

    toast.success("Image uploaded successfully.");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.address.trim()) {
      newErrors.address = "Address is required.";
    }

    if (!formData.birthdate) {
      newErrors.birthdate = "Birthdate is required.";
    }

    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = "License number is required.";
    }

    if (!formData.licenseExpiry) {
      newErrors.licenseExpiry = "License expiry is required.";
    }

    if (!uploadedFiles.license) {
      newErrors.license = "Driver's license image is required.";
    }

    if (!uploadedFiles.selfie) {
      newErrors.selfie = "Selfie with ID is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please complete all required fields.");
      return;
    }


    setSubmitting(true);

    try {
      const fd = new FormData();

      fd.append(
        "birthdate",
        format(formData.birthdate, "yyyy-MM-dd")
      );

      fd.append(
        "licenseExpiry",
        format(formData.licenseExpiry, "yyyy-MM")
      );

      fd.append("address", formData.address);
      fd.append("licenseNumber", formData.licenseNumber);

      fd.append("licenseImage", uploadedFiles.license);
      fd.append("licenseSelfie", uploadedFiles.selfie);

      const res = await axios.post(`${API}/api/users/verify`, fd, {
        withCredentials: true,
      });

      if (res.status === 200) {
        setVerificationStatus("pending");
        queryClient.invalidateQueries(["currentuser"]);
      }

      setTimeout(() => {
        toast.success("Verification documents submitted successfully!", {
          duration: 3000,
        });
        navigate('/dashboard/profile');
      }, 1000);
      
    } catch (err) {
      console.error(err);
      setErrors({
        submit: err?.response?.data?.message || "Failed to submit verification.",
      });
      toast.error(
        err?.response?.data?.message || "Failed to submit verification."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = () => {
    switch (verificationStatus) {
      case 'pending':
        return (
          <div className="flex items-center px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg">
            <ClockIcon size={20} className="mr-2" />
            <span className="font-medium">Verification Pending</span>
          </div>
        )
      case 'approved':
        return (
          <div className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg">
            <CheckCircleIcon size={20} className="mr-2" />
            <span className="font-medium">Identity Verified</span>
          </div>
        )
      case 'rejected':
        return (
          <div className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg">
            <XCircleIcon size={20} className="mr-2" />
            <span className="font-medium">Verification Rejected</span>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <>
      <Toaster richColors position="top-right" />
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
          Identity Verification
        </h1>

        {verificationStatus !== 'unverified' && (
          <div className="mb-6">{getStatusBadge()}</div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            Why verify your identity?
          </h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Build trust with the WeDrive community</li>
            <li>Unlock premium features and better rates</li>
            <li>Faster booking approvals</li>
            <li>Enhanced account security</li>
          </ul>
        </div>

        {verificationStatus === 'unverified' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setShowConfirmModal(true);
            }}
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Submit Verification Documents
            </h2>

            {/* Address */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Address <span className="text-red-500">*</span>
              </label>
              <input
                name="address"
                value={formData.address}
                onChange={handleInput}
                placeholder="e.g. 123 Main St, City"
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-1 hover:border-green-500 transition-colors"
                required
              />
              {errors.address && (
                <p className="text-sm text-red-500 mt-1">{errors.address}</p>
              )}
            </div>

            {/* Birthdate */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Birthdate <span className="text-red-500">*</span>
              </label>

              <DatePicker
                selected={formData.birthdate}
                onChange={(date) =>
                  setFormData((prev) => ({ ...prev, birthdate: date }))
                }
                dateFormat="yyyy-MM-dd"
                maxDate={maxBirthdate} // 🔞 age validation
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
                placeholderText="YYYY-MM-DD"
                calendarClassName="bg-white border border-gray-200 rounded-lg shadow-lg"
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-2 focus:border-green-500 focus:outline-none"
                required
              />
              {errors.birthdate && (
                <p className="text-sm text-red-500 mt-1">{errors.birthdate}</p>
              )}


              {formData.birthdate && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected:{" "}
                  <span className="font-medium">
                    {format(formData.birthdate, "MMMM dd, yyyy")}
                  </span>
                </p>
              )}

              <p className="text-xs text-gray-500 mt-1">
                You must be at least 18 years old.
              </p>
            </div>

            {/* License Number */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                License Number <span className="text-red-500">*</span>
              </label>
              <input
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  setFormData({ ...formData, licenseNumber: value });
                }}
                placeholder="e.g. 123-456-789"
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-1 hover:border-green-500 transition-colors"
                required
              />

              {errors.licenseNumber && (
                <p className="text-sm text-red-500 mt-1">{errors.licenseNumber}</p>
              )}
            </div>

            {/* License Expiry */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                License Expiry <span className="text-red-500">*</span>
              </label>

              <DatePicker
                selected={formData.licenseExpiry}
                onChange={(date) =>
                  setFormData((prev) => ({ ...prev, licenseExpiry: date }))
                }
                dateFormat="yyyy-MM"
                showMonthYearPicker
                minDate={new Date()} // cannot be expired
                placeholderText="YYYY-MM"
                calendarClassName="bg-white border border-gray-200 rounded-lg shadow-lg"
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-2 focus:border-green-500 focus:outline-none"
                required
              />
              {errors.license && (
                <p className="text-sm text-red-500 mt-2">{errors.license}</p>
              )}


              {formData.licenseExpiry && (
              <p className="text-sm text-gray-600 mt-2">
                Expires on:{" "}
                <span className="font-medium">
                  {format(formData.licenseExpiry, "MMMM yyyy")}
                </span>
              </p>
            )}


            </div>

            {/* Driver's License */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Driver's License <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Upload a clear photo of your driver's license (front side)
              </p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                <input
                  type="file"
                  id="license-upload"
                  accept="image/*"
                  onChange={(e) => handleFileUpload('license', e)}
                  className="hidden"
                  disabled={submitting}
                />
                <label
                  htmlFor="license-upload"
                  className={`cursor-pointer ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {uploadedFiles.license ? (
                    <div className="space-y-3">
                      <img
                        src={previews.license}
                        alt="License preview"
                        className="mx-auto h-40 rounded-md object-cover border"
                      />
                      <p className="text-sm text-gray-700">
                        {uploadedFiles.license.name}
                      </p>
                    </div>
                  ) : (
                    <>
                      <UploadIcon
                        size={32}
                        className="text-gray-400 mx-auto mb-2"
                      />
                      <p className="text-sm text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG or PDF (max. 10MB)
                      </p>
                    </>
                  )}
                  {errors.license && (
                    <p className="text-sm text-red-500 mt-2">{errors.license}</p>
                  )}

                </label>
              </div>
            </div>

            {/* Selfie with ID */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selfie with ID <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Take a selfie holding your driver's license next to your face
              </p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                <input
                  type="file"
                  id="selfie-upload"
                  accept="image/*"
                  onChange={(e) => handleFileUpload('selfie', e)}
                  disabled={submitting}
                  className="hidden"
                />
                <label
                  htmlFor="selfie-upload"
                  className={`cursor-pointer ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {uploadedFiles.selfie ? (
                    <div className="space-y-3">
                      <img
                        src={previews.selfie}
                        alt="Selfie preview"
                        className="mx-auto h-40 rounded-md object-cover border"
                      />
                      <p className="text-sm text-gray-700">
                        {uploadedFiles.selfie.name}
                      </p>
                    </div>
                  ) : (
                    <>
                      <UploadIcon
                        size={32}
                        className="text-gray-400 mx-auto mb-2"
                      />
                      <p className="text-sm text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG or JPG (max. 10MB)
                      </p>
                    </>
                  )}
                </label>
                {errors.selfie && (
                  <p className="text-sm text-red-500 mt-2">{errors.selfie}</p>
                )}

              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-800 mb-2">
                Document Guidelines:
              </h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Ensure all text on your ID is clearly visible</li>
                <li>Photo should be well-lit with no glare</li>
                <li>Your face should be clearly visible in the selfie</li>
                <li>Documents must be valid and not expired</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-4">
              <Link to="/dashboard/profile"
                type="button"
                disabled={submitting}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </Link>
              <button
                type="submit"
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
                    Submit for Review
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {verificationStatus === 'pending' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClockIcon size={32} className="text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Verification In Progress
            </h3>
            <p className="text-gray-600 mb-4">
              We are reviewing your documents. This typically takes 24-48 hours.
            </p>
            <p className="text-sm text-gray-500">
              You will receive an email notification once the review is complete.
            </p>
          </div>
        )}

        {verificationStatus === 'approved' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Identity Verified!
            </h3>
            <p className="text-gray-600 mb-4">
              Your identity has been successfully verified. You now have access to
              all premium features.
            </p>
            <button className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors">
              View Profile
            </button>
          </div>
        )}

        {verificationStatus === 'rejected' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircleIcon size={32} className="text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Verification Rejected
              </h3>
              <p className="text-gray-600">
                Unfortunately, we could not verify your identity with the
                submitted documents.
              </p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-red-900 mb-2">Rejection Reason:</h4>
              <p className="text-sm text-red-800">
                {user.rejectionReason || 'The documents provided were unclear or invalid. Please ensure that your ID is valid, clearly visible, and that the selfie matches the ID.'}
              </p>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setVerificationStatus('unverified')
                  setUploadedFiles({
                    license: null,
                    selfie: null,
                  })
                }}
                className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                Submit New Documents
              </button>
            </div>
          </div>
        )}
      
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Confirm Submission
            </h3>

            <p className="text-sm text-gray-600 mb-6">
              Please confirm that all information and documents you submitted are
              accurate and valid. You won’t be able to edit them while under review.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={(e) => {
                  setShowConfirmModal(false);
                  handleSubmit(e);
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Yes, Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      
      </div>
    </>
  )
}

export default VerifyIdentity

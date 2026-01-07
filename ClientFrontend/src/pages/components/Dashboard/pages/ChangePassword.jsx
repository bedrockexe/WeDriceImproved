import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeftIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from 'lucide-react'
import { toast, Toaster } from 'sonner'
import axios from 'axios'
import { ConfirmationModal } from '../components/UI/ConfirmationModal'


const ChangePassword = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const getPasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[@$!%*?&]/.test(password)) strength++
    return Math.min(strength, 4)
  }
  const getPasswordStrengthLabel = (strength) => {
    const labels = ['Weak', 'Fair', 'Good', 'Strong']
    return labels[strength - 1] || 'Weak'
  }
  const getPasswordStrengthColor = (strength) => {
    const colors = [
      'bg-red-500',
      'bg-orange-500',
      'bg-yellow-500',
      'bg-green-500',
    ]
    return colors[strength - 1] || 'bg-gray-300'
  }
  const validateField = (
    name,
    value,
  ) => {
    switch (name) {
      case 'currentPassword':
        if (!value) return 'Current password is required'
        break
      case 'newPassword':
        if (!value) return 'New password is required'
        if (value.length < 8) return 'Password must be at least 8 characters'
        if (!/[a-z]/.test(value))
          return 'Password must contain at least one lowercase letter'
        if (!/[A-Z]/.test(value))
          return 'Password must contain at least one uppercase letter'
        if (!/\d/.test(value))
          return 'Password must contain at least one number'
        if (value === formData.currentPassword)
          return 'New password must be different from current password'
        break
      case 'confirmPassword':
        if (!value) return 'Please confirm your new password'
        if (value !== formData.newPassword) return 'Passwords do not match'
        break
    }
  }
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
    // Validate confirmPassword when newPassword changes
    if (name === 'newPassword' && formData.confirmPassword) {
      const confirmError = validateField(
        'confirmPassword',
        formData.confirmPassword,
      )
      setErrors((prev) => ({
        ...prev,
        confirmPassword: confirmError,
      }))
    }
  }
  const handleBlur = (e) => {
    const { name, value } = e.target
    const error = validateField(name, value)
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }))
  }
  const validateForm = () => {
    const newErrors = {}
    Object.keys(formData).forEach((key) => {
      const error = validateField(
        key,
        formData[key],
      )
      if (error) newErrors[key] = error
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const confirmChangePassword = async () => {
    setModalLoading(true);
    setIsSubmitting(true);

    try {
      const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

      const res = await axios.patch(
        `${API}/api/users/me`,
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
        { withCredentials: true }
      );

      toast.success(res.data.message || "Password updated successfully!");

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => navigate("/dashboard/settings"), 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating password");
    }

    setIsSubmitting(false);
    setModalLoading(false);
    setModalOpen(false);
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }
  const passwordStrength = getPasswordStrength(formData.newPassword)
  return (
    <>
      <Toaster position="top-right" richColors />
      <div>
        <div className="flex items-center mb-6">
          <Link
            to="/dashboard/settings"
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon size={20} />
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Change Password
          </h1>
        </div>

        <div>
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircleIcon
                size={20}
                className="text-blue-600 mr-3 mt-0.5 flex-shrink-0"
              />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Password Security Tips
                </p>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>
                    • Use at least 8 characters with a mix of letters, numbers,
                    and symbols
                  </li>
                  <li>• Avoid using personal information or common words</li>
                  <li>• Don't reuse passwords from other accounts</li>
                  <li>• Consider using a password manager</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Change Password Form */}
          <form
            // onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-6"
          >
            {/* Current Password */}
            <div className="mb-6">
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Current Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon size={18} className="text-gray-400" />
                </div>
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${errors.currentPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.current ? (
                    <EyeOffIcon size={18} />
                  ) : (
                    <EyeIcon size={18} />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <div className="flex items-center mt-2 text-sm text-red-600">
                  <AlertCircleIcon size={14} className="mr-1 flex-shrink-0" />
                  {errors.currentPassword}
                </div>
              )}
            </div>

            {/* New Password */}
            <div className="mb-6">
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon size={18} className="text-gray-400" />
                </div>
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${errors.newPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? (
                    <EyeOffIcon size={18} />
                  ) : (
                    <EyeIcon size={18} />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">
                      Password strength:
                    </span>
                    <span className="text-xs font-medium text-gray-700">
                      {getPasswordStrengthLabel(passwordStrength)}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${level <= passwordStrength ? getPasswordStrengthColor(passwordStrength) : 'bg-gray-200'}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {errors.newPassword && (
                <div className="flex items-center mt-2 text-sm text-red-600">
                  <AlertCircleIcon size={14} className="mr-1 flex-shrink-0" />
                  {errors.newPassword}
                </div>
              )}

              {/* Password Requirements */}
              <div className="mt-3 space-y-1">
                <p className="text-xs font-medium text-gray-700 mb-2">
                  Password must contain:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  <div
                    className={`flex items-center text-xs ${formData.newPassword.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}
                  >
                    <CheckCircleIcon size={14} className="mr-1 flex-shrink-0" />
                    At least 8 characters
                  </div>
                  <div
                    className={`flex items-center text-xs ${/[a-z]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-500'}`}
                  >
                    <CheckCircleIcon size={14} className="mr-1 flex-shrink-0" />
                    One lowercase letter
                  </div>
                  <div
                    className={`flex items-center text-xs ${/[A-Z]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-500'}`}
                  >
                    <CheckCircleIcon size={14} className="mr-1 flex-shrink-0" />
                    One uppercase letter
                  </div>
                  <div
                    className={`flex items-center text-xs ${/\d/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-500'}`}
                  >
                    <CheckCircleIcon size={14} className="mr-1 flex-shrink-0" />
                    One number
                  </div>
                </div>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="mb-6">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon size={18} className="text-gray-400" />
                </div>
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${errors.confirmPassword ? 'border-red-300 bg-red-50' : formData.confirmPassword && !errors.confirmPassword && formData.confirmPassword === formData.newPassword ? 'border-green-300 bg-green-50' : 'border-gray-300'}`}
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? (
                    <EyeOffIcon size={18} />
                  ) : (
                    <EyeIcon size={18} />
                  )}
                </button>
                {formData.confirmPassword &&
                  !errors.confirmPassword &&
                  formData.confirmPassword === formData.newPassword && (
                    <div className="absolute inset-y-0 right-10 flex items-center">
                      <CheckCircleIcon size={18} className="text-green-500" />
                    </div>
                  )}
              </div>
              {errors.confirmPassword && (
                <div className="flex items-center mt-2 text-sm text-red-600">
                  <AlertCircleIcon size={14} className="mr-1 flex-shrink-0" />
                  {errors.confirmPassword}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
              <Link
                to="/Dashboard/settings"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center font-medium"
              >
                Cancel
              </Link>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  if (!validateForm()) {
                    toast.error("Please fix the errors before submitting");
                    return;
                  }
                  setModalOpen(true);
                }}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
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
                    Updating Password...
                  </span>
                ) : (
                  'Update Password'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => {
          if (!modalLoading) setModalOpen(false);
        }}
        onConfirm={confirmChangePassword}
        title="Confirm Password Change"
        message="Are you sure you want to update your password? You will need to log in again on some devices."
        confirmText="Yes, Update Password"
        cancelText="Cancel"
        variant="warning"
        isLoading={modalLoading}
      />
    </>
  )
}
export default ChangePassword

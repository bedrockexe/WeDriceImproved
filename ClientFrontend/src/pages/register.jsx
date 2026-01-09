import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  LockIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  CarIcon,
} from 'lucide-react'
import axios from 'axios'
import { toast, Toaster } from 'sonner'


const Register = () => {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
        if (!value.trim()) return 'First name is required'
        if (value.length < 2) return 'First name must be at least 2 characters'
        if (!/^[a-zA-Z\s]+$/.test(value))
          return 'First name can only contain letters'
        break
      case 'lastName':
        if (!value.trim()) return 'Last name is required'
        if (value.length < 2) return 'Last name must be at least 2 characters'
        if (!/^[a-zA-Z\s]+$/.test(value))
          return 'Last name can only contain letters'
        break
      case 'email':
        if (!value) return 'Email is required'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return 'Please enter a valid email address'
        break
      case 'phone':
        if (!value) return 'Phone number is required'
        if (!/^\+?[\d\s\-()]+$/.test(value))
          return 'Please enter a valid phone number'
        if (value.replace(/\D/g, '').length < 10)
          return 'Phone number must be at least 10 digits'
        break
      case 'username':
        if (!value) return 'Username is required'
        if (value.length < 3) return 'Username must be at least 3 characters'
        if (value.length > 20) return 'Username must be less than 20 characters'
        if (!/^[a-zA-Z0-9_]+$/.test(value))
          return 'Username can only contain letters, numbers, and underscores'
        break
      case 'password':
        if (!value) return 'Password is required'
        if (value.length < 8) return 'Password must be at least 8 characters'
        if (!/(?=.*[a-z])/.test(value))
          return 'Password must contain at least one lowercase letter'
        if (!/(?=.*[A-Z])/.test(value))
          return 'Password must contain at least one uppercase letter'
        if (!/(?=.*\d)/.test(value))
          return 'Password must contain at least one number'
        break
      case 'confirmPassword':
        if (!value) return 'Please confirm your password'
        if (value !== formData.password) return 'Passwords do not match'
        break
    }
  }
  const getPasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/(?=.*[a-z])/.test(password)) strength++
    if (/(?=.*[A-Z])/.test(password)) strength++
    if (/(?=.*\d)/.test(password)) strength++
    if (/(?=.*[@$!%*?&])/.test(password)) strength++
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
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Validate field on change if it's been touched
    if (touched[name]) {
      const error = validateField(name, value)
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }))
    }
    // Also validate confirmPassword when password changes
    if (name === 'password' && touched.confirmPassword) {
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
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }))
    const error = validateField(name, value)
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }))
  }
  const validateForm = () => {
    const newErrors = {}
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key])
      if (error) newErrors[key] = error
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  const handleSubmit = async (e) => {
    e.preventDefault();

  // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(allTouched);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await axios.post(
        `${API}/api/users/register`,
        {
          username: formData.username,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        },
        { withCredentials: true }
      );

      toast.success('Account created successfully! Please verify your email before logging in.', {
        duration: 4000,
      })

      setTimeout(() => {
        navigate('/login')
      }, 500)

    } catch (err) {
      if (err.response.status === 400) {
        toast.error(err.response.data.message, {duration: 3000});
      }
      if (err.response && err.response.status === 500) {
        toast.error('Server error. Please try again later.', { duration: 4000 });
        setIsLoading(false);
        return;
      }
    } finally {
      setIsLoading(false);
    }
  };
  const passwordStrength = getPasswordStrength(formData.password)
  return (
    <>
    <Toaster richColors />
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-2xl mb-4 shadow-lg">
            <CarIcon size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Join <span className="text-green-500">We</span>Drive
          </h1>
          <p className="text-gray-600 mt-2">
            Create your account to get started
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${errors.firstName && touched.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                    placeholder="John"
                  />
                </div>
                {errors.firstName && touched.firstName && (
                  <div className="flex items-center mt-2 text-sm text-red-600">
                    <AlertCircleIcon size={14} className="mr-1 flex-shrink-0" />
                    {errors.firstName}
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${errors.lastName && touched.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                    placeholder="Doe"
                  />
                </div>
                {errors.lastName && touched.lastName && (
                  <div className="flex items-center mt-2 text-sm text-red-600">
                    <AlertCircleIcon size={14} className="mr-1 flex-shrink-0" />
                    {errors.lastName}
                  </div>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MailIcon size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${errors.email && touched.email ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && touched.email && (
                <div className="flex items-center mt-2 text-sm text-red-600">
                  <AlertCircleIcon size={14} className="mr-1 flex-shrink-0" />
                  {errors.email}
                </div>
              )}
            </div>

            {/* Phone and Username */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneIcon size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${errors.phone && touched.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                {errors.phone && touched.phone && (
                  <div className="flex items-center mt-2 text-sm text-red-600">
                    <AlertCircleIcon size={14} className="mr-1 flex-shrink-0" />
                    {errors.phone}
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${errors.username && touched.username ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                    placeholder="johndoe"
                  />
                </div>
                {errors.username && touched.username && (
                  <div className="flex items-center mt-2 text-sm text-red-600">
                    <AlertCircleIcon size={14} className="mr-1 flex-shrink-0" />
                    {errors.username}
                  </div>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon size={18} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${errors.password && touched.password ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  placeholder="••••••••"
                />
              </div>
              {formData.password && (
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
              {errors.password && touched.password && (
                <div className="flex items-center mt-2 text-sm text-red-600">
                  <AlertCircleIcon size={14} className="mr-1 flex-shrink-0" />
                  {errors.password}
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon size={18} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${errors.confirmPassword && touched.confirmPassword ? 'border-red-300 bg-red-50' : formData.confirmPassword && !errors.confirmPassword && touched.confirmPassword ? 'border-green-300 bg-green-50' : 'border-gray-300'}`}
                  placeholder="••••••••"
                />
                {formData.confirmPassword &&
                  !errors.confirmPassword &&
                  touched.confirmPassword && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <CheckCircleIcon size={18} className="text-green-500" />
                    </div>
                  )}
              </div>
              {errors.confirmPassword && touched.confirmPassword && (
                <div className="flex items-center mt-2 text-sm text-red-600">
                  <AlertCircleIcon size={14} className="mr-1 flex-shrink-0" />
                  {errors.confirmPassword}
                </div>
              )}
            </div>

            {/* Show Password Toggle */}
            <div className="flex items-center">
            <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                className="w-4 h-4 text-green-500 border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="showPassword" className="ml-2 text-sm text-gray-600">
                Show Passwords
            </label>
            </div>


            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
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
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
    
  )
}
export default Register

import React, { useState, useEffect } from 'react'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader2,
  AlertTriangle,
  XCircle,
} from 'lucide-react'

import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../authentication/AuthContext'


export function LoginForm() {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [attemptCount, setAttemptCount] = useState(0)

  const validateEmail = (email) => {
    if (!email) return 'Email is required'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return 'Please enter a valid email address'
    return undefined
  }

  const validatePassword = (password) => {
    if (!password) return 'Password is required'
    if (password.length < 8) return 'Password must be at least 8 characters'
    return undefined
  }

  const handleBlur = (field) => {
    setErrors((prev) => {
      const newErrors = {
        ...prev,
      }
      if (field === 'email') {
        newErrors.email = validateEmail(email)
      }
      if (field === 'password') {
        newErrors.password = validatePassword(password)
      }
      // Clear global error on interaction
      if (newErrors.global) delete newErrors.global
      return newErrors
    })
  }

  
  const handleSubmit = async (e) => {
    e.preventDefault()
    // 1. Validate Fields
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError,
      })
      return
    }
    // 2. Check Rate Limiting (Client-side simulation)
    if (attemptCount >= 5) {
      setStatus('locked')
      setErrors({
        global: 'Maximum login attempts exceeded. Please try again later.',
      })
      return
    }
    // 3. Submit
    setStatus('loading')
    setErrors({})
    try {
      await login({ email, password });
      navigate('/dashboard');
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setAttemptCount((prev) => prev + 1)
      const errorMessage = err.message || 'An unexpected error occurred'
      if (
        errorMessage.includes('locked') ||
        errorMessage.includes('Too many')
      ) {
        setStatus('locked')
      }
      setErrors((prev) => ({
        ...prev,
        global: errorMessage,
      }))
    }
  }
  if (status === 'success') {
    return (
      <div className="w-full max-w-md mx-auto p-8 bg-emerald-50 rounded-xl border border-emerald-100 text-center animate-in fade-in zoom-in duration-300">
        <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-xl font-bold text-emerald-900 mb-2">
          Login Successful
        </h3>
        <p className="text-emerald-700">Redirecting to dashboard...</p>
      </div>
    )
  }
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Admin Login
        </h1>
        <p className="text-gray-500 mt-2">
          Enter your credentials to access the fleet dashboard.
        </p>
      </div>

      {/* Global Error Alert */}
      {errors.global && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-start gap-3 text-sm ${status === 'locked' ? 'bg-red-50 border border-red-100 text-red-800' : 'bg-amber-50 border border-amber-100 text-amber-800'}`}
          role="alert"
        >
          {status === 'locked' ? (
            <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-medium">
              {status === 'locked' ? 'Access Denied' : 'Login Failed'}
            </p>
            <p className="mt-1 opacity-90">{errors.global}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Email Field */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail
                className={`h-5 w-5 ${errors.email ? 'text-red-400' : 'text-gray-400'}`}
              />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
              disabled={status === 'loading' || status === 'locked'}
              className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-offset-0 transition-colors
                ${errors.email ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-200'}
                disabled:bg-gray-50 disabled:text-gray-500
              `}
              placeholder="admin@rental-service.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
          </div>
          {errors.email && (
            <p
              id="email-error"
              className="flex items-center text-sm text-red-600 animate-in slide-in-from-top-1"
            >
              <AlertCircle className="w-4 h-4 mr-1.5" />
              {errors.email}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <a
              href="#"
              className="text-sm font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
            >
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock
                className={`h-5 w-5 ${errors.password ? 'text-red-400' : 'text-gray-400'}`}
              />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur('password')}
              disabled={status === 'loading' || status === 'locked'}
              className={`block w-full pl-10 pr-10 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-offset-0 transition-colors
                ${errors.password ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-200'}
                disabled:bg-gray-50 disabled:text-gray-500
              `}
              placeholder="••••••••"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={status === 'loading' || status === 'locked'}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p
              id="password-error"
              className="flex items-center text-sm text-red-600 animate-in slide-in-from-top-1"
            >
              <AlertCircle className="w-4 h-4 mr-1.5" />
              {errors.password}
            </p>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={status === 'loading' || status === 'locked'}
            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded transition-colors cursor-pointer disabled:opacity-50"
          />
          <label
            htmlFor="remember-me"
            className="ml-2 block text-sm text-gray-700 cursor-pointer disabled:opacity-50"
          >
            Remember me for 30 days
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={status === 'loading' || status === 'locked'}
          className={`w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all
            ${status === 'locked' ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 active:bg-emerald-800'}
            disabled:opacity-70 disabled:cursor-not-allowed
          `}
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Signing in...
            </>
          ) : status === 'locked' ? (
            'Account Locked'
          ) : (
            'Sign In'
          )}
        </button>
      </form>
    </div>
  )
}

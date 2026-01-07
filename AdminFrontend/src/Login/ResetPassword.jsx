import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Car, Lock, ShieldCheck, ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import axios from "axios"
import { toast, Toaster } from "sonner"

export function NewPasswordPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const API = import.meta.env.VITE_API_URL || "http://localhost:5001"
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)

    try {
      const response = await axios.post(`${API}/api/admin/reset-password/${token}`, { password })
      toast.success(response.data.message || "Password has been reset!", {
        duration: 4000,
      })
      setTimeout(() => {
        setLoading(false)
        navigate("/")
      }, 1200)
    } catch (err) {
      setLoading(false)
      toast.error(
        err.response?.data?.message || "Failed to reset password",
        { duration: 5000 }
      )
      setError("Invalid or expired reset link")
    }
  }

  return (
    <>
        <Toaster richColors position="top-right" />
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
        {/* Left Branding Panel */}
        <div className="lg:w-1/2 relative overflow-hidden bg-emerald-900 flex flex-col justify-between p-12 text-white">
            <div className="absolute inset-0 opacity-10">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
            </svg>
            </div>

            <div className="absolute inset-0 bg-gradient-to-br from-emerald-800/90 to-emerald-950/90" />

            <div className="relative z-10">
            <div className="flex items-center gap-3 text-emerald-300 mb-8">
                <div className="p-2 bg-emerald-800/50 rounded-lg border border-emerald-700">
                <Car className="w-8 h-8" />
                </div>
                <span className="text-xl font-bold tracking-wide uppercase">
                WeDrive
                </span>
            </div>

            <div className="mt-12 max-w-lg">
                <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
                Create a New Password
                </h2>
                <p className="text-emerald-100 text-lg opacity-90">
                Choose a strong password to secure your account.
                </p>
            </div>
            </div>

            <div className="relative z-10 mt-12 text-sm text-emerald-400/60">
            © 2024 WeDrive Inc. All rights reserved.
            </div>
        </div>

        {/* Right Panel - Reset Form */}
        <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
            <div className="w-full max-w-md">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Set New Password
                </h1>
                <p className="text-gray-600">
                Please enter and confirm your new password.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Password */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                </label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                </div>
                </div>

                {/* Confirm Password */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                </label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                </div>
                </div>

                {/* Error */}
                {error && (
                <p className="text-sm text-red-500">{error}</p>
                )}

                {/* Submit */}
                <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-70"
                >
                <ShieldCheck className="w-5 h-5" />
                {loading ? "Updating..." : "Update Password"}
                </button>
            </form>

            {/* Back */}
            <div className="mt-6">
                <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:underline"
                >
                <ArrowLeft className="w-4 h-4" />
                Back to login
                </Link>
            </div>
            </div>
        </div>
        </div>
    </>
  )
}

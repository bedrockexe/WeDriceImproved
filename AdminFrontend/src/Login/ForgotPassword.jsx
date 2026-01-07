import React, { useState } from "react"
import { Car, Mail, ArrowLeft, ShieldCheck } from "lucide-react"
import { Link } from "react-router-dom"
import axios from "axios"
import { toast, Toaster } from "sonner"

export function ResetPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const API = import.meta.env.VITE_API_URL || "http://localhost:5001"

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
        const response = await axios.post(`${API}/api/admin/forgot-password`, { email })
        toast.success(response.data.message || "Password reset link sent!", {
            duration: 4000,
        });
        setEmail("");
    } catch (error) {
        console.error(error);
        toast.error(
            error.response?.data?.message || "Failed to send reset link",
            { duration: 5000 }
        );
    }

    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  return (
    <>
        <Toaster richColors position="top-right" />
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
        {/* Left Panel - Branding */}
        <div className="lg:w-1/2 relative overflow-hidden bg-emerald-900 flex flex-col justify-between p-12 text-white">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
            </svg>
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-800/90 to-emerald-950/90" />

            {/* Content */}
            <div className="relative z-10">
            <div className="flex items-center gap-3 text-emerald-300 mb-8">
                <div className="p-2 bg-emerald-800/50 rounded-lg backdrop-blur-sm border border-emerald-700">
                <Car className="w-8 h-8" />
                </div>
                <span className="text-xl font-bold tracking-wide uppercase">
                WeDrive
                </span>
            </div>

            <div className="mt-12 max-w-lg">
                <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
                Secure Account Recovery
                </h2>
                <p className="text-emerald-100 text-lg leading-relaxed opacity-90">
                Enter your registered email and we’ll send you a secure link to
                reset your password.
                </p>
            </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 mt-12 text-sm text-emerald-400/60">
            © 2024 WeDrive Inc. All rights reserved.
            </div>
        </div>

        {/* Right Panel - Reset Form */}
        <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
            <div className="w-full max-w-md">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Reset Password
                </h1>
                <p className="text-gray-600">
                We’ll email you instructions to reset your password.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                </label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@wedrive.com"
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                </div>
                </div>

                {/* Submit */}
                <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-70"
                >
                <ShieldCheck className="w-5 h-5" />
                {loading ? "Sending..." : "Send Reset Link"}
                </button>
            </form>

            {/* Back to Login */}
            <div className="mt-6">
                <Link
                to="/"
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

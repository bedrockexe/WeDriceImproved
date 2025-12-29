import React from 'react'
import { LoginForm } from './LoginForm'
import { Car, Key, ShieldCheck, BarChart3 } from 'lucide-react'
export function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
      {/* Left Panel - Branding */}
      <div className="lg:w-1/2 relative overflow-hidden bg-emerald-900 flex flex-col justify-between p-12 text-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg
            className="h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
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
              Streamline Your Fleet Management
            </h2>
            <p className="text-emerald-100 text-lg leading-relaxed opacity-90">
              Access real-time analytics, vehicle tracking, and reservation
              management in one powerful dashboard.
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="relative z-10 mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-800/50 flex items-center justify-center border border-emerald-700 backdrop-blur-sm">
              <Key className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-semibold text-emerald-100">Smart Access</h3>
              <p className="text-sm text-emerald-300/80">
                Digital key management
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-800/50 flex items-center justify-center border border-emerald-700 backdrop-blur-sm">
              <BarChart3 className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-semibold text-emerald-100">Analytics</h3>
              <p className="text-sm text-emerald-300/80">
                Real-time fleet data
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-800/50 flex items-center justify-center border border-emerald-700 backdrop-blur-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-semibold text-emerald-100">Secure</h3>
              <p className="text-sm text-emerald-300/80">
                Enterprise grade security
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-12 text-sm text-emerald-400/60">
          © 2024 WeDrive Inc. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}

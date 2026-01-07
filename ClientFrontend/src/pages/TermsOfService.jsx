import React from "react";
import { CarIcon } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 px-4 py-10">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-green-500 rounded-2xl mb-4 shadow-lg">
            <CarIcon size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Terms of <span className="text-green-500">Service</span>
          </h1>
          <p className="text-gray-600 mt-2">Last updated: January 2026</p>
        </div>

        <section className="space-y-5 text-gray-700">
          <p>
            Welcome to <strong>WeDrive</strong>. By accessing or using our
            platform, you agree to be bound by these Terms of Service. If you do
            not agree, please discontinue using the service.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">
            1. Eligibility
          </h2>
          <p>
            You must be at least 18 years old and legally capable of entering
            into binding agreements to use WeDrive.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">
            2. Account Registration
          </h2>
          <p>
            Users are responsible for maintaining the confidentiality of their
            account credentials and all activities performed under their
            account.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">
            3. Bookings & Payments
          </h2>
          <p>
            All vehicle bookings are subject to availability and confirmation.
            Payments must be completed through approved payment methods
            displayed on the platform.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">
            4. User Responsibilities
          </h2>
          <p>
            Users agree to comply with all applicable laws, traffic rules, and
            rental agreements when using rented vehicles.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">
            5. Prohibited Activities
          </h2>
          <p>
            Any misuse of the platform, fraudulent activity, unauthorized
            access, or damage to vehicles may result in account suspension or
            termination.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">
            6. Limitation of Liability
          </h2>
          <p>
            WeDrive shall not be liable for indirect, incidental, or
            consequential damages arising from the use of the service or rented
            vehicles.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">
            7. Governing Law
          </h2>
          <p>
            These Terms are governed by the laws of the Republic of the
            Philippines.
          </p>
        </section>

        <div className="border-t border-gray-200 mt-10 pt-6 text-sm text-gray-500 text-center">
          © {new Date().getFullYear()} WeDrive. All rights reserved.
        </div>
      </div>
    </div>
  );
}

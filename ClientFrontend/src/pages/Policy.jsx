import React from "react";
import { ShieldCheckIcon } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 px-4 py-10">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-green-500 rounded-2xl mb-4 shadow-lg">
            <ShieldCheckIcon size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Privacy <span className="text-green-500">Policy</span>
          </h1>
          <p className="text-gray-600 mt-2">Last updated: January 2026</p>
        </div>

        <section className="space-y-5 text-gray-700">
          <p>
            At <strong>WeDrive</strong>, we respect your privacy and are committed
            to protecting your personal information. This policy explains how
            we collect, use, and safeguard your data.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">
            1. Information We Collect
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Full name, email address, and phone number</li>
            <li>Account credentials (securely encrypted)</li>
            <li>Booking and transaction details</li>
            <li>Technical data (IP address, browser, device)</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900">
            2. How We Use Your Information
          </h2>
          <p>
            Your data is used to manage accounts, process reservations, send
            notifications, improve services, and comply with legal obligations.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">
            3. Cookies & Tracking
          </h2>
          <p>
            We use cookies and similar technologies to maintain login sessions
            and enhance user experience. Disabling cookies may limit certain
            features.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">
            4. Data Sharing
          </h2>
          <p>
            WeDrive does not sell personal data. Information may be shared with
            trusted partners such as payment processors or when required by
            law.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">
            5. Data Security
          </h2>
          <p>
            We implement reasonable security measures including encrypted
            communication, access controls, and secure authentication.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">
            6. Your Rights
          </h2>
          <p>
            You may request access, correction, or deletion of your personal
            information by contacting support.
          </p>
        </section>

        <div className="border-t border-gray-200 mt-10 pt-6 text-sm text-gray-500 text-center">
          © {new Date().getFullYear()} WeDrive. All rights reserved.
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MailIcon, AlertCircleIcon, ArrowLeftIcon, CarIcon } from "lucide-react";
import axios from "axios";
import { toast, Toaster } from "sonner";

const ForgotPassword = () => {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    if (!email) {
      setError("Email is required");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    try {
      const res = await axios.post(`${API}/api/users/forgot-password`, { email });

      toast.success(res.data.message || "Password reset link sent!", {
        duration: 4000,
      });

      setEmail("");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to send reset link",
        { duration: 5000 }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster richColors />

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-2xl mb-4 shadow-lg">
              <CarIcon size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Forgot your <span className="text-green-500">password?</span>
            </h1>
            <p className="text-gray-600 mt-2">
              Enter your email and we’ll send you a reset link
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MailIcon size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      error ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="johndoe@email.com"
                  />
                </div>

                {error && (
                  <div className="flex items-center mt-2 text-sm text-red-600">
                    <AlertCircleIcon size={14} className="mr-1" />
                    {error}
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                {isLoading ? "Sending..." : "Send reset link"}
              </button>
            </form>

            {/* Back to login */}
            <Link
              to="/login"
              className="flex items-center justify-center mt-6 text-sm text-green-600 hover:text-green-700 font-medium"
            >
              <ArrowLeftIcon size={16} className="mr-1" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;

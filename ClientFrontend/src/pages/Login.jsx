import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MailIcon, LockIcon, AlertCircleIcon, CarIcon, EyeIcon, EyeOffIcon, UserIcon } from 'lucide-react'
import axios from 'axios'
import { useAuth } from "@/authentication/AuthContext";
import { toast, Toaster } from 'sonner'

const Login = () => {
  const { refetchUser } = useAuth();
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    identifier: "", // username OR email
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.identifier) {
      newErrors.identifier = "Email or Username is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response =await axios.post(
        `${API}/api/users/login`,
        { email: formData.identifier, password: formData.password },
        { withCredentials: true }
      );

      console.log(`Login Request: ${response.data.message}`)

      toast.success("Login successful! Welcome back.", { duration: 3000 });

      await refetchUser();

      setTimeout(() => navigate("/dashboard"), 500);
    } catch (err) {
      if (err.response?.status === 401) {
        // toast.error("Invalid credentials. Please try again.", { duration: 5000 });
        toast.error(err.response.data.message || "Invalid credentials. Please try again.", { duration: 5000 });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
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
              Welcome to <span className="text-green-500">We</span>Drive
            </h1>
            <p className="text-gray-600 mt-2">Sign in to your account</p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Identifier Field */}
              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
                  Email or Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="identifier"
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.identifier ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="johndoe or johndoe@email.com"
                  />
                </div>
                {errors.identifier && (
                  <div className="flex items-center mt-2 text-sm text-red-600">
                    <AlertCircleIcon size={14} className="mr-1" />
                    {errors.identifier}
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon size={18} className="text-gray-400" />
                  </div>

                  {/* 👁️ Toggleable password field */}
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.password ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="••••••••"
                  />

                  {/* Eye Icon */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                  </button>
                </div>

                {errors.password && (
                  <div className="flex items-center mt-2 text-sm text-red-600">
                    <AlertCircleIcon size={14} className="mr-1" />
                    {errors.password}
                  </div>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="w-4 h-4 text-green-500 border-gray-300 rounded focus:ring-green-500" />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-green-600 hover:text-green-700 font-medium">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">New to WeDrive?</span>
              </div>
            </div>

            {/* Register Link */}
            <Link
              to="/register"
              className="block w-full text-center py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Create an account
            </Link>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-6">
            By continuing, you agree to our{" "}
            <a href="#" className="text-green-600 hover:text-green-700">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-green-600 hover:text-green-700">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;

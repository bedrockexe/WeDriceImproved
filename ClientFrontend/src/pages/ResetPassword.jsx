import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LockIcon, EyeIcon, EyeOffIcon, AlertCircleIcon, CarIcon } from "lucide-react";
import axios from "axios";
import { toast, Toaster } from "sonner";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${API}/api/users/reset-password/${token}`,
        { password }
      );

      toast.success(res.data.message);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Reset failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster richColors />

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
          <div className="text-center mb-6">
            <div className="inline-flex w-16 h-16 bg-green-500 rounded-2xl items-center justify-center mb-4">
              <CarIcon size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold">Reset Password</h2>
            <p className="text-gray-600 mt-1">Enter your new password</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type={show ? "text" : "password"}
                  className="w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-3 text-gray-500"
                >
                  {show ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
              {error && (
                <div className="flex items-center mt-2 text-sm text-red-600">
                  <AlertCircleIcon size={14} className="mr-1" />
                  {error}
                </div>
              )}
            </div>

            <button
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;

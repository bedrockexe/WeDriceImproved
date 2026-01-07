import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { useAuth } from "@/authentication/AuthContext";

export default function DeleteAccount() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleDelete = async () => {
    setError("");

    if (confirmation !== "DELETE") {
      return setError("You must type DELETE to confirm.");
    }

    if (!password) {
      return setError("Password is required.");
    }

    try {
      setLoading(true);
      await axios.delete(`${API}/api/users/me`, { data: { password }, withCredentials: true });
      logout();
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-red-700">Delete Account</h1>

      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="text-red-600 mt-1" />
          <div>
            <p className="font-semibold text-red-800">
              This action is permanent
            </p>
            <ul className="list-disc list-inside text-sm text-red-700 mt-2 space-y-1">
              <li>Your account will be permanently deleted</li>
              <li>All bookings and rental history will be removed</li>
              <li>You will lose access to active reservations</li>
              <li>This action cannot be undone</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6 space-y-4">
        <div>
          <label className="block font-medium text-gray-700">
            Enter your password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1 border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">
            Type <span className="font-bold text-red-600">DELETE</span> to confirm
          </label>
          <input
            type="text"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            className="w-full mt-1 border rounded px-3 py-2"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete Account"}
          </button>

          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

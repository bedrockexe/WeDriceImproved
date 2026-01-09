import { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");

  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      return;
    }

    axios
      .get(`${API}/api/users/verify-email?token=${token}`)
      .then(() => {
        setStatus("success");
        setTimeout(() => navigate("/login"), 2500);
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
        
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              Verifying your email
            </h2>
            <p className="text-gray-500 mt-2">
              Please wait a moment…
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              Email verified successfully
            </h2>
            <p className="text-gray-500 mt-2">
              Redirecting you to login…
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="mx-auto mb-4 h-12 w-12 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              Verification failed
            </h2>
            <p className="text-gray-500 mt-2">
              This link may be expired or invalid.
            </p>

            <button
              onClick={() => navigate("/login")}
              className="mt-6 w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition"
            >
              Go to Login
            </button>
          </>
        )}

      </div>
    </div>
  );
}

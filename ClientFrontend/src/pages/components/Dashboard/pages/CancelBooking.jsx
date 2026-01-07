import { useParams, useNavigate } from "react-router-dom";
import { AlertTriangleIcon, ArrowLeftIcon } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

const CancelBooking = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }

    try {
      setLoading(true);

      await axios.put(
        `${API}/api/bookings/${bookingId}/cancel`,
        { reason },
        { withCredentials: true }
      );

      toast.success("Booking cancelled successfully");
      navigate("/dashboard/bookings");

    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to cancel booking"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          Cancel Booking
        </h1>
      </div>

      {/* Warning Box */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
        <div className="flex items-start">
          <AlertTriangleIcon className="text-red-500 mr-3 mt-1" />
          <div>
            <h2 className="font-semibold text-red-700 mb-2">
              Please read before cancelling
            </h2>
            <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
              <li>This action cannot be undone</li>
              <li>Your booking will be permanently cancelled</li>
              <li>Refunds (if applicable) may take 5–10 business days</li>
              <li>Reservation fees may be non-refundable</li>
              <li>Late cancellations may receive partial or no refund</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Cancellation Reason */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">
          Cancellation Reason <span className="text-red-500">*</span>
        </h2>
        <textarea
          rows={5}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Please explain why you want to cancel this booking..."
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-red-400 focus:outline-none"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Go Back
        </button>

        <button
          disabled={loading}
          onClick={handleCancel}
          className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
        >
          {loading ? "Cancelling..." : "Confirm Cancellation"}
        </button>
      </div>
    </div>
  );
};

export default CancelBooking;

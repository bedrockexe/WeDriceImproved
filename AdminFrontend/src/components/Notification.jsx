import { X, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";


export const NotificationPanel = ({ isOpen, onClose, notifList = [], onRefresh }) => {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5001";
  const navigate = useNavigate();

  const handleNotificationClick = async (notif) => {
    onClose();
    const type = notif.type;
    const id = type === "booking" ? notif.bookingId : notif.userId;

    try {
      await axios.put(`${API}/api/admin/notifications/mark-read/${notif.id}`, {}, { withCredentials: true });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to mark as read", err);
    }

    if (!id) return;
    if (type === "booking") {
      navigate(`/dashboard/bookings?bookingId=${id}`);
    } else if (type === "verification") {
      navigate(`/dashboard/customers?userId=${id}`);
    }
  };

  const notifications = notifList || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Panel */}
          <motion.div
            className="fixed right-4 top-16 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-600" />
                <h3 className="font-semibold text-sm">Notifications</h3>
              </div>
              <button onClick={onClose}>
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            {notifications.length === 0 && (
              <div className="p-4 text-center text-sm text-gray-500">
                No notifications
              </div>
            )}

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`px-4 py-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${!notif.isRead ? "bg-emerald-50" : ""
                    }`}
                >
                  <p className="text-sm font-medium text-gray-900">
                    {notif.title}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {notif.message}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {notif.timeAgo}
                  </p>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-3 border-t text-center">
              <Link to="/dashboard/notifications" onClick={onClose} className="text-sm text-emerald-600 hover:underline">
                View all notifications
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

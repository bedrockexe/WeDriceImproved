import { Bell, CheckCircle, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function NotificationsPage() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5001";
  const [notifications, setNotifications] = useState([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);

  const [showMarkAllModal, setShowMarkAllModal] = useState(false);
  const [showMarkAllUnreadModal, setShowMarkAllUnreadModal] = useState(false);
  const [processingAll, setProcessingAll] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${API}/api/admin/notifications`, { withCredentials: true });
        setNotifications(response.data.notifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotifications();
  }, []);

  const handleNotificationClick = async (link) => {
    searchParams.delete("bookingId");
    navigate(`/dashboard/bookings?bookingId=${link}`);
    await axios.put(`${API}/api/admin/notifications/mark-read/${link}`, {}, { withCredentials: true });
    window.location.reload();
  };

  // Delete modal
  const confirmDelete = (notif) => {
    setSelectedNotif(notif);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedNotif) return;
    await axios.patch(`${API}/api/admin/notifications/delete/${selectedNotif.bookingId}`, {}, { withCredentials: true });
    setNotifications((prevNotifs) => prevNotifs.filter((notif) => notif.bookingId !== selectedNotif.bookingId));
    setShowDeleteModal(false);
    setSelectedNotif(null);
  };

  // Mark all as read modal
  const confirmMarkAll = () => setShowMarkAllModal(true);
  const handleMarkAllAsRead = async () => {
    setProcessingAll(true);
    try {
      await axios.put(`${API}/api/admin/notifications/mark-all-read`, {}, { withCredentials: true });
      setNotifications((prev) => prev.map((notif) => ({ ...notif, unread: false })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
    setProcessingAll(false);
    setShowMarkAllModal(false);
  };

  // Mark all as unread modal
  const confirmMarkAllUnread = () => setShowMarkAllUnreadModal(true);
  const handleMarkAllAsUnread = async () => {
    setProcessingAll(true);
    try {
      await axios.put(`${API}/api/admin/notifications/mark-all-unread`, {}, { withCredentials: true });
      setNotifications((prev) => prev.map((notif) => ({ ...notif, unread: true })));
    } catch (error) {
      console.error("Error marking all as unread:", error);
    }
    setProcessingAll(false);
    setShowMarkAllUnreadModal(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-3">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-emerald-600" />
          <h1 className="text-xl font-semibold">All Notifications</h1>
        </div>

        <div className="flex gap-3">
          <button
            onClick={confirmMarkAll}
            disabled={notifications.every((notif) => !notif.unread)}
            className={`flex items-center gap-2 text-sm text-emerald-600 hover:underline ${
              notifications.every((notif) => !notif.unread) ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Mark all as read
          </button>

          <button
            onClick={confirmMarkAllUnread}
            disabled={notifications.every((notif) => notif.unread)}
            className={`flex items-center gap-2 text-sm text-emerald-600 hover:underline ${
              notifications.every((notif) => notif.unread) ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Mark all as unread
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm">No notifications found.</div>
        ) : (
          notifications.map((notif) => (
            <motion.div
              key={notif.bookingId}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className={`flex items-start justify-between px-5 py-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer ${
                notif.unread ? "bg-emerald-50" : ""
              }`}
            >
              <div onClick={() => handleNotificationClick(notif.bookingId)}>
                <p className="text-sm font-medium text-gray-900">{notif.action}</p>
                <p className="text-sm text-gray-600 mt-0.5">{notif.notificationText}</p>
                <p className="text-xs text-gray-400 mt-1">{notif.timeAgo}</p>
              </div>

              <button className="text-gray-400 hover:text-red-500" onClick={() => confirmDelete(notif)}>
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white rounded-xl p-6 w-96 shadow-lg"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Delete Notification</h2>
                <button onClick={() => setShowDeleteModal(false)}>
                  <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete this notification? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mark All as Read Confirmation Modal */}
      <AnimatePresence>
        {showMarkAllModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white rounded-xl p-6 w-96 shadow-lg"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Mark All as Read</h2>
                <button onClick={() => setShowMarkAllModal(false)}>
                  <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to mark all notifications as read?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowMarkAllModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMarkAllAsRead}
                  className={`px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 ${
                    processingAll ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={processingAll}
                >
                  {processingAll ? "Processing..." : "Mark All Read"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mark All as Unread Confirmation Modal */}
      <AnimatePresence>
        {showMarkAllUnreadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white rounded-xl p-6 w-96 shadow-lg"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Mark All as Unread</h2>
                <button onClick={() => setShowMarkAllUnreadModal(false)}>
                  <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to mark all notifications as unread?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowMarkAllUnreadModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMarkAllAsUnread}
                  className={`px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 ${
                    processingAll ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={processingAll}
                >
                  {processingAll ? "Processing..." : "Mark All Unread"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

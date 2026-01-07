import { useEffect, useState } from "react";
import axios from "axios";
import {
  Bell,
  CheckCircle,
  Trash2,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import { useSearchParams } from 'react-router-dom';


export default function NotificationsPage() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [confirmActionOpen, setConfirmActionOpen] = useState(false);
  const [actionType, setActionType] = useState(null); // "read" | "unread"
  const [confirmBulkOpen, setConfirmBulkOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState(null); // "read" | "unread"

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedNotifId, setSelectedNotifId] = useState(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API}/api/users/notifications`, {
        withCredentials: true
      });
      setNotifications(res.data.notifications);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.patch(
      `${API}/api/users/notifications/${id}/read`,
      {},
      { withCredentials: true }
    );

    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      )
    );
    } catch (error) {
      console.log("Error marking as read:", error);
    }
    
  };

  const markAsReadNavigate = async (id, bookingId=null) => {
    await axios.patch(
      `${API}/api/users/notifications/${id}/read`,
      {},
      { withCredentials: true }
    );

    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, read: true } : n
      )
    );

    if (bookingId) {
      navigate(`/dashboard/bookingdetails/${bookingId}`);
      window.location.reload();
    } else {
      navigate('/dashboard/profile');
      window.location.reload();
    }

  };

  const markAllAsRead = async () => {
    await axios.put(
      `${API}/api/users/notifications/mark-all-read`,
      {},
      { withCredentials: true }
    );

    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const markAsUnread = async (id) => {
    try {
      await axios.patch(
      `${API}/api/users/notifications/${id}/unread`,
      {},
      { withCredentials: true }
    );

    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, isRead: false } : n
      )
    );
    } catch (error) {
      console.log("Error marking as unread:", error);
    }
    
  };

  const markAllAsUnread = async () => {
    await axios.put(
      `${API}/api/users/notifications/mark-all-unread`,
      {},
      { withCredentials: true }
    );

    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: false }))
    );
  };

  const deleteNotification = async (id) => {
    await axios.patch(`${API}/api/users/notifications/${id}/trash`, {
      withCredentials: true
    });

    setNotifications(prev =>
      prev.filter(n => n.id !== id)
    );
  };

  const confirmMarkAction = async () => {
    if (!selectedNotifId || !actionType) return;

    if (actionType === "read") {
      await markAsRead(selectedNotifId);
    }

    if (actionType === "unread") {
      await markAsUnread(selectedNotifId);
    }

    setConfirmActionOpen(false);
    setSelectedNotifId(null);
    setActionType(null);
  };

  const confirmBulkAction = async () => {
    if (!bulkAction) return;

    if (bulkAction === "read") {
      await markAllAsRead();
    }

    if (bulkAction === "unread") {
      await markAllAsUnread();
    }

    setConfirmBulkOpen(false);
    setBulkAction(null);
  };


  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2592000 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 }
    ];

    for (let i of intervals) {
      const count = Math.floor(seconds / i.seconds);
      if (count > 0)
        return `${count} ${i.label}${count > 1 ? "s" : ""} ago`;
    }
    return "Just now";
  };

  const confirmDelete = async () => {
    if (!selectedNotifId) return;

    await deleteNotification(selectedNotifId);
    setConfirmOpen(false);
    setSelectedNotifId(null);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell /> Notifications
        </h1>

        <div className="flex gap-4">
          {notifications.some(n => n.isRead) && (
            <button
              onClick={() => {
                setBulkAction("unread");
                setConfirmBulkOpen(true);
              }}
              className="text-sm text-gray-500 hover:underline cursor-pointer"
            >
              Mark all as unread
            </button>
          )}

          {notifications.some(n => !n.isRead) && (
            <button
              onClick={() => {
                setBulkAction("read");
                setConfirmBulkOpen(true);
              }}
              className="text-sm text-green-600 hover:underline cursor-pointer"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow divide-y">
        {loading && (
          <p className="p-6 text-gray-500 text-center">
            Loading notifications...
          </p>
        )}

        {!loading && notifications.length === 0 && (
          <p className="p-6 text-gray-500 text-center">
            You have no notifications.
          </p>
        )}

        <AnimatePresence>
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className={`flex justify-between items-start p-4 border-gray-200 ${
                !notif.isRead ? "bg-green-50" : ""
              }`}
            >
              <div
                className="flex-1 cursor-pointer"
                onClick={() => markAsReadNavigate(notif.id, notif.bookingId)}
              >
                <p className="font-medium">{notif.title}</p>
                <p className="text-sm text-gray-600">
                  {notif.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {timeAgo(notif.createdAt)}
                </p>
              </div>

              <div className="flex items-center gap-2 ml-4">
                {!notif.isRead ? (
                  <button
                    onClick={() => {
                      setSelectedNotifId(notif.id);
                      setActionType("read");
                      setConfirmActionOpen(true);
                    }}
                    className="text-green-600 hover:text-green-800 cursor-pointer"
                    title="Mark as read"
                  >
                    <CheckCircle size={18} />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedNotifId(notif.id);
                      setActionType("unread");
                      setConfirmActionOpen(true);
                    }}
                    className="text-gray-500 hover:text-gray-700 cursor-pointer"
                    title="Mark as unread"
                  >
                    <Bell size={18} />
                  </button>

                )}

                <button
                  onClick={() => {
                    setSelectedNotifId(notif.id);
                    setConfirmOpen(true);
                  }}
                  className="text-red-500 hover:text-red-700 cursor-pointer"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>

            </motion.div>
          ))}
        </AnimatePresence>
        <AnimatePresence>
        {confirmOpen && (
            <motion.div
            className="fixed inset-0 bg-black/20 transition-opacity flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            >
            <motion.div
                className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
            >
                <h2 className="text-lg font-semibold mb-2">
                Delete Notification
                </h2>

                <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete this notification?
                This action cannot be undone.
                </p>

                <div className="flex justify-end gap-3">
                  <button
                      onClick={() => setConfirmOpen(false)}
                      className="px-4 py-2 text-sm rounded-md border hover:bg-gray-100 border-gray-300 cursor-pointer"
                  >
                      Cancel
                  </button>
                  <button
                      onClick={confirmDelete}
                      className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                  >
                      Delete
                  </button>
                </div>
            </motion.div>
            </motion.div>
        )}
        </AnimatePresence>
        <AnimatePresence>
          {confirmActionOpen && (
            <motion.div
              className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <h2 className="text-lg font-semibold mb-2">
                  {actionType === "read"
                    ? "Mark notification as read?"
                    : "Mark notification as unread?"}
                </h2>

                <p className="text-sm text-gray-600 mb-6">
                  {actionType === "read"
                    ? "This notification will be marked as read."
                    : "This notification will be marked as unread."}
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setConfirmActionOpen(false)}
                    className="px-4 py-2 text-sm rounded-md border hover:bg-gray-100 border-gray-300 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={confirmMarkAction}
                    className={`px-4 py-2 text-sm rounded-md text-white cursor-pointer ${
                      actionType === "read"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-gray-600 hover:bg-gray-700"
                    }`}
                  >
                    Confirm
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {confirmBulkOpen && (
            <motion.div
              className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <h2 className="text-lg font-semibold mb-2">
                  {bulkAction === "read"
                    ? "Mark all notifications as read?"
                    : "Mark all notifications as unread?"}
                </h2>

                <p className="text-sm text-gray-600 mb-6">
                  {bulkAction === "read"
                    ? "All notifications will be marked as read."
                    : "All notifications will be marked as unread."}
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setConfirmBulkOpen(false)}
                    className="px-4 py-2 text-sm rounded-md border hover:bg-gray-100 border-gray-300 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={confirmBulkAction}
                    className={`px-4 py-2 text-sm rounded-md text-white ${
                      bulkAction === "read"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-gray-600 hover:bg-gray-700"
                    }`}
                  >
                    Confirm
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

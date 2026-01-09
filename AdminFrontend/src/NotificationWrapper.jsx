import { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { socket } from "./notification/socket";
import { toast } from "sonner";
import { useAuth } from "./authentication/AuthContext";

const NotificationContext = createContext(null);

const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { admin } = useAuth();

  const fetchNotifications = useCallback(async () => {
    try {
        const res = await axios.get(`${API}/api/admin/notifications`, {
          withCredentials: true,
        });
        setNotifications(res.data.notifications);
        setUnreadCount(
          res.data.notifications.filter((n) => !n.isRead).length
        );
        console.log(`Fetch Notifications Called: Data Count - `, res.data.notifications.length);
    } catch (error) {
        console.error("Error fetching notifications:", error);
    }
  }, []);

  useEffect(() => {
    if (!admin?.adminid) return;

    fetchNotifications();
  }, [admin?.adminid, fetchNotifications]);

  useEffect(() => {
    const handleNotification = (data) => {
      toast.success("New notification received", { duration: 4000 });
      fetchNotifications();
    };

    socket.on("new-notification", handleNotification);

    return () => {
      socket.off("new-notification", handleNotification);
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
      }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
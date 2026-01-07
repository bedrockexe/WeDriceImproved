import { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { socket } from "./notification/socket";
import { toast } from "sonner";
import { useAuth } from "@/authentication/AuthContext";

const NotificationContext = createContext(null);

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/users/notifications`, {
        withCredentials: true,
      });

      setNotifications(res.data.notifications.slice(0, 3));
      setUnreadCount(
        res.data.notifications.filter((n) => !n.isRead).length
      );
      console.log(`Fetch Notifications Called: Data Count - `, res.data.notifications.length);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (!user?.userId) return;

    fetchNotifications();
  }, [user?.userId, fetchNotifications]);

  useEffect(() => {
    if (!user?.userId) return;

    socket.emit("join", user.userId);

    const handleNotification = (data) => {
      toast.success("You have a new notification!", { duration: 3000 });
      fetchNotifications();
    };

    socket.on("new-notification", handleNotification);

    return () => {
      socket.off("new-notification", handleNotification);
    };
  }, [user?.userId, fetchNotifications]);


  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  return useContext(NotificationContext);
};

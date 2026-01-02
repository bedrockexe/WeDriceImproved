import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BellIcon, ChevronDownIcon, MenuIcon, UserIcon } from 'lucide-react';
import axios from 'axios';
import { useAuth } from "@/authentication/AuthContext";
import { useNavigate } from 'react-router-dom';
import { socket } from '@/notification/socket';

const TopNavBar = ({ toggleSidebar }) => {
  const [user, setUser] = useState({});
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { logout } = useAuth(); 
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    axios
      .get(`${API}/api/users/notifications`, { withCredentials: true })
      .then(res => {
        const slicedNotifications = res.data.notifications.slice(0, 3);
        setNotifications(slicedNotifications);
        setUnreadCount(res.data.notifications.filter(n => !n.isRead).length);
      })
      .catch(err => console.log(err));
  }, []);

  useEffect(() => {
    axios
      .get(`${API}/api/users/me`, { withCredentials: true })
      .then((res) => {
        setUser(res.data.user);
      })
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    socket.emit("join", user.userId);

    socket.on("new-notification", (data) => {
      alert("New notification:", data);
      console.log("Received notification:", data);
      setNotifications(prev => [data, ...prev]);
      setUnreadCount(prev => prev + 1);
    });
  }, [user.userId]);

  const handleLogout = async () => {
    try {
      await axios.post(`${API}/api/users/logout`, {}, { withCredentials: true });
      logout();
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const markAsRead = async (id, bookingId=null) => {
    try {
      await axios.patch(
        `${API}/api/users/notifications/${id}/read`,
        {},
        { withCredentials: true }
      );

      setNotifications(prev =>
        prev.map(n =>
          n._id === id ? { ...n, read: true } : n
        )
      );

      setUnreadCount(prev => prev - 1);

      if (bookingId) {
        navigate(`/dashboard/bookingdetails/${bookingId}`);
        window.location.reload();
      } else {
        navigate('/dashboard/verify-identity');
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  console.log("Notifications:", notifications);

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 md:px-6 py-3 flex items-center justify-between">
        <button className="md:hidden text-gray-600 hover:text-gray-900" onClick={toggleSidebar}>
          <MenuIcon size={24} />
        </button>

        <Link to="/" className="flex items-center">
          <span className="text-xl font-bold text-gray-800">
            <span className="text-green-500">We</span>Drive
          </span>
        </Link>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              className="text-gray-600 hover:text-gray-900 relative"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <BellIcon size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-30">
                
                {/* Header */}
                <div className="px-4 py-2 font-semibold border-b border-gray-200">
                  Notifications
                </div>

                {/* List */}
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 && (
                    <p className="p-4 text-sm text-gray-500">
                      No notifications
                    </p>
                  )}

                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`px-4 py-3 text-sm cursor-pointer hover:bg-gray-100 ${
                        !notif.isRead ? "bg-green-50" : ""
                      }`}
                      onClick={() => {
                        markAsRead(notif.id, notif.bookingId);
                        setNotificationsOpen(false);
                      }}
                    >
                      <p className="font-medium">{notif.title}</p>
                      <p className="text-gray-600">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {notif.timeAgo}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200">
                  <Link
                    to="/dashboard/notifications"
                    onClick={() => setNotificationsOpen(false)}
                    className="block text-center px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50"
                  >
                    See all notifications
                  </Link>
                </div>
              </div>
            )}

          </div>


          {/* User Menu */}
          <div className="relative">
            <button
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300">
                <UserIcon size={18} className="text-gray-600" />
              </div>

              <span className="hidden md:inline text-sm font-medium">
                {user.username}
              </span>

              <ChevronDownIcon size={16} />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-100">
                <Link
                  to="profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setUserMenuOpen(false)}
                >
                  View Profile
                </Link>

                <Link
                  to="/dashboard/edit-account"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setUserMenuOpen(false)}
                >
                  Edit Account
                </Link>

                <Link
                  to="settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setUserMenuOpen(false)}
                >
                  Settings
                </Link>

                <div className="border-t border-gray-100"></div>

                <Link
                  to="/login"
                  onClick={handleLogout}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;

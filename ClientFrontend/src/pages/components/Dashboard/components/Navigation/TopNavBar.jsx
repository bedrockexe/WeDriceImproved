import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BellIcon, ChevronDownIcon, MenuIcon, UserIcon } from 'lucide-react';
import axios from 'axios';
import { useAuth } from "@/authentication/AuthContext";

const TopNavBar = ({ toggleSidebar }) => {
  const [user, setUser] = useState({});
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const { logout } = useAuth(); 
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    axios
      .get(`${API}/api/users/me`, { withCredentials: true })
      .then((res) => {
        setUser(res.data.user);
      })
      .catch((err) => console.log(err));
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(`${API}/api/users/logout`, {}, { withCredentials: true });
      logout();
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

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
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                3
              </span>
            </button>
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

import { Bell, ChevronDown, LogOut, Menu } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { NotificationPanel } from "./Notification";
import { useAuth } from "../authentication/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { socket } from "../notification/socket";


const getPageTitle = (pathname) => {
  const routes = {
    "/": "Dashboard",
    "/analytics": "Analytics",
    "/customers": "Customers",
    "/fleet": "Fleet Management",
    "/history": "History",
    "/calendar": "Calendar",
    "/settings": "Settings",
    "/help": "Help",
    "/verification": "Verification",
  };
  return routes[pathname] || "Dashboard";
};

export const Header = ({ onMenuClick, isSidebarOpen }) => {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5001";
  const {admin, logout} = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await axios.get(`${API}/api/admin/notifications/unread-count`, {
          withCredentials: true,
        });
        setUnreadCount(response.data.unreadCount);
      } catch (error) {
        console.error("Error fetching unread notifications count:", error);
      }
    };

    fetchUnreadCount();
  }, [API]);

  useEffect(() => {
    socket.on("new-notification", () => {
      alert("New notification received");
    });
  }, []);

  console.log("Unread notifications count:", unreadCount);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <header className="h-14 sm:h-16 border-b border-border bg-card flex items-center justify-between px-3 sm:px-4 md:px-6 sticky top-0 z-30">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onMenuClick}
            title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate">{pageTitle}</h1>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setShowNotifications((prev) => !prev)}
            >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full transform translate-x-1/2 -translate-y-1/2">
                {unreadCount}
              </span>
            )}
          </Button>
          
          <div className="h-6 sm:h-8 w-px bg-border hidden sm:block" />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-auto py-1.5 sm:py-2 px-2 sm:px-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-xs sm:text-sm font-semibold">{admin?.name ? admin.name.split(" ").map(n => n[0]).join("") : "U"}</span>
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium">{admin?.name || "User"}</p>
                </div>
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-card">
              <DropdownMenuItem 
                onClick={() => navigate("/dashboard/profile")}
                className="cursor-pointer">
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-destructive hover:text-destructive focus:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      {/* Notification Popup */}
      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
};

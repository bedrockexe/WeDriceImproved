import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  Clock, 
  Calendar, 
  Car,
  Truck,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/dashboard/bookings", icon: BookOpen, label: "Booking" },
  { to: "/dashboard/customers", icon: Users, label: "Customers" },
  { to: "/dashboard/fleet", icon: Truck, label: "Fleet Management" },
  { to: "/dashboard/history", icon: Clock, label: "History" },
  { to: "/dashboard/calendar", icon: Calendar, label: "Calendar" },
];


export const Sidebar = ({ isOpen, isMobile, onToggle }) => {
  return (
    <aside className={cn(
      "bg-[hsl(var(--sidebar-bg))] border-r border-border flex flex-col h-screen fixed top-0 left-0 z-50 transition-all duration-300",
      isMobile ? (isOpen ? "w-full" : "-translate-x-full w-full") : (isOpen ? "w-52" : "w-16"),
      !isMobile && "translate-x-0"
    )}>
      <div 
        className="p-3 sm:p-4 md:p-6 flex items-center gap-2 border-b border-border min-h-[60px] cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={onToggle}
        title={isMobile ? "Close menu" : (isOpen ? "Collapse sidebar" : "Expand sidebar")}
      >
        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-primary rounded-full flex items-center justify-center shrink-0">
          <Car className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
        </div>
        {(isOpen || isMobile) && <span className="text-base sm:text-lg md:text-xl font-bold text-foreground whitespace-nowrap">WeDrive</span>}
      </div>
      
      <nav 
        className="flex-1 px-2 py-2 overflow-y-auto cursor-pointer hover:bg-accent/20 transition-colors"
        onClick={onToggle}
        title={isMobile ? "Close menu" : (isOpen ? "Collapse sidebar" : "Expand sidebar")}
      >
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === "/dashboard"}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isMobile) onToggle();
                }}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-[hsl(var(--sidebar-text))] hover:bg-accent",
                    !isMobile && !isOpen && "justify-center px-2"
                  )
                }
                title={!isMobile && !isOpen ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {(isOpen || isMobile) && <span className="whitespace-nowrap">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

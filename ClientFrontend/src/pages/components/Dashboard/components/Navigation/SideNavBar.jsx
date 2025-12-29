import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, CalendarIcon, CarIcon, CreditCardIcon, HelpCircleIcon, SettingsIcon } from 'lucide-react';

const SideNavBar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', icon: <HomeIcon size={20} />, path: '/dashboard' },
    { name: 'My Bookings', icon: <CalendarIcon size={20} />, path: '/dashboard/bookings' },
    { name: 'Available Cars', icon: <CarIcon size={20} />, path: '/dashboard/cars' },
    { name: 'Payment History', icon: <CreditCardIcon size={20} />, path: '/dashboard/payments' },
    { name: 'Support / FAQs', icon: <HelpCircleIcon size={20} />, path: '/dashboard/support' },
    { name: 'Settings', icon: <SettingsIcon size={20} />, path: '/dashboard/settings' },
  ];

  return (
    <>
      {/* Overlay - only on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`bg-white shadow-md fixed md:relative z-10 inset-y-0 left-0 w-64 transition-transform duration-300 transform
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="px-4 py-6">
          <nav>
            <ul className="space-y-1">
              {navItems.map((item, index) => {
                const isActive = location.pathname === item.path;

                return (
                  <li key={index}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-4 py-3 rounded-lg text-sm ${
                        isActive
                          ? "bg-green-50 text-green-600"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                      onClick={() => setIsOpen(false)} // close on navigation
                    >
                      <span className={`mr-3 ${isActive ? "text-green-500" : "text-gray-500"}`}>
                        {item.icon}
                      </span>
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default SideNavBar;
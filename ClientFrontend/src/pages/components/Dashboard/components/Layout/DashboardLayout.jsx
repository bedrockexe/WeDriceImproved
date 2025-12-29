import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TopNavBar from '../Navigation/TopNavBar';
import SideNavBar from '../Navigation/SideNavBar';
import { MessageCircleIcon } from 'lucide-react';
const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  return <div className="flex flex-col min-h-screen bg-gray-50">
      <TopNavBar toggleSidebar={toggleSidebar} />
      <div className="flex flex-1">
        <SideNavBar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      {/* Floating Chat Support Button */}
      <button className="fixed bottom-6 right-6 bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-colors z-10">
        <MessageCircleIcon size={24} />
      </button>
    </div>;
};
export default DashboardLayout;
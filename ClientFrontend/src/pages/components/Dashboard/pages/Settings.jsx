import React, { useState } from 'react';
import { BellIcon, LockIcon, GlobeIcon, CreditCardIcon, ShieldIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
const Settings = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false
  });
  const [privacy, setPrivacy] = useState({
    shareData: false,
    showProfile: true
  });
  return <div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
        Settings
      </h1>
      <div className="space-y-6">
        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center mb-4">
            <BellIcon size={24} className="text-green-500 mr-3" />
            <h2 className="text-lg font-semibold text-gray-800">
              Notification Preferences
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-800">Email Notifications</p>
                <p className="text-sm text-gray-500">
                  Receive booking confirmations and updates via email
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={notifications.email} onChange={e => setNotifications({
                ...notifications,
                email: e.target.checked
              })} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-800">SMS Notifications</p>
                <p className="text-sm text-gray-500">
                  Get text messages for important updates
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={notifications.sms} onChange={e => setNotifications({
                ...notifications,
                sms: e.target.checked
              })} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-800">Push Notifications</p>
                <p className="text-sm text-gray-500">
                  Receive notifications in your browser
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={notifications.push} onChange={e => setNotifications({
                ...notifications,
                push: e.target.checked
              })} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>
          </div>
        </div>
        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center mb-4">
            <LockIcon size={24} className="text-green-500 mr-3" />
            <h2 className="text-lg font-semibold text-gray-800">Security</h2>
          </div>
          <div className="space-y-4">
            <Link to="/dashboard/change-password" className="w-full text-left py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-800">Change Password</p>
              <p className="text-sm text-gray-500">
                Update your password regularly for security
              </p>
            </Link>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-4">
            Danger Zone
          </h2>
          <div className="space-y-3">
            <Link to="/dashboard/delete-account" className="w-full text-left py-3 text-red-600 hover:text-red-700 cursor-pointer">
              <p className="font-medium">Delete Account</p>
              <p className="text-sm">
                Permanently delete your account and all data
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>;
};
export default Settings;
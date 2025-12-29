import React from 'react';
const Footer = () => {
  return <footer className="mt-8 py-6 border-t border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="text-sm text-gray-500 mb-4 md:mb-0">
          © 2023 WeDrive Car Rentals. All rights reserved.
        </div>
        <div className="flex space-x-4">
          <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
            Terms & Conditions
          </a>
          <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
            Privacy Policy
          </a>
          <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
            Contact Us
          </a>
        </div>
      </div>
    </footer>;
};
export default Footer;
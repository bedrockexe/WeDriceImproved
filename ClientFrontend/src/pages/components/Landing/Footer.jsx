import React from 'react'
import { CarIcon, PhoneIcon, MailIcon, MapPinIcon } from 'lucide-react'
export function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="border-t-2 border-[#1AB759]"></div>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CarIcon className="h-6 w-6 text-[#1AB759]" />
              <span className="text-xl font-bold">WeDrive</span>
            </div>
            <p className="text-gray-300 mb-4">
              WeDrive offers a premium car rental experience with a wide
              selection of vehicles for any occasion. Our mission is to make car
              rental fast, easy, and affordable.
            </p>
          </div>
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                'Home',
                'Cars',
                'About Us',
                'Contact',
                'Terms & Conditions',
                'Privacy Policy',
              ].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-[#1AB759] transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPinIcon className="h-5 w-5 text-[#1AB759] mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-300">
                  123 Main Street, Anytown, ST 12345
                </span>
              </li>
              <li className="flex items-center">
                <PhoneIcon className="h-5 w-5 text-[#1AB759] mr-2 flex-shrink-0" />
                <a
                  href="tel:+15551234567"
                  className="text-gray-300 hover:text-[#1AB759] transition-colors"
                >
                  (555) 123-4567
                </a>
              </li>
              <li className="flex items-center">
                <MailIcon className="h-5 w-5 text-[#1AB759] mr-2 flex-shrink-0" />
                <a
                  href="mailto:info@WeDrive.com"
                  className="text-gray-300 hover:text-[#1AB759] transition-colors"
                >
                  info@WeDrive.com
                </a>
              </li>
            </ul>
          </div>
          {/* Social & Newsletter */}
          <div>
            <h3 className="text-lg font-bold mb-4">Connect With Us</h3>
            <div className="flex space-x-4 mb-6">
              {['facebook', 'instagram', 'twitter'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-[#1AB759] transition-colors"
                >
                  <span className="sr-only">{social}</span>
                  <img
                    src={`https://cdn.jsdelivr.net/npm/simple-icons@v5/icons/${social}.svg`}
                    alt={social}
                    className="h-5 w-5 text-white invert"
                  />
                </a>
              ))}
            </div>
            <p className="text-gray-300">
              Subscribe to our newsletter for special offers and updates.
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>© {new Date().getFullYear()} WeDrive. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

"use client"

import { useState } from "react"
import { Link } from "react-router"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
     <>
        <div className="bg-light-green border-b border-gray-300 py-2 px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-gray-700">
            <div className="flex gap-6">
              <span>🏢 Taxis Canela</span>
              <span>📍 Bom-Fica Bairro - Ngozi</span>
            </div>
          </div>
        </div>
        
      <nav className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-green rounded"></div>
            <span className="text-xl font-bold text-dark-gray">WeDrive</span>
          </div>

          <div className="hidden md:flex gap-8 items-center">
            <a href="#home" className="text-dark-gray hover:text-primary-green transition">
              Home
            </a>
            <a href="#about" className="text-dark-gray hover:text-primary-green transition">
              About
            </a>
            <a href="#faq" className="text-dark-gray hover:text-primary-green transition">
              FAQ
            </a>
          </div>

          <div className="flex gap-4 items-center">
            <Link to="/login" className="text-dark-gray hover:text-primary-green transition">Log In</Link>
            <Link to="/register" className="bg-primary-green text-white px-6 py-2 rounded-full hover:bg-opacity-90 transition">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>
    </>
  )
}

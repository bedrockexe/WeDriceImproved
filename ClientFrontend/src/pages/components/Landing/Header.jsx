import { useEffect, useState } from 'react'
import {
  CarIcon,
  MenuIcon,
  X,
  LayoutDashboardIcon,
  UserIcon,
  LogOutIcon,
  UserCircle
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {useAuth} from '../../../authentication/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'


export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    await axios.post(`${API}/api/users/logout`, {}, { withCredentials: true });
    navigate('/login');
    setUser(null);
    setAccountMenuOpen(false);
  }


  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 text-2xl font-bold">
          <CarIcon
            className={`h-8 w-8 ${isScrolled ? 'text-[#1AB759]' : 'text-white'}`}
          />
          <span className={isScrolled ? 'text-gray-800' : 'text-white'}>
            WeDrive
          </span>
        </a>
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <ul className="flex gap-6">
            {[
              { label: 'Home', href: '#' },
              { label: 'Cars', href: '#cars' },
              { label: 'About', href: '#about' },
              { label: 'FAQ', href: '#faq' }
            ].map((nav) => (
              <li key={nav.label}>
                <a
                  href={nav.href}
                  className={`font-medium hover:text-[#1AB759] transition-colors ${
                    isScrolled ? 'text-gray-700' : 'text-white'
                  }`}
                >
                  {nav.label}
                </a>
              </li>
            ))}
          </ul>
          {user != null ? (
            <div className="flex items-center gap-4">
              <Link 
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors bg-[#1AB759] text-white hover:bg-[#159a4b]"
              >
                <LayoutDashboardIcon size={18} />
                Dashboard
              </Link>
              <div className="relative">
                <button
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <UserCircle className="w-8 h-8 text-gray-400" />
                  <span
                    className={`font-medium ${isScrolled ? 'text-gray-700' : 'text-white'}`}
                  >
                    {user?.username}
                  </span>
                </button>

                {accountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-100">
                    <Link
                      to="/dashboard/profile"
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <UserIcon size={16} />
                      My Account
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <LogOutIcon size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ): (
            <div className="flex items-center gap-4">
              <Link to="/login"
                className={`px-4 py-2 rounded-full font-medium transition-colors ${isScrolled ? 'text-gray-700 hover:text-[#1AB759]' : 'text-white hover:text-[#1AB759]'}`}
              >
                Login
              </Link>
              <Link to="/register" className="px-6 py-2 bg-[#1AB759] text-white rounded-full font-medium hover:bg-[#159a4b] transition-colors">
                Register
              </Link>
            </div>
          )}
          
        </nav>
        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X
              className={isScrolled ? 'text-gray-800' : 'text-white'}
              size={24}
            />
          ) : (
            <MenuIcon
              className={isScrolled ? 'text-gray-800' : 'text-white'}
              size={24}
            />
          )}
        </button>
      </div>
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <ul className="flex flex-col p-4">
            {['Home', 'Cars', 'About', 'Contact'].map((item) => (
              <li key={item}>
                <a
                  href="#"
                  className="block py-2 text-gray-700 hover:text-[#1AB759]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </a>
              </li>
            ))}
            {user != null ? (
              <>
                <li className="mt-4">
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 py-2 text-gray-700 hover:text-[#1AB759]"
                  >
                    <LayoutDashboardIcon size={18} />
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard/profile"
                    className="flex items-center gap-2 py-2 text-gray-700 hover:text-[#1AB759]"
                  >
                    <UserIcon size={18} />
                    My Account
                  </Link>
                </li>
                <li>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 py-2 text-gray-700 hover:text-[#1AB759]"
                  >
                    <LogOutIcon size={18} />
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li className="mt-4 flex flex-col gap-2">
                <Link to="/login" className="w-full py-2 text-gray-700 hover:text-[#1AB759]">
                  Login
                </Link>
                <Link to="/register" className="w-full py-2 bg-[#1AB759] text-white rounded-md hover:bg-[#159a4b]">
                  Register
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  )
}

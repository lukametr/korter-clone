import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings,
  Home,
  Building,
  Building2 as OfficeIcon,
  Search,
  Bell
} from 'lucide-react';

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 md:space-x-3">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-32 h-32 md:w-40 md:h-40 object-contain"
            />
            <span className="text-xl md:text-2xl font-bold text-gray-900">homeinfo.ge</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              to="/"
              className="flex items-center px-3 md:px-4 py-2 md:py-3 text-sm md:text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            >
              <Home className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              მთავარი
            </Link>
            <Link
              to="/properties"
              className="flex items-center px-3 md:px-4 py-2 md:py-3 text-sm md:text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            >
              <Building className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              უძრავი ქონება
            </Link>
            <Link
              to="/properties?type=office"
              className="flex items-center px-3 md:px-4 py-2 md:py-3 text-sm md:text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            >
              <OfficeIcon className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              ოფისები
            </Link>
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
            {/* Search Button */}
            <button className="p-2 md:p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
              <Search className="w-5 h-6" />
            </button>

            {/* Notifications */}
            <button className="p-2 md:p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 relative">
              <Bell className="w-5 h-6" />
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                2
              </span>
            </button>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm md:text-base">
                      {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div className="hidden lg:block text-left">
                    <div className="text-sm md:text-base font-medium text-gray-900">
                      {user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'მომხმარებელი'}
                    </div>
                    <div className="text-xs md:text-sm text-gray-500">
                      {user.role === 'superadmin' ? 'ადმინისტრატორი' : 'კომპანია'}
                    </div>
                  </div>
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 md:w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'მომხმარებელი'}
                      </div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                    
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 md:py-3 text-sm md:text-base text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4 md:w-5 md:h-5 mr-3" />
                      პროფილი
                    </Link>
                    
                    {user.role === 'superadmin' && (
                      <Link
                        to="/admin"
                        className="flex items-center px-4 py-2 md:py-3 text-sm md:text-base text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4 md:w-5 md:h-5 mr-3" />
                        ადმინ პანელი
                      </Link>
                    )}
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 md:py-3 text-sm md:text-base text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 md:w-5 md:h-5 mr-3" />
                      გასვლა
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 lg:space-x-3">
                <Link
                  to="/login"
                  className="px-4 md:px-6 py-2 md:py-3 text-sm md:text-base font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  შესვლა
                </Link>
                <Link
                  to="/register"
                  className="px-4 md:px-6 py-2 md:py-3 text-sm md:text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  რეგისტრაცია
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {user && (
              <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
                <Search className="w-5 h-6" />
              </button>
            )}
            <button
              onClick={toggleMenu}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-1">
              <Link
                to="/"
                className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="w-5 h-5 mr-3" />
                მთავარი
              </Link>
              <Link
                to="/properties"
                className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                <Building className="w-5 h-5 mr-3" />
                უძრავი ქონება
              </Link>
              <Link
                to="/properties?type=office"
                className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                <OfficeIcon className="w-5 h-5 mr-3" />
                ოფისები
              </Link>
            </div>

            {user ? (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-900">
                    {user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'მომხმარებელი'}
                  </div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
                
                <Link
                  to="/profile"
                  className="flex items-center px-4 py-3 text-base text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-5 h-5 mr-3" />
                  პროფილი
                </Link>
                {/* გასვლა */}
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 text-base text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  გასვლა
                </button>
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <Link
                  to="/login"
                  className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  შესვლა
                </Link>
                <Link
                  to="/register"
                  className="block mx-4 px-4 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  რეგისტრაცია
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
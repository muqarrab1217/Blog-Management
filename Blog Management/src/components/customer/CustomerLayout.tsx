import React, { useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, FileText, Package, LogOut, Menu, X, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';

interface CustomerLayoutProps {
  children: React.ReactNode;
}

function CustomerLayout({ children }: CustomerLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const lastActiveLink = useRef<HTMLAnchorElement>(null);
  const activeBox = useRef<HTMLDivElement>(null);

  const navigation = [
    { name: 'Dashboard', href: '/customer/dashboard', icon: User },
    { name: 'Blogs', href: '/customer/blogs', icon: FileText },
    { name: 'Services', href: '/customer/services', icon: Package }
  ];

  const initActiveBox = () => {
    if (activeBox.current && lastActiveLink.current) {
      const rect = lastActiveLink.current.getBoundingClientRect();
      const navContainer = lastActiveLink.current.parentElement;
      if (navContainer) {
        const containerRect = navContainer.getBoundingClientRect();
        activeBox.current.style.top = (rect.top - containerRect.top) + 'px';
        activeBox.current.style.left = (rect.left - containerRect.left) + 'px';
        activeBox.current.style.width = rect.width + 'px';
        activeBox.current.style.height = rect.height + 'px';
      }
    }
  };

  useEffect(() => {
    // Small delay to ensure DOM is rendered
    const timer = setTimeout(() => {
      const activeLinkElement = document.querySelector(`[href="${location.pathname}"]`) as HTMLAnchorElement;
      if (activeLinkElement) {
        (lastActiveLink as React.MutableRefObject<HTMLAnchorElement | null>).current = activeLinkElement;
        initActiveBox();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      setTimeout(initActiveBox, 100);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isUserMenuOpen && !target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (lastActiveLink.current) {
      lastActiveLink.current.classList.remove('active');
    }
    event.currentTarget.classList.add('active');
    (lastActiveLink as React.MutableRefObject<HTMLAnchorElement | null>).current = event.currentTarget;

    // Use getBoundingClientRect for more accurate positioning
    const rect = event.currentTarget.getBoundingClientRect();
    const navContainer = event.currentTarget.parentElement;
    if (activeBox.current && navContainer) {
      const containerRect = navContainer.getBoundingClientRect();
      activeBox.current.style.top = (rect.top - containerRect.top) + 'px';
      activeBox.current.style.left = (rect.left - containerRect.left) + 'px';
      activeBox.current.style.width = rect.width + 'px';
      activeBox.current.style.height = rect.height + 'px';
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 w-full h-20 flex items-center z-40 bg-white shadow-subtle border-b border-gray-200">
        <div className="max-w-[80%] w-full mx-auto px-4 flex justify-between items-center md:px-6 md:grid md:grid-cols-[1fr,3fr,1fr]">
          
          {/* Logo */}
          <h1>
            <Link to="/customer/dashboard" className="flex items-center">
              <div className="w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900 hidden sm:block">Customer Portal</span>
            </Link>
          </h1>

          {/* Center Navigation with Animated Active Box */}
          <div className="relative py-2 md:justify-self-center">
            <button
              className="md:hidden p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Desktop Navigation */}
            <nav className={`hidden md:flex relative bg-gray-100 rounded-full p-1 ${isMobileMenuOpen ? 'active' : ''}`}>
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    ref={isActive ? lastActiveLink : null}
                    className={`nav-link px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ease-feather ${
                      isActive ? 'active' : ''
                    }`}
                    onClick={handleNavClick}
                  >
                    {item.name}
                  </Link>
                );
              })}
              <div
                className="active-box absolute bg-brand-600 rounded-full transition-all duration-300 ease-feather pointer-events-none"
                ref={activeBox}
              ></div>
            </nav>
          </div>

          {/* Right Side - Contact Me Button & User Menu */}
          <div className="flex items-center space-x-4 md:justify-self-end">
            <button className="hidden sm:inline-flex items-center px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-full hover:bg-brand-700 transition-colors duration-200 ease-feather">
              Contact Me
            </button>
            
            {/* User Menu */}
            <div className="relative user-menu-container">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-800 mt-1">
                          {user?.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <Link
                      to="/customer/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-3 text-gray-400" />
                      Profile Settings
                    </Link>
                    <button
                      onClick={async () => {
                        setIsUserMenuOpen(false);
                        await handleLogout();
                      }}
                      disabled={isLoggingOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <LogOut className="h-4 w-4 mr-3 text-gray-400" />
                      {isLoggingOut ? 'Signing out...' : 'Sign out'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 absolute top-full left-0 right-0 shadow-lg">
            <div className="px-4 py-3">
              {/* Mobile Navigation Links */}
              <div className="space-y-2 mb-4">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 ${
                        isActive
                          ? 'bg-brand-600 text-white'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  );
                })}
                <Link
                  to="/customer/profile"
                  className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 ${
                    location.pathname === '/customer/profile'
                      ? 'bg-brand-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </Link>
              </div>
              
              {/* Mobile Contact Me Button */}
              <button className="w-full px-4 py-3 bg-brand-600 text-white text-base font-semibold rounded-lg hover:bg-brand-700 transition-colors duration-200 mb-4">
                Contact Me
              </button>
              
              {/* User Info & Logout */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <div className="text-base font-medium text-gray-800">{user?.name}</div>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {isLoggingOut ? 'Signing out...' : 'Sign out'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pt-20">
        {children}
      </main>
    </div>
  );
}

export default CustomerLayout;
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Briefcase,
  Users,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  ArrowLeft,
  Database,
  Sun,
  Moon,
  CheckCircle2,
  Settings,
  User as UserIcon,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    activeRole,
    currentRoute,
    setCurrentRoute,
    switchRole,
    logoutUser,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    theme,
    toggleTheme,
    goBack,
    canGoBack,
    setIsBackendModalOpen,
    isBackendLive,
    isSupabaseReady,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.readStatus).length;
  const isPublicRoute = ['landing', 'how-it-works', 'about', 'login', 'admin-login', 'register', 'demo'].includes(currentRoute);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Left navigation */}
        <div className="flex items-center gap-3">
          {canGoBack && !isPublicRoute && (
            <button
              onClick={goBack}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-800 transition-colors"
              title="Go Back"
              aria-label="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => setCurrentRoute(isPublicRoute ? 'landing' : 'dashboard')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                Staff<span className="text-cyan-600 dark:text-cyan-400">X</span>
              </span>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 -mt-0.5 tracking-wide">
                Verified Staffing
              </span>
            </div>
          </button>
        </div>

        {/* Public Header Navigation */}
        {isPublicRoute && (
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setCurrentRoute('landing')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentRoute === 'landing'
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentRoute('how-it-works')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentRoute === 'how-it-works'
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              How It Works
            </button>
            <button
              onClick={() => {
                switchRole('ORGANIZER');
                
              }}
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-100 dark:hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              For Organizers
            </button>
            <button
              onClick={() => {
                switchRole('PROFESSIONAL');
                
              }}
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-100 dark:hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              For Staff & Crew
            </button>
            <button
              onClick={() => setCurrentRoute('admin-login')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentRoute === 'admin-login'
                  ? 'text-purple-400 bg-purple-950/60 border border-purple-800/80 shadow-xs'
                  : 'text-slate-400 hover:text-purple-300 hover:bg-purple-950/30'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Admin Portal</span>
            </button>
          </nav>
        )}

        {/* Right Section / Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin Database Indicator - Only visible to authenticated Administrators */}
          {activeRole === 'ADMIN' && currentUser?.role === 'ADMIN' && (
            <button
              onClick={() => setIsBackendModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/80 border border-purple-200 dark:border-purple-800/80 transition-colors cursor-pointer"
              title="Admin Database Console"
            >
              <Database className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span className="hidden sm:inline font-semibold">DB Console</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  isBackendLive || isSupabaseReady ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-amber-400'
                }`}
              />
            </button>
          )}

          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Role Switcher Pill (Desktop) */}
          {!isPublicRoute && (
            <div className="relative hidden md:block">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider">Role:</span>
                <span className="capitalize">{(activeRole || 'ORGANIZER').toLowerCase()}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-slate-900 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1.5 z-50 text-xs">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch Perspective
                  </div>
                  <button
                    onClick={() => {
                      switchRole('ORGANIZER');
                      setShowRoleMenu(false);
                      
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-700/70 ${
                      activeRole === 'ORGANIZER' ? 'font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30' : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Event Organizer</span>
                    </span>
                    {activeRole === 'ORGANIZER' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                  </button>
                  <button
                    onClick={() => {
                      switchRole('PROFESSIONAL');
                      setShowRoleMenu(false);
                      
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-700/70 ${
                      activeRole === 'PROFESSIONAL' ? 'font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30' : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5" />
                      <span>Staff / Professional</span>
                    </span>
                    {activeRole === 'PROFESSIONAL' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                  </button>
                  
                  <div className="my-1 border-t border-slate-100 dark:border-slate-700/80" />
                  
                  <button
                    onClick={() => {
                      setShowRoleMenu(false);
                      if (currentUser?.role === 'ADMIN' || activeRole === 'ADMIN') {
                        switchRole('ADMIN');
                        
                      } else {
                        setCurrentRoute('admin-login');
                      }
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-purple-50 dark:hover:bg-purple-950/30 ${
                      activeRole === 'ADMIN' ? 'font-semibold text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/30' : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span>Admin Portal (Restricted)</span>
                    </span>
                    {activeRole === 'ADMIN' && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-100 dark:hover:text-white hover:bg-slate-800 transition-colors relative cursor-pointer flex items-center gap-1"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold text-white bg-indigo-600 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>

                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllNotificationsRead()}
                      className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="space-y-1.5 max-h-72 overflow-y-auto no-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="text-xs text-slate-400 py-6 text-center">No notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-2.5 rounded-xl text-left cursor-pointer transition-colors ${
                          !n.readStatus
                            ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50'
                            : 'hover:bg-slate-900 dark:hover:bg-slate-700/50 opacity-80'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-semibold text-white">
                          <span>{n.title}</span>
                          <span className="text-[10px] text-slate-400">{n.createdAt}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar & Dropdown */}
          {currentUser ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <img
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                  src={
                    currentUser.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                  }
                />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-2 z-50 text-xs">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                    <div className="font-semibold text-white truncate">
                      {currentUser.fullName}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {currentUser.email}
                    </div>
                    <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-700 text-slate-700 dark:text-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>{activeRole}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setCurrentRoute(activeRole === 'PROFESSIONAL' ? 'pro-profile' : 'profile');
                    }}
                    className="w-full text-left px-4 py-2 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-900 dark:hover:bg-slate-700/60"
                  >
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <span>View Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      logoutUser();
                      setShowProfileMenu(false);
                      setCurrentRoute('landing');
                    }}
                    className="w-full text-left px-4 py-2 flex items-center gap-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentRoute('admin-login')}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-300 hover:text-white bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/60 transition-all cursor-pointer shadow-sm shadow-purple-900/20"
                title="Admin Login Portal"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>Admin Login</span>
              </button>
              <button
                onClick={() => setCurrentRoute('login')}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => setCurrentRoute('register')}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 transition-all"
              >
                Get Started
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          {isPublicRoute && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-800"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer Navigation for Public Routes */}
      {isPublicRoute && mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 border-t border-slate-200 dark:border-slate-800 space-y-2 bg-slate-900">
          <button
            onClick={() => {
              setCurrentRoute('landing');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-800"
          >
            Home
          </button>
          <button
            onClick={() => {
              setCurrentRoute('how-it-works');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-800"
          >
            How It Works
          </button>
          <button
            onClick={() => {
              switchRole('ORGANIZER');
              
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-800"
          >
            For Organizers
          </button>
          <button
            onClick={() => {
              switchRole('PROFESSIONAL');
              
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-800"
          >
            For Staff & Crew
          </button>
          <div className="my-1 border-t border-slate-200/80 dark:border-slate-800" />
          <button
            onClick={() => {
              setCurrentRoute('admin-login');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-purple-500" />
            <span>Admin Login Portal</span>
          </button>
        </div>
      )}
    </header>
  );
};

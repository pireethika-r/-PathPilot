import React from 'react';
import {
  UserIcon,
  LayoutDashboardIcon,
  GraduationCapIcon,
  XIcon,
  BriefcaseIcon,
  BookOpenIcon,
  BookMarkedIcon,
  ReceiptIcon,
  CompassIcon
} from 'lucide-react';

export function Sidebar({
  userRole,
  user,
  onLogout,
  currentView,
  setCurrentView,
  isOpen,
  setIsOpen
}) {

  const navByRole = {
    student: [
      {
        id: 'profile',
        label: 'My Profile',
        icon: UserIcon
      },
      {
        id: 'career',
        label: 'Career Guide',
        icon: CompassIcon
      },
      {
        id: 'courses',
        label: 'Course Catalog',
        icon: BookOpenIcon
      },
      {
        id: 'learning',
        label: 'My Learning',
        icon: BookMarkedIcon
      },
      {
        id: 'payments',
        label: 'Payment History',
        icon: ReceiptIcon
      }
    ],

    admin: [
      {
        id: 'admin',
        label: 'Admin Dashboard',
        icon: LayoutDashboardIcon
      },
      {
        id: 'admin-courses',
        label: 'Manage Courses',
        icon: BookOpenIcon
      },

      // ✅ NEW FEATURE (YOUR PART)
      {
        id: 'create-course',
        label: 'Create Course',
        icon: BookOpenIcon
      },

      {
    id: 'create-content',
    label: 'Create Content',
    icon: BookMarkedIcon
  }
    ],

    hiring: [
      {
        id: 'hiring',
        label: 'Hiring Dashboard',
        icon: BriefcaseIcon
      }
    ]
  };

  const navItems = navByRole[userRole] || [];

  const roleLabel =
    userRole === 'admin'
      ? 'Admin'
      : userRole === 'hiring'
      ? 'Hiring Manager'
      : 'Student';

  const displayName = user?.fullName || 'User';
  const avatarSrc = user?.avatarUrl || '';

  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'U';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 h-screen w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex-shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">

          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800">
            <GraduationCapIcon className="w-8 h-8 text-blue-400 mr-3" />
            <span className="text-xl font-bold tracking-tight">PathPilot</span>

            <button
              className="ml-auto lg:hidden text-slate-400 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              {roleLabel}
            </p>

            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 mr-3 ${
                        isActive
                          ? 'text-white'
                          : 'text-slate-400 group-hover:text-white'
                      }`}
                    />

                    <span className="font-medium text-sm">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center px-4 py-3 rounded-lg bg-slate-800/50">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="Profile avatar"
                  className="w-8 h-8 rounded-full object-cover border border-slate-600 mr-3"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold mr-3">
                  {initials}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {displayName}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {roleLabel}
                </p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="mt-3 w-full px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
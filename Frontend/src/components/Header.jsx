import React, { useEffect, useMemo, useState } from 'react';
import { MenuIcon, BellIcon, SearchIcon } from 'lucide-react';
import { io } from 'socket.io-client';
export function Header({ title, onMenuClick, user, onProfileClick }) {
    const avatarSrc = user?.avatarUrl || '';
    const displayName = user?.fullName || 'User';
    const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const token = localStorage.getItem('token') || '';
    const backendUrl = useMemo(() => {
        const host = window.location.hostname || 'localhost';
        return `${window.location.protocol}//${host}:5000`;
    }, []);

    const loadNotifications = async () => {
        if (!token) return;
        try {
            const response = await fetch('/api/notifications?limit=20', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (!response.ok) return;
            setNotifications(data.notifications || []);
            setUnreadCount(Number(data.unreadCount) || 0);
        }
        catch (_error) {
            // ignore notification fetch errors in header
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    useEffect(() => {
        if (!token) return;
        const socket = io(backendUrl, {
            auth: { token },
            transports: ['websocket', 'polling']
        });

        socket.on('notification:new', (payload) => {
            setNotifications((prev) => [payload, ...prev].slice(0, 20));
            setUnreadCount((prev) => prev + 1);
        });

        return () => {
            socket.disconnect();
        };
    }, [backendUrl, token]);

    const markAsRead = async (notificationId) => {
        try {
            const response = await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (!response.ok) return;
            setNotifications((prev) =>
                prev.map((item) => item.id === notificationId ? { ...item, read: true } : item)
            );
            setUnreadCount(Number(data.unreadCount) || 0);
        }
        catch (_error) {
            // ignore
        }
    };

    const markAllRead = async () => {
        try {
            const response = await fetch('/api/notifications/read-all', {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!response.ok) return;
            setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
            setUnreadCount(0);
        }
        catch (_error) {
            // ignore
        }
    };

    const formatTime = (value) => {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        return date.toLocaleString();
    };
    return (<header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-10">
      <div className="flex items-center">
        <button onClick={onMenuClick} className="mr-4 text-slate-500 hover:text-slate-700 lg:hidden focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1">

          <MenuIcon className="w-6 h-6"/>
        </button>
        <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Search (hidden on mobile) */}
        <div className="hidden md:flex relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-4 w-4 text-slate-400"/>
          </div>
          <input type="text" className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors" placeholder="Quick search..."/>

        </div>

        {/* Notifications */}
        <button onClick={() => setIsOpen((prev) => !prev)} className="relative p-2 text-slate-400 hover:text-slate-500 transition-colors rounded-full hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
          {unreadCount > 0 &&
          <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] leading-4 text-center ring-2 ring-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          }
          <BellIcon className="h-6 w-6"/>
        </button>
        {isOpen &&
        <div className="absolute right-4 top-14 sm:right-6 lg:right-8 w-[360px] max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-xl shadow-xl z-30">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
              <button onClick={markAllRead} className="text-xs font-medium text-blue-600 hover:text-blue-700">
                Mark all read
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ?
              <div className="px-4 py-6 text-sm text-slate-500">No notifications yet.</div> :
              notifications.map((item) => <button key={item.id} onClick={() => !item.read && markAsRead(item.id)} className={`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 ${item.read ? 'opacity-70' : ''}`}>

                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      {!item.read && <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"/>}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{item.message}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{formatTime(item.createdAt)}</p>
                  </button>)
              }
            </div>
          </div>
        }

        {/* User Dropdown (Static) */}
        <button onClick={onProfileClick} className="relative flex items-center cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500">
          {avatarSrc ?
            <img className="h-8 w-8 rounded-full object-cover border border-slate-200" src={avatarSrc} alt="User avatar"/> :
            <div className="h-8 w-8 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center border border-slate-200">
              {initials}
            </div>
          }

        </button>
      </div>
    </header>);
}

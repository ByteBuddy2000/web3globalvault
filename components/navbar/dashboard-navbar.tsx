'use client';
import React, { useEffect, useRef, useState } from 'react';
import {
  Bell,
  Menu,
  LogOut,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import CryptoPriceTicker from '../CryptoPriceTicker';

type UserData = {
  username: string;
  email: string;
  fullName: string;
};

type Notification = {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  category?: string;
};

const Dashboardnavbar = ({ onMenu }: { onMenu?: () => void }) => {
  const [user, setUser] = useState<UserData | null>(null);

  // 🔔 NOTIFICATIONS STATE
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotif, setShowNotif] = useState(false);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  const profileRef = useRef<HTMLDivElement | null>(null);
  const notifRef = useRef<HTMLDivElement | null>(null);

  // USER
  useEffect(() => {
    fetch('/api/user', { credentials: 'include' })
      .then(r => (r.ok ? r.json() : null))
      .then(d => setUser(d))
      .catch(() => { });
  }, []);

  // CLOCK
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  // NOTIFICATIONS FETCH
  useEffect(() => {
    fetch('/api/notifications')
      .then(res => res.json())
      .then(setNotifications)
      .catch(() => { });
  }, []);

  // CLOSE ON CLICK OUTSIDE
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setShowProfileMenu(false);
      }

      if (
        notifRef.current &&
        !notifRef.current.contains(e.target as Node)
      ) {
        setShowNotif(false);
      }
    }

    document.addEventListener('mousedown', handleClick);
    return () =>
      document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleSignOut() {
    await signOut({
      redirect: true,
      callbackUrl: '/signin',
    });
  }

  const initials = user?.fullName
    ? user.fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
    : '?';

  // UNREAD COUNT
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      <nav className="w-full flex items-center px-5 h-14 bg-surface-100/95 border-b border-border backdrop-blur-xl sticky top-0 z-30 gap-3 font-mono">
        {/* LEFT */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onMenu}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center md:hidden"
          >
            <Menu size={15} />
          </button>
        </div>

        {/* CENTER — hide ticker on mobile */}
        <div className="flex-1 justify-center hidden md:flex">
          <CryptoPriceTicker
            symbols={['BTC', 'ETH', 'XRP', 'SOL', 'ADA', 'DOGE']}
            scrollSpeed={35000}
            className="w-full max-w-2xl"
          />
        </div>

        {/* Clock — hide on mobile */}
        <div className="hidden md:flex px-2.5 h-7 border border-border rounded-lg items-center gap-1.5">
          <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px]">{currentTime}</span>
        </div>


        {/* 🔔 NOTIFICATIONS */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotif(s => !s)}
            className="relative w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-glass-white-sm"
          >
            <Bell size={14} />

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          {/* DROPDOWN */}
          {showNotif && (
            <div className="absolute right-0 mt-2 w-72 bg-surface-100 border border-border rounded-xl shadow-lg z-50 overflow-hidden">

              {/* HEADER */}
              <div className="px-4 py-3 border-b border-border flex justify-between items-center">
                <p className="text-xs font-semibold">Notifications</p>

                <button
                  onClick={async () => {
                    await fetch('/api/notifications/mark-all-read', {
                      method: 'POST',
                    });

                    setNotifications(prev =>
                      prev.map(n => ({
                        ...n,
                        isRead: true,
                      }))
                    );
                  }}
                  className="text-[10px] text-brand-400 hover:underline"
                >
                  Mark all read
                </button>
              </div>

              {/* LIST */}
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-xs text-muted-foreground">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n._id}
                      onClick={async () => {
                        await fetch(
                          `/api/notifications/${n._id}/read`,
                          {
                            method: 'POST',
                          }
                        );

                        setNotifications(prev =>
                          prev.map(item =>
                            item._id === n._id
                              ? { ...item, isRead: true }
                              : item
                          )
                        );
                      }}
                      className={`px-4 py-3 border-b border-border cursor-pointer hover:bg-glass-white-xs ${!n.isRead ? 'bg-brand-500/5' : ''
                        }`}
                    >
                      <div className="flex justify-between">
                        <p className="text-xs font-semibold">
                          {n.title}
                        </p>

                        {!n.isRead && (
                          <span className="w-2 h-2 bg-brand-400 rounded-full" />
                        )}
                      </div>

                      <p className="text-[10px] text-muted-foreground mt-1">
                        {n.message}
                      </p>

                      {n.category === 'transaction' && (
                        <p className="text-[9px] text-brand-400 mt-1">
                          Transaction update
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* PROFILE */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() =>
              setShowProfileMenu(s => !s)
            }
            className="flex items-center gap-2 h-8 px-2.5 rounded-lg border border-border"
          >
            <div className="w-5 h-5 text-[8px] bg-brand-500/20 rounded-md flex items-center justify-center">
              {initials}
            </div>

            <ChevronDown size={11} />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-surface-100 border border-border rounded-xl shadow-lg z-50">
              <div className="px-4 py-3 border-b border-border">
                <div className="text-xs font-semibold">
                  {user?.fullName}
                </div>
                <div className="text-[9px] text-muted-foreground">
                  {user?.email}
                </div>
              </div>

              <div className="p-2">
                <a
                  href="/dashboard/setting"
                  className="flex items-center gap-2 px-2 py-2 text-xs hover:bg-glass-white-xs rounded-lg"
                >
                  <Settings size={13} />
                  Settings
                </a>

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-2 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg"
                >
                  <LogOut size={13} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>

      
    </nav >
    </>
  );
};

export default Dashboardnavbar;
'use client';
import React, { useEffect, useRef, useState } from 'react';
import {
  Search,
  Bell,
  Menu,
  X,
  LogOut,
  Settings,
  ChevronDown,
  User,
} from 'lucide-react';
import { signOut } from 'next-auth/react';

type UserData = {
  username: string;
  email: string;
  fullName: string;
};

const Navbar = ({ onMenu }: { onMenu?: () => void }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch('/api/user', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => setUser(d))
      .catch(() => { });
  }, []);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleSignOut() {
    await signOut({ redirect: true, callbackUrl: '/signin' });
  }

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        .nb-search::placeholder { color: #374151; }
        .nb-search:focus { outline: none; }
        @keyframes nb-fadein { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        .nb-dropdown { animation: nb-fadein 0.18s ease both; }
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>

      <nav className="w-full flex items-center px-5 h-14 bg-surface-100/95 border-b border-border backdrop-blur-xl sticky top-0 z-30 gap-3 font-mono flex-shrink-0">

        {/* Left — mobile menu + brand */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={onMenu}
            aria-label="Open sidebar"
            className="nb-menu-btn hidden w-8 h-8 rounded-lg bg-glass-white-xs border border-border items-center justify-center cursor-pointer outline-none text-muted-foreground hover:text-foreground hover:bg-glass-white-sm"
          >
            <Menu size={15} />
          </button>

          {/* Brand — hidden on desktop since sidebar shows it */}
          <div className="nb-brand hidden text-[11px] font-bold text-foreground font-display leading-tight">
            <div className="text-xs font-bold text-foreground tracking-tight leading-tight">
              Web3GlobalVault
            </div>
            <div className="text-[8px] text-brand-400 tracking-widest mt-0.5">
              DASHBOARD
            </div>
          </div>
        </div>

        {/* Center — search */}
        <div className="flex-1 flex justify-center min-w-0">
          {/* Desktop search */}
          <div className="nb-search-wrap flex items-center gap-2.5 w-full max-w-md bg-glass-white-xs border border-border hover:border-border-strong rounded-lg p-3.5 h-9 transition-all focus-within:border-brand-400 focus-within:shadow-brand-sm">
            <kbd className="text-xs text-muted-foreground bg-glass-white-xs border border-border rounded px-1.5 py-0.5 font-mono tracking-wider">
              ⌘K
            </kbd>
          </div>

          {/* Mobile search toggle */}
          {!showMobileSearch ? (
            <button
              onClick={() => setShowMobileSearch(true)}
              aria-label="Search"
              className="nb-mobile-search-btn hidden w-8 h-8 rounded-lg bg-glass-white-xs border border-border items-center justify-center cursor-pointer outline-none text-muted-foreground hover:text-foreground"
            >
              <Search size={14} />
            </button>
          ) : (
            <div className="nb-mobile-search-open hidden items-center gap-2 bg-glass-white-xs border border-brand-400/25 rounded-lg px-3 h-9 flex-1">
              <Search size={13} color="var(--brand-400)" />
              <input
                autoFocus
                type="text"
                placeholder="Search..."
                className="nb-search flex-1 bg-transparent border-none text-xs text-muted-foreground font-mono outline-none placeholder:text-muted-foreground"
              />
              <button onClick={() => setShowMobileSearch(false)} className="bg-transparent border-none cursor-pointer text-muted-foreground p-0 leading-none">
                <X size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Right — clock + notif + profile */}
        <div className="flex items-center gap-1.5 flex-shrink-0">

          {/* Live clock */}
          <div className="nb-clock hidden flex items-center gap-1.5 px-2.5 h-7 bg-glass-white-xs border border-border rounded-lg">
            <span className="w-1 h-1 rounded-full bg-success-500 inline-block animate-pulse flex-shrink-0" />
            <span className="text-[10px] text-muted-foreground tracking-widest">{currentTime}</span>
          </div>

          {/* Notifications */}
          <button
            aria-label="Notifications"
            className="w-8 h-8 rounded-lg bg-glass-white-xs border border-border flex items-center justify-center cursor-pointer outline-none text-muted-foreground hover:text-foreground hover:bg-glass-white-sm hover:border-brand-400/25 transition-all relative"
          >
            <Bell size={14} />
            {/* unread dot */}
            <span className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full bg-warning-500 border border-surface-100" />
          </button>

          {/* Profile */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setShowProfileMenu(s => !s)}
              className={`flex items-center gap-2 px-2.5 py-0 h-8 rounded-lg transition-all outline-none cursor-pointer ${
                showProfileMenu 
                  ? 'bg-glass-brand-sm border border-brand-400/30' 
                  : 'bg-glass-white-xs border border-border hover:bg-glass-white-sm'
              }`}
            >
              {/* Avatar */}
              <div className="w-5 h-5 rounded-md flex-shrink-0 bg-brand-500/15 border border-brand-400/25 flex items-center justify-center text-[8px] font-bold text-brand-400 tracking-wide">
                {initials}
              </div>

              {/* Name — desktop only */}
              <div className="nb-profile-name hidden flex-col text-left">
                <span className="text-xs font-semibold text-foreground leading-tight whitespace-nowrap">
                  {user?.fullName || 'Loading...'}
                </span>
                <span className="text-[9px] text-muted-foreground leading-tight whitespace-nowrap">
                  @{user?.email?.split('@')[0] || '—'}
                </span>
              </div>

              <ChevronDown
                size={11}
                color="var(--text-300)"
                style={{ transition: 'transform 0.2s', transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
            </button>

            {/* Dropdown */}
            {showProfileMenu && (
              <div className="nb-dropdown absolute right-0 top-full mt-1 w-48 bg-surface-100 border border-border rounded-xl overflow-hidden shadow-lg z-50">
                {/* User info header */}
                <div className="px-4 py-3 border-b border-border">
                  <div className="text-xs font-semibold text-foreground">
                    {user?.fullName || '—'}
                  </div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">
                    {user?.email || '—'}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-2">
                  <a
                    href="/dashboard/setting"
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-muted-foreground text-xs transition-colors hover:bg-glass-white-xs hover:text-foreground"
                  >
                    <Settings size={13} />
                    Settings
                  </a>

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-transparent border-none text-danger-400 text-xs font-body cursor-pointer outline-none transition-all hover:bg-danger-500/10"
                  >
                    <LogOut size={13} />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Responsive breakpoints */}
      <style>{`
        @media (max-width: 767px) {
          .nb-menu-btn    { display: flex !important; }
          .nb-brand       { display: block !important; }
          .nb-search-wrap { display: none !important; }
          .nb-clock       { display: none !important; }
          .nb-mobile-search-btn  { display: flex !important; }
          .nb-mobile-search-open { display: flex !important; }
          .nb-profile-name { display: none !important; }
        }
        @media (min-width: 768px) {
          .nb-menu-btn           { display: none !important; }
          .nb-mobile-search-btn  { display: none !important; }
          .nb-mobile-search-open { display: none !important; }
          .nb-profile-name       { display: flex !important; }
        }
        @media (max-width: 900px) {
          .nb-clock { display: none !important; }
        }
      `}</style>
    </>
  );
};

export default Navbar;
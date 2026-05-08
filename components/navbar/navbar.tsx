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

      <nav style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        height: 56,
        background: 'rgba(10,11,14,0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        gap: 12,
        fontFamily: "'DM Mono', monospace",
        flexShrink: 0,
      }}>

        {/* Left — mobile menu + brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <button
            onClick={onMenu}
            aria-label="Open sidebar"
            style={{
              display: 'none',
              width: 34, height: 34, borderRadius: 9,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', outline: 'none', color: '#9ca3af',
            }}
            className="nb-menu-btn"
          >
            <Menu size={15} />
          </button>

          {/* Brand — hidden on desktop since sidebar shows it */}
          <div style={{ display: 'none' }} className="nb-brand">
            <div style={{ fontSize: 14, fontWeight: 800, color: '#f9fafb', fontFamily: "'Syne', sans-serif", letterSpacing: '-0.01em', lineHeight: 1 }}>
              Genesis Bank
            </div>
            <div style={{ fontSize: 9, color: '#fbbf24', letterSpacing: '0.12em', marginTop: 1 }}>
              DASHBOARD
            </div>
          </div>
        </div>

        {/* Center — search */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 0 }}>

          {/* Desktop search */}
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', maxWidth: 440,
              background: searchFocused ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${searchFocused ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: 10, padding: '0 14px', height: 36,
              transition: 'all 0.2s',
              boxShadow: searchFocused ? '0 0 0 3px rgba(251,191,36,0.06)' : 'none',
            }}
            className="nb-search-wrap"
          >

            <kbd style={{
              fontSize: 9, color: '#374151',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 4, padding: '2px 5px',
              fontFamily: "'DM Mono', monospace",
              letterSpacing: '0.04em',
            }}>
              ⌘K
            </kbd>
          </div>

          {/* Mobile search toggle */}
          {!showMobileSearch ? (
            <button
              onClick={() => setShowMobileSearch(true)}
              aria-label="Search"
              className="nb-mobile-search-btn"
              style={{
                display: 'none', width: 34, height: 34, borderRadius: 9,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', outline: 'none', color: '#9ca3af',
              }}
            >
              <Search size={14} />
            </button>
          ) : (
            <div
              className="nb-mobile-search-open"
              style={{
                display: 'none', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(251,191,36,0.25)',
                borderRadius: 10, padding: '0 12px', height: 36,
                flex: 1,
              }}
            >
              <Search size={13} color="#fbbf24" />
              <input
                autoFocus
                type="text"
                placeholder="Search..."
                className="nb-search"
                style={{
                  flex: 1, background: 'transparent', border: 'none',
                  fontSize: 12, color: '#9ca3af',
                  fontFamily: "'DM Mono', monospace",
                }}
              />
              <button onClick={() => setShowMobileSearch(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 0 }}>
                <X size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Right — clock + notif + profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>

          {/* Live clock */}
          <div
            className="nb-clock"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '0 10px', height: 30,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 8,
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse-dot 2s infinite', flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: '#4b5563', letterSpacing: '0.06em' }}>{currentTime}</span>
          </div>

          {/* Notifications */}
          <button
            aria-label="Notifications"
            style={{
              width: 34, height: 34, borderRadius: 9,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', outline: 'none', color: '#6b7280',
              transition: 'all 0.18s', position: 'relative',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)';
              (e.currentTarget as HTMLButtonElement).style.color = '#f9fafb';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)';
              (e.currentTarget as HTMLButtonElement).style.color = '#6b7280';
            }}
          >
            <Bell size={14} />
            {/* unread dot */}
            <span style={{
              position: 'absolute', top: 7, right: 7,
              width: 5, height: 5, borderRadius: '50%',
              background: '#fbbf24',
              border: '1.5px solid #0a0b0e',
            }} />
          </button>

          {/* Profile */}
          <div ref={profileRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowProfileMenu(s => !s)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '0 10px 0 6px', height: 34, borderRadius: 10,
                background: showProfileMenu ? 'rgba(251,191,36,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${showProfileMenu ? 'rgba(251,191,36,0.25)' : 'rgba(255,255,255,0.06)'}`,
                cursor: 'pointer', outline: 'none',
                transition: 'all 0.18s',
              }}
              onMouseEnter={e => {
                if (!showProfileMenu) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
                }
              }}
              onMouseLeave={e => {
                if (!showProfileMenu) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)';
                }
              }}
            >
              {/* Avatar */}
              <div style={{
                width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                background: 'rgba(251,191,36,0.15)',
                border: '1px solid rgba(251,191,36,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, color: '#fbbf24',
                letterSpacing: '0.04em',
              }}>
                {initials}
              </div>

              {/* Name — desktop only */}
              <div style={{ display: 'none', flexDirection: 'column', textAlign: 'left' }} className="nb-profile-name">
                <span style={{ fontSize: 12, fontWeight: 600, color: '#f9fafb', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                  {user?.fullName || 'Loading...'}
                </span>
                <span style={{ fontSize: 10, color: '#4b5563', lineHeight: 1, whiteSpace: 'nowrap' }}>
                  @{user?.email?.split('@')[0] || '—'}
                </span>
              </div>

              <ChevronDown
                size={11}
                color="#4b5563"
                style={{ transition: 'transform 0.2s', transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
            </button>

            {/* Dropdown */}
            {showProfileMenu && (
              <div
                className="nb-dropdown"
                style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                  width: 200,
                  background: '#111318',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 14,
                  overflow: 'hidden',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
                  zIndex: 50,
                }}
              >
                {/* User info header */}
                <div style={{
                  padding: '14px 16px 12px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#f9fafb' }}>
                    {user?.fullName || '—'}
                  </div>
                  <div style={{ fontSize: 10, color: '#4b5563', marginTop: 2 }}>
                    {user?.email || '—'}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ padding: '8px' }}>
                  <a
                    href="/dashboard/setting"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 10px', borderRadius: 8,
                      textDecoration: 'none', color: '#9ca3af',
                      fontSize: 12, transition: 'all 0.15s', cursor: 'pointer',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.04)';
                      (e.currentTarget as HTMLAnchorElement).style.color = '#f9fafb';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                      (e.currentTarget as HTMLAnchorElement).style.color = '#9ca3af';
                    }}
                  >
                    <Settings size={13} />
                    Settings
                  </a>

                  <button
                    onClick={handleSignOut}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 10px', borderRadius: 8,
                      background: 'transparent', border: 'none',
                      color: '#f87171', fontSize: 12,
                      fontFamily: "'DM Mono', monospace",
                      cursor: 'pointer', outline: 'none', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.07)'}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
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
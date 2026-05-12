'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Home, TrendingUp, Wallet, DollarSign, ShoppingCart,
  FileText, Users, Briefcase, Settings, HelpCircle,
  LogOut, ChevronLeft, X, Zap, Repeat2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Nav data ──────────────────────────────────────────────── */
const mainLinks = [
  { href: '/dashboard',                label: 'Dashboard',    icon: Home },
  { href: '/dashboard/my-investment',  label: 'Investments',  icon: TrendingUp },
  { href: '/dashboard/deposit',        label: 'Deposit',      icon: Wallet },
  { href: '/dashboard/withdraw',       label: 'Withdraw',     icon: DollarSign },
  { href: '/dashboard/buy',            label: 'Buy Assets',   icon: ShoppingCart },
  { href: '/dashboard/swap',           label: 'Swap',         icon: Repeat2 },
  { href: '/dashboard/transactions',   label: 'Transactions', icon: FileText },
];

const toolsLinks = [
  { href: '/dashboard/referral', label: 'Referral', icon: Users },
  { href: '/dashboard/401k',     label: '401k Plan', icon: Briefcase },
];

const settingsLinks = [
  { href: '/dashboard/setting', label: 'Settings', icon: Settings },
  { href: '/dashboard/support', label: 'Support',  icon: HelpCircle },
];

type LinkItem = { href: string; label: string; icon: any };

/* ─── Component ─────────────────────────────────────────────── */
export default function Sidebar({
  mobileOpen = false,
  onClose,
}: {
  mobileOpen?: boolean;
  onClose?: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/signin' });
  };

  /* ── Single nav link ── */
  const NavLink = ({ link }: { link: LinkItem }) => {
    const Icon = link.icon;
    const isActive =
      pathname === link.href || pathname.startsWith(link.href + '/');

    return (
      <a
        href={link.href}
        onClick={() => onClose?.()}
        className={`relative flex items-center gap-2.5 rounded-xl transition-all duration-200 no-underline
          ${collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'}`}
        style={{
          background:  isActive ? 'rgba(123,47,255,0.12)' : 'transparent',
          border:      isActive
            ? '1px solid rgba(123,47,255,0.30)'
            : '1px solid transparent',
          color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
        }}
        onMouseEnter={e => {
          if (!isActive) {
            e.currentTarget.style.background   = 'rgba(123,47,255,0.06)';
            e.currentTarget.style.borderColor  = 'rgba(123,47,255,0.18)';
            e.currentTarget.style.color        = 'var(--text-secondary)';
          }
        }}
        onMouseLeave={e => {
          if (!isActive) {
            e.currentTarget.style.background   = 'transparent';
            e.currentTarget.style.borderColor  = 'transparent';
            e.currentTarget.style.color        = 'var(--text-muted)';
          }
        }}
      >
        {/* Violet active bar */}
        {isActive && !collapsed && (
          <motion.div
            layoutId="active-bar"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
            style={{ background: 'var(--grad-primary)' }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          />
        )}

        {/* Icon box */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all"
          style={
            isActive
              ? {
                  background:  'rgba(123,47,255,0.20)',
                  border:      '1px solid rgba(123,47,255,0.40)',
                  color:       'var(--vio-300)',
                  boxShadow:   '0 0 10px rgba(123,47,255,0.25)',
                }
              : {
                  background: 'rgba(255,255,255,0.03)',
                  border:     '1px solid rgba(255,255,255,0.06)',
                  color:      'var(--text-faint)',
                }
          }
        >
          <Icon size={14} />
        </div>

        {/* Label */}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              key="label"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="text-[13px] font-mono whitespace-nowrap overflow-hidden"
              style={{
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--text-primary)' : 'inherit',
              }}
            >
              {link.label}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Collapsed active dot */}
        {collapsed && isActive && (
          <span
            className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
            style={{ background: 'var(--vio-500)', boxShadow: '0 0 5px var(--vio-500)' }}
          />
        )}
      </a>
    );
  };

  /* ── Section group ── */
  const NavSection = ({ title, links }: { title: string; links: LinkItem[] }) => (
    <div className="mb-5">
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.p
            key="section-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-[9px] font-bold tracking-[0.14em] uppercase px-3 mb-2"
            style={{ color: 'var(--text-faint)' }}
          >
            {title}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Collapsed: thin divider instead of label */}
      {collapsed && (
        <div
          className="h-px mx-2 mb-2"
          style={{ background: 'var(--surface-border)' }}
        />
      )}

      <div className="flex flex-col gap-0.5">
        {links.map(link => <NavLink key={link.href} link={link} />)}
      </div>
    </div>
  );

  /* ── Inner sidebar content (shared desktop + mobile) ── */
  const SidebarInner = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full font-mono">

      {/* ── Logo / brand ── */}
      <div
        className={`flex items-center gap-3 mb-5
          ${collapsed && !isMobile ? 'justify-center px-0 py-5' : 'px-4 py-5'}`}
        style={{ borderBottom: '1px solid var(--surface-border)' }}
      >
        {/* Logo with glow ring */}
        <div className="relative shrink-0">
          <div
            className="absolute inset-0 rounded-full blur-md"
            style={{ background: 'rgba(123,47,255,0.35)' }}
          />
          <Image
            src="/asset/logo.jpeg"
            alt="Web3GlobalVault"
            width={collapsed && !isMobile ? 34 : 40}
            height={collapsed && !isMobile ? 34 : 40}
            className="rounded-full relative z-10 object-cover block"
            style={{ border: '1.5px solid rgba(123,47,255,0.50)' }}
          />
          {/* Online indicator */}
          <span
            className="absolute bottom-0 right-0 z-20 w-2.5 h-2.5 rounded-full"
            style={{
              background: 'var(--green-500)',
              border: '1.5px solid var(--void-50)',
              boxShadow: '0 0 6px var(--green-500)',
            }}
          />
        </div>

        <AnimatePresence initial={false}>
          {(!collapsed || isMobile) && (
            <motion.div
              key="brand"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
            >
              <p
                className="text-sm font-extrabold leading-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                Web3GlobalVault
              </p>
              <p
                className="text-[9px] tracking-[0.14em] mt-0.5"
                style={{ color: 'var(--vio-300)' }}
              >
                BUY · INVEST · EARN
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Navigation ── */}
      <nav
        className={`flex-1 overflow-y-auto overflow-x-hidden
          ${collapsed && !isMobile ? 'px-2' : 'px-3'}`}
        style={{ scrollbarWidth: 'none' }}
      >
        <NavSection title="Menu"             links={mainLinks} />
        <NavSection title="Tools & Partners" links={toolsLinks} />
        <NavSection title="Account"          links={settingsLinks} />
      </nav>

      {/* ── Bottom area ── */}
      <div
        className={`${collapsed && !isMobile ? 'px-2 py-3' : 'px-3 py-3'}`}
        style={{ borderTop: '1px solid var(--surface-border)' }}
      >
        {/* Pro tip banner */}
        <AnimatePresence initial={false}>
          {(!collapsed || isMobile) && (
            <motion.div
              key="pro-tip"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-2 p-3 rounded-xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(123,47,255,0.10), rgba(0,229,255,0.05))',
                border: '1px solid rgba(123,47,255,0.22)',
              }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Zap size={10} style={{ color: 'var(--cyan-500)' }} />
                <span
                  className="text-[10px] font-bold tracking-wider"
                  style={{ color: 'var(--cyan-300)' }}
                >
                  PRO TIP
                </span>
              </div>
              <p
                className="text-[10px] leading-relaxed"
                style={{ color: 'var(--text-muted)' }}
              >
                Use Buy to top-up assets quickly — trusted providers available.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-2.5 rounded-xl transition-all outline-none cursor-pointer bg-transparent
            ${collapsed && !isMobile ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'}`}
          style={{ border: '1px solid transparent' }}
          onMouseEnter={e => {
            e.currentTarget.style.background   = 'rgba(255,0,110,0.07)';
            e.currentTarget.style.borderColor  = 'rgba(255,0,110,0.20)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background  = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <div
            className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center"
            style={{
              background: 'rgba(255,0,110,0.08)',
              border: '1px solid rgba(255,0,110,0.20)',
              color: 'var(--mag-500)',
            }}
          >
            <LogOut size={14} />
          </div>
          <AnimatePresence initial={false}>
            {(!collapsed || isMobile) && (
              <motion.span
                key="logout-label"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-[13px] whitespace-nowrap overflow-hidden"
                style={{ color: 'var(--text-muted)' }}
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );

  /* ── Shared sidebar surface style ── */
  const sidebarSurface: React.CSSProperties = {
    background: 'linear-gradient(180deg, rgba(13,11,24,0.97) 0%, rgba(7,6,15,0.98) 100%)',
    borderRight: '1px solid var(--surface-border)',
    backdropFilter: 'blur(24px)',
  };

  return (
    <>
      {/* ══ Desktop sidebar (md+) ══════════════════════════════ */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        className="hidden md:flex flex-col min-h-screen sticky top-0 overflow-hidden shrink-0 relative"
        style={sidebarSurface}
      >
        {/* Ambient violet orb */}
        <div
          className="pointer-events-none absolute top-0 left-0 w-48 h-48 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(123,47,255,0.07) 0%, transparent 70%)',
            filter: 'blur(30px)',
          }}
        />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute top-5 right-3 z-10 w-6 h-6 rounded-lg flex items-center justify-center outline-none cursor-pointer transition-all"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--surface-border)',
            color: 'var(--text-faint)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background  = 'rgba(123,47,255,0.12)';
            e.currentTarget.style.borderColor = 'rgba(123,47,255,0.35)';
            e.currentTarget.style.color       = 'var(--vio-300)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background  = 'rgba(255,255,255,0.04)';
            e.currentTarget.style.borderColor = 'var(--surface-border)';
            e.currentTarget.style.color       = 'var(--text-faint)';
          }}
        >
          <motion.div
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ duration: 0.25 }}
          >
            <ChevronLeft size={12} />
          </motion.div>
        </button>

        <SidebarInner isMobile={false} />
      </motion.aside>

      {/* ══ Mobile overlay + drawer ════════════════════════════ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: 'rgba(3,2,10,0.75)', backdropFilter: 'blur(6px)' }}
              onClick={() => onClose?.()}
            />

            {/* Drawer */}
            <motion.aside
              key="mobile-sidebar"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-64 flex flex-col overflow-hidden md:hidden"
              style={sidebarSurface}
            >
              {/* Ambient orb */}
              <div
                className="pointer-events-none absolute top-0 left-0 w-40 h-40 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(123,47,255,0.08) 0%, transparent 70%)',
                  filter: 'blur(24px)',
                }}
              />

              {/* Close button */}
              <button
                onClick={() => onClose?.()}
                className="absolute top-4 right-3 z-10 w-7 h-7 rounded-lg flex items-center justify-center outline-none cursor-pointer transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--surface-border)',
                  color: 'var(--text-muted)',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <X size={13} />
              </button>

              <SidebarInner isMobile={true} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
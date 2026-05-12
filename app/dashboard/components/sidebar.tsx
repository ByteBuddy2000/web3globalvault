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

const mainLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/my-investment', label: 'Investments', icon: TrendingUp },
  { href: '/dashboard/deposit', label: 'Deposit', icon: Wallet },
  { href: '/dashboard/withdraw', label: 'Withdraw', icon: DollarSign },
  { href: '/dashboard/buy', label: 'Buy Assets', icon: ShoppingCart },
  { href: '/dashboard/swap', label: 'Swap', icon: Repeat2 },
  { href: '/dashboard/transactions', label: 'Transactions', icon: FileText },
];

const toolsLinks = [
  { href: '/dashboard/referral', label: 'Referral', icon: Users },
  { href: '/dashboard/401k', label: '401k Plan', icon: Briefcase },
];

const settingsLinks = [
  { href: '/dashboard/setting', label: 'Settings', icon: Settings },
  { href: '/dashboard/support', label: 'Support', icon: HelpCircle },
];

type LinkItem = { href: string; label: string; icon: any };

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

  const NavLink = ({ link }: { link: LinkItem }) => {
    const Icon = link.icon;
    const isActive = pathname === link.href || pathname.startsWith(link.href + '/');

    return (
      <a
        href={link.href}
        onClick={() => onClose?.()}
        className={`relative flex items-center gap-2.5 rounded-xl transition-all duration-200 no-underline
          ${collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'}
          ${isActive
            ? 'bg-yellow-400/10 border border-yellow-400/20 text-gray-100'
            : 'border border-transparent text-gray-500 hover:bg-white/[0.04] hover:border-white/[0.07] hover:text-gray-300'
          }`}
      >
        {/* Active bar */}
        {isActive && !collapsed && (
          <motion.div
            layoutId="active-bar"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-yellow-400 rounded-r-full"
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          />
        )}

        {/* Icon */}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all
          ${isActive
            ? 'bg-yellow-400/15 border border-yellow-400/30 text-yellow-400'
            : 'bg-white/[0.04] border border-white/[0.06] text-gray-600'
          }`}>
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
              className={`text-[13px] font-mono whitespace-nowrap overflow-hidden
                ${isActive ? 'font-semibold text-gray-100' : 'font-normal text-gray-500'}`}
            >
              {link.label}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Dot iFederal Reserveator when collapsed + active */}
        {collapsed && isActive && (
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-yellow-400" />
        )}
      </a>
    );
  };

  const NavSection = ({ title, links }: { title: string; links: LinkItem[] }) => (
    <div className="mb-5">
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.p
            key="section-title"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-[9px] font-bold tracking-[0.14em] text-gray-700 uppercase px-3 mb-2"
          >
            {title}
          </motion.p>
        )}
      </AnimatePresence>
      {collapsed && <div className="h-px bg-white/[0.04] mx-2 mb-2" />}
      <div className="flex flex-col gap-0.5">
        {links.map(link => <NavLink key={link.href} link={link} />)}
      </div>
    </div>
  );

  const SidebarInner = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full font-mono">
      {/* Logo */}
      <div className={`flex items-center gap-3 border-b border-white/[0.05] mb-5
        ${collapsed && !isMobile ? 'justify-center px-0 py-5' : 'px-4 py-5'}`}>
        <div className="relative shrink-0">
          <div className="absolute inset-0 rounded-full bg-yellow-400/20 blur-md" />
          <Image
            src="/asset/logo.jpeg"
            alt="Web3GlobalVault"
            width={collapsed && !isMobile ? 34 : 40}
            height={collapsed && !isMobile ? 34 : 40}
            className="rounded-full border border-yellow-400/25 relative z-10 object-cover block"
          />
        </div>

        <AnimatePresence initial={false}>
          {(!collapsed || isMobile) && (
            <motion.div
              key="brand"
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-sm font-extrabold text-gray-100 leading-tight">Web3GlobalVault</p>
              <p className="text-[9px] text-yellow-400 tracking-[0.14em] mt-0.5">BUY · INVEST · EARN</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className={`flex-1 overflow-y-auto overflow-x-hidden ${collapsed && !isMobile ? 'px-2' : 'px-3'}`}>
        <NavSection title="Menu" links={mainLinks} />
        <NavSection title="Tools & Partners" links={toolsLinks} />
        <NavSection title="Account" links={settingsLinks} />
      </nav>

      {/* Bottom */}
      <div className={`border-t border-white/[0.05] ${collapsed && !isMobile ? 'px-2 py-3' : 'px-3 py-3'}`}>
        {/* Pro tip */}
        <AnimatePresence initial={false}>
          {(!collapsed || isMobile) && (
            <motion.div
              key="pro-tip"
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mb-2 p-3 bg-yellow-400/[0.05] border border-yellow-400/[0.12] rounded-xl overflow-hidden"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Zap size={10} className="text-yellow-400" />
                <span className="text-[10px] font-bold text-yellow-400 tracking-wider">PRO TIP</span>
              </div>
              <p className="text-[10px] text-gray-600 leading-relaxed">
                Use Buy to top-up assets quickly — trusted providers available.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-2.5 rounded-xl border border-transparent
            hover:bg-red-400/[0.07] hover:border-red-400/15 transition-all outline-none cursor-pointer bg-transparent
            ${collapsed && !isMobile ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'}`}
        >
          <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center bg-red-400/[0.08] border border-red-400/15 text-red-400">
            <LogOut size={14} />
          </div>
          <AnimatePresence initial={false}>
            {(!collapsed || isMobile) && (
              <motion.span
                key="logout-label"
                initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }}
                className="text-[13px] text-gray-500 whitespace-nowrap overflow-hidden"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar (md+) ── */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        className="hidden md:flex flex-col min-h-screen bg-[#0a0b0e]/95 border-r border-white/[0.06] sticky top-0 backdrop-blur-xl overflow-hidden shrink-0 relative"
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute top-5 right-3 z-10 w-6 h-6 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-gray-600 hover:bg-yellow-400/10 hover:text-yellow-400 transition-all outline-none cursor-pointer"
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <ChevronLeft size={12} />
          </motion.div>
        </button>

        <SidebarInner isMobile={false} />
      </motion.aside>

      {/* ── Mobile overlay + sidebar ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm md:hidden"
              onClick={() => onClose?.()}
            />
            <motion.aside
              key="mobile-sidebar"
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#0a0b0e]/98 border-r border-white/[0.07] flex flex-col overflow-hidden md:hidden"
            >
              <button
                onClick={() => onClose?.()}
                className="absolute top-4 right-3 z-10 w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-gray-500 hover:text-white outline-none cursor-pointer"
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
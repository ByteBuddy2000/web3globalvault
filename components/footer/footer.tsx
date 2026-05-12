'use client';
import React, { useState } from 'react';
import { Facebook, Twitter, Linkedin, Instagram, Send, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const navLinks = [
  { label: 'About Us',       href: '/about' },
  { label: 'Services',       href: '/services' },
  { label: 'FAQ',            href: '/faq' },
  { label: 'Contact Us',     href: '/contact' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms',          href: '#' },
];

const socials = [
  { icon: Facebook,  href: '#', label: 'Facebook' },
  { icon: Twitter,   href: '#', label: 'Twitter' },
  { icon: Linkedin,  href: '#', label: 'LinkedIn' },
  { icon: Instagram, href: '#', label: 'Instagram' },
];

export default function Footer() {
  const [email, setEmail]           = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) { setSubscribed(true); setEmail(''); }
  };

  return (
    <footer className="relative overflow-hidden bg-surface-0 border-t border-border-subtle font-body">
      {/* ── top brand line ── */}
      <div className="w-full h-px" style={{
        background: 'linear-gradient(90deg, transparent 0%, var(--border-default) 15%, var(--border-brand-strong) 50%, var(--border-default) 85%, transparent 100%)',
      }} />

      {/* ── ambient glow ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-28 left-1/2 -translate-x-1/2 w-[700px] h-56 rounded-full"
          style={{
            background:
              'radial-gradient(ellipse, var(--brand-glow-sm) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-14">

        {/* ══ main row ══ */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10 mb-12">

          {/* brand */}
          <div className="flex-shrink-0">
            <span className="text-2xl font-bold block mb-1.5 text-gradient font-display">
              Web3GlobalVault
            </span>
            <p className="text-sm text-muted-foreground">
              Where Finance Meets the Future.
            </p>
          </div>

          {/* newsletter */}
          <div className="w-full md:w-auto">
            {subscribed ? (
              <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-glass-brand-sm border border-brand-400 text-brand-400 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" />
                You're subscribed!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="input w-[220px] rounded-full px-4"
                  required
                />
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}
                >
                  Subscribe <Send className="w-3 h-3" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ── divider ── */}
        <div className="divider" />

        {/* ══ bottom row ══ */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mt-2">

          {/* nav links */}
          <nav className="flex flex-wrap justify-center md:justify-start gap-x-5 gap-y-2">
            {navLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-xs text-muted-foreground tracking-wide transition-colors hover:text-foreground"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* social icons */}
          <div className="flex items-center gap-2">
            {socials.map(({ icon: Icon, href, label }) => (
              <Link
                key={label}
                href={href}
                aria-label={label}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-glass-white-xs border border-border hover:bg-glass-brand-sm hover:border-brand-400 hover:-translate-y-0.5"
              >
                <Icon className="w-3.5 h-3.5 text-brand-400" />
              </Link>
            ))}
          </div>
        </div>

        {/* ── copyright ── */}
        <p className="text-center mt-10 text-xs text-muted-foreground">
          © {new Date().getFullYear()}{' '}
          <span className="text-brand-400">Web3GlobalVault</span>
          {' '}· All Rights Reserved
        </p>

      </div>
    </footer>
  );
}
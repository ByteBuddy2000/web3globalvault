'use client';
import React, { useState } from 'react';
import { Facebook, Twitter, Linkedin, Instagram, Send } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(''); }
  };

  const navLinks = [
    { label: 'About Us', href: '/about' },
    { label: 'Services', href: '/services' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms', href: '#' },
  ];

  const socials = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Instagram, href: '#', label: 'Instagram' },
  ];

  return (
    <footer
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #07080A 0%, #0A0C0F 60%, #080A0D 100%)',
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
        ::placeholder { color: #4B5563; }
      `}</style>

      {/* top gold line */}
      <div className="w-full h-px" style={{ background: 'linear-gradient(90deg, transparent 0%, #C9A84C 25%, #F5D78E 50%, #C9A84C 75%, transparent 100%)' }} />

      {/* ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-48 rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(201,168,76,0.06) 0%, transparent 70%)', filter: 'blur(30px)' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-14">

        {/* ── main row ── */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10 mb-12">

          {/* brand */}
          <div className="flex-shrink-0">
            <span className="text-2xl font-bold block mb-2"
              style={{ fontFamily: "'Playfair Display', serif", background: 'linear-gradient(135deg, #F5D78E 0%, #C9A84C 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Genesis Bank
            </span>
            <p className="text-sm text-gray-500">Where Finance Meets the Future.</p>
          </div>

          {/* newsletter */}
          <div className="w-full md:w-auto">
            {subscribed ? (
              <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm"
                style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)', color: '#C9A84C' }}>
                <span>✓</span> You're subscribed!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="px-4 py-2.5 rounded-full text-sm outline-none w-56 transition-all duration-300"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', color: '#E8E8E8' }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)')}
                />
                <button type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg, #C9A84C 0%, #F5D78E 50%, #C9A84C 100%)', color: '#0A0A0B', boxShadow: '0 4px 16px rgba(201,168,76,0.25)' }}>
                  Subscribe <Send className="w-3 h-3" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ── divider ── */}
        <div className="h-px w-full mb-10"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.15) 30%, rgba(201,168,76,0.15) 70%, transparent)' }} />

        {/* ── bottom row ── */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* nav links */}
          <nav className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2">
            {navLinks.map(({ label, href }) => (
              <Link key={label} href={href}
                className="text-xs text-gray-500 hover:text-white transition-colors duration-200 tracking-wide">
                {label}
              </Link>
            ))}
          </nav>

          {/* socials */}
          <div className="flex items-center gap-3">
            {socials.map(({ icon: Icon, href, label }) => (
              <Link key={label} href={href} aria-label={label}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.15)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.45)'; (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,76,0.08)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.15)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: '#C9A84C' }} />
              </Link>
            ))}
          </div>
        </div>

        {/* ── copyright ── */}
        <p className="text-center text-xs text-gray-600 mt-8">
          © {new Date().getFullYear()} <span style={{ color: '#C9A84C' }}>Genesis Bank</span> · All Rights Reserved
        </p>

      </div>
    </footer>
  );
};

export default Footer;
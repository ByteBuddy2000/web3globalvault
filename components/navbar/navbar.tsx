"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Services", href: "/services" },
//   { label: "Partners", href: "#partners" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact Us", href: "/contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? "rgba(6,7,10,0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(22px) saturate(140%)" : "none",
        borderBottom: scrolled
          ? "1px solid var(--border-subtle)"
          : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full overflow-hidden"
            style={{ border: "2px solid var(--border-brand)" }}
          >
            <Image
              src="/asset/logo.jpeg"
              width={40}
              height={40}
              alt="Web3GlobalVault"
              className="object-cover"
            />
          </div>

          <span
            className="text-xl font-bold text-gradient"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Web3GlobalVault
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="nav-link"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTA + Mobile Toggle */}
        <div className="flex items-center gap-3">
          <Link
            href="/signup"
            className="btn-primary btn-sm hidden md:inline-flex"
          >
            Open Account
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            className="md:hidden p-2 btn-ghost btn-icon"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
            style={{
              background: "rgba(6,7,10,0.97)",
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            <div className="px-6 py-6 flex flex-col gap-2">
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="nav-link"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <Link
                href="/signup"
                className="btn-primary mt-3 text-center"
                onClick={() => setMobileOpen(false)}
              >
                Open Account
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
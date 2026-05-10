"use client";
import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Send,
  BarChart,
  Star,
  Building2,
  Users2,
  Globe2,
  ChevronDown,
  Menu,
  X,
  TrendingUp,
  Lock,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Footer from "../components/footer/footer";
import NewsSection from "./dashboard/components/NewsSection";
import Link from "next/link";

/* ─── Data ─────────────────────────────────────────────────── */
const companyPlans = [
  "Secure Digital Banking",
  "Smart Investment Tools",
  "Easy International Transfers",
  "Crypto Integration",
];

const partners = [
  { name: "Visa",       logo: "/asset/Visa.png" },
  { name: "Mastercard", logo: "/asset/Mastercard.png" },
  { name: "PayPal",     logo: "/asset/PayPal.png" },
  { name: "Stripe",     logo: "/asset/Stripe_Logo.png" },
  { name: "Revolut",    logo: "/asset/Revolut.png" },
];

const testimonials = [
  {
    name: "Jane Doe",
    role: "Entrepreneur",
    text: "Web3GlobalVault helped us scale globally with seamless payments and smart investment tools.",
    avatar: "/asset/user1.jpg",
    rating: 5,
  },
  {
    name: "Michael Lee",
    role: "Freelancer",
    text: "The dashboard is intuitive and the support team is always responsive. Highly recommended!",
    avatar: "/asset/user2.jpg",
    rating: 5,
  },
  {
    name: "Natasha Smith",
    role: "Business Owner",
    text: "I love the security features and the cashback offers provided. Genesis is my go-to bank.",
    avatar: "/asset/user3.jpg",
    rating: 5,
  },
];

const navLinks = [
  { label: "Home",       href: "/" },
  { label: "About Us",   href: "/about" },
  { label: "Services",   href: "/services" },
  { label: "Partners",   href: "#partners" },
  { label: "FAQ",        href: "/faq" },
  { label: "Contact Us", href: "/contact" },
];

/* ─── Helpers ───────────────────────────────────────────────── */
const ThemeLine = () => <hr className="divider" />;

const ThemeDot = ({ className = "" }) => (
  <span
    className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${className}`}
    style={{ background: "var(--vio-500)" }}
  />
);

/* ─── Floating orbs background ──────────────────────────────── */
const Orbs = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
    {[
      { top: "10%", left: "5%",  size: 400, delay: 0 },
      { top: "60%", left: "75%", size: 500, delay: 2 },
      { top: "40%", left: "40%", size: 300, delay: 4 },
    ].map((o, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          top: o.top,
          left: o.left,
          width: o.size,
          height: o.size,
          background:
            i % 2 === 0
              ? "radial-gradient(circle, rgba(123,47,255,0.07) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(0,229,255,0.05) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 8, delay: o.delay, repeat: Infinity, ease: "easeInOut" }}
      />
    ))}
  </div>
);

/* ─── Stat card ─────────────────────────────────────────────── */
function StatCard({ value, label }) {
  return (
    <div className="text-center px-8 py-6 border-l first:border-l-0"
         style={{ borderColor: "var(--surface-border)" }}>
      <p className="stat-value text-4xl mb-1">{value}</p>
      <p className="text-xs tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
    </div>
  );
}

/* ─── Feature card ──────────────────────────────────────────── */
function FeatureCard({ icon: Icon, title, desc, delay }) {
  return (
    <motion.div
      className="card group relative p-8"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      whileHover={{ y: -6 }}
    >
      {/* hover glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: "radial-gradient(circle at 50% 0%, rgba(123,47,255,0.10) 0%, transparent 60%)" }}
      />

      {/* icon */}
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
        style={{
          background: "linear-gradient(135deg, rgba(123,47,255,0.18), rgba(123,47,255,0.06))",
          border: "1px solid rgba(123,47,255,0.30)",
        }}
      >
        <Icon className="w-6 h-6" style={{ color: "var(--vio-300)" }} />
      </div>

      <h4 className="text-xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
        {title}
      </h4>
      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        {desc}
      </p>

      <div
        className="mt-6 inline-flex items-center gap-2 text-xs tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
        style={{ color: "var(--cyan-500)" }}
      >
        Learn more <ArrowRight className="w-3 h-3" />
      </div>
    </motion.div>
  );
}

/* ─── Testimonial card ──────────────────────────────────────── */
function TestimonialCard({ t, delay }) {
  return (
    <motion.div
      className="card relative p-8"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
    >
      {/* decorative quote */}
      <span
        className="absolute top-4 right-6 text-6xl leading-none opacity-10 select-none"
        style={{ color: "var(--vio-300)" }}
      >
        "
      </span>

      {/* stars */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: t.rating }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-current" style={{ color: "var(--cyan-500)" }} />
        ))}
      </div>

      <p className="text-sm leading-relaxed mb-6 italic" style={{ color: "var(--text-secondary)" }}>
        "{t.text}"
      </p>

      <div className="flex items-center gap-3">
        <Image
          src={t.avatar}
          alt={t.name}
          width={44}
          height={44}
          className="rounded-full object-cover"
          style={{ border: "2px solid rgba(123,47,255,0.40)" }}
        />
        <div>
          <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
            {t.name}
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {t.role}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Globe visual ──────────────────────────────────────────── */
const GlobeVisual = () => (
  <div className="relative flex justify-center items-center w-72 h-72">
    {[220, 180, 140].map((size, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          border: `1px solid rgba(123,47,255,${0.08 + i * 0.08})`,
        }}
        animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
        transition={{ duration: 20 + i * 6, repeat: Infinity, ease: "linear" }}
      />
    ))}

    {/* core */}
    <div
      className="relative w-24 h-24 rounded-full flex items-center justify-center"
      style={{
        background: "var(--grad-primary)",
        boxShadow: "var(--glow-vio)",
      }}
    >
      <Globe2 className="w-10 h-10" style={{ color: "var(--void-0)" }} />
    </div>

    {/* orbiting dots */}
    {[0, 60, 120, 180, 240, 300].map((deg, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 rounded-full"
        style={{
          background: i % 2 === 0 ? "var(--vio-500)" : "var(--cyan-500)",
          boxShadow: i % 2 === 0 ? "0 0 6px var(--vio-500)" : "0 0 6px var(--cyan-500)",
          top: "50%",
          left: "50%",
          marginTop: -4,
          marginLeft: -4,
        }}
        animate={{
          x: Math.cos((deg * Math.PI) / 180) * 100,
          y: Math.sin((deg * Math.PI) / 180) * 100,
        }}
        transition={{ duration: 0 }}
      />
    ))}
  </div>
);

/* ─── Main Component ─────────────────────────────────────────── */
export default function HomePage() {
  const [typingIndex, setTypingIndex]     = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [mobileOpen, setMobileOpen]       = useState(false);
  const [scrolled, setScrolled]           = useState(false);
  const heroRef = useRef(null);

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const heroY       = useTransform(scrollY, [0, 500], [0, 80]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const phrase = companyPlans[typingIndex % companyPlans.length];
    let i = 0;
    setDisplayedText("");
    const iv = setInterval(() => {
      if (i < phrase.length) {
        setDisplayedText(phrase.slice(0, i + 1));
        i++;
      } else {
        clearInterval(iv);
        setTimeout(() => setTypingIndex((p) => p + 1), 2200);
      }
    }, 70);
    return () => clearInterval(iv);
  }, [typingIndex]);

  return (
    <div className="bg-app min-h-screen flex flex-col relative">
      <Orbs />

      {/* ── HEADER ───────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? "rgba(7,6,15,0.88)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid var(--surface-border)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full overflow-hidden"
              style={{ border: "2px solid rgba(123,47,255,0.45)" }}
            >
              <Image src="/asset/logo.jpeg" width={40} height={40} alt="Genesis" className="object-cover" />
            </div>
            <span className="text-xl font-bold text-gradient">Web3GlobalVault</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium tracking-wide transition-colors duration-200"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--text-primary)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)")}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-3">
            <a href="/signup" className="hidden md:inline-flex items-center gap-2 btn-primary text-sm">
              Open Account <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <button
              className="md:hidden p-2"
              style={{ color: "var(--text-secondary)" }}
              onClick={() => setMobileOpen((p) => !p)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
              style={{
                background: "rgba(7,6,15,0.97)",
                borderTop: "1px solid var(--surface-border)",
              }}
            >
              <div className="px-6 py-6 flex flex-col gap-4">
                {navLinks.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="text-sm py-1 transition-colors"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link href="/signup" className="mt-2 btn-primary text-center text-sm">
                  Open Account
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <motion.section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 z-10"
        style={{ opacity: heroOpacity, y: heroY }}
      >
        {/* eyebrow pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="badge badge-vio mb-8"
        >
          <ThemeDot /> Trusted by 2M+ customers worldwide
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold leading-none mb-6 max-w-5xl"
        >
          Where Finance{" "}
          <span className="text-gradient">Meets</span>{" "}
          the Future
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg md:text-xl mb-4 max-w-xl leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Your gateway to smart, secure, and modern financial solutions crafted for today's world.
        </motion.p>

        {/* typewriter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mb-10 h-8 flex items-center justify-center"
        >
          <span className="text-base md:text-lg" style={{ color: "var(--vio-300)" }}>
            {displayedText}
            <span className="animate-pulse">▌</span>
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <a
            href="/signup"
            className="btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </a>
          <a href="#" className="btn-ghost inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm">
            Watch Demo
          </a>
        </motion.div>

        {/* scroll hint */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ color: "var(--text-faint)" }}
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.section>

      {/* ── STATS STRIP ──────────────────────────────────────── */}
      <motion.div
        className="relative z-10 max-w-5xl mx-auto w-full px-6 mb-4"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <div className="card rounded-2xl grid grid-cols-2 md:grid-cols-4">
          {[
            { value: "40+",  label: "Countries" },
            { value: "2M+",  label: "Customers" },
            { value: "14+",  label: "Years" },
            { value: "$50B+", label: "Processed" },
          ].map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </motion.div>

      <ThemeLine />

      {/* ── HERO IMAGE + COPY ─────────────────────────────────── */}
      <motion.section
        className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center py-8 z-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {/* Image */}
        <div className="relative">
          <div
            className="absolute -inset-4 rounded-3xl"
            style={{
              background: "linear-gradient(135deg, rgba(123,47,255,0.14) 0%, transparent 60%)",
              filter: "blur(20px)",
            }}
          />
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{ border: "1px solid var(--surface-border)" }}
          >
            <Image
              src="/asset/mps.jpeg"
              alt="Mobile Payment System"
              width={600}
              height={450}
              className="w-full object-cover"
            />
            {/* overlay badge */}
            <div
              className="absolute bottom-4 left-4 right-4 rounded-xl p-4 flex items-center gap-3"
              style={{
                background: "rgba(7,6,15,0.85)",
                backdropFilter: "blur(16px)",
                border: "1px solid var(--surface-border)",
              }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(123,47,255,0.15)" }}
              >
                <TrendingUp className="w-5 h-5" style={{ color: "var(--vio-300)" }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Portfolio Growth</p>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  +24.6% this quarter
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Copy */}
        <div>
          <p className="text-xs tracking-widest uppercase mb-4 text-vio">About Genesis</p>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Best Financial Company{" "}
            <span className="text-gradient">For Your Business</span>
          </h2>
          <p className="mb-8 text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            At Genesis Financial, we help clients unlock their full financial potential with
            secure digital banking, automated investment tools, and trusted advisors —
            all at your fingertips.
          </p>

          <div className="flex gap-6 mb-8">
            {[
              { num: "76+", label: "Projects Completed" },
              { num: "14+", label: "Years of Experience" },
            ].map((s) => (
              <div key={s.label} className="stat-tile text-center px-6 py-4 rounded-xl">
                <p className="stat-value text-3xl">{s.num}</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{s.label}</p>
              </div>
            ))}
          </div>

          <a href="/signin" className="btn-primary inline-flex items-center gap-2 text-sm px-6 py-3 rounded-full">
            Plan Your Financial Future <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </motion.section>

      <ThemeLine />

      {/* ── PARTNERS ─────────────────────────────────────────── */}
      <motion.section
        id="partners"
        className="max-w-7xl mx-auto px-6 py-8 z-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <div className="text-center mb-10">
          <p className="text-xs tracking-widest uppercase mb-2 text-vio">Ecosystem</p>
          <h3 className="text-3xl font-bold">Our Trusted Partners</h3>
        </div>
        <div className="flex flex-wrap justify-center gap-5">
          {partners.map((partner, idx) => (
            <motion.div
              key={idx}
              className="card flex flex-col items-center gap-2 px-8 py-5 rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-1"
              whileHover={{ borderColor: "rgba(0,229,255,0.35)" }}
            >
              <Image
                src={partner.logo}
                alt={partner.name}
                width={72}
                height={36}
                className="object-contain opacity-70 hover:opacity-100 transition-opacity"
              />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {partner.name}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <ThemeLine />

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-8 z-10">
        <div className="text-center mb-14">
          <p className="text-xs tracking-widest uppercase mb-2 text-vio">Why Us</p>
          <h3 className="text-4xl font-bold">Why Choose Genesis?</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: ShieldCheck,
              title: "Bank-Grade Security",
              desc: "Your funds and personal data are protected using multi-layer encryption, biometric 2FA, and continuous AI-powered threat monitoring.",
              delay: 0,
            },
            {
              icon: Zap,
              title: "Fast Global Transfers",
              desc: "Seamlessly send money worldwide with competitive rates, real-time tracking, and instant settlement from our secure platform.",
              delay: 0.12,
            },
            {
              icon: BarChart,
              title: "Insightful Investments",
              desc: "Grow smarter with advanced dashboards, ML-driven risk analysis, and tailored insights into your financial performance.",
              delay: 0.24,
            },
          ].map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </section>

      <ThemeLine />

      {/* ── IMAGE CARDS ──────────────────────────────────────── */}
      <motion.section
        className="max-w-7xl mx-auto px-6 py-8 z-10 grid md:grid-cols-2 gap-6"
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        {[
          {
            img:  "/asset/card1.jpeg",
            tag:  "Advisory",
            title: "Expert Financial Advice",
            desc:  "Talk to certified consultants about business growth and smart investments.",
            icon:  Lock,
          },
          {
            img:  "/asset/card2.jpeg",
            tag:  "Analytics",
            title: "Real-Time Investment Tracking",
            desc:  "Track and grow your investments with real-time insights and powerful dashboards.",
            icon:  TrendingUp,
          },
        ].map(({ img, tag, title, desc, icon: Icon }) => (
          <motion.div
            key={title}
            className="card group rounded-2xl overflow-hidden cursor-pointer"
            whileHover={{ y: -4 }}
          >
            <div className="relative h-64 overflow-hidden">
              <Image
                src={img}
                alt={title}
                width={700}
                height={400}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(7,6,15,0.92) 0%, rgba(7,6,15,0.2) 60%, transparent 100%)",
                }}
              />
              <span className="badge badge-vio absolute top-4 left-4">{tag}</span>
            </div>

            <div className="p-6" style={{ background: "rgba(255,255,255,0.015)" }}>
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "rgba(123,47,255,0.12)" }}
                >
                  <Icon className="w-4 h-4" style={{ color: "var(--vio-300)" }} />
                </div>
                <div>
                  <h4 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                    {title}
                  </h4>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{desc}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.section>

      <ThemeLine />

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-8 z-10">
        <div className="text-center mb-14">
          <p className="text-xs tracking-widest uppercase mb-2 text-vio">Social Proof</p>
          <h3 className="text-4xl font-bold">What Our Clients Say</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <TestimonialCard key={t.name} t={t} delay={i * 0.1} />
          ))}
        </div>
      </section>

      <ThemeLine />

      {/* ── GLOBAL REACH ─────────────────────────────────────── */}
      <motion.section
        className="max-w-7xl mx-auto px-6 py-8 z-10 grid md:grid-cols-2 gap-16 items-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <div>
          <p className="text-xs tracking-widest uppercase mb-2 text-vio">Presence</p>
          <h4 className="text-4xl font-bold mb-6 leading-tight">A Truly Global Bank</h4>
          <p className="mb-6 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Web3GlobalVault operates in over 40 countries, serving millions of customers with
            local expertise and global standards. No matter where you are, we're there.
          </p>
          <ul className="space-y-3">
            {[
              "Offices in North America, Europe, Africa & Asia",
              "24/7 multilingual support in 12 languages",
              "International compliance & regulatory standards",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                <ThemeDot />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-center">
          <GlobeVisual />
        </div>
      </motion.section>

      <ThemeLine />

      {/* ── LOANS & OFFERS ───────────────────────────────────── */}
      <motion.section
        className="max-w-7xl mx-auto px-6 py-8 z-10 grid md:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        {/* Loans */}
        <div
          className="p-8 rounded-2xl relative overflow-hidden group"
          style={{
            background: "linear-gradient(135deg, rgba(123,47,255,0.10), rgba(123,47,255,0.03))",
            border: "1px solid rgba(123,47,255,0.22)",
          }}
        >
          <div
            className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-20 pointer-events-none"
            style={{ background: "radial-gradient(circle, var(--vio-500), transparent)" }}
          />
          <h4 className="text-2xl font-bold mb-3" style={{ color: "var(--vio-100)" }}>
            Need a Loan?
          </h4>
          <p className="text-sm mb-5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Genesis offers quick personal and business loans with flexible repayment options,
            low interest rates, and instant digital approval.
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
            style={{ color: "var(--vio-300)" }}
          >
            Check your eligibility <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Offers */}
        <div className="card p-8 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 fill-current" style={{ color: "var(--cyan-500)" }} />
            <h4 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              Best Offers for You
            </h4>
          </div>
          <ul className="space-y-3">
            {[
              "4% cashback on all card purchases",
              "Free international transfer this month",
              "Refer & earn $250 instantly",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                <ThemeDot />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </motion.section>

      <ThemeLine />

      {/* ── CTA BANNER ───────────────────────────────────────── */}
      <motion.section
        className="max-w-7xl mx-auto px-6 py-8 z-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <div
          className="relative rounded-3xl p-12 md:p-16 text-center overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(123,47,255,0.14) 0%, rgba(0,229,255,0.05) 50%, rgba(123,47,255,0.10) 100%)",
            border: "1px solid rgba(123,47,255,0.28)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(123,47,255,0.14) 0%, transparent 60%)",
            }}
          />
          <p className="text-xs tracking-widest uppercase mb-4 text-vio">Get Started Today</p>
          <h3 className="text-4xl md:text-5xl font-bold mb-5 max-w-2xl mx-auto leading-tight">
            Ready to Take Control of{" "}
            <span className="text-gradient">Your Finances?</span>
          </h3>
          <p className="mb-8 max-w-lg mx-auto" style={{ color: "var(--text-secondary)" }}>
            Join over 2 million customers who trust Web3GlobalVault for seamless, secure, and smart banking.
          </p>
          <a
            href="/signup"
            className="btn-primary inline-flex items-center gap-2 px-10 py-4 rounded-full text-sm font-bold"
          >
            Open Your Free Account <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </motion.section>

      <ThemeLine />

      {/* ── NEWS ─────────────────────────────────────────────── */}
      <div className="z-10">
        <NewsSection />
      </div>

      <ThemeLine />

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <div className="z-10">
        <Footer />
      </div>
    </div>
  );
}
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
  Wifi,
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
  { name: "Visa", logo: "/asset/Visa.png" },
  { name: "Mastercard", logo: "/asset/Mastercard.png" },
  { name: "PayPal", logo: "/asset/PayPal.png" },
  { name: "Stripe", logo: "/asset/Stripe_Logo.png" },
  { name: "Revolut", logo: "/asset/Revolut.png" },
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
    text: "I love the security features and the cashback offers provided. GlobalVault is my go-to bank.",
    avatar: "/asset/user3.jpg",
    rating: 5,
  },
];

/* ─── Section Divider ───────────────────────────────────────── */
const SectionDivider = () => (
  <div className="max-w-7xl mx-auto px-6">
    <div
      style={{
        height: "1px",
        background:
          "linear-gradient(90deg, transparent 0%, var(--border-default) 20%, var(--border-brand) 50%, var(--border-default) 80%, transparent 100%)",
        margin: "0",
      }}
    />
  </div>
);

/* ─── Live indicator dot ────────────────────────────────────── */
const LiveDot = () => (
  <span className="status-dot status-dot-live" />
);

/* ─── Ambient Orbs ──────────────────────────────────────────── */
const Orbs = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
    {[
      { top: "8%", left: "2%", size: 560, delay: 0, color: "var(--brand-500)" },
      { top: "65%", left: "72%", size: 440, delay: 2.5, color: "var(--cyan-400)" },
      { top: "38%", left: "42%", size: 320, delay: 5, color: "var(--brand-700)" },
    ].map((o, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          top: o.top,
          left: o.left,
          width: o.size,
          height: o.size,
          background: `radial-gradient(circle, ${i === 1
              ? "rgba(34,211,238,0.07)"
              : "rgba(59,130,246,0.08)"
            } 0%, transparent 70%)`,
          filter: "blur(50px)",
        }}
        animate={{ scale: [1, 1.18, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 9 + i * 2, delay: o.delay, repeat: Infinity, ease: "easeInOut" }}
      />
    ))}
  </div>
);

/* ─── Stat Card ─────────────────────────────────────────────── */
function StatCard({ value, label }) {
  return (
    <div
      className="text-center px-8 py-6"
      style={{ borderLeft: "1px solid var(--border-subtle)" }}
    >
      <p
        className="text-4xl font-bold mb-1 text-gradient"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {value}
      </p>
      <p
        className="text-xs tracking-wider uppercase"
        style={{ color: "var(--text-300)", letterSpacing: "var(--tracking-wider)" }}
      >
        {label}
      </p>
    </div>
  );
}

/* ─── Feature Card ──────────────────────────────────────────── */
function FeatureCard({
  icon: Icon,
  title,
  desc,
  delay,
}) {
  return (
    <motion.div
      className="card group relative p-8 overflow-hidden"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      whileHover={{ y: -6 }}
    >
      {/* hover top-glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, var(--glass-brand-md) 0%, transparent 65%)",
        }}
      />

      {/* icon badge */}
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
        style={{
          background: "var(--glass-brand-sm)",
          border: "1px solid var(--border-brand)",
        }}
      >
        <Icon className="w-6 h-6" style={{ color: "var(--brand-400)" }} />
      </div>

      <h4
        className="text-xl font-bold mb-3"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--text-0)",
        }}
      >
        {title}
      </h4>

      <p style={{ color: "var(--text-200)", fontSize: "var(--text-sm)", lineHeight: "var(--leading-normal)" }}>
        {desc}
      </p>

      <div
        className="mt-6 inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
        style={{ color: "var(--brand-400)", letterSpacing: "var(--tracking-wider)" }}
      >
        Learn more <ArrowRight className="w-3 h-3" />
      </div>
    </motion.div>
  );
}

/* ─── Testimonial Card ──────────────────────────────────────── */
function TestimonialCard({
  t,
  delay,
}) {
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
        style={{ fontFamily: "Georgia, serif", color: "var(--brand-400)" }}
      >
        "
      </span>

      {/* stars */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: t.rating }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-current" style={{ color: "var(--brand-400)" }} />
        ))}
      </div>

      <p
        className="text-sm italic mb-6"
        style={{ color: "var(--text-100)", lineHeight: "var(--leading-normal)" }}
      >
        "{t.text}"
      </p>

      <div className="flex items-center gap-3">
        <Image
          src={t.avatar}
          alt={t.name}
          width={44}
          height={44}
          className="rounded-full object-cover avatar-md"
          style={{ border: "2px solid var(--border-brand)" }}
        />
        <div>
          <p className="font-semibold text-sm" style={{ color: "var(--text-0)" }}>
            {t.name}
          </p>
          <p className="text-xs" style={{ color: "var(--text-300)" }}>
            {t.role}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Globe Visual ──────────────────────────────────────────── */
const GlobeVisual = () => (
  <div className="relative flex justify-center items-center w-72 h-72">
    {/* orbital rings */}
    {[220, 175, 130].map((size, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          border: `1px solid ${i === 0
              ? "var(--border-brand)"
              : i === 1
                ? "var(--border-cyan)"
                : "var(--border-default)"
            }`,
          opacity: 0.5 + i * 0.15,
        }}
        animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
        transition={{ duration: 18 + i * 7, repeat: Infinity, ease: "linear" }}
      />
    ))}

    {/* core sphere */}
    <div
      className="relative w-24 h-24 rounded-full flex items-center justify-center"
      style={{
        background:
          "linear-gradient(135deg, var(--brand-600) 0%, var(--brand-400) 60%, var(--cyan-400) 100%)",
        boxShadow: "var(--shadow-glow-brand)",
      }}
    >
      <Globe2 className="w-10 h-10" style={{ color: "#fff" }} />
    </div>

    {/* orbiting dots */}
    {[0, 60, 120, 180, 240, 300].map((deg, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 rounded-full"
        style={{
          background: i % 2 === 0 ? "var(--brand-400)" : "var(--cyan-400)",
          boxShadow: i % 2 === 0
            ? "0 0 6px var(--brand-400)"
            : "0 0 6px var(--cyan-400)",
          top: "50%",
          left: "50%",
          marginTop: -4,
          marginLeft: -4,
          x: Math.cos((deg * Math.PI) / 180) * 105,
          y: Math.sin((deg * Math.PI) / 180) * 105,
        }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
      />
    ))}
  </div>
);

/* ─── Main Component ─────────────────────────────────────────── */
export default function HomePage() {
  const [typingIndex, setTypingIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef(null);

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const heroY = useTransform(scrollY, [0, 500], [0, 80]);

  /* scroll listener */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* typewriter */
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
    <div
      className="min-h-screen flex flex-col relative"
      style={{
        background: "var(--surface-0)",
        fontFamily: "var(--font-body)",
        color: "var(--text-0)",
      }}
    >
      <Orbs />


      {/* ══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════ */}
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
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8"
          style={{
            border: "1px solid var(--border-brand)",
            background: "var(--glass-brand-sm)",
            color: "var(--brand-300)",
            fontSize: "var(--text-xs)",
            letterSpacing: "var(--tracking-wider)",
            textTransform: "uppercase",
          }}
        >
          <LiveDot />
          Trusted by 2M+ customers worldwide
        </motion.div>

        {/* H1 */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-bold leading-none mb-6 max-w-5xl"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.8rem, 8vw, 5.5rem)",
            letterSpacing: "var(--tracking-tight)",
            color: "var(--text-0)",
          }}
        >
          Where Finance{" "}
          <span className="text-gradient">Meets</span>{" "}
          the Future
        </motion.h1>

        {/* Sub-heading */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg md:text-xl mb-4 max-w-xl leading-relaxed"
          style={{ color: "var(--text-200)" }}
        >
          Your gateway to smart, secure, and modern financial solutions crafted for today's world.
        </motion.p>

        {/* Typewriter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mb-10 h-8 flex items-center justify-center"
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-base)",
              color: "var(--brand-400)",
            }}
          >
            {displayedText}
            <span className="animate-pulse">▌</span>
          </span>
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <a href="/signup" className="btn-primary btn-lg">
            Get Started Free <ArrowRight className="w-4 h-4" />
          </a>
          <a href="#" className="btn-secondary btn-lg">
            Watch Demo
          </a>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ color: "var(--text-400)" }}
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span
            style={{
              fontSize: "var(--text-xs)",
              letterSpacing: "var(--tracking-wider)",
              textTransform: "uppercase",
            }}
          >
            Scroll
          </span>
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.section>

      {/* ══════════════════════════════════════════════════════
          STATS STRIP
      ══════════════════════════════════════════════════════ */}
      <motion.div
        className="relative z-10 max-w-5xl mx-auto w-full px-6 mb-4"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <div
          className="card rounded-2xl grid grid-cols-2 md:grid-cols-4"
          style={{
            /* override card border-radius for strip */
            borderRadius: "var(--radius-xl)",
          }}
        >
          {/* first child: no left border */}
          {[
            { value: "40+", label: "Countries" },
            { value: "2M+", label: "Customers" },
            { value: "14+", label: "Years" },
            { value: "$50B+", label: "Processed" },
          ].map((s, i) => (
            <div
              key={s.label}
              style={i === 0 ? { borderLeft: "none" } : {}}
            >
              <StatCard {...s} />
            </div>
          ))}
        </div>
      </motion.div>

      <SectionDivider />

      {/* ══════════════════════════════════════════════════════
          HERO IMAGE + COPY
      ══════════════════════════════════════════════════════ */}
      <motion.section
        className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center py-20 z-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {/* Image */}
        <div className="relative">
          {/* ambient glow behind image */}
          <div
            className="absolute -inset-6 rounded-3xl pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 40% 40%, var(--glass-brand-md) 0%, transparent 65%)",
              filter: "blur(24px)",
            }}
          />
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{ border: "1px solid var(--border-brand)" }}
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
                background: "rgba(6,7,10,0.85)",
                backdropFilter: "blur(16px)",
                border: "1px solid var(--border-brand)",
              }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--glass-brand-md)" }}
              >
                <TrendingUp className="w-5 h-5" style={{ color: "var(--brand-400)" }} />
              </div>
              <div>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-200)" }}>
                  Portfolio Growth
                </p>
                <p className="font-semibold" style={{ fontSize: "var(--text-sm)", color: "var(--text-0)" }}>
                  +24.6% this quarter
                </p>
              </div>
              <span
                className="badge badge-success ml-auto"
              >
                Live
              </span>
            </div>
          </div>
        </div>

        {/* Copy */}
        <div>
          <p
            className="text-xs font-semibold tracking-wider uppercase mb-4"
            style={{ color: "var(--brand-400)", letterSpacing: "var(--tracking-wider)" }}
          >
            About GlobalVault
          </p>
          <h2
            className="font-bold leading-tight mb-6"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              letterSpacing: "var(--tracking-tight)",
              color: "var(--text-0)",
            }}
          >
            Best Financial Company{" "}
            <span className="text-gradient">For Your Business</span>
          </h2>
          <p className="mb-8 leading-relaxed" style={{ color: "var(--text-200)" }}>
            At GlobalVault Financial, we help clients unlock their full financial potential with
            secure digital banking, automated investment tools, and trusted advisors —
            all at your fingertips.
          </p>

          {/* Mini stats */}
          <div className="flex gap-4 mb-8">
            {[
              { num: "76+", label: "Projects Completed" },
              { num: "14+", label: "Years of Experience" },
            ].map((s) => (
              <div
                key={s.label}
                className="card-brand px-6 py-4 rounded-xl text-center"
                style={{
                  background: "var(--glass-brand-sm)",
                  border: "1px solid var(--border-brand)",
                }}
              >
                <p
                  className="text-3xl font-bold text-gradient"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {s.num}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--text-200)" }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          <a href="/signin" className="btn-primary">
            Plan Your Financial Future <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </motion.section>

      <SectionDivider />

      {/* ══════════════════════════════════════════════════════
          PARTNERS
      ══════════════════════════════════════════════════════ */}
      <motion.section
        id="partners"
        className="max-w-7xl mx-auto px-6 py-20 z-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <div className="text-center mb-12">
          <p
            className="section-label mb-2"
            style={{
              fontSize: "var(--text-xs)",
              letterSpacing: "var(--tracking-wider)",
              textTransform: "uppercase",
              color: "var(--brand-400)",
              fontWeight: 600,
            }}
          >
            Ecosystem
          </p>
          <h3
            className="section-header"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Our Trusted Partners
          </h3>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {partners.map((partner, idx) => (
            <motion.div
              key={idx}
              className="flex flex-col items-center gap-2 px-8 py-5 rounded-xl cursor-pointer transition-base"
              style={{
                background: "var(--glass-white-xs)",
                border: "1px solid var(--border-default)",
                backdropFilter: "blur(12px)",
              }}
              whileHover={{
                borderColor: "var(--border-brand)",
                y: -4,
                transition: { duration: 0.2 },
              }}
            >
              <Image
                src={partner.logo}
                alt={partner.name}
                width={72}
                height={36}
                className="object-contain opacity-70 hover:opacity-100 transition-opacity"
                style={{ filter: "brightness(0) invert(1)" }}
              />
              <span
                style={{ fontSize: "var(--text-xs)", color: "var(--text-300)" }}
              >
                {partner.name}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <SectionDivider />

      {/* ══════════════════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 py-20 z-10">
        <div className="text-center mb-16">
          <p
            className="text-xs font-semibold tracking-wider uppercase mb-2"
            style={{ color: "var(--brand-400)", letterSpacing: "var(--tracking-wider)" }}
          >
            Why Us
          </p>
          <h3
            className="section-header"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Why Choose GlobalVault?
          </h3>
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

      <SectionDivider />

      {/* ══════════════════════════════════════════════════════
          IMAGE CARDS
      ══════════════════════════════════════════════════════ */}
      <motion.section
        className="max-w-7xl mx-auto px-6 py-20 z-10 grid md:grid-cols-2 gap-6"
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        {[
          {
            img: "/asset/card1.jpeg",
            tag: "Advisory",
            title: "Expert Financial Advice",
            desc: "Talk to certified consultants about business growth and smart investments.",
            icon: Lock,
          },
          {
            img: "/asset/card2.jpeg",
            tag: "Analytics",
            title: "Real-Time Investment Tracking",
            desc: "Track and grow your investments with real-time insights and powerful dashboards.",
            icon: TrendingUp,
          },
        ].map(({ img, tag, title, desc, icon: Icon }) => (
          <motion.div
            key={title}
            className="card group rounded-2xl overflow-hidden cursor-pointer"
            whileHover={{ y: -4 }}
          >
            {/* image */}
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
                    "linear-gradient(to top, var(--surface-0) 0%, rgba(6,7,10,0.15) 60%, transparent 100%)",
                }}
              />
              <span
                className="badge badge-brand absolute top-4 left-4"
              >
                {tag}
              </span>
            </div>

            {/* content */}
            <div className="p-6" style={{ background: "var(--glass-white-xs)" }}>
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "var(--glass-brand-sm)" }}
                >
                  <Icon className="w-4 h-4" style={{ color: "var(--brand-400)" }} />
                </div>
                <div>
                  <h4
                    className="font-semibold mb-1"
                    style={{ color: "var(--text-0)", fontFamily: "var(--font-display)" }}
                  >
                    {title}
                  </h4>
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--text-200)" }}>
                    {desc}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.section>

      <SectionDivider />

      {/* ══════════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 py-20 z-10">
        <div className="text-center mb-16">
          <p
            className="text-xs font-semibold tracking-wider uppercase mb-2"
            style={{ color: "var(--brand-400)", letterSpacing: "var(--tracking-wider)" }}
          >
            Social Proof
          </p>
          <h3
            className="section-header"
            style={{ fontFamily: "var(--font-display)" }}
          >
            What Our Clients Say
          </h3>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <TestimonialCard key={t.name} t={t} delay={i * 0.1} />
          ))}
        </div>
      </section>

      <SectionDivider />

      {/* ══════════════════════════════════════════════════════
          GLOBAL REACH
      ══════════════════════════════════════════════════════ */}
      <motion.section
        className="max-w-7xl mx-auto px-6 py-20 z-10 grid md:grid-cols-2 gap-16 items-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <div>
          <p
            className="text-xs font-semibold tracking-wider uppercase mb-2"
            style={{ color: "var(--brand-400)", letterSpacing: "var(--tracking-wider)" }}
          >
            Presence
          </p>
          <h4
            className="font-bold leading-tight mb-6"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 4vw, 2.8rem)",
              letterSpacing: "var(--tracking-tight)",
              color: "var(--text-0)",
            }}
          >
            A Truly Global Bank
          </h4>
          <p className="mb-6 leading-relaxed" style={{ color: "var(--text-200)" }}>
            Web3GlobalVault operates in over 40 countries, serving millions of customers with
            local expertise and global standards. No matter where you are, we're there.
          </p>
          <ul className="space-y-3">
            {[
              "Offices in North America, Europe, Africa & Asia",
              "24/7 multilingual support in 12 languages",
              "International compliance & regulatory standards",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 text-sm"
                style={{ color: "var(--text-100)" }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: "var(--brand-400)" }}
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-center">
          <GlobeVisual />
        </div>
      </motion.section>

      <SectionDivider />

      {/* ══════════════════════════════════════════════════════
          LOANS & OFFERS
      ══════════════════════════════════════════════════════ */}
      <motion.section
        className="max-w-7xl mx-auto px-6 py-20 z-10 grid md:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        {/* Loans */}
        <div
          className="card-brand p-8 rounded-2xl relative overflow-hidden group"
          style={{
            background:
              "linear-gradient(135deg, var(--glass-brand-md) 0%, var(--glass-brand-xs) 100%)",
            border: "1px solid var(--border-brand)",
          }}
        >
          {/* decorative blob */}
          <div
            className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, var(--brand-glow-sm), transparent)",
            }}
          />
          <h4
            className="text-2xl font-bold mb-3"
            style={{ fontFamily: "var(--font-display)", color: "var(--text-0)" }}
          >
            Need a Loan?
          </h4>
          <p className="text-sm mb-5 leading-relaxed" style={{ color: "var(--text-200)" }}>
            GlobalVault offers quick personal and business loans with flexible repayment options,
            low interest rates, and instant digital approval.
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-2 text-sm font-semibold transition-base"
            style={{ color: "var(--brand-400)" }}
          >
            Check your eligibility <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Offers */}
        <div
          className="card p-8 rounded-2xl relative overflow-hidden"
        >
          <div className="flex items-center gap-2 mb-5">
            <Star className="w-5 h-5 fill-current" style={{ color: "var(--brand-400)" }} />
            <h4
              className="text-2xl font-bold"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-0)" }}
            >
              Best Offers for You
            </h4>
          </div>
          <ul className="space-y-3">
            {[
              "4% cashback on all card purchases",
              "Free international transfer this month",
              "Refer & earn $250 instantly",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 text-sm"
                style={{ color: "var(--text-100)" }}
              >
                <span
                  className="status-dot"
                  style={{ background: "var(--success-400)", boxShadow: "0 0 6px var(--success-400)" }}
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </motion.section>

      <SectionDivider />

      {/* ══════════════════════════════════════════════════════
    CTA BANNER
══════════════════════════════════════════════════════ */}
      <motion.section
        className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-20"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto">
          <div
            className="
        relative overflow-hidden text-center
        rounded-2xl sm:rounded-3xl
        px-5 py-12
        sm:px-8 sm:py-16
        lg:px-16 lg:py-20
      "
            style={{
              background:
                "linear-gradient(135deg, var(--glass-brand-md) 0%, var(--glass-white-xs) 50%, var(--glass-brand-sm) 100%)",
              border: "1px solid var(--border-brand)",
            }}
          >
            {/* Glow Overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 0%, var(--brand-glow-sm) 0%, transparent 65%)",
              }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center">
              {/* Label */}
              <p
                className="
            text-[10px] sm:text-xs
            font-semibold uppercase
            tracking-[0.25em]
            mb-4
          "
                style={{ color: "var(--brand-400)" }}
              >
                Get Started Today
              </p>

              {/* Heading */}
              <h3
                className="
            font-bold leading-tight
            max-w-3xl mx-auto
            mb-5
            text-3xl
            sm:text-4xl
            md:text-5xl
          "
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--text-0)",
                }}
              >
                Ready to Take Control of Your Finances?
              </h3>

              {/* Description */}
              <p
                className="
            max-w-xl mx-auto
            text-sm sm:text-base md:text-lg
            leading-relaxed
            mb-8 sm:mb-10
            px-1
          "
                style={{ color: "var(--text-200)" }}
              >
                Join over 2 million customers who trust
                Web3GlobalVault for seamless, secure, and smart
                banking.
              </p>

              {/* CTA */}
              <div className="w-full sm:w-auto">
                <a
                  href="/signup"
                  className="
              btn-primary btn-lg
              inline-flex items-center justify-center gap-2
              w-full sm:w-auto
              min-h-[52px]
              px-6 sm:px-8
              text-sm sm:text-base
            "
                >
                  Open Your Free Account
                  <ArrowRight className="w-4 h-4 flex-shrink-0" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <SectionDivider />

      {/* ══════════════════════════════════════════════════════
          NEWS
      ══════════════════════════════════════════════════════ */}
      <div className="z-10">
        <NewsSection />
      </div>

      <SectionDivider />

      {/* ══════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════ */}
      <div className="z-10">
        <Footer />
      </div>
    </div>
  );
}
"use client";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Globe2,
  ShieldCheck,
  Users2,
  Building2,
  Star,
  TrendingUp,
  Award,
  Heart,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Footer from "@/components/footer/footer";
/* ─── Helpers ───────────────────────────────────────────────── */
const GoldLine = () => (
  <div className="flex justify-center my-16">
    <div
      className="h-px w-48"
      style={{
        background:
          "linear-gradient(90deg, transparent 0%, #C9A84C 30%, #F5D78E 50%, #C9A84C 70%, transparent 100%)",
      }}
    />
  </div>
);

const GoldDot = ({ className = "" }) => (
  <span
    className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${className}`}
    style={{ background: "#C9A84C" }}
  />
);

const Orbs = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
    {[
      { top: "10%", left: "5%", size: 400, delay: 0 },
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
          background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 8, delay: o.delay, repeat: Infinity, ease: "easeInOut" }}
      />
    ))}
  </div>
);

/* ─── Data ──────────────────────────────────────────────────── */
const milestones = [
  { year: "2010", title: "Founded in San Francisco", desc: "Web3GlobalVault was established with a vision to democratize access to financial services across Africa." },
  { year: "2013", title: "Expanded to 10 Countries", desc: "Rapid growth across West Africa and entry into key European markets." },
  { year: "2017", title: "Launched Digital Banking", desc: "Pioneered mobile-first banking with our award-winning app platform." },
  { year: "2020", title: "Reached 1 Million Customers", desc: "A milestone celebrating trust, reliability and innovation." },
  { year: "2023", title: "Global Presence: 40+ Countries", desc: "Serving 2M+ customers worldwide with local expertise and global standards." },
];

const values = [
  { icon: ShieldCheck, title: "Integrity", desc: "We operate with full transparency, holding ourselves to the highest ethical standards in every transaction." },
  { icon: Heart, title: "Customer First", desc: "Every decision we make is guided by the needs and wellbeing of the people we serve." },
  { icon: Zap, title: "Innovation", desc: "We invest heavily in technology to stay ahead and deliver future-ready financial solutions." },
  { icon: Globe2, title: "Inclusion", desc: "We believe great banking should be accessible to everyone, regardless of geography or background." },
];

const leadership = [
  { name: "Dr. Alex  Crawford", role: "Chief Executive Officer", avatar: "/asset/user1.jpg" },
  { name: "Rachel  Dawson", role: "Chief Financial Officer", avatar: "/asset/user2.jpg" },
  { name: "James Whitfield", role: "Chief Technology Officer", avatar: "/asset/user3.jpg" },
];

/* ─── Main ──────────────────────────────────────────────────── */
export default function AboutPage() {
  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{
        background: "linear-gradient(160deg, #0A0A0B 0%, #0D0E10 40%, #0A0C0F 100%)",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        color: "#E8E8E8",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@300;400&display=swap');
        html { scroll-behavior: smooth; }
        * { -webkit-font-smoothing: antialiased; }
        ::selection { background: rgba(201,168,76,0.25); }
      `}</style>

      <Orbs />

      {/* ── PAGE HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-[55vh] flex flex-col items-center justify-center text-center px-6 pt-32 pb-16 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 text-xs tracking-widest uppercase"
          style={{ border: "1px solid rgba(201,168,76,0.3)", background: "rgba(201,168,76,0.06)", color: "#C9A84C" }}
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: "#C9A84C" }} />
          Our Story
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold leading-none mb-6 max-w-4xl"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Built on{" "}
          <span style={{ background: "linear-gradient(135deg, #F5D78E 0%, #C9A84C 50%, #E8C668 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Trust
          </span>
          , Driven by{" "}
          <span style={{ background: "linear-gradient(135deg, #F5D78E 0%, #C9A84C 50%, #E8C668 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Purpose
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed"
        >
          For over 14 years, Web3GlobalVault has been redefining what it means to be a financial institution — combining global reach with deeply local understanding.
        </motion.p>
      </section>

      <GoldLine />

      {/* ── MISSION & VISION ──────────────────────────────────── */}
      <motion.section
        className="max-w-7xl mx-auto px-6 py-8 z-10 grid md:grid-cols-2 gap-8"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        {[
          {
            label: "Our Mission",
            title: "Empowering Financial Freedom",
            desc: "We exist to make world-class financial services accessible to every individual and business — breaking down barriers, removing complexity, and delivering real value at every step.",
            icon: Award,
          },
          {
            label: "Our Vision",
            title: "A Borderless Financial Future",
            desc: "We envision a world where geography, background, or status no longer limits one's access to capital, investment, and opportunity. Web3GlobalVaultis building that world.",
            icon: Globe2,
          },
        ].map(({ label, title, desc, icon: Icon }, i) => (
          <motion.div
            key={label}
            className="p-10 rounded-2xl relative overflow-hidden group"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
              border: "1px solid rgba(201,168,76,0.15)",
              backdropFilter: "blur(20px)",
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.15 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: "radial-gradient(circle at 50% 0%, rgba(201,168,76,0.07) 0%, transparent 60%)" }} />
            <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "#C9A84C" }}>{label}</p>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
              style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))", border: "1px solid rgba(201,168,76,0.3)" }}>
              <Icon className="w-5 h-5" style={{ color: "#C9A84C" }} />
            </div>
            <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif", color: "#F5D78E" }}>{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
          </motion.div>
        ))}
      </motion.section>

      <GoldLine />

      {/* ── STATS ─────────────────────────────────────────────── */}
      <motion.div
        className="relative z-10 max-w-5xl mx-auto w-full px-6"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <div
          className="rounded-2xl grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
            border: "1px solid rgba(201,168,76,0.12)",
            backdropFilter: "blur(20px)",
          }}
        >
          {[
            { value: "40+", label: "Countries" },
            { value: "2M+", label: "Customers" },
            { value: "14+", label: "Years" },
            { value: "$50B+", label: "Processed" },
          ].map((s) => (
            <div key={s.label} className="text-center px-8 py-6 border-l border-white/10 first:border-l-0">
              <p className="text-4xl font-bold mb-1"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", background: "linear-gradient(135deg, #F5D78E 0%, #C9A84C 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {s.value}
              </p>
              <p className="text-sm text-gray-400 tracking-widest uppercase">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <GoldLine />

      {/* ── VALUES ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-8 z-10">
        <div className="text-center mb-14">
          <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "#C9A84C" }}>What We Stand For</p>
          <h3 className="text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Our Core Values</h3>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {values.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              className="group p-7 rounded-2xl text-center relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
                border: "1px solid rgba(201,168,76,0.15)",
                backdropFilter: "blur(20px)",
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: "radial-gradient(circle at 50% 0%, rgba(201,168,76,0.08) 0%, transparent 60%)" }} />
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))", border: "1px solid rgba(201,168,76,0.3)" }}>
                <Icon className="w-5 h-5" style={{ color: "#C9A84C" }} />
              </div>
              <h4 className="text-lg font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif", color: "#F5D78E" }}>{title}</h4>
              <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <GoldLine />

      {/* ── TIMELINE ──────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-8 z-10">
        <div className="text-center mb-14">
          <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "#C9A84C" }}>Our Journey</p>
          <h3 className="text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Key Milestones</h3>
        </div>
        <div className="relative">
          {/* vertical line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px" style={{ background: "linear-gradient(to bottom, transparent, #C9A84C 20%, #C9A84C 80%, transparent)" }} />
          <div className="space-y-10">
            {milestones.map(({ year, title, desc }, i) => (
              <motion.div
                key={year}
                className={`relative flex items-start gap-8 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} flex-row`}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                {/* dot */}
                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full z-10"
                  style={{ background: "#C9A84C", boxShadow: "0 0 12px rgba(201,168,76,0.6)", top: "1.25rem" }} />
                <div className={`ml-14 md:ml-0 md:w-1/2 ${i % 2 === 0 ? "md:pr-16 md:text-right" : "md:pl-16"}`}>
                  <span className="text-xs tracking-widest uppercase font-semibold" style={{ color: "#C9A84C" }}>{year}</span>
                  <h4 className="text-xl font-bold mt-1 mb-2" style={{ fontFamily: "'Playfair Display', serif", color: "#F5D78E" }}>{title}</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                </div>
                <div className="hidden md:block md:w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <GoldLine />

      {/* ── LEADERSHIP ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-8 z-10">
        <div className="text-center mb-14">
          <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "#C9A84C" }}>The Team</p>
          <h3 className="text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Our Leadership</h3>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {leadership.map(({ name, role, avatar }, i) => (
            <motion.div
              key={name}
              className="group p-7 rounded-2xl text-center"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
                border: "1px solid rgba(201,168,76,0.15)",
                backdropFilter: "blur(20px)",
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="relative mx-auto mb-4 w-20 h-20">
                <Image src={avatar} alt={name} width={80} height={80}
                  className="rounded-full object-cover w-full h-full"
                  style={{ border: "2px solid rgba(201,168,76,0.4)" }} />
                <div className="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: "radial-gradient(circle, rgba(201,168,76,0.15), transparent)", filter: "blur(6px)" }} />
              </div>
              <h4 className="font-bold text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{name}</h4>
              <p className="text-xs text-gray-500">{role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <GoldLine />

      {/* ── CTA ───────────────────────────────────────────────── */}
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
            background: "linear-gradient(135deg, rgba(201,168,76,0.12) 0%, rgba(201,168,76,0.04) 50%, rgba(201,168,76,0.08) 100%)",
            border: "1px solid rgba(201,168,76,0.25)",
          }}
        >
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.12) 0%, transparent 60%)" }} />
          <p className="text-xs tracking-widest uppercase mb-4" style={{ color: "#C9A84C" }}>Join Us</p>
          <h3 className="text-4xl md:text-5xl font-bold mb-5 max-w-2xl mx-auto leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            Be Part of the Web3GlobalVaultStory
          </h3>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Millions of people trust us with their finances. Open your account today and experience the difference.
          </p>
          <a href="/signup"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-full text-sm font-bold transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            style={{ background: "linear-gradient(135deg, #C9A84C 0%, #F5D78E 50%, #C9A84C 100%)", color: "#0A0A0B", boxShadow: "0 8px 40px rgba(201,168,76,0.4)" }}>
            Open Your Free Account <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </motion.section>

      <GoldLine />
      <div className="z-10"><Footer /></div>
    </div>
  );
}
"use client";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Globe2,
  ShieldCheck,
  Award,
  Heart,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Footer from "@/components/footer/footer";
import Navbar from "@/components/navbar/navbar";

/* ─── Section Divider ───────────────────────────────────────── */
const SectionDivider = () => (
  <div className="max-w-7xl mx-auto px-6 my-16">
    <div
      style={{
        height: "1px",
        background:
          "linear-gradient(90deg, transparent 0%, var(--border-default) 20%, var(--border-brand) 50%, var(--border-default) 80%, transparent 100%)",
      }}
    />
  </div>
);

/* ─── Ambient Orbs ──────────────────────────────────────────── */
const Orbs = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
    {[
      { top: "10%", left: "5%", size: 480, delay: 0 },
      { top: "60%", left: "75%", size: 520, delay: 2.5 },
      { top: "38%", left: "40%", size: 320, delay: 5 },
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
              ? "rgba(34,211,238,0.06)"
              : "rgba(59,130,246,0.08)"
            } 0%, transparent 70%)`,
          filter: "blur(50px)",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 9 + i * 2, delay: o.delay, repeat: Infinity, ease: "easeInOut" }}
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
  { name: "Dr. Alex Crawford", role: "Chief Executive Officer", avatar: "/asset/user1.jpg" },
  { name: "Rachel Dawson", role: "Chief Financial Officer", avatar: "/asset/user2.jpg" },
  { name: "James Whitfield", role: "Chief Technology Officer", avatar: "/asset/user3.jpg" },
];

/* ─── Main ──────────────────────────────────────────────────── */
export default function AboutPage() {
  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{
        background: "var(--surface-0)",
        fontFamily: "var(--font-body)",
        color: "var(--text-0)",
      }}
    >
      <Navbar />
      <Orbs />

      {/* ══════════════════════════════════════════════════════
          PAGE HERO
      ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-[55vh] flex flex-col items-center justify-center text-center px-6 pt-32 pb-16 z-10">

        {/* eyebrow */}
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
          <span
            className="w-1.5 h-1.5 rounded-full status-dot status-dot-live"
          />
          Our Story
        </motion.div>

        {/* H1 */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-bold leading-none mb-6 max-w-4xl"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.8rem, 8vw, 5rem)",
            letterSpacing: "var(--tracking-tight)",
            color: "var(--text-0)",
          }}
        >
          Built on{" "}
          <span className="text-gradient">Trust</span>
          , Driven by{" "}
          <span className="text-gradient">Purpose</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg md:text-xl max-w-2xl leading-relaxed"
          style={{ color: "var(--text-200)" }}
        >
          For over 14 years, Web3GlobalVault has been redefining what it means to be a financial
          institution — combining global reach with deeply local understanding.
        </motion.p>
      </section>

      <SectionDivider />

      {/* ══════════════════════════════════════════════════════
          MISSION & VISION
      ══════════════════════════════════════════════════════ */}
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
            desc: "We envision a world where geography, background, or status no longer limits one's access to capital, investment, and opportunity. Web3GlobalVault is building that world.",
            icon: Globe2,
          },
        ].map(({ label, title, desc, icon: Icon }, i) => (
          <motion.div
            key={label}
            className="card group p-10 relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.15 }}
            viewport={{ once: true }}
          >
            {/* hover top-glow */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: "radial-gradient(circle at 50% 0%, var(--glass-brand-md) 0%, transparent 60%)" }}
            />

            <p
              className="text-xs font-semibold tracking-wider uppercase mb-3"
              style={{ color: "var(--brand-400)", letterSpacing: "var(--tracking-wider)" }}
            >
              {label}
            </p>

            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
              style={{ background: "var(--glass-brand-sm)", border: "1px solid var(--border-brand)" }}
            >
              <Icon className="w-5 h-5" style={{ color: "var(--brand-400)" }} />
            </div>

            <h3
              className="text-2xl font-bold mb-4"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-0)" }}
            >
              {title}
            </h3>

            <p style={{ color: "var(--text-200)", fontSize: "var(--text-sm)", lineHeight: "var(--leading-normal)" }}>
              {desc}
            </p>
          </motion.div>
        ))}
      </motion.section>

      <SectionDivider />

      {/* ══════════════════════════════════════════════════════
          STATS STRIP
      ══════════════════════════════════════════════════════ */}
      <motion.div
        className="relative z-10 max-w-5xl mx-auto w-full px-6"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <div
          className="card rounded-2xl grid grid-cols-2 md:grid-cols-4"
          style={{ borderRadius: "var(--radius-xl)" }}
        >
          {[
            { value: "40+", label: "Countries" },
            { value: "2M+", label: "Customers" },
            { value: "14+", label: "Years" },
            { value: "$50B+", label: "Processed" },
          ].map((s, i) => (
            <div
              key={s.label}
              className="text-center px-8 py-6"
              style={i !== 0 ? { borderLeft: "1px solid var(--border-subtle)" } : {}}
            >
              <p
                className="text-4xl font-bold mb-1 text-gradient"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {s.value}
              </p>
              <p
                className="text-xs uppercase"
                style={{ color: "var(--text-300)", letterSpacing: "var(--tracking-wider)" }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      <SectionDivider />

      {/* ══════════════════════════════════════════════════════
          VALUES
      ══════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 py-8 z-10">
        <div className="text-center mb-14">
          <p
            className="text-xs font-semibold tracking-wider uppercase mb-2"
            style={{ color: "var(--brand-400)", letterSpacing: "var(--tracking-wider)" }}
          >
            What We Stand For
          </p>
          <h3
            className="section-header"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Our Core Values
          </h3>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {values.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              className="card group p-7 text-center relative overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: "radial-gradient(circle at 50% 0%, var(--glass-brand-md) 0%, transparent 60%)" }}
              />

              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "var(--glass-brand-sm)", border: "1px solid var(--border-brand)" }}
              >
                <Icon className="w-5 h-5" style={{ color: "var(--brand-400)" }} />
              </div>

              <h4
                className="text-lg font-bold mb-2"
                style={{ fontFamily: "var(--font-display)", color: "var(--text-0)" }}
              >
                {title}
              </h4>

              <p style={{ color: "var(--text-200)", fontSize: "var(--text-xs)", lineHeight: "var(--leading-normal)" }}>
                {desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <SectionDivider />

      {/* ══════════════════════════════════════════════════════
          TIMELINE
      ══════════════════════════════════════════════════════ */}
      <section className="max-w-4xl mx-auto px-6 py-8 z-10">
        <div className="text-center mb-14">
          <p
            className="text-xs font-semibold tracking-wider uppercase mb-2"
            style={{ color: "var(--brand-400)", letterSpacing: "var(--tracking-wider)" }}
          >
            Our Journey
          </p>
          <h3
            className="section-header"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Key Milestones
          </h3>
        </div>

        <div className="relative">
          {/* vertical spine */}
          <div
            className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px"
            style={{
              background:
                "linear-gradient(to bottom, transparent, var(--brand-600) 15%, var(--brand-500) 50%, var(--brand-600) 85%, transparent)",
            }}
          />

          <div className="space-y-10">
            {milestones.map(({ year, title, desc }, i) => (
              <motion.div
                key={year}
                className={`relative flex items-start gap-8 flex-row ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                {/* spine dot */}
                <div
                  className="absolute left-6 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full z-10"
                  style={{
                    background: "var(--brand-400)",
                    boxShadow: "var(--shadow-glow-brand)",
                    top: "1.25rem",
                  }}
                />

                {/* content card */}
                <div
                  className={`ml-14 md:ml-0 md:w-1/2 ${i % 2 === 0 ? "md:pr-16 md:text-right" : "md:pl-16"
                    }`}
                >
                  <span
                    className="text-xs font-semibold tracking-wider uppercase"
                    style={{ color: "var(--brand-400)", letterSpacing: "var(--tracking-wider)" }}
                  >
                    {year}
                  </span>
                  <h4
                    className="text-xl font-bold mt-1 mb-2"
                    style={{ fontFamily: "var(--font-display)", color: "var(--text-0)" }}
                  >
                    {title}
                  </h4>
                  <p style={{ color: "var(--text-200)", fontSize: "var(--text-sm)", lineHeight: "var(--leading-normal)" }}>
                    {desc}
                  </p>
                </div>

                <div className="hidden md:block md:w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ══════════════════════════════════════════════════════
          LEADERSHIP
      ══════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 py-8 z-10">
        <div className="text-center mb-14">
          <p
            className="text-xs font-semibold tracking-wider uppercase mb-2"
            style={{ color: "var(--brand-400)", letterSpacing: "var(--tracking-wider)" }}
          >
            The Team
          </p>
          <h3
            className="section-header"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Our Leadership
          </h3>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {leadership.map(({ name, role, avatar }, i) => (
            <motion.div
              key={name}
              className="card group p-7 text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="relative mx-auto mb-4 w-20 h-20">
                <Image
                  src={avatar}
                  alt={name}
                  width={80}
                  height={80}
                  className="rounded-full object-cover w-full h-full"
                  style={{ border: "2px solid var(--border-brand)" }}
                />
                {/* hover glow ring */}
                <div
                  className="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: "radial-gradient(circle, var(--brand-glow-sm), transparent)",
                    filter: "blur(6px)",
                  }}
                />
              </div>

              <h4
                className="font-bold mb-1"
                style={{ fontFamily: "var(--font-display)", color: "var(--text-0)" }}
              >
                {name}
              </h4>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--text-300)" }}>
                {role}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <SectionDivider />

      {/* ══════════════════════════════════════════════════════
    CTA BANNER
══════════════════════════════════════════════════════ */}
      <motion.section
        className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16"
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
            {/* Top Glow */}
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
                Join Us
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
                Be Part of the Web3GlobalVault Story
              </h3>

              {/* Description */}
              <p
                className="
            max-w-2xl mx-auto
            text-sm sm:text-base md:text-lg
            leading-relaxed
            mb-8 sm:mb-10
            px-1
          "
                style={{ color: "var(--text-200)" }}
              >
                Millions of people trust us with their finances.
                Open your account today and experience the
                difference.
              </p>

              {/* CTA Button */}
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

      <div className="z-10">
        <Footer />
      </div>
    </div>
  );
}
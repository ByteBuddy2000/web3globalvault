"use client";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Send,
  BarChart,
  Zap,
  CreditCard,
  Globe2,
  RefreshCw,
  PiggyBank,
  Smartphone,
  Users2,
  Building2,
} from "lucide-react";
import Footer from "@/components/footer/footer";

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
          top: o.top, left: o.left, width: o.size, height: o.size,
          background: `radial-gradient(circle, ${i === 1 ? "rgba(34,211,238,0.06)" : "rgba(59,130,246,0.08)"
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
const mainServices = [
  {
    icon: CreditCard,
    tag: "Banking",
    title: "Digital Current & Savings Accounts",
    desc: "Open a fully digital account in minutes. Enjoy zero maintenance fees, competitive interest rates on savings, instant notifications, and full control from your mobile app.",
    features: ["Zero monthly fees", "Up to 6.5% annual interest", "Instant mobile access", "Federal Reserve insured deposits"],
    delay: 0,
  },
  {
    icon: Globe2,
    tag: "Transfers",
    title: "International Money Transfers",
    desc: "Send money to 40+ countries at near-interbank exchange rates. Funds arrive in minutes — not days — with complete transparency on fees before you send.",
    features: ["Transfers to 40+ countries", "Live exchange rates", "Funds in minutes", "No hidden charges"],
    delay: 0.1,
  },
  {
    icon: BarChart,
    tag: "Investments",
    title: "Smart Investment Portfolio",
    desc: "From equities and ETFs to fixed income and crypto, build a diversified portfolio with ML-driven insights and real-time performance tracking.",
    features: ["Stocks, ETFs & Bonds", "Crypto integration", "AI-powered risk analysis", "Live dashboard"],
    delay: 0.2,
  },
  {
    icon: PiggyBank,
    tag: "Loans",
    title: "Personal & Business Loans",
    desc: "Access fast, flexible financing with instant digital approval. Competitive rates, transparent repayment schedules, and no unnecessary paperwork.",
    features: ["Instant digital approval", "Flexible repayment terms", "Business & personal options", "Low interest rates"],
    delay: 0.3,
  },
  {
    icon: ShieldCheck,
    tag: "Security",
    title: "Advanced Account Protection",
    desc: "Your funds are guarded by military-grade encryption, biometric authentication, real-time fraud detection, and 24/7 AI-powered monitoring.",
    features: ["Biometric 2FA", "AI fraud detection", "End-to-end encryption", "Instant card freeze"],
    delay: 0.4,
  },
  {
    icon: Smartphone,
    tag: "Mobile",
    title: "Mobile Banking App",
    desc: "Everything you need in one beautifully designed app. Pay bills, track spending, invest, transfer, and manage your finances on the go.",
    features: ["iOS & Android", "Budgeting tools", "Bill payments", "Spending insights"],
    delay: 0.5,
  },
];

const businessServices = [
  { icon: Building2, title: "Business Accounts", desc: "Multi-currency business accounts with team access controls and real-time analytics." },
  { icon: Send, title: "Bulk Payments", desc: "Process payroll, vendor payments, and mass disbursements in a single click." },
  { icon: RefreshCw, title: "Payment APIs", desc: "Integrate Web3GlobalVault payment rails directly into your app or e-commerce platform." },
  { icon: Users2, title: "Corporate Cards", desc: "Issue virtual and physical cards for your team with custom spending limits." },
];

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    features: ["Digital account", "Local transfers", "Mobile app access", "Basic support"],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Plus",
    price: "$9",
    period: "per month",
    features: ["Everything in Starter", "International transfers", "Investment tools", "Priority support", "2% cashback"],
    cta: "Upgrade Now",
    highlight: true,
  },
  {
    name: "Elite",
    price: "$29",
    period: "per month",
    features: ["Everything in Plus", "Dedicated advisor", "Crypto trading", "Business tools", "5% cashback", "Concierge support"],
    cta: "Go Elite",
    highlight: false,
  },
];

/* ─── Service Card ──────────────────────────────────────────── */
type ServiceCardProps = {
  icon: React.ElementType;
  tag: string;
  title: string;
  desc: string;
  features: string[];
  delay: number;
};

function ServiceCard({ icon: Icon, tag, title, desc, features, delay }: ServiceCardProps) {
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
        style={{ background: "radial-gradient(circle at 50% 0%, var(--glass-brand-md) 0%, transparent 60%)" }}
      />

      {/* header row */}
      <div className="flex items-start justify-between mb-5">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center"
          style={{ background: "var(--glass-brand-sm)", border: "1px solid var(--border-brand)" }}
        >
          <Icon className="w-6 h-6" style={{ color: "var(--brand-400)" }} />
        </div>
        <span className="badge badge-brand">{tag}</span>
      </div>

      <h4
        className="text-xl font-bold mb-3"
        style={{ fontFamily: "var(--font-display)", color: "var(--text-0)" }}
      >
        {title}
      </h4>

      <p
        className="mb-5"
        style={{ color: "var(--text-200)", fontSize: "var(--text-sm)", lineHeight: "var(--leading-normal)" }}
      >
        {desc}
      </p>

      <ul className="space-y-2 mb-6">
        {features.map((f) => (
          <li
            key={f}
            className="flex items-center gap-2.5"
            style={{ fontSize: "var(--text-xs)", color: "var(--text-100)" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: "var(--brand-400)" }}
            />
            {f}
          </li>
        ))}
      </ul>

      <div
        className="inline-flex items-center gap-2 font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
        style={{
          fontSize: "var(--text-xs)",
          letterSpacing: "var(--tracking-wider)",
          textTransform: "uppercase",
          color: "var(--brand-400)",
        }}
      >
        Learn more <ArrowRight className="w-3 h-3" />
      </div>
    </motion.div>
  );
}

/* ─── Main ──────────────────────────────────────────────────── */
export default function ServicesPage() {
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
          <span className="status-dot status-dot-live" />
          What We Offer
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
          Financial Services{" "}
          <span className="text-gradient">Built for You</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg md:text-xl max-w-2xl leading-relaxed"
          style={{ color: "var(--text-200)" }}
        >
          From everyday banking to global investing, Web3GlobalVault provides a complete
          financial ecosystem designed for modern life.
        </motion.p>
      </section>

      <SectionDivider />

      {/* ══════════════════════════════════════════════════════
          CORE SERVICES GRID
      ══════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 py-8 z-10">
        <div className="text-center mb-14">
          <p
            className="text-xs font-semibold tracking-wider uppercase mb-2"
            style={{ color: "var(--brand-400)", letterSpacing: "var(--tracking-wider)" }}
          >
            Personal Banking
          </p>
          <h3
            className="section-header"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Core Services
          </h3>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mainServices.map((s) => <ServiceCard key={s.title} {...s} />)}
        </div>
      </section>

      <SectionDivider />

      {/* ══════════════════════════════════════════════════════
          BUSINESS SERVICES
      ══════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 py-8 z-10">
        <div className="text-center mb-14">
          <p
            className="text-xs font-semibold tracking-wider uppercase mb-2"
            style={{ color: "var(--brand-400)", letterSpacing: "var(--tracking-wider)" }}
          >
            Enterprise
          </p>
          <h3
            className="section-header"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Business Solutions
          </h3>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {businessServices.map(({ icon: Icon, title, desc }, i) => (
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
          PRICING PLANS
      ══════════════════════════════════════════════════════ */}
      <motion.section
        className="max-w-5xl mx-auto px-6 py-8 z-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <div className="text-center mb-14">
          <p
            className="text-xs font-semibold tracking-wider uppercase mb-2"
            style={{ color: "var(--brand-400)", letterSpacing: "var(--tracking-wider)" }}
          >
            Plans
          </p>
          <h3
            className="section-header"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Choose Your Plan
          </h3>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map(({ name, price, period, features, cta, highlight }, i) => (
            <motion.div
              key={name}
              className="relative overflow-hidden rounded-2xl p-8"
              style={{
                background: highlight
                  ? "linear-gradient(135deg, var(--glass-brand-md) 0%, var(--glass-brand-xs) 100%)"
                  : "var(--glass-white-xs)",
                border: highlight
                  ? "1px solid var(--border-brand-strong)"
                  : "1px solid var(--border-default)",
                backdropFilter: "blur(20px)",
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              viewport={{ once: true }}
            >
              {/* "Most Popular" badge */}
              {highlight && (
                <>
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 badge font-semibold"
                    style={{
                      background: "linear-gradient(135deg, var(--brand-500), var(--brand-400))",
                      color: "#fff",
                      border: "none",
                      boxShadow: "var(--shadow-brand-sm)",
                    }}
                  >
                    Most Popular
                  </div>
                  {/* inner glow */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse at 50% 0%, var(--brand-glow-sm) 0%, transparent 65%)" }}
                  />
                </>
              )}

              {/* plan name */}
              <p
                className="text-xs font-semibold tracking-wider uppercase mb-2"
                style={{ color: "var(--brand-400)", letterSpacing: "var(--tracking-wider)" }}
              >
                {name}
              </p>

              {/* price */}
              <div className="flex items-end gap-1 mb-1">
                <span
                  className="text-4xl font-bold text-gradient"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {price}
                </span>
              </div>
              <p
                className="mb-6"
                style={{ fontSize: "var(--text-xs)", color: "var(--text-400)" }}
              >
                {period}
              </p>

              {/* features */}
              <ul className="space-y-3 mb-8">
                {features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2.5"
                    style={{ fontSize: "var(--text-sm)", color: "var(--text-100)" }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: "var(--brand-400)" }}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href="/signin"
                className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold transition-base ${highlight ? "btn-primary" : "btn-secondary"
                  }`}
                style={{ borderRadius: "var(--radius-full)" }}
              >
                {cta} <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </motion.div>
          ))}
        </div>
      </motion.section>

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
                Get Started
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
                Ready to Explore Our Services?
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
                Open a free account in minutes and access the
                full suite of Web3GlobalVault financial tools.
              </p>

              {/* CTA Button */}
              <div className="w-full sm:w-auto">
                <a
                  href="/register"
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

      <div className="z-10"><Footer /></div>
    </div>
  );
}
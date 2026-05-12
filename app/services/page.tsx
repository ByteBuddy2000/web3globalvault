"use client";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Send,
  BarChart,
  Zap,
  Lock,
  TrendingUp,
  CreditCard,
  Globe2,
  RefreshCw,
  PiggyBank,
  Smartphone,
  Users2,
  Building2,
} from "lucide-react";
import Footer from "@/components/footer/footer";

/* ─── Helpers ───────────────────────────────────────────────── */
const GoldLine = () => (
  <div className="flex justify-center my-16">
    <div className="h-px w-48"
      style={{ background: "linear-gradient(90deg, transparent 0%, #C9A84C 30%, #F5D78E 50%, #C9A84C 70%, transparent 100%)" }} />
  </div>
);

const GoldDot = ({ className = "" }) => (
  <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${className}`}
    style={{ background: "#C9A84C" }} />
);

const Orbs = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
    {[
      { top: "10%", left: "5%", size: 400, delay: 0 },
      { top: "60%", left: "75%", size: 500, delay: 2 },
      { top: "40%", left: "40%", size: 300, delay: 4 },
    ].map((o, i) => (
      <motion.div key={i} className="absolute rounded-full"
        style={{ top: o.top, left: o.left, width: o.size, height: o.size, background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)", filter: "blur(40px)" }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 8, delay: o.delay, repeat: Infinity, ease: "easeInOut" }} />
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
    desc: "From equities and Cryptos to fixed income and crypto, build a diversified portfolio with ML-driven insights and real-time performance tracking.",
    features: ["Stocks, Cryptos & Bonds", "Crypto integration", "AI-powered risk analysis", "Live dashboard"],
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
  { icon: RefreshCw, title: "Payment APIs", desc: "Integrate Web3GlobalVaultpayment rails directly into your app or e-commerce platform." },
  { icon: Users2, title: "Corporate Cards", desc: "Issue virtual and physical cards for your team with custom spending limits." },
];

type ServiceCardProps = {
  icon: typeof CreditCard;
  tag: string;
  title: string;
  desc: string;
  features: string[];
  delay: number;
};

/* ─── Service Card ──────────────────────────────────────────── */
function ServiceCard({ icon: Icon, tag, title, desc, features, delay }: ServiceCardProps) {
  return (
    <motion.div
      className="group relative p-8 rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
        border: "1px solid rgba(201,168,76,0.15)",
        backdropFilter: "blur(20px)",
      }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      whileHover={{ y: -6 }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: "radial-gradient(circle at 50% 0%, rgba(201,168,76,0.08) 0%, transparent 60%)" }} />

      <div className="flex items-start justify-between mb-5">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))", border: "1px solid rgba(201,168,76,0.3)" }}>
          <Icon className="w-6 h-6" style={{ color: "#C9A84C" }} />
        </div>
        <span className="text-xs tracking-widest uppercase px-3 py-1 rounded-full"
          style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)", color: "#C9A84C" }}>
          {tag}
        </span>
      </div>

      <h4 className="text-xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#F5D78E" }}>{title}</h4>
      <p className="text-gray-400 text-sm leading-relaxed mb-5">{desc}</p>

      <ul className="space-y-2 mb-6">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2.5 text-xs text-gray-300">
            <GoldDot /> {f}
          </li>
        ))}
      </ul>

      <div className="inline-flex items-center gap-2 text-xs tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
        style={{ color: "#C9A84C" }}>
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
          What We Offer
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold leading-none mb-6 max-w-4xl"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Financial Services{" "}
          <span style={{ background: "linear-gradient(135deg, #F5D78E 0%, #C9A84C 50%, #E8C668 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Built for You
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed"
        >
          From everyday banking to global investing, Web3GlobalVaultprovides a complete financial ecosystem designed for modern life.
        </motion.p>
      </section>

      <GoldLine />

      {/* ── MAIN SERVICES GRID ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-8 z-10">
        <div className="text-center mb-14">
          <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "#C9A84C" }}>Personal Banking</p>
          <h3 className="text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Core Services</h3>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mainServices.map((s) => <ServiceCard key={s.title} {...s} />)}
        </div>
      </section>

      <GoldLine />

      {/* ── BUSINESS SERVICES ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-8 z-10">
        <div className="text-center mb-14">
          <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "#C9A84C" }}>Enterprise</p>
          <h3 className="text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Business Solutions</h3>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {businessServices.map(({ icon: Icon, title, desc }, i) => (
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

      {/* ── COMPARISON TABLE ──────────────────────────────────── */}
      <motion.section
        className="max-w-5xl mx-auto px-6 py-8 z-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <div className="text-center mb-14">
          <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "#C9A84C" }}>Plans</p>
          <h3 className="text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Choose Your Plan</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
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
          ].map(({ name, price, period, features, cta, highlight }, i) => (
            <motion.div
              key={name}
              className="p-8 rounded-2xl relative overflow-hidden"
              style={{
                background: highlight
                  ? "linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.04))"
                  : "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
                border: highlight ? "1px solid rgba(201,168,76,0.4)" : "1px solid rgba(201,168,76,0.15)",
                backdropFilter: "blur(20px)",
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              viewport={{ once: true }}
            >
              {highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs tracking-widest uppercase px-3 py-1 rounded-full font-semibold"
                  style={{ background: "linear-gradient(135deg, #C9A84C, #F5D78E)", color: "#0A0A0B" }}>
                  Most Popular
                </div>
              )}
              {highlight && <div className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.1) 0%, transparent 60%)" }} />}
              <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "#C9A84C" }}>{name}</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif", background: "linear-gradient(135deg, #F5D78E, #C9A84C)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{price}</span>
              </div>
              <p className="text-xs text-gray-500 mb-6">{period}</p>
              <ul className="space-y-3 mb-8">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                    <GoldDot /> {f}
                  </li>
                ))}
              </ul>
              <a href="/signin"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5"
                style={highlight
                  ? { background: "linear-gradient(135deg, #C9A84C, #F5D78E)", color: "#0A0A0B", boxShadow: "0 4px 20px rgba(201,168,76,0.3)" }
                  : { border: "1px solid rgba(201,168,76,0.3)", color: "#C9A84C" }}>
                {cta} <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </motion.div>
          ))}
        </div>
      </motion.section>

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
          <p className="text-xs tracking-widest uppercase mb-4" style={{ color: "#C9A84C" }}>Get Started</p>
          <h3 className="text-4xl md:text-5xl font-bold mb-5 max-w-2xl mx-auto leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            Ready to Explore Our Services?
          </h3>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Open a free account in minutes and access the full suite of Web3GlobalVaultfinancial tools.
          </p>
          <a href="/register"
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
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronDown, Search, MessageSquare } from "lucide-react";
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
      { top: "10%", left: "5%",  size: 480, delay: 0 },
      { top: "60%", left: "75%", size: 520, delay: 2.5 },
      { top: "38%", left: "40%", size: 320, delay: 5 },
    ].map((o, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          top: o.top, left: o.left, width: o.size, height: o.size,
          background: `radial-gradient(circle, ${
            i === 1 ? "rgba(34,211,238,0.06)" : "rgba(59,130,246,0.08)"
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
const categories = ["All", "Accounts", "Transfers", "Investments", "Security", "Loans"];

const faqs = [
  {
    category: "Accounts",
    q: "How do I open a Web3GlobalVault account?",
    a: "Opening an account takes less than 5 minutes. Visit our website or download the GlobalVault app, click 'Open Account', provide your basic details, verify your identity with a government-issued ID, and you're set. No branch visits required.",
  },
  {
    category: "Accounts",
    q: "What documents do I need to sign up?",
    a: "For personal accounts, you'll need a valid government-issued photo ID (passport, national ID, or driver's licence) and proof of address (utility bill or bank statement dated within the last 3 months). Business accounts require additional documentation.",
  },
  {
    category: "Accounts",
    q: "Are there any account maintenance fees?",
    a: "Our Starter account is completely free — no monthly maintenance fees. Our Plus and Elite plans have monthly fees of $9 and $29 respectively, which unlock premium features like international transfers, higher cashback, and dedicated advisor access.",
  },
  {
    category: "Accounts",
    q: "Can I have multiple accounts?",
    a: "Yes. You can hold a personal current account, a savings account, and a business account simultaneously under a single GlobalVault profile, all managed from one dashboard.",
  },
  {
    category: "Transfers",
    q: "How long do international transfers take?",
    a: "Most international transfers arrive within minutes to a few hours depending on the destination country and receiving bank. In rare cases, transfers can take up to 1 business day. You can track your transfer in real-time from the app.",
  },
  {
    category: "Transfers",
    q: "What are the fees for sending money abroad?",
    a: "We charge a flat fee starting from $1 per international transfer on Plus and Elite plans. Starter plan users pay a small percentage-based fee. All fees are shown transparently before you confirm any transaction — no surprises.",
  },
  {
    category: "Transfers",
    q: "Which countries can I send money to?",
    a: "GlobalVault supports transfers to 40+ countries across Africa, Europe, North America, Asia, and the Middle East. The full list is available in the app under 'Send Money → International'.",
  },
  {
    category: "Investments",
    q: "What types of investments does GlobalVault offer?",
    a: "We offer a diversified range including equities (stocks), ETFs, fixed income (bonds), money market funds, and cryptocurrency. All investment products are accessible directly from the GlobalVault app with real-time pricing and portfolio analytics.",
  },
  {
    category: "Investments",
    q: "Is my investment capital guaranteed?",
    a: "All investments carry risk and capital is not guaranteed. However, we provide detailed risk profiling tools to match products to your financial goals. Our licensed advisors are available to guide your investment decisions.",
  },
  {
    category: "Investments",
    q: "Can I withdraw my investments at any time?",
    a: "Most investment products allow withdrawals at any time during market hours. Some fixed-term products may have a notice period or early withdrawal fee, which is clearly stated at the time of investment.",
  },
  {
    category: "Security",
    q: "How does GlobalVault protect my account?",
    a: "We use multiple layers of security including 256-bit AES encryption, biometric and two-factor authentication, real-time AI-powered fraud monitoring, device fingerprinting, and instant transaction alerts. Your data is never sold to third parties.",
  },
  {
    category: "Security",
    q: "What should I do if I suspect fraudulent activity?",
    a: "Immediately freeze your card via the app (Settings → Card → Freeze), then contact our 24/7 fraud response team at fraud@GlobalVaultbank.com or via the in-app chat. We'll investigate and resolve the issue promptly.",
  },
  {
    category: "Security",
    q: "Are my deposits insured?",
    a: "Yes. Web3GlobalVault deposits are insured up to the applicable regulatory limits in each jurisdiction. Details vary by country — check the app for your local coverage.",
  },
  {
    category: "Loans",
    q: "How quickly can I get a personal loan approved?",
    a: "Our fully digital loan process typically provides instant pre-approval within minutes. Final approval and disbursement to your GlobalVault account can happen in as little as 24 hours, depending on verification requirements.",
  },
  {
    category: "Loans",
    q: "What are the interest rates on GlobalVault loans?",
    a: "Interest rates depend on your credit profile, loan amount, and repayment term. Rates start from as low as 8% per annum. You can check your personalised rate offer before committing — no impact on your credit score.",
  },
  {
    category: "Loans",
    q: "Can I repay my loan early?",
    a: "Yes, you can make partial or full early repayments at any time without penalty. Early repayment reduces your outstanding balance and total interest owed.",
  },
];

/* ─── Accordion Item ────────────────────────────────────────── */
type AccordionItemProps = {
  q: string;
  a: string;
  isOpen: boolean;
  onToggle: () => void;
  delay: number;
};

function AccordionItem({ q, a, isOpen, onToggle, delay }: AccordionItemProps) {
  return (
    <motion.div
      className="overflow-hidden"
      style={{
        background: isOpen ? "var(--glass-brand-sm)" : "var(--glass-white-xs)",
        border: isOpen
          ? "1px solid var(--border-brand)"
          : "1px solid var(--border-default)",
        borderRadius: "var(--radius-xl)",
        backdropFilter: "blur(20px)",
        transition: "background var(--duration-base) var(--ease-out), border-color var(--duration-base) var(--ease-out)",
      }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
    >
      {/* trigger */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-7 py-5 text-left"
      >
        <span
          className="font-semibold leading-snug"
          style={{
            fontSize: "var(--text-sm)",
            color: isOpen ? "var(--text-0)" : "var(--text-100)",
          }}
        >
          {q}
        </span>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: isOpen ? "var(--glass-brand-md)" : "var(--glass-white-sm)",
            border: isOpen ? "1px solid var(--border-brand)" : "1px solid var(--border-default)",
          }}
        >
          <ChevronDown
            className="w-4 h-4"
            style={{ color: isOpen ? "var(--brand-400)" : "var(--text-300)" }}
          />
        </motion.div>
      </button>

      {/* body */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <div className="px-7 pb-6">
              <div
                className="mb-4"
                style={{ height: "1px", background: "var(--border-brand)" }}
              />
              <p
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--text-200)",
                  lineHeight: "var(--leading-normal)",
                }}
              >
                {a}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Main ──────────────────────────────────────────────────── */
export default function FAQPage() {
  const [openIndex,       setOpenIndex]       = useState<number | null>(null);
  const [activeCategory,  setActiveCategory]  = useState("All");
  const [searchQuery,     setSearchQuery]     = useState("");

  const filtered = faqs.filter((f) => {
    const matchCat    = activeCategory === "All" || f.category === activeCategory;
    const matchSearch =
      searchQuery.trim() === "" ||
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

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
      <section className="relative min-h-[52vh] flex flex-col items-center justify-center text-center px-6 pt-32 pb-16 z-10">

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
          Help Center
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
          Frequently Asked{" "}
          <span className="text-gradient">Questions</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg max-w-xl leading-relaxed mb-10"
          style={{ color: "var(--text-200)" }}
        >
          Everything you need to know about Web3GlobalVault. Can't find an answer?
          Our team is happy to help.
        </motion.p>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative w-full max-w-lg"
        >
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: "var(--text-400)" }}
          />
          <input
            type="text"
            placeholder="Search questions…"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setOpenIndex(null); }}
            className="input"
            style={{
              paddingLeft: "2.75rem",
              borderRadius: "var(--radius-full)",
            }}
          />
        </motion.div>
      </section>

      <SectionDivider />

      {/* ══════════════════════════════════════════════════════
          FAQ CONTENT
      ══════════════════════════════════════════════════════ */}
      <section className="max-w-3xl mx-auto px-6 py-8 z-10 w-full">

        {/* Category pills */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {categories.map((cat) => {
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setOpenIndex(null); }}
                className="transition-base"
                style={{
                  padding: "0.5rem 1.25rem",
                  borderRadius: "var(--radius-full)",
                  fontSize: "var(--text-xs)",
                  letterSpacing: "var(--tracking-wider)",
                  textTransform: "uppercase",
                  fontWeight: active ? 600 : 500,
                  background: active
                    ? "linear-gradient(135deg, var(--brand-500), var(--brand-400))"
                    : "var(--glass-white-xs)",
                  border: active ? "none" : "1px solid var(--border-default)",
                  color: active ? "#fff" : "var(--text-300)",
                  boxShadow: active ? "var(--shadow-brand-sm)" : "none",
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Accordion */}
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((faq, i) => (
              <AccordionItem
                key={`${faq.category}-${i}`}
                q={faq.q}
                a={faq.a}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                delay={i * 0.04}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{
                background: "var(--glass-brand-xs)",
                border: "1px solid var(--border-brand)",
              }}
            >
              <Search className="w-6 h-6" style={{ color: "var(--brand-500)", opacity: 0.5 }} />
            </div>
            <p style={{ color: "var(--text-300)", fontSize: "var(--text-sm)" }}>
              No questions match your search. Try different keywords.
            </p>
          </motion.div>
        )}
      </section>

      <SectionDivider />

      {/* ══════════════════════════════════════════════════════
          STILL HAVE QUESTIONS CTA
      ══════════════════════════════════════════════════════ */}
      <motion.section
        className="max-w-7xl mx-auto px-6 py-8 z-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <div
          className="relative rounded-3xl p-12 md:p-20 text-center overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, var(--glass-brand-md) 0%, var(--glass-white-xs) 50%, var(--glass-brand-sm) 100%)",
            border: "1px solid var(--border-brand)",
          }}
        >
          {/* top glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 0%, var(--brand-glow-sm) 0%, transparent 65%)",
            }}
          />

          <p
            className="text-xs font-semibold tracking-wider uppercase mb-4"
            style={{ color: "var(--brand-400)", letterSpacing: "var(--tracking-wider)" }}
          >
            Still Need Help?
          </p>

          <h3
            className="font-bold mb-5 max-w-xl mx-auto leading-tight"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 5vw, 3.2rem)",
              letterSpacing: "var(--tracking-tight)",
              color: "var(--text-0)",
            }}
          >
            We're Here to Answer Everything
          </h3>

          <p className="mb-10 max-w-md mx-auto" style={{ color: "var(--text-200)" }}>
            Our support team is available 24/7 via live chat, email, or phone.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <a href="/contact" className="btn-primary btn-lg">
              Contact Support <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#" className="btn-secondary btn-lg">
              <MessageSquare className="w-4 h-4" /> Live Chat
            </a>
          </div>
        </div>
      </motion.section>

      <SectionDivider />

      <div className="z-10"><Footer /></div>
    </div>
  );
}
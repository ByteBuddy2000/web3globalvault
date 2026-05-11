"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronDown, Search } from "lucide-react";
import Footer from "@/components/footer/footer";

/* ─── Helpers ───────────────────────────────────────────────── */
const GoldLine = () => (
  <div className="flex justify-center my-16">
    <div className="h-px w-48"
      style={{ background: "linear-gradient(90deg, transparent 0%, #C9A84C 30%, #F5D78E 50%, #C9A84C 70%, transparent 100%)" }} />
  </div>
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
const categories = ["All", "Accounts", "Transfers", "Investments", "Security"];

const faqs = [
  {
    category: "Accounts",
    q: "How do I open a Web3GlobalVault account?",
    a: "Opening an account takes less than 5 minutes. Visit our website or download the Web3GlobalVaultapp, click 'Open Account', provide your basic details, verify your identity with a government-issued ID, and you're set. No branch visits required.",
  },
  {
    category: "Accounts",
    q: "What documents do I need to signup?",
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
    a: "Yes. You can hold a personal current account, a savings account, and a business account simultaneously under a single Web3GlobalVaultprofile, all managed from one dashboard.",
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
    a: "Web3GlobalVaultsupports transfers to 40+ countries across Africa, Europe, North America, Asia, and the Middle East. The full list is available in the app under 'Send Money → International'.",
  },
  {
    category: "Investments",
    q: "What types of investments does Web3GlobalVaultoffer?",
    a: "We offer a diversified range including equities (stocks), Cryptos, fixed income (bonds), money market funds, and cryptocurrency. All investment products are accessible directly from the Web3GlobalVaultapp with real-time pricing and portfolio analytics.",
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
    q: "How does Web3GlobalVaultprotect my account?",
    a: "We use multiple layers of security including 256-bit AES encryption, biometric and two-factor authentication, real-time AI-powered fraud monitoring, device fingerprinting, and instant transaction alerts. Your data is never sold to third parties.",
  },
  {
    category: "Security",
    q: "What should I do if I suspect fraudulent activity?",
    a: "Immediately freeze your card via the app (Settings → Card → Freeze), then contact our 24/7 fraud response team at fraud@genesisbank.com or via the in-app chat. We'll investigate and resolve the issue promptly.",
  },
  {
    category: "Security",
    q: "Are my deposits insured?",
    a: "Yes. Web3GlobalVault deposits are insured up to the applicable regulatory limits in each jurisdiction. In Nigeria, this is up to$500,000 per depositor through the Federal Reserve. Details vary by country — check the app for your local coverage.",
  },
  {
    category: "Loans",
    q: "How quickly can I get a personal loan approved?",
    a: "Our fully digital loan process typically provides instant pre-approval within minutes. Final approval and disbursement to your Web3GlobalVaultaccount can happen in as little as 24 hours, depending on verification requirements.",
  },
  {
    category: "Loans",
    q: "What are the interest rates on Web3GlobalVaultloans?",
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
      className="rounded-2xl overflow-hidden"
      style={{
        background: isOpen
          ? "linear-gradient(135deg, rgba(201,168,76,0.07), rgba(201,168,76,0.02))"
          : "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
        border: isOpen ? "1px solid rgba(201,168,76,0.3)" : "1px solid rgba(201,168,76,0.12)",
        backdropFilter: "blur(20px)",
        transition: "all 0.3s ease",
      }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-7 py-5 text-left"
      >
        <span className="text-sm font-semibold text-white leading-snug">{q}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: isOpen ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.05)",
            border: isOpen ? "1px solid rgba(201,168,76,0.35)" : "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <ChevronDown className="w-4 h-4" style={{ color: isOpen ? "#C9A84C" : "#6B7280" }} />
        </motion.div>
      </button>

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
              <div className="h-px mb-4" style={{ background: "rgba(201,168,76,0.15)" }} />
              <p className="text-sm text-gray-400 leading-relaxed">{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Main ──────────────────────────────────────────────────── */
export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = faqs.filter((f) => {
    const matchCat = activeCategory === "All" || f.category === activeCategory;
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
      <section className="relative min-h-[52vh] flex flex-col items-center justify-center text-center px-6 pt-32 pb-16 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 text-xs tracking-widest uppercase"
          style={{ border: "1px solid rgba(201,168,76,0.3)", background: "rgba(201,168,76,0.06)", color: "#C9A84C" }}
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: "#C9A84C" }} />
          Help Center
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold leading-none mb-6 max-w-4xl"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Frequently Asked{" "}
          <span style={{ background: "linear-gradient(135deg, #F5D78E 0%, #C9A84C 50%, #E8C668 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Questions
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg text-gray-400 max-w-xl leading-relaxed mb-10"
        >
          Everything you need to know about Web3GlobalVault. Can't find an answer? Our team is happy to help.
        </motion.p>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative w-full max-w-lg"
        >
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search questions…"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setOpenIndex(null); }}
            className="w-full pl-12 pr-5 py-4 rounded-full text-sm text-gray-200 placeholder-gray-500 outline-none transition-all duration-300"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(201,168,76,0.2)",
              backdropFilter: "blur(20px)",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.5)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.2)")}
          />
        </motion.div>
      </section>

      <GoldLine />

      {/* ── FAQ CONTENT ───────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 py-8 z-10 w-full">
        {/* Category pills */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setOpenIndex(null); }}
              className="px-5 py-2 rounded-full text-xs tracking-widest uppercase font-medium transition-all duration-300"
              style={activeCategory === cat
                ? { background: "linear-gradient(135deg, #C9A84C, #F5D78E)", color: "#0A0A0B", boxShadow: "0 4px 16px rgba(201,168,76,0.3)" }
                : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.2)", color: "#9CA3AF" }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion */}
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((faq, i) => (
              <AccordionItem
                key={i}
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
            <p className="text-gray-500 text-sm">No questions match your search. Try different keywords.</p>
          </motion.div>
        )}
      </section>

      <GoldLine />

      {/* ── STILL HAVE QUESTIONS ──────────────────────────────── */}
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
          <p className="text-xs tracking-widest uppercase mb-4" style={{ color: "#C9A84C" }}>Still Need Help?</p>
          <h3 className="text-4xl md:text-5xl font-bold mb-5 max-w-xl mx-auto leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            We're Here to Answer Everything
          </h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Our support team is available 24/7 via live chat, email, or phone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <a href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              style={{ background: "linear-gradient(135deg, #C9A84C 0%, #F5D78E 50%, #C9A84C 100%)", color: "#0A0A0B", boxShadow: "0 8px 40px rgba(201,168,76,0.4)" }}>
              Contact Support <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200"
              style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
              Live Chat
            </a>
          </div>
        </div>
      </motion.section>

      <GoldLine />
      <div className="z-10"><Footer /></div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  Mail,
  MessageSquare,
  ChevronDown,
  Phone,
  Send,
} from "lucide-react";

const faqs = [
  {
    question: "How do I deposit crypto?",
    answer:
      "Go to Dashboard → Deposit → select an asset (BTC or USDT), copy the wallet address and transfer. Your wallet will update automatically after blockchain confirmation.",
  },
  {
    question: "How long does withdrawal take?",
    answer:
      "Withdrawals are processed instantly but may take up to 5–10 minutes depending on network traffic.",
  },
  {
    question: "How do I start investing?",
    answer:
      "Go to Dashboard → Invest → choose a plan → select an asset → enter amount. Your plan will start immediately.",
  },
  {
    question: "What assets can I use?",
    answer:
      "You can deposit and invest using BTC, ETH, USDT, or any supported coins on your dashboard.",
  },
];

function SideCard({
  title,
  delay = 0,
  children,
}: {
  title: string;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-[#111318]/80 border border-white/[0.07] rounded-2xl p-5 backdrop-blur-md"
    >
      <h3 className="text-sm font-bold text-gray-100 font-mono mb-4">
        {title}
      </h3>
      {children}
    </motion.div>
  );
}

function DashModal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#111318] border border-white/10 rounded-t-3xl sm:rounded-2xl p-6 w-full sm:max-w-lg relative shadow-2xl font-mono"
      >
        <div className="w-10 h-1 bg-white/10 rounded-full mx-auto mb-4 sm:hidden" />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center bg-white/[0.06] border border-white/10 rounded-lg text-gray-400 hover:text-white cursor-pointer outline-none"
        >
          ×
        </button>
        <h2 className="text-lg font-extrabold text-gray-100 mb-5 tracking-tight flex items-center gap-2">
          {title}
        </h2>
        {children}
      </motion.div>
    </motion.div>
  );
}

export default function SupportPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;
    setSubmitted(true);
    setTimeout(() => {
      setShowTicketForm(false);
      setSubmitted(false);
      setSubject("");
      setMessage("");
      setCategory("");
    }, 2500);
  };

  return (
    <div className="py-4 font-mono text-gray-100 min-h-screen">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
            <HelpCircle size={15} className="text-yellow-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-100 tracking-tight">
            Support Center
          </h1>
        </div>
        <p className="text-[10px] text-gray-600 tracking-[0.14em] uppercase ml-11">
          Find answers · Ask questions · Contact support
        </p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] gap-5 items-start">

        {/* ── FAQ ── */}
        <SideCard title="Frequently Asked Questions" delay={0.1}>
          <div className="flex flex-col gap-2">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white/[0.025] border border-white/[0.07] rounded-xl overflow-hidden"
              >
                <button
                  onClick={() =>
                    setOpenFAQ(openFAQ === index ? null : index)
                  }
                  className="flex justify-between items-center w-full px-4 py-3.5 text-left hover:bg-yellow-400/[0.04] transition-colors outline-none cursor-pointer"
                >
                  <span className="text-xs font-semibold text-gray-100">
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-gray-600 shrink-0 transition-transform duration-250 ${
                      openFAQ === index ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {openFAQ === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-[11px] text-gray-600 px-4 pb-4 leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </SideCard>

        {/* ── Right column ── */}
        <div className="flex flex-col gap-4">

          {/* Contact Support */}
          <SideCard title="Contact Support" delay={0.15}>
            <div className="flex items-center gap-2 mb-3 -mt-1">
              <div className="w-6 h-6 rounded-lg bg-yellow-400/10 border border-yellow-400/15 flex items-center justify-center shrink-0">
                <Mail size={11} className="text-yellow-400" />
              </div>
              <span className="text-[10px] text-gray-600 leading-relaxed">
                Our support team is available 24/7.
              </span>
            </div>

            <div className="flex flex-col gap-3 mb-4">
              <div className="flex flex-col gap-0.5 px-3 py-2.5 bg-white/[0.025] border border-white/[0.07] rounded-xl">
                <span className="text-[9px] text-gray-600 tracking-[0.12em] uppercase">
                  Email
                </span>
                <span className="text-xs text-gray-300">
                  support@genesis-bank.io
                </span>
              </div>
              <div className="flex flex-col gap-0.5 px-3 py-2.5 bg-white/[0.025] border border-white/[0.07] rounded-xl">
                <span className="text-[9px] text-gray-600 tracking-[0.12em] uppercase">
                  Phone
                </span>
                <span className="text-xs text-gray-300">
                  +1 (555) 123-4567
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowTicketForm(true)}
              className="w-full py-2.5 bg-yellow-400/10 border border-yellow-400/25 text-yellow-400 hover:bg-yellow-400/[0.15] rounded-xl text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-2 outline-none cursor-pointer"
            >
              <MessageSquare size={13} />
              SUBMIT A TICKET
            </button>
          </SideCard>

          {/* Live Chat */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="bg-gradient-to-br from-indigo-500/[0.12] to-purple-500/[0.08] border border-indigo-500/20 rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-400/10 border border-indigo-400/20 flex items-center justify-center shrink-0">
                <Phone size={11} className="text-indigo-400" />
              </div>
              <span className="text-sm font-bold text-indigo-200">
                Live Chat
              </span>
              <span className="ml-auto text-[9px] font-bold tracking-widest px-2 py-0.5 rounded border bg-indigo-400/10 border-indigo-400/25 text-indigo-400">
                SOON
              </span>
            </div>
            <p className="text-[11px] text-indigo-300/50 leading-relaxed">
              Chat with our support team in real-time. Connect with an
              agent instantly.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Ticket Modal ── */}
      <AnimatePresence>
        {showTicketForm && (
          <DashModal
            title=""
            onClose={() => {
              setShowTicketForm(false);
              setSubmitted(false);
            }}
          >
            <div className="flex items-center gap-2 mb-5 -mt-2">
              <Send size={15} className="text-yellow-400" />
              <span className="text-lg font-extrabold text-gray-100 tracking-tight">
                Submit a Support Ticket
              </span>
            </div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-6 flex flex-col items-center gap-3 text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-green-400/10 border border-green-400/20 flex items-center justify-center">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#4ade80"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-green-400">
                  Ticket Submitted
                </p>
                <p className="text-[11px] text-gray-600">
                  Our team will reach out within 24 hours.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                <div>
                  <label className="text-[9px] text-gray-600 tracking-[0.12em] uppercase block mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-gray-300 font-mono outline-none focus:border-yellow-400/40 transition-colors cursor-pointer"
                  >
                    <option value="" className="bg-[#111318]">
                      Select a category...
                    </option>
                    <option value="deposit" className="bg-[#111318]">
                      Deposit issue
                    </option>
                    <option value="withdraw" className="bg-[#111318]">
                      Withdrawal issue
                    </option>
                    <option value="access" className="bg-[#111318]">
                      Account access
                    </option>
                    <option value="investment" className="bg-[#111318]">
                      Investment query
                    </option>
                    <option value="other" className="bg-[#111318]">
                      Other
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] text-gray-600 tracking-[0.12em] uppercase block mb-1.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Deposit not showing after 2 hours"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-gray-300 font-mono placeholder:text-gray-700 outline-none focus:border-yellow-400/40 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[9px] text-gray-600 tracking-[0.12em] uppercase block mb-1.5">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your issue in detail..."
                    rows={4}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-gray-300 font-mono placeholder:text-gray-700 outline-none focus:border-yellow-400/40 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer outline-none"
                >
                  <Send size={12} />
                  SUBMIT TICKET
                </button>
              </form>
            )}
          </DashModal>
        )}
      </AnimatePresence>
    </div>
  );
}
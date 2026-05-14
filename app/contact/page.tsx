"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Globe2,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
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
const contactInfo = [
  { icon: Mail,    label: "Email Us",       value: "support@GlobalVaultbank.com",             sub: "We respond within 2 hours" },
  { icon: Phone,   label: "Call Us",        value: "+1 626 923 7679",                     sub: "Mon–Fri, 8am–10pm WAT" },
  { icon: MapPin,  label: "Head Office",    value: "123 Financial District, Los Angeles", sub: "Los Angeles, USA" },
  { icon: Clock,   label: "Support Hours",  value: "24/7 Live Chat",                      sub: "Always available in the app" },
];

const offices = [
  { city: "Los Angeles", country: "United States", address: "123 Financial District, Los Angeles, USA", flag: "🇺🇸" },
  { city: "London",      country: "United Kingdom", address: "20 Fenchurch Street, EC3M 3BY",           flag: "🇬🇧" },
  { city: "New York",    country: "United States", address: "350 Fifth Avenue, Suite 4100",             flag: "🇺🇸" },
  { city: "Dubai",       country: "UAE",           address: "DIFC Gate Village, Building 6",            flag: "🇦🇪" },
];

const departments = [
  { icon: MessageSquare, label: "General Enquiry" },
  { icon: Globe2,        label: "International Services" },
  { icon: Mail,          label: "Business / Enterprise" },
  { icon: Phone,         label: "Technical Support" },
];

/* ─── Input Field ───────────────────────────────────────────── */
function InputField({
  label,
  type = "text",
  placeholder,
  required = false,
  textarea = false,
  value,
  onChange,
}: {
  label: string;
  type?: string;
  placeholder: string;
  required?: boolean;
  textarea?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}) {
  return (
    <div>
      <label
        className="block text-xs font-semibold tracking-wider uppercase mb-2"
        style={{ color: "var(--brand-400)", letterSpacing: "var(--tracking-wider)" }}
      >
        {label}
        {required && <span style={{ color: "var(--brand-400)" }}> *</span>}
      </label>
      {textarea ? (
        <textarea
          placeholder={placeholder}
          required={required}
          rows={5}
          value={value}
          onChange={onChange}
          className="input"
          style={{ resize: "vertical", fontFamily: "var(--font-body)" }}
        />
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={onChange}
          className="input"
        />
      )}
    </div>
  );
}

/* ─── Main ──────────────────────────────────────────────────── */
export default function ContactPage() {
  const [form, setForm] = useState({
    name: "", email: "", department: "", subject: "", message: "",
  });
  const [submitted,  setSubmitted]  = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || "Failed to send message"}`);
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setForm({ name: "", email: "", department: "", subject: "", message: "" });
  };

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
          Get In Touch
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
          We'd Love to{" "}
          <span className="text-gradient">Hear From You</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg max-w-xl leading-relaxed"
          style={{ color: "var(--text-200)" }}
        >
          Whether you have a question, need support, or want to explore a partnership —
          our team is ready to assist you.
        </motion.p>
      </section>

      <SectionDivider />

      {/* ══════════════════════════════════════════════════════
          CONTACT INFO CARDS
      ══════════════════════════════════════════════════════ */}
      <motion.section
        className="max-w-7xl mx-auto px-6 py-8 z-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
          {contactInfo.map(({ icon: Icon, label, value, sub }, i) => (
            <motion.div
              key={label}
              className="card group p-7 relative overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: "radial-gradient(circle at 50% 0%, var(--glass-brand-md) 0%, transparent 60%)" }}
              />

              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "var(--glass-brand-sm)", border: "1px solid var(--border-brand)" }}
              >
                <Icon className="w-4 h-4" style={{ color: "var(--brand-400)" }} />
              </div>

              <p
                className="text-xs font-semibold tracking-wider uppercase mb-1"
                style={{ color: "var(--brand-400)", letterSpacing: "var(--tracking-wider)" }}
              >
                {label}
              </p>
              <p className="font-semibold text-sm mb-1" style={{ color: "var(--text-0)" }}>
                {value}
              </p>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--text-400)" }}>
                {sub}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <SectionDivider />

      {/* ══════════════════════════════════════════════════════
          FORM + SIDEBAR
      ══════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 py-8 z-10 grid md:grid-cols-5 gap-10 items-start">

        {/* ── Contact Form ── */}
        <motion.div
          className="md:col-span-3"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <div className="card p-10">
            <p
              className="text-xs font-semibold tracking-wider uppercase mb-2"
              style={{ color: "var(--brand-400)", letterSpacing: "var(--tracking-wider)" }}
            >
              Send a Message
            </p>
            <h3
              className="text-3xl font-bold mb-8"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-0)" }}
            >
              How Can We Help?
            </h3>

            {/* ── Success state ── */}
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background: "var(--success-glow)", border: "1px solid rgba(34,197,94,0.3)" }}
                >
                  <CheckCircle2 className="w-7 h-7" style={{ color: "var(--success-400)" }} />
                </div>
                <h4
                  className="text-2xl font-bold mb-2"
                  style={{ fontFamily: "var(--font-display)", color: "var(--text-0)" }}
                >
                  Message Sent!
                </h4>
                <p style={{ color: "var(--text-200)", fontSize: "var(--text-sm)" }}>
                  A member of our team will respond to you within 2 hours.
                </p>
                <button
                  onClick={resetForm}
                  className="btn-ghost btn-sm mt-8 inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Send Another Message
                </button>
              </motion.div>
            ) : (
              /* ── Form ── */
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <InputField label="Full Name"      placeholder="Jane Doe"           required value={form.name}  onChange={handleChange("name")} />
                  <InputField label="Email Address"  type="email" placeholder="jane@example.com" required value={form.email} onChange={handleChange("email")} />
                </div>

                {/* Department picker */}
                <div>
                  <label
                    className="block text-xs font-semibold tracking-wider uppercase mb-2"
                    style={{ color: "var(--brand-400)", letterSpacing: "var(--tracking-wider)" }}
                  >
                    Department
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {departments.map(({ icon: Icon, label }) => {
                      const active = form.department === label;
                      return (
                        <button
                          type="button"
                          key={label}
                          onClick={() => setForm((p) => ({ ...p, department: label }))}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full transition-base"
                          style={{
                            fontSize: "var(--text-xs)",
                            fontWeight: active ? 600 : 400,
                            background: active ? "var(--glass-brand-md)" : "var(--glass-white-xs)",
                            border: active ? "1px solid var(--border-brand-strong)" : "1px solid var(--border-default)",
                            color: active ? "var(--brand-300)" : "var(--text-300)",
                          }}
                        >
                          <Icon className="w-3 h-3" />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <InputField label="Subject" placeholder="What's this about?" required value={form.subject} onChange={handleChange("subject")} />
                <InputField label="Message" placeholder="Tell us how we can help you…" required textarea value={form.message} onChange={handleChange("message")} />

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full justify-center py-4 disabled:opacity-60"
                  style={{ borderRadius: "var(--radius-full)" }}
                >
                  {submitting ? (
                    <>
                      <motion.div
                        className="w-4 h-4 rounded-full"
                        style={{ border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff" }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      />
                      Sending…
                    </>
                  ) : (
                    <>Send Message <Send className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>

        {/* ── Sidebar ── */}
        <motion.div
          className="md:col-span-2 space-y-6"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          {/* Live chat promo */}
          <div
            className="card-brand p-8 relative overflow-hidden"
            style={{
              borderRadius: "var(--radius-xl)",
              background: "linear-gradient(135deg, var(--glass-brand-md) 0%, var(--glass-brand-xs) 100%)",
              border: "1px solid var(--border-brand)",
            }}
          >
            {/* decorative blob */}
            <div
              className="absolute -top-10 -right-10 w-32 h-32 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, var(--brand-glow-sm), transparent)" }}
            />
            <MessageSquare className="w-6 h-6 mb-4" style={{ color: "var(--brand-400)" }} />
            <h4
              className="text-xl font-bold mb-2"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-0)" }}
            >
              Live Chat
            </h4>
            <p
              className="text-sm mb-5 leading-relaxed"
              style={{ color: "var(--text-200)" }}
            >
              Get an instant response from our support team — available 24 hours a day,
              7 days a week.
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-2 text-sm font-semibold transition-base"
              style={{ color: "var(--brand-400)" }}
            >
              Start a chat <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Commitments */}
          <div className="card p-7">
            <p
              className="text-xs font-semibold tracking-wider uppercase mb-4"
              style={{ color: "var(--brand-400)", letterSpacing: "var(--tracking-wider)" }}
            >
              Our Commitments
            </p>
            <ul className="space-y-3">
              {[
                "Email response within 2 hours",
                "24/7 live chat & in-app support",
                "Dedicated business account manager",
                "Multilingual support (12 languages)",
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
        </motion.div>
      </section>

      <SectionDivider />

      {/* ══════════════════════════════════════════════════════
          OFFICES
      ══════════════════════════════════════════════════════ */}
      <motion.section
        className="max-w-7xl mx-auto px-6 py-8 z-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <div className="text-center mb-12">
          <p
            className="text-xs font-semibold tracking-wider uppercase mb-2"
            style={{ color: "var(--brand-400)", letterSpacing: "var(--tracking-wider)" }}
          >
            Locations
          </p>
          <h3
            className="section-header"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Our Global Offices
          </h3>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
          {offices.map(({ city, country, address, flag }, i) => (
            <motion.div
              key={city}
              className="card group p-7 relative overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: "radial-gradient(circle at 50% 0%, var(--glass-brand-md) 0%, transparent 60%)" }}
              />

              <span className="text-3xl mb-4 block">{flag}</span>

              <h4
                className="font-bold mb-0.5"
                style={{ fontFamily: "var(--font-display)", color: "var(--text-0)" }}
              >
                {city}
              </h4>
              <p
                className="mb-3"
                style={{ fontSize: "var(--text-xs)", color: "var(--text-400)" }}
              >
                {country}
              </p>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--text-200)", lineHeight: "var(--leading-normal)" }}>
                {address}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <SectionDivider />

      <div className="z-10"><Footer /></div>
    </div>
  );
}
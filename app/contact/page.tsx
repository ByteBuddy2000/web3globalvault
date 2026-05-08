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
  CheckCircle,
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
const contactInfo = [
  {
    icon: Mail,
    label: "Email Us",
    value: "support@genesisbank.com",
    sub: "We respond within 2 hours",
  },
  {
    icon: Phone,
    label: "Call Us",
    value: "+1 626 923 7679",
    sub: "Mon–Fri, 8am–10pm WAT",
  },
  {
    icon: MapPin,
    label: "Head Office",
    value: "123 Financial District, Los Angeles, USA",
    sub: "Los Angeles, USA",
  },
  {
    icon: Clock,
    label: "Support Hours",
    value: "24/7 Live Chat",
    sub: "Always available in the app",
  },
];

const offices = [
  { city: "Los Angeles", country: "United States", address: "123 Financial District, Los Angeles, USA", flag: "�🇸" },
  { city: "London", country: "United Kingdom", address: "20 Fenchurch Street, EC3M 3BY", flag: "🇬🇧" },
  { city: "New York", country: "United States", address: "350 Fifth Avenue, Suite 4100", flag: "🇺🇸" },
  { city: "Dubai", country: "UAE", address: "DIFC Gate Village, Building 6", flag: "🇦🇪" },
];

const departments = [
  { icon: MessageSquare, label: "General Enquiry" },
  { icon: Globe2, label: "International Services" },
  { icon: Mail, label: "Business / Enterprise" },
  { icon: Phone, label: "Technical Support" },
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
  const [focused, setFocused] = useState(false);
  const base = {
    background: "rgba(255,255,255,0.03)",
    border: focused ? "1px solid rgba(201,168,76,0.5)" : "1px solid rgba(201,168,76,0.15)",
    backdropFilter: "blur(10px)",
    color: "#E8E8E8",
    outline: "none",
    transition: "border-color 0.25s ease",
    width: "100%",
    borderRadius: "0.75rem",
    padding: "0.875rem 1rem",
    fontSize: "0.875rem",
  };

  return (
    <div>
      <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "#C9A84C" }}>
        {label}{required && <span style={{ color: "#C9A84C" }}> *</span>}
      </label>
      {textarea ? (
        <textarea
          placeholder={placeholder}
          required={required}
          rows={5}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ ...base, resize: "vertical" }}
        />
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={base}
        />
      )}
    </div>
  );
}

/* ─── Main ──────────────────────────────────────────────────── */
export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", department: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      if (response.ok) {
        setSubmitted(true);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to send message'}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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
        ::placeholder { color: #4B5563; }
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
          Get In Touch
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold leading-none mb-6 max-w-4xl"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          We'd Love to{" "}
          <span style={{ background: "linear-gradient(135deg, #F5D78E 0%, #C9A84C 50%, #E8C668 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Hear From You
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg text-gray-400 max-w-xl leading-relaxed"
        >
          Whether you have a question, need support, or want to explore a partnership — our team is ready to assist you.
        </motion.p>
      </section>

      <GoldLine />

      {/* ── CONTACT INFO CARDS ────────────────────────────────── */}
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
              className="group p-7 rounded-2xl relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
                border: "1px solid rgba(201,168,76,0.15)",
                backdropFilter: "blur(20px)",
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: "radial-gradient(circle at 50% 0%, rgba(201,168,76,0.08) 0%, transparent 60%)" }} />
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))", border: "1px solid rgba(201,168,76,0.3)" }}>
                <Icon className="w-4 h-4" style={{ color: "#C9A84C" }} />
              </div>
              <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#C9A84C" }}>{label}</p>
              <p className="font-semibold text-white text-sm mb-1">{value}</p>
              <p className="text-xs text-gray-500">{sub}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <GoldLine />

      {/* ── FORM + SIDEBAR ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-8 z-10 grid md:grid-cols-5 gap-10 items-start">
        {/* Form */}
        <motion.div
          className="md:col-span-3"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <div
            className="p-10 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
              border: "1px solid rgba(201,168,76,0.15)",
              backdropFilter: "blur(20px)",
            }}
          >
            <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "#C9A84C" }}>Send a Message</p>
            <h3 className="text-3xl font-bold mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
              How Can We Help?
            </h3>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.3)" }}>
                  <CheckCircle className="w-7 h-7" style={{ color: "#C9A84C" }} />
                </div>
                <h4 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif", color: "#F5D78E" }}>Message Sent!</h4>
                <p className="text-gray-400 text-sm">A member of our team will respond to you within 2 hours.</p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: "", email: "", department: "", subject: "", message: "" }); }}
                  className="mt-8 text-xs tracking-widest uppercase"
                  style={{ color: "#C9A84C" }}
                >
                  Send Another Message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <InputField label="Full Name" placeholder="Jane Doe" required value={form.name} onChange={handleChange("name")} />
                  <InputField label="Email Address" type="email" placeholder="jane@example.com" required value={form.email} onChange={handleChange("email")} />
                </div>

                {/* Department select */}
                <div>
                  <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "#C9A84C" }}>Department</label>
                  <div className="flex flex-wrap gap-2">
                    {departments.map(({ icon: Icon, label }) => (
                      <button
                        type="button"
                        key={label}
                        onClick={() => setForm((p) => ({ ...p, department: label }))}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all duration-200"
                        style={form.department === label
                          ? { background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.5)", color: "#F5D78E" }
                          : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#6B7280" }}
                      >
                        <Icon className="w-3 h-3" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <InputField label="Subject" placeholder="What's this about?" required value={form.subject} onChange={handleChange("subject")} />
                <InputField label="Message" placeholder="Tell us how we can help you…" required textarea value={form.message} onChange={handleChange("message")} />

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-full text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-70"
                  style={{
                    background: "linear-gradient(135deg, #C9A84C 0%, #F5D78E 50%, #C9A84C 100%)",
                    color: "#0A0A0B",
                    boxShadow: "0 6px 24px rgba(201,168,76,0.35)",
                  }}
                >
                  {submitting ? (
                    <>
                      <motion.div
                        className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black"
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

        {/* Sidebar */}
        <motion.div
          className="md:col-span-2 space-y-6"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          {/* Live chat promo */}
          <div
            className="p-8 rounded-2xl relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(201,168,76,0.1), rgba(201,168,76,0.03))",
              border: "1px solid rgba(201,168,76,0.25)",
            }}
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20"
              style={{ background: "radial-gradient(circle, #C9A84C, transparent)" }} />
            <MessageSquare className="w-6 h-6 mb-4" style={{ color: "#C9A84C" }} />
            <h4 className="text-xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif", color: "#F5D78E" }}>Live Chat</h4>
            <p className="text-gray-400 text-sm mb-5 leading-relaxed">Get an instant response from our support team — available 24 hours a day, 7 days a week.</p>
            <a href="#"
              className="inline-flex items-center gap-2 text-sm font-semibold"
              style={{ color: "#C9A84C" }}>
              Start a chat <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Response time */}
          <div
            className="p-7 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
              border: "1px solid rgba(201,168,76,0.12)",
              backdropFilter: "blur(20px)",
            }}
          >
            <p className="text-xs tracking-widest uppercase mb-4" style={{ color: "#C9A84C" }}>Our Commitments</p>
            <ul className="space-y-3">
              {[
                "Email response within 2 hours",
                "24/7 live chat & in-app support",
                "Dedicated business account manager",
                "Multilingual support (12 languages)",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-gray-300">
                  <GoldDot /> {item}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </section>

      <GoldLine />

      {/* ── OFFICES ───────────────────────────────────────────── */}
      <motion.section
        className="max-w-7xl mx-auto px-6 py-8 z-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <div className="text-center mb-12">
          <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "#C9A84C" }}>Locations</p>
          <h3 className="text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Our Global Offices</h3>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
          {offices.map(({ city, country, address, flag }, i) => (
            <motion.div
              key={city}
              className="group p-7 rounded-2xl relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
                border: "1px solid rgba(201,168,76,0.15)",
                backdropFilter: "blur(20px)",
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: "radial-gradient(circle at 50% 0%, rgba(201,168,76,0.07) 0%, transparent 60%)" }} />
              <span className="text-3xl mb-4 block">{flag}</span>
              <h4 className="font-bold text-white mb-0.5" style={{ fontFamily: "'Playfair Display', serif" }}>{city}</h4>
              <p className="text-xs text-gray-500 mb-3">{country}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{address}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <GoldLine />
      <div className="z-10"><Footer /></div>
    </div>
  );
}
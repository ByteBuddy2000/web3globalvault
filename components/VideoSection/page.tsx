"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

const VIDEOS = [
  {
    id: "8QA6T9R1WyQ",
    title: "GlobalVault Platform Overview",
    label: "Overview",
  },
  {
    id: "UU3c-1akOZw",
    title: "Smart Investment Tools",
    label: "Investments",
  },
  {
    id: "4OVgWbvYzIY",
    title: "MedBed Innovation",
    label: "MedBed",
  },
  {
    id: "mcUX-TiAaxU",
    title: "Secure Digital Banking",
    label: "Banking",
  },
  {
    id: "hoO8wBozHzI",
    title: "Global Transfers & Crypto",
    label: "Transfers",
  },
];

export default function VideoSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = VIDEOS[activeIndex];

  return (
    <motion.section
      id="video-demo"
      className="max-w-7xl mx-auto px-6 py-20 z-10"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true }}
    >
      {/* Header */}
      <div className="text-center mb-12">
        <p
          className="text-xs font-semibold tracking-wider uppercase mb-2"
          style={{ color: "var(--brand-400)", letterSpacing: "var(--tracking-wider)" }}
        >
          See It In Action
        </p>
        <h3
          className="section-header mb-4"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Experience GlobalVault MedBed Innovation
        </h3>
        <p
          className="max-w-2xl mx-auto text-lg leading-relaxed"
          style={{ color: "var(--text-200)" }}
        >
          Watch how our platform simplifies your financial journey with secure banking,
          smart investments, and healthcare benefits.
        </p>
      </div>

      {/* Tab Pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {VIDEOS.map((v, i) => (
          <button
            key={v.id}
            onClick={() => setActiveIndex(i)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
            style={{
              border: `1px solid ${activeIndex === i ? "var(--border-brand)" : "var(--border-default)"}`,
              background: activeIndex === i ? "var(--glass-brand-sm)" : "var(--glass-white-xs)",
              color: activeIndex === i ? "var(--brand-400)" : "var(--text-300)",
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Main Player */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35 }}
          className="relative rounded-2xl overflow-hidden"
          style={{
            border: "1px solid var(--border-brand)",
            background: "var(--surface-0)",
            boxShadow: "0 0 40px rgba(59,130,246,0.08)",
          }}
        >
          {/* Glow */}
          <div
            className="absolute -inset-8 rounded-3xl pointer-events-none -z-10"
            style={{
              background:
                "radial-gradient(ellipse at 50% 50%, var(--glass-brand-md) 0%, transparent 60%)",
              filter: "blur(24px)",
            }}
          />
          {/* 16:9 iframe */}
          <div className="relative w-full pt-[56.25%] bg-black">
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${active.id}?autoplay=1&mute=1&controls=1&modestbranding=1&rel=0`}
              title={active.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Bottom overlay label */}
          <div
            className="px-5 py-3 flex items-center justify-between"
            style={{
              background: "var(--glass-white-xs)",
              borderTop: "1px solid var(--border-default)",
            }}
          >
            <p className="text-sm font-semibold" style={{ color: "var(--text-0)" }}>
              {active.title}
            </p>
            <span
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{
                background: "var(--glass-brand-sm)",
                border: "1px solid var(--border-brand)",
                color: "var(--brand-400)",
              }}
            >
              {activeIndex + 1} / {VIDEOS.length}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Thumbnail Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-4">
        {VIDEOS.map((v, i) => (
          <button
            key={v.id}
            onClick={() => setActiveIndex(i)}
            className="group relative rounded-xl overflow-hidden transition-all duration-200"
            style={{
              border: `2px solid ${activeIndex === i ? "var(--border-brand)" : "var(--border-default)"}`,
              opacity: activeIndex === i ? 1 : 0.6,
            }}
          >
            {/* YouTube thumbnail */}
            <div className="relative w-full pt-[56.25%] bg-black">
              <img
                src={`https://img.youtube.com/vi/${v.id}/mqdefault.jpg`}
                alt={v.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* dim overlay */}
              <div
                className="absolute inset-0 transition-opacity duration-200"
                style={{
                  background: activeIndex === i
                    ? "rgba(6,7,10,0.15)"
                    : "rgba(6,7,10,0.45)",
                }}
              />
              {/* play icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                  style={{
                    background: activeIndex === i ? "var(--brand-500)" : "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                </div>
              </div>
            </div>
            {/* label */}
            <div
              className="px-2 py-1.5 text-center"
              style={{ background: "var(--glass-white-xs)" }}
            >
              <p
                className="text-xs font-medium truncate"
                style={{ color: activeIndex === i ? "var(--brand-400)" : "var(--text-300)" }}
              >
                {v.label}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-12">
        <a href="/signup" className="btn-primary btn-lg">
          Get Started <ArrowRight className="w-4 h-4" />
        </a>
        <a href="#" className="btn-secondary btn-lg">
          Learn More
        </a>
      </div>
    </motion.section>
  );
}
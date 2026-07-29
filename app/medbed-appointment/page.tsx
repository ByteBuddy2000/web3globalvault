"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  HeartPulse,
  Mail,
  PhoneCall,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";

type TawkApi = {
  toggle?: () => void;
  maximize?: () => void;
  showWidget?: () => void;
};

const highlights = [
  {
    title: "Fast coordination",
    desc: "We help arrange your medbed appointment flow with clarity and care.",
  },
  {
    title: "Secure support",
    desc: "Every step is handled with privacy-first communication and trusted assistance.",
  },
  {
    title: "Flexible follow-up",
    desc: "Our team is ready to help you with scheduling questions and next steps.",
  },
];

const steps = [
  {
    title: "Share your request",
    desc: "Tell us what you need and the best time for your appointment support.",
  },
  {
    title: "Connect with our team",
    desc: "We guide the next steps and make communication simple and stress-free.",
  },
  {
    title: "Receive follow-up",
    desc: "You get prompt, helpful answers so you can plan with confidence.",
  },
];

export default function MedbedAppointmentPage() {
  const handleSendMail = () => {
    const tawkApi = (window as Window & { Tawk_API?: TawkApi }).Tawk_API;

    if (tawkApi?.toggle) {
      tawkApi.toggle();
      return;
    }

    if (tawkApi?.maximize) {
      tawkApi.maximize();
      return;
    }

    window.open(
      "https://tawk.to/chat/6a24138874bd6b1c2dcc9457/1jqeeojh7",
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="min-h-screen bg-app text-foreground">
      <Navbar />

      <main className="pt-24 pb-16">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-[-8%] top-8 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="absolute right-[-6%] top-16 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
          </div>

          <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-6 py-16 lg:flex-row lg:items-center lg:px-8 lg:py-24">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl"
            >
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-400/10 px-3 py-1 text-sm font-medium text-brand-300">
                <Sparkles className="h-4 w-4" />
                Medbed Appointment Support
              </div>

              <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl" style={{ fontFamily: "var(--font-display)" }}>
                Smooth, caring support for every medbed appointment need.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
                From appointment coordination to fast follow-up care, our team helps you feel prepared and supported every step of the way.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleSendMail}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  Send Mail
                  <Mail className="h-4 w-4" />
                </button>

                <Link href="/" className="btn-secondary inline-flex items-center gap-2">
                  Explore Home
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Response time", value: "24/7" },
                  { label: "Care focus", value: "Personal" },
                  { label: "Support type", value: "Live chat" },
                ].map((item) => (
                  <div key={item.label} className="card rounded-2xl p-4 text-center">
                    <p className="text-2xl font-semibold text-brand-300">{item.value}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="w-full max-w-xl"
            >
              <div className="card p-8 rounded-3xl">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-brand-400/15 p-3 text-brand-300">
                    <CalendarDays className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Appointment concierge</p>
                    <h2 className="text-2xl font-semibold">Everything you need in one place</h2>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {highlights.map((item) => (
                    <div key={item.title} className="rounded-2xl border border-border/70 bg-background/50 p-4">
                      <div className="flex items-start gap-3">
                        <ShieldCheck className="mt-0.5 h-5 w-5 text-brand-300" />
                        <div>
                          <h3 className="font-semibold text-foreground">{item.title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="card rounded-3xl p-8">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-cyan-400/15 p-3 text-cyan-300">
                  <HeartPulse className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-brand-300">How it works</p>
                  <h3 className="text-2xl font-semibold">Simple steps, thoughtful support</h3>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {steps.map((step, index) => (
                  <div key={step.title} className="flex gap-4 rounded-2xl border border-border/70 bg-background/40 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-400/15 text-sm font-semibold text-brand-300">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{step.title}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card rounded-3xl p-8">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-brand-400/15 p-3 text-brand-300">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Send Mail</p>
                  <h3 className="text-2xl font-semibold">Need a quick conversation?</h3>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-border/70 bg-background/50 p-6">
                <div className="flex items-start gap-3">
                  <PhoneCall className="mt-1 h-5 w-5 text-brand-300" />
                  <div>
                    <p className="font-semibold text-foreground">Open our live support chat</p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      Hit the button below and we’ll connect you with the support desk so your request gets answered faster.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3 rounded-2xl border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
                  <Clock3 className="h-4 w-4 text-brand-300" />
                  Usually answered in a few moments during working hours.
                </div>

                <button
                  type="button"
                  onClick={handleSendMail}
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-400/10 px-4 py-2 text-sm font-semibold text-brand-300 transition hover:bg-brand-400/20"
                >
                  Send Mail
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

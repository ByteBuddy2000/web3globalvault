"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Clock3,
  HeartPulse,
  Mail,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Users,
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
    desc: "We help arrange your medbed appointment flow with clarity, calm, and efficiency.",
  },
  {
    title: "Secure support",
    desc: "Every step is handled with privacy-first communication and trusted assistance.",
  },
  {
    title: "Flexible follow-up",
    desc: "Our team is ready to help with scheduling questions and next-step guidance.",
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

const galleryCards = [
  {
    image: "/asset/bodyy.jpeg",
    title: "Thoughtful follow-up",
    desc: "Personalized guidance for each part of your care journey.",
  },
  {
    image: "/asset/vrshot.png",
    title: "Modern support experience",
    desc: "A polished, reassuring journey from first message to final update.",
  },
  {
    image: "/asset/cus.jpg",
    title: "Trusted communication",
    desc: "Support designed to feel human, clear, and dependable.",
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.12),_transparent_28%),linear-gradient(135deg,rgba(11,18,32,0.98),rgba(8,14,24,1))] text-foreground">
      <Navbar />

      <main className="pb-16 pt-24">
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[-8%] top-8 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
            <div className="absolute right-[-6%] top-16 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
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

                <h1
                  className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Elegant care support for every medbed appointment need.
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

                <div className="mt-6 rounded-2xl border border-brand-400/20 bg-brand-400/10 p-4 text-sm text-muted-foreground">
                  <p className="font-semibold text-brand-200">Support email</p>
                  <a
                    href="mailto:support@web3globalvault.com"
                    className="mt-1 inline-flex items-center gap-2 text-brand-300 transition hover:text-brand-200"
                  >
                    <Mail className="h-4 w-4" />
                    support@web3globalvault.com
                  </a>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.12 }}
                className="w-full"
              >
                <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 shadow-2xl shadow-cyan-950/20">
                  <div className="relative h-72 w-full sm:h-80 lg:h-[26rem]">
                    <Image
                      src="/asset/trumpmedbed.jpeg"
                      alt="Care and medical support illustration"
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    <div className="absolute left-4 top-4 rounded-full border border-cyan-400/30 bg-cyan-400/15 px-3 py-1 text-sm text-cyan-200 backdrop-blur">
                      <span className="inline-flex items-center gap-2">
                        <BadgeCheck className="h-4 w-4" />
                        Premium care concierge
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                      <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur">
                        <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Appointment concierge</p>
                        <h2 className="mt-2 text-2xl font-semibold text-white">Everything you need in one place</h2>
                        <p className="mt-2 text-sm leading-7 text-slate-300">
                          From scheduling to follow-up, your experience is managed with calm professionalism.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {galleryCards.slice(0, 2).map((item) => (
                    <div key={item.title} className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/70">
                      <div className="relative h-40 w-full">
                        <Image src={item.image} alt={item.title} fill className="object-cover" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-white">{item.title}</h3>
                        <p className="mt-1 text-sm text-slate-300">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="card rounded-[2rem] p-8">
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

            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 shadow-xl shadow-cyan-950/20">
              <Image
                src="/asset/vrshot.png"
                alt="Support team and scheduling overview"
                width={1200}
                height={900}
                className="h-full min-h-[420px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-8">
                <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur">
                  <div className="flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-brand-300">
                    <Users className="h-4 w-4" />
                    Care-first communication
                  </div>
                  <h3 className="mt-3 text-2xl font-semibold text-white">A polished experience from start to finish</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    Our team stays close to your request so important details never feel lost.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/70">
                <div className="relative h-56 w-full">
                  <Image src="/asset/bodyy.jpeg" alt="Comfort-focused care environment" fill className="object-cover" />
                </div>
              </div>
              <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/70">
                <div className="relative h-56 w-full">
                  <Image src="/asset/cus.jpg" alt="Supportive team member" fill className="object-cover" />
                </div>
              </div>
            </div>

            <div className="card rounded-[2rem] p-8">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-brand-400/15 p-3 text-brand-300">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Why patients choose us</p>
                  <h3 className="text-2xl font-semibold">Support that feels calm, clear, and personal</h3>
                </div>
              </div>

              <div className="mt-8 grid gap-4">
                {highlights.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-border/70 bg-background/50 p-4">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="mt-0.5 h-5 w-5 text-brand-300" />
                      <div>
                        <h4 className="font-semibold text-foreground">{item.title}</h4>
                        <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <div className="card rounded-[2rem] p-8 lg:p-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Send Mail</p>
                <h3 className="mt-2 text-3xl font-semibold">Need a quick conversation?</h3>
                <p className="mt-3 text-lg leading-8 text-muted-foreground">
                  Reach out today and let our support team help you move forward with confidence.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-border/70 bg-background/50 p-6">
                <div className="flex items-start gap-3">
                  <PhoneCall className="mt-1 h-5 w-5 text-brand-300" />
                  <div>
                    <p className="font-semibold text-foreground">Open our live support chat</p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      We’ll connect you with the right support desk so your request gets answered faster.
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

import React from "react";
import { FileText, Mail } from "lucide-react";
import Navbar from "@/components/navbar/navbar";

const terms = [
  {
    title: "Acceptance of Terms",
    body: "By signing up for or using any Web3GlobalVault services, you accept and agree to be bound by these Terms and our Privacy Policy.",
  },
  {
    title: "Eligibility",
    body: "You must be at least 18 years old (or the legal age in your jurisdiction) to use our services. You represent and warrant that you meet this requirement.",
  },
  {
    title: "Account Security",
    body: "You are responsible for maintaining the confidentiality of your account credentials. Notify Web3GlobalVault immediately of any unauthorized use.",
  },
  {
    title: "Use of Services",
    body: "Services are provided for lawful personal or business use only. You agree not to use Web3GlobalVault for illegal activities or in violation of applicable laws.",
  },
  {
    title: "Fees and Charges",
    body: "Certain services may incur fees. All fees will be disclosed prior to charging and are governed by the applicable fee schedule.",
  },
  {
    title: "Transactions and Limits",
    body: "Transaction processing, limits, and settlement times are subject to our policies. Web3GlobalVault is not liable for delays caused by third parties.",
  },
  {
    title: "Privacy and Data",
    body: "Your use of Web3GlobalVault is subject to our Privacy Policy, which explains how we collect, use, and protect your personal information.",
  },
  {
    title: "Intellectual Property",
    body: "All content, logos, and trademarks on the site are owned by Web3GlobalVault or our licensors. You may not reproduce or misuse them without permission.",
  },
  {
    title: "Disclaimers",
    body: 'Services are provided "as is" without warranties to the fullest extent permitted by law. Web3GlobalVault disclaims implied warranties of merchantability and fitness for a particular purpose.',
  },
  {
    title: "Limitation of Liability",
    body: "To the maximum extent permitted by law, Web3GlobalVault will not be liable for indirect, incidental, or consequential damages arising from your use of the services.",
  },
  {
    title: "Modification of Terms",
    body: "Web3GlobalVault may modify these Terms from time to time. We will notify you of material changes through the app or by email; continued use constitutes acceptance.",
  },
  {
    title: "Governing Law & Contact",
    body: null, // rendered separately to include mailto link
  },
];

export default function TermsAndConditions() {
  return (
    <main
      className="min-h-screen"
      style={{
        background: "var(--surface-0)",
        fontFamily: "var(--font-body)",
        color: "var(--text-0)",
        padding: "var(--space-8) var(--space-4)",
      }}
    >
      <Navbar />

      {/* ambient glow */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        style={{ zIndex: 0 }}
      >
        <div
          className="absolute rounded-full"
          style={{
            top: "-10%",
            left: "30%",
            width: 700,
            height: 400,
            background:
              "radial-gradient(ellipse, rgba(59,130,246,0.07) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      <div
        className="relative max-w-4xl mx-auto"
        style={{ zIndex: 1 }}
      >
        {/* ── Card ── */}
        <div
          className="card p-8 md:p-12"
          style={{ borderRadius: "var(--radius-2xl)" }}
        >

          {/* ── Header ── */}
          <header className="mb-10">
            {/* eyebrow */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6"
              style={{
                border: "1px solid var(--border-brand)",
                background: "var(--glass-brand-sm)",
                color: "var(--brand-300)",
                fontSize: "var(--text-xs)",
                letterSpacing: "var(--tracking-wider)",
                textTransform: "uppercase",
              }}
            >
              <FileText className="w-3.5 h-3.5" />
              Legal Document
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <h1
                className="font-bold leading-tight"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                  letterSpacing: "var(--tracking-tight)",
                  color: "var(--text-0)",
                }}
              >
                Web3GlobalVault —{" "}
                <span className="text-gradient">Terms &amp; Conditions</span>
              </h1>
              <span
                className="flex-shrink-0 badge badge-default"
                style={{ alignSelf: "flex-start", marginTop: "0.25rem" }}
              >
                Last updated: September 11, 2025
              </span>
            </div>

            <p
              className="mt-4 leading-relaxed"
              style={{ color: "var(--text-200)", fontSize: "var(--text-sm)" }}
            >
              Welcome to Web3GlobalVault. These Terms &amp; Conditions ("Terms") govern your
              access to and use of our services. By using Web3GlobalVault services, you agree
              to these Terms. Please read them carefully.
            </p>
          </header>

          {/* ── Divider ── */}
          <div className="divider" />

          {/* ── Terms list ── */}
          <ol className="space-y-0" aria-label="Terms and Conditions">
            {terms.map(({ title, body }, i) => (
              <li key={title}>
                <div className="flex gap-5 py-7">
                  {/* index badge */}
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
                    style={{
                      background: "var(--glass-brand-sm)",
                      border: "1px solid var(--border-brand)",
                    }}
                  >
                    <span
                      className="font-bold"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "var(--text-xs)",
                        color: "var(--brand-400)",
                      }}
                    >
                      {i + 1}
                    </span>
                  </div>

                  {/* content */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-bold mb-2"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "var(--text-base)",
                        color: "var(--text-0)",
                      }}
                    >
                      {title}
                    </h3>

                    {/* special case for last item with mailto */}
                    {body ? (
                      <p
                        style={{
                          fontSize: "var(--text-sm)",
                          color: "var(--text-200)",
                          lineHeight: "var(--leading-normal)",
                        }}
                      >
                        {body}
                      </p>
                    ) : (
                      <p
                        style={{
                          fontSize: "var(--text-sm)",
                          color: "var(--text-200)",
                          lineHeight: "var(--leading-normal)",
                        }}
                      >
                        These Terms are governed by the laws of the jurisdiction where
                        Web3GlobalVault is incorporated. For questions or notices, contact us
                        at{" "}
                        <a
                          href="mailto:support@GlobalVault.bank"
                          className="inline-flex items-center gap-1 font-medium transition-base"
                          style={{ color: "var(--brand-400)" }}
                        >
                          <Mail className="w-3.5 h-3.5" />
                          support@GlobalVault.bank
                        </a>
                        .
                      </p>
                    )}
                  </div>
                </div>

                {/* item divider — skip after last */}
                {i < terms.length - 1 && (
                  <div
                    style={{
                      height: "1px",
                      background: "var(--border-subtle)",
                    }}
                  />
                )}
              </li>
            ))}
          </ol>

          {/* ── Footer note ── */}
          <div className="divider" />
          <footer
            className="flex items-start gap-3 rounded-xl p-5"
            style={{
              background: "var(--glass-brand-xs)",
              border: "1px solid var(--border-brand)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2"
              style={{ background: "var(--brand-400)" }}
            />
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-200)", lineHeight: "var(--leading-normal)" }}>
              If you have questions about these Terms, please contact our support team.
              Thank you for choosing{" "}
              <span style={{ color: "var(--brand-400)", fontWeight: 600 }}>
                Web3GlobalVault
              </span>{" "}
              — Where Finance Meets the Future.
            </p>
          </footer>

        </div>
      </div>
    </main>
  );
}
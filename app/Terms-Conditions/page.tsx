import React from 'react';

// Terms & Conditions page for the Web3GlobalVaulting site
// Uses Tailwind CSS className utilities and Web3GlobalVaultcolor theme (gold & black)

export default function TermsAndConditions() {
  return (
    <main className="min-h-screen bg-black text-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white/5 border border-gray-800 rounded-2xl shadow-lg p-8">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-amber-400">Web3GlobalVault — Terms &amp; Conditions</h1>
          <span className="text-sm text-gray-400">Last updated: September 11, 2025</span>
        </header>

        <section className="prose prose-invert max-w-none">
          <p className="mb-4">Welcome to Genesis. These Terms &amp; Conditions ("Terms") govern your access to and use of our services. By using Web3GlobalVaultservices, you agree to these Terms. Please read them carefully.</p>

          <ol className="list-decimal pl-6 space-y-4" aria-label="Terms and Conditions list">
            <li className="term-item">
              <h3 className="term-title font-semibold text-lg text-amber-300">1. Acceptance of Terms</h3>
              <p className="term-desc text-sm text-gray-300">By signuping for or using any Web3GlobalVaultservices, you accept and agree to be bound by these Terms and our Privacy Policy.</p>
            </li>

            <li className="term-item">
              <h3 className="term-title font-semibold text-lg text-amber-300">2. Eligibility</h3>
              <p className="term-desc text-sm text-gray-300">You must be at least 18 years old (or the legal age in your jurisdiction) to use our services. You represent and warrant that you meet this requirement.</p>
            </li>

            <li className="term-item">
              <h3 className="term-title font-semibold text-lg text-amber-300">3. Account Security</h3>
              <p className="term-desc text-sm text-gray-300">You are responsible for maintaining the confidentiality of your account credentials. Notify Web3GlobalVaultimmediately of any unauthorized use.</p>
            </li>

            <li className="term-item">
              <h3 className="term-title font-semibold text-lg text-amber-300">4. Use of Services</h3>
              <p className="term-desc text-sm text-gray-300">Services are provided for lawful personal or business use only. You agree not to use Web3GlobalVaultfor illegal activities or in violation of applicable laws.</p>
            </li>

            <li className="term-item">
              <h3 className="term-title font-semibold text-lg text-amber-300">5. Fees and Charges</h3>
              <p className="term-desc text-sm text-gray-300">Certain services may incur fees. All fees will be disclosed prior to charging and are governed by the applicable fee schedule.</p>
            </li>

            <li className="term-item">
              <h3 className="term-title font-semibold text-lg text-amber-300">6. Transactions and Limits</h3>
              <p className="term-desc text-sm text-gray-300">Transaction processing, limits, and settlement times are subject to our policies. Web3GlobalVaultis not liable for delays caused by third parties.</p>
            </li>

            <li className="term-item">
              <h3 className="term-title font-semibold text-lg text-amber-300">7. Privacy and Data</h3>
              <p className="term-desc text-sm text-gray-300">Your use of Web3GlobalVaultis subject to our Privacy Policy which explains how we collect, use, and protect your personal information.</p>
            </li>

            <li className="term-item">
              <h3 className="term-title font-semibold text-lg text-amber-300">8. Intellectual Property</h3>
              <p className="term-desc text-sm text-gray-300">All content, logos, and trademarks on the site are owned by Web3GlobalVaultor our licensors. You may not reproduce or misuse them without permission.</p>
            </li>

            <li className="term-item">
              <h3 className="term-title font-semibold text-lg text-amber-300">9. Disclaimers</h3>
              <p className="term-desc text-sm text-gray-300">Services are provided "as is" without warranties to the fullest extent permitted by law. Web3GlobalVaultdisclaims implied warranties of merchantability and fitness for a particular purpose.</p>
            </li>

            <li className="term-item">
              <h3 className="term-title font-semibold text-lg text-amber-300">10. Limitation of Liability</h3>
              <p className="term-desc text-sm text-gray-300">To the maximum extent permitted by law, Web3GlobalVaultwill not be liable for indirect, incidental, or consequential damages arising from your use of the services.</p>
            </li>

            <li className="term-item">
              <h3 className="term-title font-semibold text-lg text-amber-300">11. Modification of Terms</h3>
              <p className="term-desc text-sm text-gray-300">Web3GlobalVaultmay modify these Terms from time to time. We will notify you of material changes through the app or by email; continued use constitutes acceptance.</p>
            </li>

            <li className="term-item">
              <h3 className="term-title font-semibold text-lg text-amber-300">12. Governing Law &amp; Contact</h3>
              <p className="term-desc text-sm text-gray-300">These Terms are governed by the laws of the jurisdiction where Web3GlobalVaultis incorporated. For questions or notices, contact us at <a href="mailto:support@genesis.bank" className="text-amber-300 underline">support@genesis.bank</a>.</p>
            </li>
          </ol>

          <footer className="mt-8 border-t border-gray-800 pt-6">
            <p className="text-sm text-gray-400">If you have questions about these Terms, please contact our support team. Thank you for choosing Web3GlobalVault— Where Finance Meets the Future.</p>
          </footer>
        </section>
      </div>
    </main>
  );
}

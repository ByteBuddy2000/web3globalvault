'use client';

import { ShoppingCart } from 'lucide-react';

const services = [
  {
    name: 'MoonPay',
    url: 'https://buy.moonpay.com', // Replace with your project link from MoonPay dashboard
    description: 'Buy crypto easily with credit/debit card or bank transfer.',
  },
  {
    name: 'Ramp Network',
    url: 'https://app.ramp.network', // Replace with partner link if you have one
    description: 'Global fiat-to-crypto onramp with multiple payment methods.',
  },
  {
    name: 'Transak',
    url: 'https://global.transak.com', // Replace with your integration link
    description: 'Secure crypto purchases with cards, Apple Pay, Google Pay.',
  },
];

export default function BuyPage() {
  return (
    <main className="flex-1 flex flex-col p-6 items-center w-full">
      <div className="card backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-5xl border border-white/6 text-white">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-accent">
          <ShoppingCart className="w-6 h-6" />
          Buy Crypto
        </h2>

        <p className="text-sm text-muted mb-6">
          Choose one of our trusted third-party providers to purchase crypto
          with your preferred payment method.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.name} className="card rounded-xl p-6 flex flex-col items-center text-center transition">
              <h3 className="text-lg font-semibold text-white mb-2">{service.name}</h3>
              <p className="text-xs text-muted mb-4">{service.description}</p>
              <a href={service.url} target="_blank" rel="noopener noreferrer" className="w-full py-2 rounded-lg font-semibold text-black btn-accent hover:opacity-95 transition">
                Continue
              </a>
            </div>
          ))}
        </div>

        {/* Optional: Embed MoonPay iFrame directly */}
        {/* <div className="mt-10">
          <h3 className="text-lg font-semibold mb-3 text-accent">Buy with MoonPay</h3>
          <iframe src="https://buy.moonpay.com/v2/buy" // Replace with project-specific link
            title="MoonPay Buy Widget"
            className="w-full h-[600px] rounded-xl border border-white/6"
            allow="accelerometer; autoplay; camera; gyroscope; payment"
          />
        </div> */}
      </div>
    </main>
  );
}

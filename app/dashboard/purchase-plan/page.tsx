"use client"
import { useState } from "react";
import { Check, X } from "lucide-react";
import { features } from "process";

export default function PricingPlans() {
  const [annual, setAnnual] = useState(false);

  const plans = [
    {
      name: "Silver",
      price: annual ? "$7,500" : "$1029",
      description: "Perfect for beginners or individuals who need core features at an affordable rate.",
      features: [true, true, true],
    },
    {
      name: "Gold",
      price: annual ? "$25,000" : "$10,029",
      description: "Great for growing users who need more power and flexibility.",
      features: [true, true, true, false],
    },
    {
      name: "Premium",
      price: annual ? "$65,000" : "$25,029",
      description: "Ideal for growing professionals and businesses that require high performance.",
      features: [true, true, true, true],
      highlight: true,
    },
    {
      name: "Diamond",
      price: annual ? "$1,000,000" : "$65,029",
      description: "The ultimate plan for enterprises and power users who demand the best.",
      features: [true, true, true, true],
    },
  ];

  const featureList = [
    "Minimum deposit",
    "Maximum deposit",
    "Expected Return",
  ];

  return (
    <div className="min-h-screen text-[#000] bg-gray-50 bg-[url('/pattern.svg')] bg-cover bg-center flex flex-col items-center py-16 px-4">
      
      {/* Heading */}
      <div className="text-center mb-12 max-w-xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-2">The Right Plan for Your Business</h2>
        <p className="text-[#000]">Choose the plan that suits your needs and scale with confidence.</p>
      </div>

      {/* Toggle */}
      <div className="flex items-center gap-2 mb-10">
        <span className={!annual ? "font-bold" : "text-gray-500"}>Bill Monthly</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" checked={annual} onChange={() => setAnnual(!annual)} />
          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-500 rounded-full peer peer-checked:bg-yellow-500"></div>
          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
        </label>
        <span className={annual ? "font-bold" : "text-gray-500"}>Bill Annually</span>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl w-full">
        {plans.map((plan, idx) => (
          <div key={idx} className={`flex flex-col justify-between rounded-2xl p-6 shadow-lg ${plan.highlight ? "bg-yellow-100 border-2 border-yellow-500" : "bg-white"}`}> 

            {/* Plan Header */}
            <div>
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <p className="text-gray-600 mb-4">{plan.description}</p>
              <p className="text-3xl font-bold mb-6">{plan.price} <span className="text-sm text-gray-500">{annual ? "/year" : "/month"}</span></p>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-6">
              {featureList.map((feature, fIdx) => (
                <li key={fIdx} className={`flex items-center gap-2 ${plan.features[fIdx] ? "" : "text-gray-400"}`}>
                  {plan.features[fIdx] ? <Check className="text-green-500 w-4 h-4" /> : <X className="w-4 h-4" />}
                  {feature}
                </li>
              ))}
            </ul>

            {/* Button */}
            {plan.highlight ? (
              <button className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition">Choose Plan</button>
            ) : (
              <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-100 transition">Choose Plan</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

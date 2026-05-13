"use client";
import { useState } from "react";
import { CreditCard, Plus } from "lucide-react";

export default function CardsPage() {
  const [cardDetails, setCardDetails] = useState({
    name: "Josh GlobalVault",
    number: "3267 2836 0594 0009",
    expiry: "06/26",
    cvv: "759",
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-10 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-yellow-500 mb-2">Your Cards</h2>
          <p className="text-gray-700 text-base">Manage your virtual and physical cards.</p>
        </div>
        <button className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 shadow-md">
          <Plus className="w-5 h-5" /> <span className="font-semibold">Get a New Card</span>
        </button>
      </div>

      {/* Card Display and Edit Form */}
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl grid md:grid-cols-2 gap-8">
        {/* Card Preview */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-full h-48 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 flex flex-col justify-between shadow-lg">
            <div className="flex justify-between text-sm font-medium">
              <span>VIRTUAL CARD</span>
              <CreditCard />
            </div>
            <div className="text-2xl font-mono tracking-widest">{cardDetails.number}</div>
            <div className="flex justify-between text-sm">
              <div>
                <p className="uppercase text-xs">Card Holder</p>
                <p className="font-bold">{cardDetails.name}</p>
              </div>
              <div>
                <p className="uppercase text-xs">Expires</p>
                <p className="font-bold">{cardDetails.expiry}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div>
          <h3 className="text-xl font-bold text-yellow-600 mb-6">Edit Card Details</h3>
          <form className="space-y-5">
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2">Card Holder</label>
              <input
                type="text"
                className="w-full p-3 bg-white text-gray-800 border border-yellow-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={cardDetails.name}
                onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2">Card Number</label>
              <input
                type="text"
                className="w-full p-3 bg-white text-gray-800 border border-yellow-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={cardDetails.number}
                onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
              />
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-base font-semibold text-gray-800 mb-2">Expiry Date</label>
                <input
                  type="text"
                  className="w-full p-3 bg-white text-gray-800 border border-yellow-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  value={cardDetails.expiry}
                  onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                />
              </div>
              <div className="w-1/2">
                <label className="block text-base font-semibold text-gray-800 mb-2">CVV</label>
                <input
                  type="text"
                  className="w-full p-3 bg-white text-gray-800 border border-yellow-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  value={cardDetails.cvv}
                  onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                />
              </div>
            </div>
            <button className="w-full bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600 font-semibold shadow-md">
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

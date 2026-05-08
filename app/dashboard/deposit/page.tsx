"use client";

import { useState, useEffect } from "react";
import { CreditCard, Banknote, Bitcoin, Copy } from "lucide-react";
import QRCode from "qrcode";

/* ---------------- HELPERS ---------------- */

function getCardType(number: string) {
  const n = number.replace(/\s/g, "");
  if (/^4/.test(n)) return "Visa";
  if (/^5[1-5]/.test(n)) return "MasterCard";
  if (/^3[47]/.test(n)) return "American Express";
  if (/^6(?:011|5)/.test(n)) return "Discover";
  return "Unknown";
}

/* ---------------- COMPONENT ---------------- */

export default function DepositPage() {
  const [depositMethod, setDepositMethod] = useState("bank");
  const [crypto, setCrypto] = useState("BTC");
  const [network, setNetwork] = useState("Bitcoin");

  // Bank
  const [bankAmount, setBankAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAcct, setBankAcct] = useState("");
  const [bankError, setBankError] = useState("");

  // Card
  const [cardAmount, setCardAmount] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");
  const [cardError, setCardError] = useState("");

  // Crypto
  const [cryptoError, setCryptoError] = useState("");

  // QR code data URL
  const [qrCode, setQrCode] = useState<string | null>(null);

  const cryptoAddresses: Record<string, Record<string, string>> = {
    BTC: { Bitcoin: "bc1qpycmsxnlarnay4jgwa3y535m802qevq7ffnp5x" },
    ETH: {
      ERC20: "0xD41DCAc22335d26a391F97C4a9DdE1b2745936b3",
    },
    USDT: {
      ERC20: "0xD41DCAc22335d26a391F97C4a9DdE1b2745936b3",
      TRC20: "TAtGDx2KpwrcFnY4qcSQgzGy4aEkajKEZ9",
    },
  };

  const selectedAddress = cryptoAddresses[crypto][network];

  /* ---------------- QR CODE ---------------- */

  useEffect(() => {
    const generateQR = async () => {
      try {
        if (!selectedAddress) return;

        const qrDataUrl = await QRCode.toDataURL(selectedAddress, {
          errorCorrectionLevel: "H",
          type: "image/png",
          margin: 1,
          width: 300,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });

        setQrCode(qrDataUrl);
      } catch (err) {
        console.error("QR generation error:", err);
        setCryptoError("Failed to generate QR code");
      }
    };

    generateQR();
  }, [selectedAddress]);

  /* ---------------- VALIDATION ---------------- */

  const validateBank = () => {
    if (!bankAmount || Number(bankAmount) <= 0) {
      setBankError("Enter a valid amount.");
      return false;
    }
    if (!bankName.trim()) {
      setBankError("Bank name is required.");
      return false;
    }
    if (!/^\d{10,}$/.test(bankAcct)) {
      setBankError("Enter a valid account number.");
      return false;
    }
    setBankError("");
    return true;
  };

  const validateCard = () => {
    if (!cardAmount || Number(cardAmount) <= 0) {
      setCardError("Enter a valid amount.");
      return false;
    }
    if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ""))) {
      setCardError("Invalid card number.");
      return false;
    }
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      setCardError("Expiry must be MM/YY.");
      return false;
    }
    if (!/^\d{3}$/.test(cardCVV)) {
      setCardError("CVV must be 3 digits.");
      return false;
    }
    setCardError("");
    return true;
  }

  function validateCrypto() {
    setCryptoError("");
    return true;
  }

  const handleBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateBank()) alert("Bank deposit submitted");
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateCard()) {
      alert("Card payment submitted!");
    }
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-10">
        <h2 className="text-3xl font-bold text-accent mb-2">Deposit Funds</h2>
        <p className="text-muted">Select your preferred method to deposit into your account.</p>
      </div>

      {/* Method Selector */}
      <div className="max-w-3xl mx-auto flex justify-center gap-4 mb-8">
        {[
          { method: "bank", label: "Bank Deposit", icon: <Banknote className="w-4 h-4" /> },
          { method: "card", label: "Card Payment", icon: <CreditCard className="w-4 h-4" /> },
          { method: "crypto", label: "Crypto Deposit", icon: <Bitcoin className="w-4 h-4" /> },
        ].map(({ method, label, icon }) => (
          <button
            key={method}
            onClick={() => setDepositMethod(method)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg shadow text-sm transition-all duration-300
              ${
                depositMethod === method
                  ? "btn-accent"
                  : "bg-black/20 text-white/80 hover:bg-black/30 border border-white/6"
              }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* Deposit Forms */}
      <div className="max-w-3xl mx-auto card p-6 rounded-2xl shadow-xl">
        {/* Bank Deposit */}
        {depositMethod === "bank" && (
          <>
            <h3 className="text-xl font-bold text-accent mb-6">Bank Deposit</h3>
            <form className="space-y-6" onSubmit={handleBankSubmit}>
              <div>
                <label className="block text-sm font-semibold text-muted mb-2">Amount (USD)</label>
                <input type="number" value={bankAmount} onChange={e => setBankAmount(e.target.value)} className="w-full p-3 bg-black/20 text-white border border-white/6 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent" placeholder="Enter amount" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-muted mb-2">Bank Name</label>
                <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} className="w-full p-3 bg-black/20 text-white border border-white/6 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent" placeholder="Enter bank name" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-muted mb-2">Account Number</label>
                <input type="text" value={bankAcct} onChange={e => setBankAcct(e.target.value)} className="w-full p-3 bg-black/20 text-white border border-white/6 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent" placeholder="Enter account number" />
              </div>
              {bankError && (
                <div className="text-red-400 text-sm mb-2">{bankError}</div>
              )}
              <button className="w-full btn-accent text-black py-3 rounded-lg font-semibold text-lg shadow-md transition">
                Proceed
              </button>
            </form>
          </>
        )}

        {/* CARD */}
        {depositMethod === "card" && (
          <>
            <h3 className="text-xl font-bold text-yellow-500 mb-6">Card Payment</h3>
            <form className="space-y-6" onSubmit={handleCardSubmit}>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Amount (USD)</label>
                <input
                  type="number"
                  value={cardAmount}
                  onChange={e => setCardAmount(e.target.value)}
                  className="w-full p-3 bg-black/40 text-white border border-yellow-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                  className="w-full p-3 bg-black/40 text-white border border-yellow-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="**** **** **** ****"
                />
                {cardNumber && (
                  <div className="text-xs text-yellow-400 mt-1">
                    Card Type: {getCardType(cardNumber)}
                  </div>
                )}
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Expiry Date</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={e => setCardExpiry(e.target.value)}
                    className="w-full p-3 bg-black/40 text-white border border-yellow-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="MM/YY"
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">CVV</label>
                  <input
                    type="text"
                    value={cardCVV}
                    onChange={e => setCardCVV(e.target.value)}
                    className="w-full p-3 bg-black/40 text-white border border-yellow-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="123"
                  />
                </div>
              </div>
              {cardError && (
                <div className="text-red-400 text-sm mb-2">{cardError}</div>
              )}
              <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-lg font-semibold text-lg shadow-md transition">
                Proceed
              </button>
            </form>
          </>
        )}

        {/* CRYPTO */}
        {depositMethod === "crypto" && (
          <>
            <h3 className="text-xl font-bold text-yellow-500 mb-6">Crypto Deposit</h3>

            {/* Select Crypto */}
            <div className="flex gap-4 mb-6">
              {["BTC", "ETH", "USDT"].map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setCrypto(c);
                    setNetwork(Object.keys(cryptoAddresses[c])[0]);
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    crypto === c
                      ? "bg-yellow-500 text-white"
                      : "bg-black/40 text-gray-300 hover:bg-yellow-500/20"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Select Network */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-300 mb-2">Select Network</label>
              <select
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
                className="w-full p-3 bg-black/40 text-white border border-yellow-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                {Object.keys(cryptoAddresses[crypto]).map((net) => (
                  <option key={net} value={net}>
                    {net}
                  </option>
                ))}
              </select>
            </div>

            {/* Wallet Address */}
            <div className="bg-black/60 px-4 py-4 rounded-lg flex justify-between items-center mb-6 shadow-sm border border-yellow-500">
              <span className="font-mono text-base font-semibold text-yellow-300 break-all">
                {selectedAddress}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(selectedAddress)}
                className="flex items-center gap-1 text-xs bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
              >
                <Copy className="w-4 h-4" /> Copy
              </button>
            </div>

            {/* QR Code */}
            <div className="text-center">
              <img
                src={qrCode ?? `/${crypto.toLowerCase()}-qr.png`}
                alt={`${crypto} QR Code`}
                className="mx-auto w-44 h-44 mb-4 rounded border border-yellow-300 shadow"
              />
              <p className="text-gray-400 text-sm">Scan the QR code to deposit {crypto} directly via {network}.</p>
            </div>
            {cryptoError && (
              <div className="text-red-400 text-sm mt-2">{cryptoError}</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

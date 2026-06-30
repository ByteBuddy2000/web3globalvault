"use client";

import { useState, useEffect } from "react";
import { CreditCard, Banknote, Bitcoin, Copy, Check } from "lucide-react";
import QRCode from "qrcode";
import { KYCGuard } from "@/components/KYCGuard";

/* ---------------- HELPERS ---------------- */

function getCardType(number: string) {
  const n = number.replace(/\s/g, "");
  if (/^4/.test(n)) return "Visa";
  if (/^5[1-5]/.test(n)) return "MasterCard";
  if (/^3[47]/.test(n)) return "American Express";
  if (/^6(?:011|5)/.test(n)) return "Discover";
  return "Unknown";
}

/* ---------------- COMPONENT CONTENT ---------------- */

function DepositContent() {
  const [depositMethod, setDepositMethod] = useState("bank");
  const [crypto, setCrypto] = useState("BTC");
  const [network, setNetwork] = useState("Bitcoin");
  const [copied, setCopied] = useState(false);

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
    BTC: {
      Bitcoin: "bc1q876w5vxqlpgzyyxzhxr24chalg5z74ztvp75dp",
    },
    ETH: {
      ERC20: "0xfE09a5D6Cd24f4E6172627011b85866DE3fBf447",
    },
    USDT: {
      ERC20: "0xfE09a5D6Cd24f4E6172627011b85866DE3fBf447",
      TRC20: "TRr2kB36MdKnXanodWFyp5D9zub1tLxpCm",
      BEP20: "0x8a3F1c2E6B47d9aA0c1e2D8f3B9e7Ad4C5f1E2B6",
    },
    BNB: {
      BEP20: "0xfE09a5D6Cd24f4E6172627011b85866DE3fBf447",
    },
    SOL: {
      Solana: "GtVu1NbCoowWyfknjrWe9ajL4BDF74MjkcitryVpa3bh",
    },
    XRP:{
      Xrp: "rp5PMThCE9FtANy7ULtN4X43fNf7oXW6mt"
    }
  };

  const networks = Object.keys(cryptoAddresses[crypto]);
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
  };

  const handleBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateBank()) alert("Bank deposit submitted");
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateCard()) {
      alert("Card payment submitted!");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen w-full px-4 py-8 sm:p-6 max-w-4xl mx-auto flex flex-col justify-center">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-accent mb-2">Deposit Funds</h2>
        <p className="text-text-200 text-sm sm:text-base">
          Select your preferred method to deposit into your account.
        </p>
      </div>

      {/* Method Selector */}
      <div className="max-w-3xl mx-auto w-full grid grid-cols-3 sm:flex sm:justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
        {[
          { method: "bank", label: "Bank", fullLabel: "Bank Deposit", icon: <Banknote className="w-4 h-4 shrink-0" /> },
          { method: "card", label: "Card", fullLabel: "Card Payment", icon: <CreditCard className="w-4 h-4 shrink-0" /> },
          { method: "crypto", label: "Crypto", fullLabel: "Crypto Deposit", icon: <Bitcoin className="w-4 h-4 shrink-0" /> },
        ].map(({ method, label, fullLabel, icon }) => (
          <button
            key={method}
            onClick={() => setDepositMethod(method)}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2.5 sm:py-2 border rounded-lg shadow text-xs sm:text-sm transition-all duration-300 ${
              depositMethod === method
                ? "btn-primary"
                : "bg-surface-300 text-text-200 hover:bg-surface-400 border border-white/10"
            }`}
          >
            {icon}
            <span className="sm:hidden">{label}</span>
            <span className="hidden sm:inline">{fullLabel}</span>
          </button>
        ))}
      </div>

      {/* Deposit Forms */}
      <div className="max-w-3xl mx-auto w-full bg-surface-200 p-4 sm:p-6 rounded-xl border border-white/10 shadow-xl">
        {/* Bank Deposit */}
        {depositMethod === "bank" && (
          <>
            <h3 className="text-lg sm:text-xl font-bold text-accent mb-5 sm:mb-6">Bank Deposit</h3>
            <form className="space-y-5 sm:space-y-6" onSubmit={handleBankSubmit}>
              <div>
                <label className="block text-sm font-semibold text-text-100 mb-2">Amount (USD)</label>
                <input
                  type="number"
                  value={bankAmount}
                  onChange={(e) => setBankAmount(e.target.value)}
                  className="w-full p-3 bg-surface-300 text-white border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm sm:text-base"
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-100 mb-2">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full p-3 bg-surface-300 text-white border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm sm:text-base"
                  placeholder="Enter bank name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-100 mb-2">Account Number</label>
                <input
                  type="text"
                  value={bankAcct}
                  onChange={(e) => setBankAcct(e.target.value)}
                  className="w-full p-3 bg-surface-300 text-white border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm sm:text-base"
                  placeholder="Enter account number"
                />
              </div>
              {bankError && <div className="text-danger-400 text-sm mb-2">{bankError}</div>}
              <button className="w-full btn-primary py-3 rounded-lg font-semibold text-base sm:text-lg shadow-md transition">
                Proceed
              </button>
            </form>
          </>
        )}

        {/* CARD */}
        {depositMethod === "card" && (
          <>
            <h3 className="text-lg sm:text-xl font-bold text-accent mb-5 sm:mb-6">Card Payment</h3>
            <form className="space-y-5 sm:space-y-6" onSubmit={handleCardSubmit}>
              <div>
                <label className="block text-sm font-semibold text-text-100 mb-2">Amount (USD)</label>
                <input
                  type="number"
                  value={cardAmount}
                  onChange={(e) => setCardAmount(e.target.value)}
                  className="w-full p-3 bg-surface-300 text-white border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm sm:text-base"
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-100 mb-2">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full p-3 bg-surface-300 text-white border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm sm:text-base"
                  placeholder="**** **** **** ****"
                />
                {cardNumber && (
                  <div className="text-xs text-accent mt-1">Card Type: {getCardType(cardNumber)}</div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text-100 mb-2">Expiry Date</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full p-3 bg-surface-300 text-white border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm sm:text-base"
                    placeholder="MM/YY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-100 mb-2">CVV</label>
                  <input
                    type="text"
                    value={cardCVV}
                    onChange={(e) => setCardCVV(e.target.value)}
                    className="w-full p-3 bg-surface-300 text-white border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm sm:text-base"
                    placeholder="123"
                  />
                </div>
              </div>
              {cardError && <div className="text-danger-400 text-sm mb-2">{cardError}</div>}
              <button className="w-full btn-primary py-3 rounded-lg font-semibold text-base sm:text-lg shadow-md transition">
                Proceed
              </button>
            </form>
          </>
        )}

        {/* CRYPTO */}
        {depositMethod === "crypto" && (
          <>
            <h3 className="text-lg sm:text-xl font-bold text-accent mb-5 sm:mb-6">Crypto Deposit</h3>

            {/* Select Crypto */}
            <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
              {Object.keys(cryptoAddresses).map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setCrypto(c);
                    setNetwork(Object.keys(cryptoAddresses[c])[0]);
                  }}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    crypto === c
                      ? "btn-primary"
                      : "bg-surface-300 text-text-200 hover:bg-surface-400"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Select Network */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-text-100 mb-2">Select Network</label>
              <select
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
                className="w-full p-3 bg-surface-300 text-white border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm sm:text-base"
              >
                {networks.map((net) => (
                  <option key={net} value={net}>
                    {net}
                  </option>
                ))}
              </select>
            </div>

            {/* Wallet Address */}
            <div className="bg-surface-300 px-4 py-4 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 border border-white/10">
              <span className="font-mono text-xs sm:text-base font-semibold text-accent break-all">
                {selectedAddress}
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-1 text-xs btn-primary px-3 py-2 rounded transition self-start sm:self-auto shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            {/* QR Code */}
            <div className="text-center">
              <img
                src={qrCode ?? `/${crypto.toLowerCase()}-qr.png`}
                alt={`${crypto} QR Code`}
                className="mx-auto w-36 h-36 sm:w-44 sm:h-44 mb-4 rounded border border-white/10 shadow"
              />
              <p className="text-text-200 text-xs sm:text-sm px-2">
                Scan the QR code to deposit {crypto} directly via {network}.
              </p>
            </div>
            {cryptoError && <div className="text-danger-400 text-sm mt-2">{cryptoError}</div>}
          </>
        )}
      </div>
    </div>
  );
}

export default function DepositPage() {
  return (
    <div className="flex min-h-screen text-white justify-center items-center">
      <KYCGuard requiredFor="make deposits">
        <div className="w-full">
          <DepositContent />
        </div>
      </KYCGuard>
    </div>
  );
}
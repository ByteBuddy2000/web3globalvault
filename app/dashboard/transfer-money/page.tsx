// Transfer Money Page
"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Send,
  Banknote,
  Globe,
  Bitcoin,
  User as UserIcon,
  Loader2,
} from "lucide-react";

export default function TransferMoneyPage() {
  const [transferType, setTransferType] = useState<"local" | "international" | "crypto">("local");
  const [transferData, setTransferData] = useState({
    recipient: "",
    accountNumber: "",
    country: "",
    amount: "",
    cryptoType: "BTC",
    walletAddress: "",
    note: "",
  });
  const [recipientName, setRecipientName] = useState<string | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const lookupTimer = useRef<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTransferData((prev) => ({ ...prev, [name]: value }));

    if (name === "accountNumber") {
      setRecipientName(null);
      setLookupError(null);
      if (lookupTimer.current) window.clearTimeout(lookupTimer.current);
      lookupTimer.current = window.setTimeout(() => {
        lookupRecipient(value);
      }, 600);
    }
  };

  const lookupRecipient = async (accountNumber: any) => {
    const acct = String(accountNumber || "").trim();
    if (!acct) return;
    setLookupLoading(true);
    setLookupError(null);
    setRecipientName(null);
    try {
      const res = await fetch(`/api/users/lookup?account=${encodeURIComponent(acct)}`, {
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.found && json?.name) {
          setRecipientName(json.name);
        } else {
          setLookupError("Account not found");
        }
      } else if (res.status === 404) {
        setLookupError("Account not found");
      } else {
        setLookupError("Lookup failed");
      }
    } catch {
      setLookupError("Network error");
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (transferType === "local" && !recipientName) {
      alert("Please confirm recipient name before sending.");
      return;
    }
    if (!transferData.amount || Number(transferData.amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    try {
      const payload = {
        type: transferType,
        ...transferData,
      };
      const res = await fetch("/api/transfer", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setTransferData({
          recipient: "",
          accountNumber: "",
          country: "",
          amount: "",
          cryptoType: "BTC",
          walletAddress: "",
          note: "",
        });
        setRecipientName(null);
        alert("✅ Transfer submitted successfully.");
      } else {
        const j = await res.json().catch(() => ({}));
        alert("❌ Transfer failed: " + (j?.message || res.statusText));
      }
    } catch {
      alert("Network error while sending transfer.");
    }
  };

  useEffect(() => {
    return () => {
      if (lookupTimer.current) window.clearTimeout(lookupTimer.current);
    };
  }, []);

  return (
    <div className="min-h-screen px-4 sm:px-6 py-8" style={{ background: 'var(--void-0)' }}>
      <div className="max-w-2xl mx-auto rounded-2xl shadow-lg p-6 sm:p-8" style={{ background: 'var(--card)', border: '1px solid var(--surface-border)' }}>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2" style={{ color: 'var(--cyan-500)' }}>
            <Send className="w-6 h-6" />
            Transfer Money
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Send funds locally, internationally, or via crypto — securely.
          </p>
        </div>

        <div className="flex justify-center gap-3 mb-8 flex-wrap">
          {{
            local: { label: "Local", icon: Banknote },
            international: { label: "International", icon: Globe },
            crypto: { label: "Crypto", icon: Bitcoin },
          }[transferType] && (
            <button
              onClick={() => setTransferType(transferType)}
              type="button"
              className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-medium"
              style={{
                background: transferType === transferType ? 'var(--cyan-500)' : 'var(--input)',
                color: transferType === transferType ? 'var(--void-0)' : 'var(--text-secondary)',
              }}
            >
              {{
                local: <Banknote className="w-4 h-4" />,
                international: <Globe className="w-4 h-4" />,
                crypto: <Bitcoin className="w-4 h-4" />,
              }[transferType]}
              {{
                local: "Local",
                international: "International",
                crypto: "Crypto",
              }[transferType]}
            </button>
          )}
        </div>

        <form onSubmit={handleSend} className="space-y-5">
          {transferType === "local" && (
            <>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Recipient Account Number
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={transferData.accountNumber}
                  onChange={handleChange}
                  className="w-full rounded-lg px-3 py-3 focus:ring-2"
                  style={{
                    background: 'var(--input)',
                    border: '1px solid var(--surface-border)',
                    color: 'var(--text-primary)',
                  }}
                  placeholder="Enter recipient account number"
                  required
                />
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <label className="block text-gray-400 text-sm mb-1">
                    Amount (USD)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={transferData.amount}
                    onChange={handleChange}
                    className="w-full bg-black/20 border border-white/6 rounded-lg px-3 py-3 focus:ring-2 focus:ring-accent text-white"
                    placeholder="Enter amount"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="w-44">
                  <label className="block text-gray-400 text-sm mb-1">
                    Recipient
                  </label>
                  <div className="h-[52px] flex items-center justify-center rounded-lg border border-gray-700 bg-[#1c1c22]">
                    {lookupLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-accent" />
                    ) : recipientName ? (
                      <div className="flex items-center gap-2 text-green-400">
                        <UserIcon className="w-5 h-5" />
                        <span className="text-sm">{recipientName}</span>
                      </div>
                    ) : lookupError ? (
                      <span className="text-sm text-red-400">{lookupError}</span>
                    ) : (
                      <span className="text-sm text-muted">Awaiting</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">
                  Note (optional)
                </label>
                <textarea
                  name="note"
                  value={transferData.note}
                  onChange={handleChange}
                  className="w-full bg-black/20 border border-white/6 rounded-lg px-3 py-3 focus:ring-2 focus:ring-accent text-white"
                  rows={2}
                  placeholder="Add a note"
                />
              </div>
            </>
          )}

          {transferType === "international" && (
            <>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    name="recipient"
                    value={transferData.recipient}
                    onChange={handleChange}
                    className="w-full bg-[#1c1c22] border border-gray-700 rounded-lg px-3 py-3 focus:ring-2 focus:ring-yellow-400 text-gray-100"
                    placeholder="Full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">
                    Account Number / IBAN
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={transferData.accountNumber}
                    onChange={handleChange}
                    className="w-full bg-[#1c1c22] border border-gray-700 rounded-lg px-3 py-3 focus:ring-2 focus:ring-yellow-400 text-gray-100"
                    placeholder="Account number or IBAN"
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={transferData.country}
                    onChange={handleChange}
                    className="w-full bg-[#1c1c22] border border-gray-700 rounded-lg px-3 py-3 focus:ring-2 focus:ring-yellow-400 text-gray-100"
                    placeholder="Destination country"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">
                    Amount (USD)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={transferData.amount}
                    onChange={handleChange}
                    className="w-full bg-[#1c1c22] border border-gray-700 rounded-lg px-3 py-3 focus:ring-2 focus:ring-yellow-400 text-gray-100"
                    placeholder="Enter amount"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">
                  Note (optional)
                </label>
                <textarea
                  name="note"
                  value={transferData.note}
                  onChange={handleChange}
                  className="w-full bg-[#1c1c22] border border-gray-700 rounded-lg px-3 py-3 focus:ring-2 focus:ring-yellow-400 text-gray-100"
                  rows={2}
                  placeholder="Add a note"
                />
              </div>
            </>
          )}

          {transferType === "crypto" && (
            <>
              <div>
                <label className="block text-gray-400 text-sm mb-1">
                  Crypto Type
                </label>
                <select
                  name="cryptoType"
                  value={transferData.cryptoType}
                  onChange={handleChange}
                  className="w-full bg-[#1c1c22] border border-gray-700 rounded-lg px-3 py-3 focus:ring-2 focus:ring-yellow-400 text-gray-100"
                >
                  <option value="BTC">Bitcoin (BTC)</option>
                  <option value="USDT">Tether (USDT)</option>
                  <option value="ETH">Ethereum (ETH)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">
                  Wallet Address
                </label>
                <input
                  type="text"
                  name="walletAddress"
                  value={transferData.walletAddress}
                  onChange={handleChange}
                  className="w-full bg-[#1c1c22] border border-gray-700 rounded-lg px-3 py-3 focus:ring-2 focus:ring-yellow-400 text-gray-100"
                  placeholder="Enter wallet address"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">
                  Amount ({transferData.cryptoType})
                </label>
                <input
                  type="number"
                  name="amount"
                  value={transferData.amount}
                  onChange={handleChange}
                  className="w-full bg-[#1c1c22] border border-gray-700 rounded-lg px-3 py-3 focus:ring-2 focus:ring-yellow-400 text-gray-100"
                  placeholder={`Enter amount in ${transferData.cryptoType}`}
                  min="0"
                  step="0.00000001"
                  required
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={
              (transferType === "local" &&
                (!recipientName || lookupLoading || Number(transferData.amount) <= 0)) ||
              (transferType === "international" &&
                (!transferData.recipient || !transferData.accountNumber || Number(transferData.amount) <= 0)) ||
              (transferType === "crypto" &&
                (!transferData.walletAddress || Number(transferData.amount) <= 0))
            }
            className="w-full bg-yellow-400 text-black py-3 rounded-lg hover:bg-yellow-300 transition-all font-semibold flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" /> Send Money
          </button>
        </form>
      </div>
    </div>
  );
}

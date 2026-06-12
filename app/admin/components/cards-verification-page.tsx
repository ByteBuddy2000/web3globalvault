"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, X, Loader, AlertCircle, CheckCircle2, Eye, EyeOff, Copy } from "lucide-react";

type PendingCard = {
  _id: string;
  user: { fullName: string; email: string };
  tierLevel: string;
  paymentAmount: number;
  transactionHash: string;
  usdtAddress: string;
  requestStatus: string;
  transactionVerifiedAt: string;
  cardNumber: string;
};

export default function AdminCardsVerificationPage() {
  const [pendingCards, setPendingCards] = useState<PendingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<PendingCard | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [revealHash, setRevealHash] = useState(false);
  const [rejectionNotes, setRejectionNotes] = useState("");

  useEffect(() => {
    fetchPendingCards();
  }, []);

  const fetchPendingCards = async () => {
    try {
      const res = await fetch("/api/cards/verify", {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const d = await res.json();
        setPendingCards(d.pendingCards || []);
      } else {
        toast.error("Failed to load pending cards");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading pending cards");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCard = async (cardId: string) => {
    setProcessing(cardId);
    try {
      const res = await fetch("/api/cards/verify", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId,
          action: "APPROVE",
          notes: "Payment verified and card approved",
        }),
      });

      if (res.ok) {
        const d = await res.json();
        toast.success("Card approved successfully!");
        setPendingCards(pendingCards.filter(c => c._id !== cardId));
        setShowDetails(false);
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to approve card");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error approving card");
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectCard = async (cardId: string) => {
    if (!rejectionNotes.trim()) {
      toast.error("Please enter rejection reason");
      return;
    }

    setProcessing(cardId);
    try {
      const res = await fetch("/api/cards/verify", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId,
          action: "REJECT",
          notes: rejectionNotes,
        }),
      });

      if (res.ok) {
        toast.success("Card rejected");
        setPendingCards(pendingCards.filter(c => c._id !== cardId));
        setShowDetails(false);
        setRejectionNotes("");
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to reject card");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error rejecting card");
    } finally {
      setProcessing(null);
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", minHeight: "400px" }}>
        <Loader size={24} style={{ animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ padding: "0" }}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .card-item:hover { 
          border-color: rgba(99,102,241,0.3);
          background: rgba(99,102,241,0.05);
          transform: translateY(-2px);
        }
      `}</style>

      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: "0", letterSpacing: "-0.02em" }}>
              Card Payment Verification
            </h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "8px 0 0 0" }}>
              Review and approve pending card payment submissions
            </p>
          </div>
          {pendingCards.length > 0 && (
            <div style={{
              padding: "8px 16px", borderRadius: 10,
              background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(129,140,248,0.1))",
              border: "1px solid rgba(99,102,241,0.2)",
              display: "flex", alignItems: "center", gap: 8
            }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", animation: "pulse 2s infinite" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{pendingCards.length} Pending</span>
            </div>
          )}
        </div>
      </div>

      {pendingCards.length === 0 ? (
        <div style={{
          padding: 60, borderRadius: 16, border: "2px dashed rgba(99,102,241,0.2)",
          textAlign: "center", background: "rgba(99,102,241,0.03)",
        }}>
          <CheckCircle2 size={48} style={{ color: "rgba(99,102,241,0.3)", margin: "0 auto 16px" }} />
          <p style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.7)", margin: "0 0 8px 0" }}>All Caught Up!</p>
          <p style={{ color: "rgba(255,255,255,0.4)", margin: 0, fontSize: 13 }}>No pending card payments to verify</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {pendingCards.map((card, idx) => (
            <div
              key={card._id}
              className="card-item"
              style={{
                padding: 20, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.01)", cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                animation: `slideIn 0.4s ease-out ${idx * 50}ms backwards`,
              }}
              onClick={() => {
                setSelectedCard(card);
                setShowDetails(true);
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1.2fr auto", gap: 20, alignItems: "center" }}>
                {/* User Section */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>User</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{card.user.fullName}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>{card.user.email}</div>
                </div>

                {/* Payment Section */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Payment</div>
                  <div style={{ fontSize: 18, fontWeight: 800, background: "linear-gradient(135deg, #6366f1, #818cf8)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    ${card.paymentAmount}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{card.tierLevel} Tier</div>
                </div>

                {/* Hash Section */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Transaction Hash</div>
                  <div style={{ fontSize: 12, fontFamily: "monospace", color: "rgba(99,102,241,0.8)", wordBreak: "break-all", background: "rgba(99,102,241,0.1)", padding: "6px 10px", borderRadius: 6 }}>
                    {card.transactionHash.slice(0, 24)}...
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApproveCard(card._id);
                    }}
                    disabled={processing === card._id}
                    style={{
                      padding: "10px 14px", borderRadius: 8, border: "none",
                      background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", fontWeight: 700, cursor: "pointer",
                      fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                      opacity: processing === card._id ? 0.6 : 1,
                      transition: "all 0.2s",
                      boxShadow: "0 4px 12px rgba(16,185,129,0.2)",
                    }}
                  >
                    {processing === card._id ? <Loader size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Check size={14} />}
                    {processing === card._id ? "Approving..." : "Approve"}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCard(card);
                      setShowDetails(true);
                    }}
                    style={{
                      padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(255,255,255,0.03)", color: "#fff", fontWeight: 600, cursor: "pointer",
                      fontSize: 12, transition: "all 0.2s",
                    }}
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          MODAL: CARD DETAILS & ACTIONS
      ═══════════════════════════════════════════════════════ */}
      {showDetails && selectedCard && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
            background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)",
          }}
          onClick={() => setShowDetails(false)}
        >
          <div
            style={{
              width: "100%", maxWidth: 540, borderRadius: 20, padding: 32,
              background: "#0c0c14", border: "1px solid rgba(99,102,241,0.2)",
              boxShadow: "0 48px 96px rgba(0,0,0,0.7), 0 0 40px rgba(99,102,241,0.1)",
              maxHeight: "90vh", overflowY: "auto",
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: "0", letterSpacing: "-0.01em" }}>Verify Payment</h2>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "6px 0 0 0" }}>Review card payment details</p>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                style={{
                  width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
                  background: "transparent", color: "rgba(255,255,255,0.5)", cursor: "pointer",
                  fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s",
                }}
              >
                ×
              </button>
            </div>

            {/* User Info */}
            <div style={{ padding: 18, borderRadius: 14, background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(129,140,248,0.05))", border: "1px solid rgba(99,102,241,0.15)", marginBottom: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>👤 User Information</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 6, fontWeight: 600 }}>Full Name</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{selectedCard.user.fullName}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 6, fontWeight: 600 }}>Email</div>
                  <div style={{ fontSize: 13, fontFamily: "monospace", color: "rgba(255,255,255,0.8)" }}>{selectedCard.user.email}</div>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div style={{ padding: 18, borderRadius: 14, background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.05))", border: "1px solid rgba(16,185,129,0.15)", marginBottom: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>💰 Payment Details</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 6, fontWeight: 600 }}>Amount</div>
                  <div style={{ fontSize: 20, fontWeight: 800, background: "linear-gradient(135deg, #10b981, #059669)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    ${selectedCard.paymentAmount}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 6, fontWeight: 600 }}>Card Tier</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{selectedCard.tierLevel}</div>
                </div>
              </div>
            </div>

            {/* Payment Address */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>📍 Payment Address (USDT)</div>
              <div style={{
                padding: 14, borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
                fontFamily: "monospace", fontSize: 11, wordBreak: "break-all", color: "#fff", lineHeight: 1.6
              }}>
                {selectedCard.usdtAddress}
              </div>
              <button
                onClick={() => copyText(selectedCard.usdtAddress)}
                style={{
                  marginTop: 10, width: "100%", padding: "9px 12px", borderRadius: 8,
                  border: "1px solid rgba(99,102,241,0.2)", background: "rgba(99,102,241,0.05)",
                  color: "#6366f1", fontWeight: 700, fontSize: 12, cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <Copy size={13} style={{ display: "inline", marginRight: 6 }} />
                Copy Address
              </button>
            </div>

            {/* Transaction Hash */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>🔗 Transaction Hash</div>
              <div style={{
                padding: 14, borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
                fontFamily: "monospace", fontSize: 11, wordBreak: "break-all", color: "#fff",
                display: "flex", alignItems: "flex-start", gap: 12, lineHeight: 1.6
              }}>
                <span style={{ flex: 1 }}>{revealHash ? selectedCard.transactionHash : selectedCard.transactionHash.slice(0, 20) + "..."}</span>
                <button
                  onClick={() => setRevealHash(!revealHash)}
                  style={{ border: "none", background: "none", color: "#6366f1", cursor: "pointer", padding: 0, flexShrink: 0 }}
                  title={revealHash ? "Hide" : "Show"}
                >
                  {revealHash ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <button
                onClick={() => copyText(selectedCard.transactionHash)}
                style={{
                  marginTop: 10, width: "100%", padding: "9px 12px", borderRadius: 8,
                  border: "1px solid rgba(99,102,241,0.2)", background: "rgba(99,102,241,0.05)",
                  color: "#6366f1", fontWeight: 700, fontSize: 12, cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <Copy size={13} style={{ display: "inline", marginRight: 6 }} />
                Copy Hash
              </button>
            </div>

            {/* Verification Actions */}
            <div style={{ padding: 18, borderRadius: 14, background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)", marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>⚡ Verification Action</div>
              
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 8 }}>Rejection Reason (if rejecting)</label>
                <textarea
                  placeholder="e.g., Invalid transaction, Amount mismatch, Transaction not on blockchain..."
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.02)", color: "#fff", fontSize: 12,
                    fontFamily: "inherit", resize: "none", minHeight: 80,
                    transition: "all 0.2s",
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <button
                  onClick={() => handleRejectCard(selectedCard._id)}
                  disabled={processing === selectedCard._id}
                  style={{
                    padding: "11px 16px", borderRadius: 10, border: "none",
                    background: "#f43f5e", color: "#fff", fontWeight: 700, fontSize: 13,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    opacity: processing === selectedCard._id ? 0.6 : 1,
                    boxShadow: "0 4px 12px rgba(244,63,94,0.2)",
                    transition: "all 0.2s",
                  }}
                >
                  {processing === selectedCard._id ? <Loader size={14} style={{ animation: "spin 1s linear infinite" }} /> : <X size={14} />}
                  {processing === selectedCard._id ? "Rejecting..." : "Reject"}
                </button>
                <button
                  onClick={() => handleApproveCard(selectedCard._id)}
                  disabled={processing === selectedCard._id}
                  style={{
                    padding: "11px 16px", borderRadius: 10, border: "none",
                    background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", fontWeight: 700, fontSize: 13,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    opacity: processing === selectedCard._id ? 0.6 : 1,
                    boxShadow: "0 4px 12px rgba(16,185,129,0.2)",
                    transition: "all 0.2s",
                  }}
                >
                  {processing === selectedCard._id ? <Loader size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Check size={14} />}
                  {processing === selectedCard._id ? "Approving..." : "Approve"}
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowDetails(false)}
              style={{
                width: "100%", padding: "10px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)",
                background: "transparent", color: "#fff", fontWeight: 600, cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

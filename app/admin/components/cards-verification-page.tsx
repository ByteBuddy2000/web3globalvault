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
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", margin: "0 0 8px 0" }}>
          Card Payment Verification
        </h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: 0 }}>
          Review and approve/reject pending card payments
        </p>
      </div>

      {pendingCards.length === 0 ? (
        <div style={{
          padding: 40, borderRadius: 12, border: "2px dashed rgba(255,255,255,0.1)",
          textAlign: "center",
        }}>
          <CheckCircle2 size={40} style={{ color: "rgba(255,255,255,0.2)", margin: "0 auto 12px" }} />
          <p style={{ color: "rgba(255,255,255,0.5)" }}>No pending cards to verify</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {pendingCards.map(card => (
            <div
              key={card._id}
              style={{
                padding: 16, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.02)", cursor: "pointer",
                transition: "all 0.2s",
              }}
              onClick={() => {
                setSelectedCard(card);
                setShowDetails(true);
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 16, alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>User</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{card.user.fullName}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{card.user.email}</div>
                </div>

                <div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>Payment Details</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>${card.paymentAmount} USDT</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{card.tierLevel} Tier</div>
                </div>

                <div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>TX Hash</div>
                  <div style={{ fontSize: 11, fontFamily: "monospace", color: "#6366f1", wordBreak: "break-all" }}>
                    {card.transactionHash.slice(0, 20)}...
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApproveCard(card._id);
                    }}
                    disabled={processing === card._id}
                    style={{
                      padding: "8px 12px", borderRadius: 8, border: "none",
                      background: "#10b981", color: "#fff", fontWeight: 600, cursor: "pointer",
                      fontSize: 12, display: "flex", alignItems: "center", gap: 6,
                      opacity: processing === card._id ? 0.5 : 1,
                    }}
                  >
                    {processing === card._id ? <Loader size={14} /> : <Check size={14} />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCard(card);
                      setShowDetails(true);
                    }}
                    style={{
                      padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
                      background: "transparent", color: "#fff", fontWeight: 600, cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    Review
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
            background: "rgba(0,0,0,0.75)",
          }}
          onClick={() => setShowDetails(false)}
        >
          <div
            style={{
              width: "100%", maxWidth: 500, borderRadius: 16, padding: 28,
              background: "#0c0c14", border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 48px 96px rgba(0,0,0,0.7)",
              maxHeight: "90vh", overflowY: "auto",
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#fff", margin: 0 }}>Verify Card Payment</h2>
              <button
                onClick={() => setShowDetails(false)}
                style={{
                  width: 28, height: 28, borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)",
                  background: "transparent", color: "rgba(255,255,255,0.4)", cursor: "pointer",
                  fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                ×
              </button>
            </div>

            {/* User Info */}
            <div style={{ padding: 16, borderRadius: 12, background: "rgba(255,255,255,0.03)", marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 12 }}>User Information</div>
              <div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>Name</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{selectedCard.user.fullName}</div>
              </div>
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>Email</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{selectedCard.user.email}</div>
              </div>
            </div>

            {/* Payment Details */}
            <div style={{ padding: 16, borderRadius: 12, background: "rgba(99,102,241,0.1)", marginBottom: 16, border: "1px solid rgba(99,102,241,0.2)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", textTransform: "uppercase", marginBottom: 12 }}>Payment Details</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>Amount</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#6366f1" }}>${selectedCard.paymentAmount}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>Tier</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#6366f1" }}>{selectedCard.tierLevel}</div>
                </div>
              </div>
            </div>

            {/* Payment Address */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 8 }}>Payment Address (USDT)</div>
              <div style={{
                padding: 12, borderRadius: 8, background: "rgba(255,255,255,0.03)",
                fontFamily: "monospace", fontSize: 11, wordBreak: "break-all", color: "#fff",
              }}>
                {selectedCard.usdtAddress}
              </div>
              <button
                onClick={() => copyText(selectedCard.usdtAddress)}
                style={{
                  marginTop: 8, width: "100%", padding: "8px 12px", borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
                  color: "#6366f1", fontWeight: 600, fontSize: 12, cursor: "pointer",
                }}
              >
                <Copy size={12} style={{ display: "inline", marginRight: 6 }} />
                Copy
              </button>
            </div>

            {/* Transaction Hash */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 8 }}>Transaction Hash</div>
              <div style={{
                padding: 12, borderRadius: 8, background: "rgba(255,255,255,0.03)",
                fontFamily: "monospace", fontSize: 10, wordBreak: "break-all", color: "#fff",
                display: "flex", alignItems: "flex-start", gap: 8,
              }}>
                <span style={{ flex: 1 }}>{revealHash ? selectedCard.transactionHash : selectedCard.transactionHash.slice(0, 20) + "..."}</span>
                <button
                  onClick={() => setRevealHash(!revealHash)}
                  style={{ border: "none", background: "none", color: "#6366f1", cursor: "pointer", padding: 0 }}
                >
                  {revealHash ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <button
                onClick={() => copyText(selectedCard.transactionHash)}
                style={{
                  marginTop: 8, width: "100%", padding: "8px 12px", borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
                  color: "#6366f1", fontWeight: 600, fontSize: 12, cursor: "pointer",
                }}
              >
                <Copy size={12} style={{ display: "inline", marginRight: 6 }} />
                Copy Hash
              </button>
            </div>

            {/* Verification Actions */}
            <div style={{ padding: 16, borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)", marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 12 }}>Action</div>
              
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 8 }}>If Rejecting, Provide Reason</label>
                <textarea
                  placeholder="e.g., Invalid transaction, Amount mismatch, etc."
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                  style={{
                    width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.02)", color: "#fff", fontSize: 12,
                    fontFamily: "inherit", resize: "none", minHeight: 80,
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <button
                  onClick={() => handleRejectCard(selectedCard._id)}
                  disabled={processing === selectedCard._id}
                  style={{
                    padding: "10px 16px", borderRadius: 8, border: "none",
                    background: "#f43f5e", color: "#fff", fontWeight: 600, fontSize: 13,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    opacity: processing === selectedCard._id ? 0.5 : 1,
                  }}
                >
                  {processing === selectedCard._id ? <Loader size={14} /> : <X size={14} />}
                  Reject
                </button>
                <button
                  onClick={() => handleApproveCard(selectedCard._id)}
                  disabled={processing === selectedCard._id}
                  style={{
                    padding: "10px 16px", borderRadius: 8, border: "none",
                    background: "#10b981", color: "#fff", fontWeight: 600, fontSize: 13,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    opacity: processing === selectedCard._id ? 0.5 : 1,
                  }}
                >
                  {processing === selectedCard._id ? <Loader size={14} /> : <Check size={14} />}
                  Approve
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowDetails(false)}
              style={{
                width: "100%", padding: "10px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
                background: "transparent", color: "#fff", fontWeight: 600, cursor: "pointer",
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

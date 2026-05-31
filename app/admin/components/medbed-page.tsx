"use client";

import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Heart, RefreshCw, CheckCircle, XCircle, ChevronDown, ChevronUp,
  User, Phone, Mail, MapPin, Hash, Coins
} from "lucide-react";

interface MedbedUserId {
  _id: string;
  fullName: string;
  email: string;
}

interface MedbedRegistration {
  _id: string;
  registrationId: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  color: string;
  amountXrp: number;
  receiverAddress: string;
  status: "pending_payment" | "paid" | "confirmed" | "verified" | "rejected";
  paymentStatus: "awaiting" | "received" | "confirmed";
  txHash?: string;
  verificationStatus: "pending" | "approved" | "rejected";
  verificationNotes?: string;
  createdAt: string;
  confirmedAt?: string;
  verifiedAt?: string;
  userId?: MedbedUserId;
}

const verifStatusColor = (s: string) => ({
  pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  approved: "bg-green-500/15 text-green-400 border-green-500/30",
  rejected: "bg-red-500/15 text-red-400 border-red-500/30",
}[s] ?? "bg-white/10 text-white/60 border-white/10");

const statusColor = (s: string) => ({
  pending_payment: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  paid: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  confirmed: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  verified: "bg-green-500/15 text-green-400 border-green-500/30",
  rejected: "bg-red-500/15 text-red-400 border-red-500/30",
}[s] ?? "bg-white/10 text-white/60 border-white/10");

export default function AdminMedbedPage() {
  const [registrations, setRegistrations] = useState<MedbedRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [verifyNotes, setVerifyNotes] = useState("");
  const [showRejectInput, setShowRejectInput] = useState<string | null>(null);

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/medbed/verify");
      const data = await res.json();
      if (data.success) {
        setRegistrations(data.registrations || []);
      } else {
        toast.error(data.error || "Failed to fetch registrations");
      }
    } catch {
      toast.error("Error fetching medbed registrations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRegistrations(); }, []);

  const handleAction = async (registrationId: string, action: "approve" | "reject") => {
    setActionLoading(registrationId);
    try {
      const res = await fetch("/api/admin/medbed/verify", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId, action, notes: verifyNotes }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || `Registration ${action}d`);
        setVerifyNotes(""); setExpandedId(null); setShowRejectInput(null);
        fetchRegistrations();
      } else {
        toast.error(data.error || "Action failed");
      }
    } catch {
      toast.error("Error processing action");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <Heart className="w-7 h-7 text-primary" /> Medbed Verifications
            </h1>
            <p className="text-sm text-text-200 mt-1">
              {registrations.length} pending verification{registrations.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={fetchRegistrations}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-border-default hover:bg-white/10 transition text-sm w-fit"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="py-16 text-center text-text-300">Loading registrations...</div>
        ) : registrations.length === 0 ? (
          <div className="card p-12 text-center text-text-300">No pending medbed verifications.</div>
        ) : (
          <div className="space-y-3">
            {registrations.map((m) => (
              <div key={m._id} className="card border border-border-default overflow-hidden">
                {/* Row Header */}
                <div
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 cursor-pointer hover:bg-white/5 transition"
                  onClick={() => setExpandedId(expandedId === m._id ? null : m._id)}
                >
                  <div className="flex items-center gap-3">
                    {/* Color swatch */}
                    <div
                      className="w-9 h-9 rounded-lg border-2 border-white/20 shrink-0"
                      style={{ backgroundColor: m.color || "#888" }}
                    />
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{m.name}</p>
                      <p className="text-xs text-text-300 font-mono">{m.registrationId.slice(0, 12)}…</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-12 sm:ml-0 flex-wrap">
                    <span className={`text-xs px-2 py-1 rounded-full border font-medium ${statusColor(m.status)}`}>
                      {m.status.replace("_", " ")}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full border font-medium ${verifStatusColor(m.verificationStatus)}`}>
                      {m.verificationStatus}
                    </span>
                    <span className="font-bold text-sm text-yellow-400">{m.amountXrp} XRP</span>
                    {expandedId === m._id ? <ChevronUp className="w-4 h-4 text-text-300" /> : <ChevronDown className="w-4 h-4 text-text-300" />}
                  </div>
                </div>

                {/* Expanded */}
                {expandedId === m._id && (
                  <div className="border-t border-border-default p-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Contact Info */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-300 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" /> Contact
                        </h3>
                        {[
                          [<Mail className="w-3.5 h-3.5" />, "Email", m.email],
                          [<Phone className="w-3.5 h-3.5" />, "Phone", m.phone],
                          [<MapPin className="w-3.5 h-3.5" />, "Address", m.address],
                        ].map(([icon, label, value]) => (
                          <div key={label as string} className="flex items-start gap-2 text-sm">
                            <span className="text-text-300 mt-0.5 shrink-0">{icon}</span>
                            <div>
                              <p className="text-xs text-text-300">{label as string}</p>
                              <p className="font-medium">{value as string}</p>
                            </div>
                          </div>
                        ))}
                        {m.userId && (
                          <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-xs">
                            <p className="text-text-300 mb-1">Linked Account</p>
                            <p className="font-semibold">{m.userId.fullName}</p>
                            <p className="text-text-200">{m.userId.email}</p>
                          </div>
                        )}
                      </div>

                      {/* Payment Info */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-300 flex items-center gap-1.5">
                          <Coins className="w-3.5 h-3.5" /> Payment
                        </h3>
                        {[
                          ["Amount", `${m.amountXrp} XRP`],
                          ["Payment Status", m.paymentStatus],
                          ["Bed Color", m.color],
                          ["Registered", new Date(m.createdAt).toLocaleDateString()],
                          m.confirmedAt ? ["Confirmed", new Date(m.confirmedAt).toLocaleDateString()] : null,
                        ].filter((x): x is [string, string] => Boolean(x)).map(([label, value]) => (
                          <div key={label as string} className="flex justify-between text-sm">
                            <span className="text-text-300">{label as string}</span>
                            <span className="font-medium">{value as string}</span>
                          </div>
                        ))}
                        {m.txHash && (
                          <div className="p-3 bg-white/5 rounded-lg border border-border-default">
                            <p className="text-xs text-text-300 mb-1 flex items-center gap-1"><Hash className="w-3 h-3" /> Tx Hash</p>
                            <p className="text-xs font-mono break-all text-text-200">{m.txHash}</p>
                          </div>
                        )}
                        {m.receiverAddress && (
                          <div className="p-3 bg-white/5 rounded-lg border border-border-default">
                            <p className="text-xs text-text-300 mb-1">Receiver Address</p>
                            <p className="text-xs font-mono break-all text-text-200">{m.receiverAddress}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {m.verificationNotes && (
                      <div className="p-3 bg-white/5 rounded-lg border border-border-default text-sm">
                        <p className="text-xs text-text-300 mb-1">Previous Notes</p>
                        <p className="text-text-200">{m.verificationNotes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    {m.verificationStatus === "pending" && (
                      <div className="space-y-3 pt-2 border-t border-border-default">
                        <div>
                          <label className="block text-xs font-medium text-text-300 mb-1.5">Verification Notes (optional)</label>
                          <textarea
                            value={verifyNotes}
                            onChange={(e) => setVerifyNotes(e.target.value)}
                            rows={2}
                            placeholder="Add notes for this verification..."
                            className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-border-default focus:border-primary outline-none resize-none transition"
                          />
                        </div>

                        {showRejectInput === m.registrationId && (
                          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                            Confirming will reject this registration and notify the user by email. Add notes above if needed.
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2 justify-end">
                          {showRejectInput !== m.registrationId ? (
                            <>
                              <button
                                onClick={() => setShowRejectInput(m.registrationId)}
                                disabled={!!actionLoading}
                                className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition disabled:opacity-50"
                              >
                                <XCircle className="w-4 h-4" /> Reject
                              </button>
                              <button
                                onClick={() => handleAction(m.registrationId, "approve")}
                                disabled={actionLoading === m.registrationId}
                                className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-green-500/15 border border-green-500/30 text-green-400 hover:bg-green-500/25 transition disabled:opacity-50"
                              >
                                <CheckCircle className="w-4 h-4" />
                                {actionLoading === m.registrationId ? "Approving..." : "Approve"}
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => { setShowRejectInput(null); }}
                                className="px-4 py-2 text-sm rounded-lg border border-border-default hover:bg-white/5 transition"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleAction(m.registrationId, "reject")}
                                disabled={actionLoading === m.registrationId}
                                className="px-4 py-2 text-sm rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 transition disabled:opacity-50"
                              >
                                {actionLoading === m.registrationId ? "Rejecting..." : "Confirm Rejection"}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
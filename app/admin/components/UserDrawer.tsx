"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  X, User, Mail, Hash, Wallet, Shield, Phone, MapPin,
  ArrowUpRight, ArrowDownLeft, TrendingUp, DollarSign,
  CheckCircle, XCircle, Clock, AlertCircle
} from "lucide-react";

interface Transaction {
  _id: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
  details?: string;
  coin?: string;
  network?: string;
  walletAddress?: string;
  bankName?: string;
  reference?: string;
  fee?: number;
}

interface UserDetail {
  _id: string;
  fullName: string;
  email: string;
  accountNumber: string;
  balance: number;
  role: string;
  accountStatus: string;
  kycVerified: boolean;
  profileImage?: string;
  address?: string;
  phone?: string;
}

interface UserDrawerProps {
  userId: string | null;
  onClose: () => void;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  Deposit: <ArrowDownLeft className="w-3.5 h-3.5 text-green-400" />,
  Withdraw: <ArrowUpRight className="w-3.5 h-3.5 text-red-400" />,
  Investment: <TrendingUp className="w-3.5 h-3.5 text-blue-400" />,
  Dividend: <DollarSign className="w-3.5 h-3.5 text-yellow-400" />,
};

const statusIcon = (s: string) => ({
  Completed: <CheckCircle className="w-3.5 h-3.5 text-green-400" />,
  Approved: <CheckCircle className="w-3.5 h-3.5 text-blue-400" />,
  Pending: <Clock className="w-3.5 h-3.5 text-yellow-400" />,
  Declined: <XCircle className="w-3.5 h-3.5 text-red-400" />,
  Failed: <XCircle className="w-3.5 h-3.5 text-red-400" />,
}[s] ?? <AlertCircle className="w-3.5 h-3.5 text-text-300" />);

export function UserDrawer({ userId, onClose }: UserDrawerProps) {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [txFilter, setTxFilter] = useState<string>("all");

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`/api/admin/users/${userId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setTransactions(data.transactions || []);
        } else {
          toast.error(data.message || "Failed to load user");
        }
      })
      .catch(() => toast.error("Error loading user"))
      .finally(() => setLoading(false));
  }, [userId]);

  const filteredTx = txFilter === "all"
    ? transactions
    : transactions.filter((t) => t.type === txFilter || t.status === txFilter);

  const txTypes = [...new Set(transactions.map((t) => t.type))];

  if (!userId) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] lg:w-[520px] bg-background border-l border-border-default flex flex-col shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-default bg-white/5 shrink-0">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> User Details
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-text-300">Loading...</div>
          ) : !user ? (
            <div className="flex items-center justify-center h-40 text-text-300">User not found</div>
          ) : (
            <div className="divide-y divide-border-default">

              {/* Profile Section */}
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-bold shrink-0">
                    {user.fullName?.charAt(0) ?? "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-bold truncate">{user.fullName}</p>
                    <p className="text-sm text-text-300 truncate">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                        user.accountStatus === "Active"
                          ? "bg-green-500/15 text-green-400 border-green-500/30"
                          : user.accountStatus === "Suspended"
                          ? "bg-red-500/15 text-red-400 border-red-500/30"
                          : "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"
                      }`}>
                        {user.accountStatus}
                      </span>
                      {user.kycVerified && (
                        <span className="text-xs px-2 py-0.5 rounded-full border bg-blue-500/15 text-blue-400 border-blue-500/30 flex items-center gap-1">
                          <Shield className="w-3 h-3" /> KYC Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-300 mb-3">Account Info</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    [<Hash className="w-3.5 h-3.5" />, "Account No.", user.accountNumber] as const,
                    [<Wallet className="w-3.5 h-3.5" />, "Balance", `$${(user.balance ?? 0).toLocaleString()}`] as const,
                    [<Mail className="w-3.5 h-3.5" />, "Email", user.email] as const,
                    [<User className="w-3.5 h-3.5" />, "Role", user.role] as const,
                    ...(user.phone ? [[<Phone className="w-3.5 h-3.5" />, "Phone", user.phone] as const] : []),
                    ...(user.address ? [[<MapPin className="w-3.5 h-3.5" />, "Address", user.address] as const] : []),
                  ].map(([icon, label, value]) => (
                    <div key={label} className="p-3 bg-white/5 rounded-lg border border-border-default">
                      <div className="flex items-center gap-1.5 text-text-300 mb-1">
                        {icon}
                        <span className="text-xs">{label}</span>
                      </div>
                      <p className="text-sm font-medium truncate">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transactions */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-text-300">
                    Transactions ({transactions.length})
                  </h3>
                  {/* Type filter */}
                  <select
                    value={txFilter}
                    onChange={(e) => setTxFilter(e.target.value)}
                    className="text-xs px-2 py-1 rounded-lg bg-white/5 border border-border-default focus:border-primary outline-none"
                  >
                    <option value="all">All types</option>
                    {txTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {filteredTx.length === 0 ? (
                  <p className="text-sm text-text-300 text-center py-6">No transactions found.</p>
                ) : (
                  <div className="space-y-2">
                    {filteredTx.map((tx) => (
                      <div key={tx._id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-border-default gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-md bg-white/5 border border-border-default flex items-center justify-center shrink-0">
                            {TYPE_ICONS[tx.type] ?? <Wallet className="w-3.5 h-3.5 text-text-300" />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 text-sm">
                              <span className="font-medium">{tx.type}</span>
                              {tx.coin && <span className="text-xs text-text-300">{tx.coin}</span>}
                            </div>
                            <p className="text-xs text-text-300">{new Date(tx.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold">${tx.amount.toLocaleString()}</p>
                          <div className="flex items-center gap-1 justify-end mt-0.5">
                            {statusIcon(tx.status)}
                            <span className="text-xs text-text-300">{tx.status}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
}
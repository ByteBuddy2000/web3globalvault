'use client';

import React, { useEffect, useState } from "react";
import { Loader2, ArrowDownCircle, ArrowUpCircle, TrendingUp, XCircle } from "lucide-react";

type Transaction = {
  _id: string;
  type: "Deposit" | "Withdraw" | "Investment" | "Dividend";
  amount: number;
  status: "Pending" | "Completed" | "Failed";
  reference?: string;
  details?: string;
  createdAt: string;
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const res = await fetch("/api/transactions");
        const data = await res.json();
        setTransactions(data.transactions || []);
      } catch (err) {
        console.error("Failed to fetch transactions", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Deposit":
        return <ArrowDownCircle className="w-5 h-5 text-green-400" />;
      case "Withdraw":
        return <ArrowUpCircle className="w-5 h-5 text-red-400" />;
      case "Investment":
        return <TrendingUp className="w-5 h-5 text-blue-400" />;
      case "Dividend":
        return <TrendingUp className="w-5 h-5 text-yellow-400" />;
      default:
        return <XCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="card p-6 rounded-3xl shadow-xl">
      <h2 className="text-2xl font-bold text-accent mb-6">Transaction History</h2>

      {loading ? (
        <div className="flex items-center justify-center py-10 text-muted">
          <Loader2 className="w-6 h-6 animate-spin mr-2 text-accent" /> Loading...
        </div>
      ) : transactions.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-muted">
            <thead>
              <tr className="bg-black/20 text-muted text-xs uppercase tracking-wider">
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Amount (USD)</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx._id} className="border-t border-white/6 hover:bg-white/6 transition">
                  <td className="px-4 py-3 flex items-center gap-2">
                    {getTypeIcon(tx.type)}
                    <span>{tx.type}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-white">${tx.amount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${tx.status === "Completed" ? "bg-emerald-100 text-emerald-700" : tx.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{tx.reference || "--"}</td>
                  <td className="px-4 py-3 text-muted">{tx.details || "--"}</td>
                  <td className="px-4 py-3 text-muted">{new Date(tx.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center text-muted py-10">No transactions found.</div>
      )}
    </div>
  );
}

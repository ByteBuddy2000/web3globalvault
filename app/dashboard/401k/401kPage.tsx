'use client';

import React, { useEffect, useState } from 'react';

type Contribution = {
  _id?: string;
  amount: number;
  frequency?: 'one-time' | 'monthly' | 'yearly';
  createdAt?: string;
  status?: string;
};

type KAccount = {
  totalBalance: number;
  target?: number;
  projected?: number;
  contributions: Contribution[];
};

export default function K401Page() {
  const [data, setData] = useState<KAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [amount, setAmount] = useState('');
  const [frequency, sCryptorequency] = useState<Contribution['frequency']>('monthly');
  const [submitting, setSubmitting] = useState(false);

  // fetch user 401k summary + contributions
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/401k', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load 401k data');
        const json = await res.json();
        if (mounted) setData(json as KAccount);
      } catch (err: any) {
        if (mounted) setError(err?.message ?? 'Error');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // contribution submit
  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (isNaN(value) || value <= 0) return setError('Enter a valid amount');

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/401k/contribute', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: value, frequency }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Contribution failed');
      // refresh local state (optimistic merge)
      setData((prev) => {
        const next = prev || { totalBalance: 0, target: 0, projected: 0, contributions: [] };
        return {
          ...next,
          totalBalance: (next.totalBalance || 0) + value,
          contributions: [{ amount: value, frequency, createdAt: new Date().toISOString(), status: 'Completed' }, ...(next.contributions || [])],
        };
      });
      setAmount('');
    } catch (err: any) {
      setError(err?.message ?? 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  // simple projection helper (compound annual return)
  const projectedValue = (balance: number, monthlyAdd = 0, years = 10, rate = 0.06) => {
    const r = rate;
    let val = balance;
    for (let i = 0; i < years * 12; i++) {
      val = val * (1 + r / 12) + monthlyAdd;
    }
    return Math.round(val);
  };

  return (
    <section className="max-w-5xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">401(k) Savings</h1>
          <p className="text-sm text-gray-300">Retirement savings and contribution history</p>
        </div>
        <div className="flex gap-3">
          <div className="text-right">
            <div className="text-xs text-gray-400">Current Balance</div>
            <div className="text-xl font-semibold text-yellow-400">
              {loading ? '—' : `$${Math.round(data?.totalBalance ?? 0).toLocaleString()}`}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Projected (10y)</div>
            <div className="text-xl font-semibold text-green-400">
              {loading ? '—' : `$${projectedValue(data?.totalBalance ?? 0, 0, 10).toLocaleString()}`}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Contribution form */}
        <div className="lg:col-span-1 bg-gradient-to-br from-zinc-900/70 to-zinc-800/60 p-4 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-3 text-white">Make a Contribution</h2>
          <form onSubmit={handleContribute} className="space-y-3">
            <div>
              <label className="text-sm text-gray-300 block mb-1">Amount (USD)</label>
              <input
                inputMode="numeric"
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 rounded bg-black/20 border border-white/5 text-white"
                placeholder="e.g. 100"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-300 block mb-1">Frequency</label>
              <select value={frequency} onChange={(e) => sCryptorequency(e.target.value as any)} className="w-full p-2 rounded bg-black/20 border border-white/5 text-white">
                <option value="one-time">One-time</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            {error && <div className="text-sm text-red-400">{error}</div>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 rounded-lg bg-yellow-500 text-black font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <svg className="animate-spin h-4 w-4 text-black" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : null}
              {submitting ? 'Submitting...' : 'Contribute'}
            </button>
          </form>

          <div className="mt-4 text-xs text-gray-400">
            Contributions help grow your retirement savings with compound returns. You can cancel recurring contributions from settings.
          </div>
        </div>

        {/* Middle: Summary & projections */}
        <div className="lg:col-span-1 bg-black/30 p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-3 text-white">Summary</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between text-sm text-gray-300">
              <span>Current Balance</span>
              <span className="font-medium">${Math.round(data?.totalBalance ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-300">
              <span>Target (if set)</span>
              <span className="font-medium">${Math.round(data?.target ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-300">
              <span>Projected (10y @6%)</span>
              <span className="font-medium">${projectedValue(data?.totalBalance ?? 0, 0, 10, 0.06).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Right: Contribution history */}
        <div className="lg:col-span-1 bg-black/30 p-4 rounded-xl shadow max-h-[360px] overflow-auto">
          <h3 className="text-lg font-semibold mb-3 text-white">Contribution History</h3>

          {loading ? (
            <div className="text-center text-gray-400 py-12">Loading...</div>
          ) : (data?.contributions?.length ?? 0) === 0 ? (
            <div className="text-gray-400">No contributions yet</div>
          ) : (
            <ul className="space-y-3">
              {data!.contributions.map((c, i) => (
                <li key={i} className="flex justify-between items-start bg-white/3 p-3 rounded">
                  <div>
                    <div className="font-medium text-sm">${Math.round(c.amount).toLocaleString()}</div>
                    <div className="text-xs text-gray-300">{c.frequency ?? 'one-time'}</div>
                  </div>
                  <div className="text-right text-xs text-gray-300">
                    <div>{new Date(c.createdAt || Date.now()).toLocaleDateString()}</div>
                    <div className="mt-1">{c.status ?? 'Completed'}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { User as UserIcon, PlusCircle, Eye, X, Check, LogOut, Trash2 } from "lucide-react";

type User = {
  _id: string;
  fullName?: string;
  email?: string;
  accountNumber?: string;
  balance?: number;
  role?: string;
  accountStatus?: string;
  kycVerified?: boolean;
  profileImage?: string;
  address?: string;
  phone?: string;
  transactions?: string[];
};

type Asset = {
  _id: string;
  symbol?: string;
  name?: string;
  type?: string;
  quantity?: number;
};

type Transaction = {
  _id: string;
  user?: string;
  type: string;
  amount: number;
  status: string;
  reference?: string;
  createdAt?: string;
  details?: string;
};

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<Transaction[] | null>(null);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(false);
  const [topUpUser, setTopUpUser] = useState<User | null>(null);
  const [topUpAsset, setTopUpAsset] = useState<Asset | null>(null);
  const [topUpAmount, setTopUpAmount] = useState<number>(0);
  const [userAssets, setUserAssets] = useState<Asset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [query, setQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    fetchUsers();
    fetchPendingWithdrawals();
  }, []);

  async function fetchPendingWithdrawals() {
    setLoadingWithdrawals(true);
    try {
      const res = await fetch('/api/admin/transactions?status=Pending');
      if (!res.ok) throw new Error('Failed to load pending withdrawals');
      const data = await res.json();
      setPendingWithdrawals(data.transactions || []);
    } catch (err) {
      console.error(err);
      toast.error('Unable to load pending withdrawals');
    } finally {
      setLoadingWithdrawals(false);
    }
  }

  async function updateTransactionStatus(transactionId: string, status: 'Completed' | 'Failed') {
    try {
      const res = await fetch('/api/admin/transactions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update transaction');
      toast.success(data.message || 'Transaction updated');
      fetchPendingWithdrawals();
      if (selected) viewUser(selected._id);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Unable to update transaction');
    }
  }

  async function fetchUsers(p: number = page, q: string = query) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(p));
      params.set("limit", String(limit));
      if (q) params.set("q", q);
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.meta?.total || 0);
      setPage(data.meta?.page || p);
    } catch (err) {
      console.error(err);
      toast.error('Unable to load users');
    } finally {
      setLoading(false);
    }
  }

  async function doTopUp() {
    if (!topUpUser || !topUpAsset) return;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: topUpUser._id, assetId: topUpAsset._id, amount: Number(topUpAmount) }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.message || 'Top up failed');
      toast.success(j.message || 'Topped up');
      setTopUpUser(null);
      setTopUpAsset(null);
      setTopUpAmount(0);
      setUserAssets([]);
      // refresh current page
      fetchUsers(page, query);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Top up failed');
    }
  }

  async function openTopUpModal(u: User) {
    setTopUpUser(u);
    setTopUpAsset(null);
    setTopUpAmount(0);
    setLoadingAssets(true);
    try {
      const res = await fetch(`/api/admin/users/assets?userId=${u._id}`);
      if (!res.ok) throw new Error('Failed to fetch assets');
      const data = await res.json();
      setUserAssets(data.assets || []);
    } catch (err) {
      console.error(err);
      toast.error('Unable to load user assets');
    } finally {
      setLoadingAssets(false);
    }
  }

  async function viewUser(id: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`);
      if (!res.ok) throw new Error('Failed to fetch user');
      const data = await res.json();
      setSelected(data.user || null);
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error(err);
      toast.error('Unable to load user details');
    } finally {
      setLoading(false);
    }
  }

  async function confirmDeleteUser() {
    if (!deleteUser) return;
    try {
      const res = await fetch(`/api/admin/users/${deleteUser._id}`, {
        method: 'DELETE',
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.message || 'Delete failed');
      toast.success(j.message || 'User deleted successfully');
      setDeleteUser(null);
      // refresh current page
      fetchUsers(page, query);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Delete failed');
    }
  }

  async function handleLogout() {
    try {
      await signOut({ redirect: true, callbackUrl: "/signin" });
    } catch (err) {
      console.error(err);
      toast.error("Logout failed");
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-accent">Admin — Users</h1>
        <div className="flex items-center gap-4">
          <p className="text-muted">Manage users, top-up balances and view details</p>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600/20 border border-red-600/50 rounded hover:bg-red-600/30 flex items-center gap-2 text-red-400 text-sm font-medium transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Pending Withdrawals</h2>
          <button
            onClick={fetchPendingWithdrawals}
            className="px-3 py-1 text-xs font-medium rounded bg-slate-800 border border-slate-600 hover:bg-slate-700"
          >
            Refresh
          </button>
        </div>
        {loadingWithdrawals ? (
          <div className="py-8 text-muted text-center">Loading pending withdrawals...</div>
        ) : pendingWithdrawals && pendingWithdrawals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-muted">
              <thead>
                <tr className="bg-black/10 text-muted text-xs uppercase">
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Details</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingWithdrawals.map((t) => (
                  <tr key={t._id} className="border-t border-white/6 hover:bg-white/4 transition">
                    <td className="px-3 py-2 font-mono text-xs">{t.user || '—'}</td>
                    <td className="px-3 py-2">${(t.amount ?? 0).toLocaleString()}</td>
                    <td className="px-3 py-2">{new Date(t.createdAt || '').toLocaleString()}</td>
                    <td className="px-3 py-2 max-w-xs truncate" title={t.details || t.reference || ''}>{t.details || t.reference || '—'}</td>
                    <td className="px-3 py-2 flex gap-2">
                      <button
                        onClick={() => updateTransactionStatus(t._id, 'Completed')}
                        className="px-2 py-1 text-xs bg-emerald-600/20 text-emerald-300 rounded hover:bg-emerald-600/30"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => updateTransactionStatus(t._id, 'Failed')}
                        className="px-2 py-1 text-xs bg-red-600/20 text-red-300 rounded hover:bg-red-600/30"
                      >
                        Fail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-muted text-center">No pending withdrawals.</div>
        )}
      </div>

      <div className="card p-4">
        {loading ? (
          <div className="py-12 text-muted text-center">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-muted">
              <thead>
                <tr className="bg-black/10 text-muted text-xs uppercase">
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Account</th>
                  <th className="px-3 py-2">Balance</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-t border-white/6 hover:bg-white/4 transition">
                    <td className="px-3 py-2 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center text-accent">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">{u.fullName || '—'}</div>
                        <div className="text-xs text-muted">{u.role || 'user'}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2">{u.email || '—'}</td>
                    <td className="px-3 py-2 font-mono">{u.accountNumber || '—'}</td>
                    <td className="px-3 py-2">${(u.balance ?? 0).toLocaleString()}</td>
                    <td className="px-3 py-2">{u.accountStatus || '—'}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <button onClick={() => viewUser(u._id)} className="px-3 py-1 rounded-md text-sm bg-black/20 border border-white/6"> <Eye className="w-4 h-4 inline-block mr-2" /> View</button>
                        <button onClick={() => openTopUpModal(u)} className="px-3 py-1 rounded-md text-sm btn-accent"><PlusCircle className="w-4 h-4 inline-block mr-2" /> Top-up</button>
                        <button onClick={() => setDeleteUser(u)} className="px-3 py-1 rounded-md text-sm bg-red-600/20 border border-red-600/50 text-red-400 hover:bg-red-600/30"><Trash2 className="w-4 h-4 inline-block mr-2" /> Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Search & pagination */}
      <div className="flex items-center gap-2 my-4">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email or account" className="p-2 rounded bg-black/20 border border-white/6 text-white flex-1" />
        <button onClick={() => fetchUsers(1, query)} className="px-3 py-2 btn-accent">Search</button>
      </div>

      {/* pagination top */}
      <div className="flex items-center justify-between text-sm text-muted my-2">
        <div>Showing {(page - 1) * limit + 1} - {Math.min(page * limit, total)} of {total}</div>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1} onClick={() => fetchUsers(page - 1, query)} className="px-2 py-1 rounded bg-black/10">Prev</button>
          <span className="px-2">{page}</span>
          <button disabled={page * limit >= total} onClick={() => fetchUsers(page + 1, query)} className="px-2 py-1 rounded bg-black/10">Next</button>
        </div>
      </div>

      {/* View modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="card w-full max-w-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold">User details</h2>
              <button onClick={() => setSelected(null)} className="text-muted"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div><span className="text-muted">Name</span><div className="font-semibold text-white">{selected.fullName}</div></div>
              <div><span className="text-muted">Email</span><div className="font-semibold text-white">{selected.email}</div></div>
              <div><span className="text-muted">Account</span><div className="font-mono font-semibold text-white">{selected.accountNumber}</div></div>
              <div><span className="text-muted">Balance</span><div className="font-semibold text-accent">${(selected.balance ?? 0).toLocaleString()}</div></div>
              <div><span className="text-muted">Status</span><div className="font-semibold text-white">{selected.accountStatus}</div></div>
              <div><span className="text-muted">KYC</span><div className="font-semibold">{selected.kycVerified ? 'Verified' : 'Not verified'}</div></div>
              {selected.address && <div><span className="text-muted">Address</span><div className="font-semibold text-white">{selected.address}</div></div>}
              {selected.phone && <div><span className="text-muted">Phone</span><div className="font-semibold text-white">{selected.phone}</div></div>}
            </div>

            {transactions && transactions.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm text-muted mb-2">Recent transactions</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {transactions.map((t) => (
                    <div key={t._id} className="flex items-center justify-between bg-black/10 p-2 rounded">
                      <div>
                        <div className="font-medium">{t.type} — ${t.amount.toLocaleString()}</div>
                        <div className="text-xs text-muted">{new Date(t.createdAt || '').toLocaleString()} • {t.reference || ''}</div>
                      </div>
                      <div className="text-sm font-semibold">{t.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setSelected(null)} className="px-4 py-2 bg-black/20 rounded">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Top-up modal */}
      {topUpUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="card w-full max-w-md p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold">Top up {topUpUser.fullName || topUpUser.email}</h2>
              <button
                onClick={() => {
                  setTopUpUser(null);
                  setUserAssets([]);
                  setTopUpAsset(null);
                }}
                className="text-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {/* Asset Selection */}
              <div>
                <label className="block text-sm text-muted mb-2">Select Asset</label>
                {loadingAssets ? (
                  <div className="text-center py-4 text-muted">Loading assets...</div>
                ) : userAssets.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-white/6 rounded-lg p-2 bg-black/20">
                    {userAssets.map((asset) => (
                      <button
                        key={asset._id}
                        onClick={() => setTopUpAsset(asset)}
                        className={`w-full text-left p-3 rounded border transition ${topUpAsset?._id === asset._id
                            ? 'border-accent bg-accent/20'
                            : 'border-white/6 bg-white/5 hover:border-accent/50'
                          }`}
                      >
                        <div className="font-semibold text-white">{asset.symbol || asset.name}</div>
                        <div className="text-xs text-muted mt-1">
                          Current: {asset.quantity?.toFixed(8) || '0'} {asset.type || 'units'}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted text-sm">No assets found for this user</div>
                )}
              </div>

              {/* Amount Input */}
              {topUpAsset && (
                <div>
                  <label className="block text-sm text-muted mb-1">Amount ({topUpAsset.symbol})</label>
                  <input
                    type="number"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(Number(e.target.value))}
                    placeholder="Enter amount to add"
                    className="w-full p-3 rounded border border-white/6 bg-black/20 text-white focus:border-accent focus:ring-2 focus:ring-accent/20"
                    min="0"
                    step="0.01"
                  />
                </div>
              )}

              {/* Summary */}
              {topUpAsset && topUpAmount > 0 && (
                <div className="bg-accent/10 border border-accent/30 p-3 rounded">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Current quantity:</span>
                    <span className="text-accent font-semibold">{topUpAsset.quantity?.toFixed(8)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-muted">After top-up:</span>
                    <span className="text-accent font-semibold">{((topUpAsset.quantity || 0) + topUpAmount).toFixed(8)}</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    setTopUpUser(null);
                    setUserAssets([]);
                    setTopUpAsset(null);
                    setTopUpAmount(0);
                  }}
                  className="px-4 py-2 bg-black/20 rounded hover:bg-black/30"
                >
                  Cancel
                </button>
                <button
                  onClick={doTopUp}
                  disabled={!topUpAsset || topUpAmount <= 0}
                  className="px-4 py-2 btn-accent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm <Check className="w-4 h-4 inline-block ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="card w-full max-w-md p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold text-red-400">Delete User</h2>
              <button onClick={() => setDeleteUser(null)} className="text-muted"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <p className="text-muted">
                Are you sure you want to delete the account for <span className="font-semibold text-white">{deleteUser.fullName || deleteUser.email}</span>?
              </p>
              <p className="text-sm text-red-400">
                This action cannot be undone. All user data and transactions will be permanently removed.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setDeleteUser(null)}
                  className="px-4 py-2 bg-black/20 rounded hover:bg-black/30"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteUser}
                  className="px-4 py-2 bg-red-600/20 border border-red-600/50 text-red-400 hover:bg-red-600/30 rounded"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

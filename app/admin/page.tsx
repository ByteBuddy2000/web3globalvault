"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { 
  User as UserIcon, PlusCircle, Eye, X, Check, LogOut, Trash2, Heart,
  BarChart3, Wallet, FileText, Settings, Users, TrendingUp, Clock, AlertCircle,
  Menu, ChevronDown
} from "lucide-react";

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

type MedbedRegistration = {
  _id: string;
  registrationId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  color: string;
  status: string;
  amountXrp: number;
  txHash?: string;
  verificationStatus: string;
  verificationNotes?: string;
  confirmedAt?: string;
  userId?: {
    _id: string;
    fullName: string;
    email: string;
  };
};

export default function AdminPage() {
  // Navigation & UI
  const [activeTab, setActiveTab] = useState<"dashboard" | "users" | "kyc" | "transactions" | "medbed" | "settings">("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Users
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [query, setQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(15);
  const [total, setTotal] = useState<number>(0);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [topUpUser, setTopUpUser] = useState<User | null>(null);
  const [topUpAsset, setTopUpAsset] = useState<Asset | null>(null);
  const [topUpAmount, setTopUpAmount] = useState<number>(0);
  const [userAssets, setUserAssets] = useState<Asset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  
  // Dashboard Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBalance: 0,
    pendingWithdrawals: 0,
    pendingKYC: 0,
  });
  
  // Transactions
  const [pendingWithdrawals, setPendingWithdrawals] = useState<Transaction[] | null>(null);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(false);
  
  // KYC
  const [kycData, setKycData] = useState<any[]>([]);
  const [loadingKyc, setLoadingKyc] = useState(false);
  
  // Medbed
  const [medbedRegistrations, setMedbedRegistrations] = useState<MedbedRegistration[]>([]);
  const [loadingMedbed, setLoadingMedbed] = useState(false);
  const [verifyingMedbed, setVerifyingMedbed] = useState<MedbedRegistration | null>(null);
  const [verifyNotes, setVerifyNotes] = useState<string>("");

  useEffect(() => {
    fetchUsers();
    fetchPendingWithdrawals();
    fetchPendingMedbedVerifications();
    loadDashboardStats();
    fetchKycData();
  }, []);

  async function loadDashboardStats() {
    try {
      const res = await fetch('/api/admin/dashboard');
      if (!res.ok) throw new Error('Failed to load stats');
      const data = await res.json();
      setStats({
        totalUsers: data.totalUsers || 0,
        totalBalance: data.totalBalance || 0,
        pendingWithdrawals: data.pendingWithdrawals || 0,
        pendingKYC: data.pendingKYC || 0,
      });
    } catch (err) {
      console.error(err);
      toast.error('Unable to load dashboard stats');
    }
  }

  async function fetchKycData() {
    setLoadingKyc(true);
    try {
      const res = await fetch('/api/admin/kyc');
      if (!res.ok) throw new Error('Failed to load KYC data');
      const data = await res.json();
      setKycData(data.kyc || []);
    } catch (err) {
      console.error(err);
      toast.error('Unable to load KYC data');
    } finally {
      setLoadingKyc(false);
    }
  }

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

  async function fetchPendingMedbedVerifications() {
    setLoadingMedbed(true);
    try {
      const res = await fetch('/api/admin/medbed/verify');
      if (!res.ok) throw new Error('Failed to load medbed registrations');
      const data = await res.json();
      setMedbedRegistrations(data.registrations || []);
    } catch (err) {
      console.error(err);
      toast.error('Unable to load medbed registrations');
    } finally {
      setLoadingMedbed(false);
    }
  }

  async function verifyMedbedRegistration(registrationId: string, action: 'approve' | 'reject') {
    if (!verifyingMedbed) return;
    try {
      const res = await fetch('/api/admin/medbed/verify', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId,
          action,
          notes: verifyNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      toast.success(data.message || `Registration ${action === 'approve' ? 'approved' : 'rejected'}`);
      setVerifyingMedbed(null);
      setVerifyNotes('');
      fetchPendingMedbedVerifications();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Verification failed');
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
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar Navigation */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-surface-0 border-r border-border-default transition-all duration-300 flex flex-col overflow-hidden`}>
        <div className="h-16 border-b border-border-default flex items-center justify-between px-4">
          {sidebarOpen && <h1 className="font-bold text-lg text-primary">Admin</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-white/5 rounded"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto space-y-2 p-3">
          {[
            { id: "dashboard", label: "Dashboard", icon: BarChart3 },
            { id: "users", label: "Users", icon: Users },
            { id: "transactions", label: "Transactions", icon: Wallet },
            { id: "kyc", label: "KYC Verifications", icon: FileText },
            { id: "medbed", label: "Medbed", icon: Heart },
            { id: "settings", label: "Settings", icon: Settings },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                activeTab === id
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'hover:bg-white/5 text-text-200'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">{label}</span>}
            </button>
          ))}
        </nav>

        <div className="border-t border-border-default p-3 space-y-2">
          <button
            onClick={() => handleLogout()}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-600/20 text-red-400 transition text-sm font-medium"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold capitalize">{activeTab}</h1>
            <div className="text-sm text-text-200">{new Date().toLocaleDateString()}</div>
          </div>

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <DashboardCard
                  icon={Users}
                  title="Total Users"
                  value={stats.totalUsers}
                  color="blue"
                />
                <DashboardCard
                  icon={Wallet}
                  title="Total Balance"
                  value={`$${stats.totalBalance.toLocaleString()}`}
                  color="green"
                />
                <DashboardCard
                  icon={Clock}
                  title="Pending Withdrawals"
                  value={stats.pendingWithdrawals}
                  color="yellow"
                />
                <DashboardCard
                  icon={FileText}
                  title="Pending KYC"
                  value={stats.pendingKYC}
                  color="purple"
                />
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Withdrawals */}
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Recent Withdrawals</h2>
                    <button
                      onClick={fetchPendingWithdrawals}
                      className="text-xs px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-border-default"
                    >
                      Refresh
                    </button>
                  </div>
                  {loadingWithdrawals ? (
                    <div className="py-6 text-center text-text-300">Loading...</div>
                  ) : pendingWithdrawals && pendingWithdrawals.length > 0 ? (
                    <div className="space-y-2">
                      {pendingWithdrawals.slice(0, 5).map((t) => (
                        <div key={t._id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-border-default">
                          <div>
                            <p className="text-sm font-medium">{t.user || 'Unknown'}</p>
                            <p className="text-xs text-text-300">${t.amount.toLocaleString()}</p>
                          </div>
                          <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-300">{t.status}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-text-300">No pending withdrawals</div>
                  )}
                </div>

                {/* Pending Medbed */}
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Pending Medbed</h2>
                    <button
                      onClick={fetchPendingMedbedVerifications}
                      className="text-xs px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-border-default"
                    >
                      Refresh
                    </button>
                  </div>
                  {loadingMedbed ? (
                    <div className="py-6 text-center text-text-300">Loading...</div>
                  ) : medbedRegistrations && medbedRegistrations.length > 0 ? (
                    <div className="space-y-2">
                      {medbedRegistrations.slice(0, 5).map((m) => (
                        <div key={m._id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-border-default">
                          <div>
                            <p className="text-sm font-medium">{m.name}</p>
                            <p className="text-xs text-text-300">{m.amountXrp} XRP</p>
                          </div>
                          <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-300">{m.status}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-text-300">No pending verifications</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search by name, email, or account..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-border-default focus:border-primary outline-none transition"
                />
                <button
                  onClick={() => fetchUsers(1, query)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium"
                >
                  Search
                </button>
              </div>

              {/* Users Table */}
              <div className="card overflow-hidden">
                {loading ? (
                  <div className="py-12 text-center text-text-300">Loading users...</div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border-default bg-white/5">
                            <th className="px-4 py-3 text-left font-semibold">User</th>
                            <th className="px-4 py-3 text-left font-semibold">Email</th>
                            <th className="px-4 py-3 text-left font-semibold">Account</th>
                            <th className="px-4 py-3 text-left font-semibold">Balance</th>
                            <th className="px-4 py-3 text-left font-semibold">KYC</th>
                            <th className="px-4 py-3 text-left font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-default">
                          {users.map((u) => (
                            <tr key={u._id} className="hover:bg-white/5 transition">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                                    {u.fullName?.charAt(0) || 'U'}
                                  </div>
                                  <div>
                                    <p className="font-medium">{u.fullName || '—'}</p>
                                    <p className="text-xs text-text-300">{u.role}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-text-200">{u.email}</td>
                              <td className="px-4 py-3 font-mono text-xs text-text-200">{u.accountNumber || '—'}</td>
                              <td className="px-4 py-3 font-semibold">${(u.balance ?? 0).toLocaleString()}</td>
                              <td className="px-4 py-3">
                                <span className={`text-xs px-2 py-1 rounded font-medium ${u.kycVerified ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                  {u.kycVerified ? 'Verified' : 'Pending'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => viewUser(u._id)}
                                    className="px-3 py-1 text-xs rounded bg-white/10 hover:bg-white/20 transition border border-border-default"
                                  >
                                    View
                                  </button>
                                  <button
                                    onClick={() => openTopUpModal(u)}
                                    className="px-3 py-1 text-xs rounded bg-primary/20 hover:bg-primary/30 text-primary transition border border-primary/30"
                                  >
                                    Top-up
                                  </button>
                                  <button
                                    onClick={() => setDeleteUser(u)}
                                    className="px-3 py-1 text-xs rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 transition border border-red-500/30"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border-default bg-white/5">
                      <p className="text-sm text-text-300">
                        Showing {(page - 1) * limit + 1} - {Math.min(page * limit, total)} of {total}
                      </p>
                      <div className="flex gap-2">
                        <button
                          disabled={page <= 1}
                          onClick={() => fetchUsers(page - 1, query)}
                          className="px-3 py-1 rounded border border-border-default hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
                        >
                          Previous
                        </button>
                        <span className="px-3 py-1 text-sm text-text-300">{page}</span>
                        <button
                          disabled={page * limit >= total}
                          onClick={() => fetchUsers(page + 1, query)}
                          className="px-3 py-1 rounded border border-border-default hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === "transactions" && (
            <div className="space-y-4">
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Pending Withdrawals</h2>
                  <button
                    onClick={fetchPendingWithdrawals}
                    className="text-xs px-3 py-1 rounded bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 transition"
                  >
                    Refresh
                  </button>
                </div>
                {loadingWithdrawals ? (
                  <div className="py-8 text-center text-text-300">Loading...</div>
                ) : pendingWithdrawals && pendingWithdrawals.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border-default bg-white/5">
                          <th className="px-4 py-3 text-left font-semibold">User</th>
                          <th className="px-4 py-3 text-left font-semibold">Amount</th>
                          <th className="px-4 py-3 text-left font-semibold">Date</th>
                          <th className="px-4 py-3 text-left font-semibold">Details</th>
                          <th className="px-4 py-3 text-left font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-default">
                        {pendingWithdrawals.map((t) => (
                          <tr key={t._id} className="hover:bg-white/5 transition">
                            <td className="px-4 py-3 font-mono text-xs">{t.user || '—'}</td>
                            <td className="px-4 py-3 font-semibold">${(t.amount ?? 0).toLocaleString()}</td>
                            <td className="px-4 py-3 text-text-200">{new Date(t.createdAt || '').toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-text-300 max-w-xs truncate" title={t.details || t.reference || ''}>{t.details || t.reference || '—'}</td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => updateTransactionStatus(t._id, 'Completed')}
                                  className="px-3 py-1 text-xs rounded bg-green-500/20 text-green-300 hover:bg-green-500/30 transition border border-green-500/30"
                                >
                                  Complete
                                </button>
                                <button
                                  onClick={() => updateTransactionStatus(t._id, 'Failed')}
                                  className="px-3 py-1 text-xs rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 transition border border-red-500/30"
                                >
                                  Fail
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-text-300">No pending withdrawals</div>
                )}
              </div>
            </div>
          )}

          {/* KYC Tab */}
          {activeTab === "kyc" && (
            <div className="space-y-4">
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">KYC Verifications</h2>
                  <button
                    onClick={fetchKycData}
                    className="text-xs px-3 py-1 rounded bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 transition"
                  >
                    Refresh
                  </button>
                </div>
                {loadingKyc ? (
                  <div className="py-8 text-center text-text-300">Loading...</div>
                ) : kycData && kycData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border-default bg-white/5">
                          <th className="px-4 py-3 text-left font-semibold">User</th>
                          <th className="px-4 py-3 text-left font-semibold">Email</th>
                          <th className="px-4 py-3 text-left font-semibold">Status</th>
                          <th className="px-4 py-3 text-left font-semibold">Date Submitted</th>
                          <th className="px-4 py-3 text-left font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-default">
                        {kycData.map((kyc: any) => (
                          <tr key={kyc._id} className="hover:bg-white/5 transition">
                            <td className="px-4 py-3">
                              <p className="font-medium">{kyc.fullName || kyc.userId?.fullName || '—'}</p>
                            </td>
                            <td className="px-4 py-3 text-text-200">{kyc.email || kyc.userId?.email || '—'}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs px-2 py-1 rounded font-medium ${
                                kyc.status === 'approved' ? 'bg-green-500/20 text-green-300' :
                                kyc.status === 'rejected' ? 'bg-red-500/20 text-red-300' :
                                'bg-yellow-500/20 text-yellow-300'
                              }`}>
                                {kyc.status || 'Pending'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-text-200">
                              {kyc.createdAt ? new Date(kyc.createdAt).toLocaleDateString() : '—'}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => viewUser(kyc.userId?._id || kyc.userId)}
                                className="px-3 py-1 text-xs rounded bg-white/10 hover:bg-white/20 transition border border-border-default"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-text-300">No KYC submissions</div>
                )}
              </div>
            </div>
          )}

          {/* Medbed Tab */}
          {activeTab === "medbed" && (
            <div className="space-y-4">
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Pending Medbed Verifications</h2>
                  <button
                    onClick={fetchPendingMedbedVerifications}
                    className="text-xs px-3 py-1 rounded bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 transition"
                  >
                    Refresh
                  </button>
                </div>
                {loadingMedbed ? (
                  <div className="py-8 text-center text-text-300">Loading...</div>
                ) : medbedRegistrations && medbedRegistrations.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border-default bg-white/5">
                          <th className="px-4 py-3 text-left font-semibold">ID</th>
                          <th className="px-4 py-3 text-left font-semibold">Name</th>
                          <th className="px-4 py-3 text-left font-semibold">Email</th>
                          <th className="px-4 py-3 text-left font-semibold">Color</th>
                          <th className="px-4 py-3 text-left font-semibold">Amount (XRP)</th>
                          <th className="px-4 py-3 text-left font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-default">
                        {medbedRegistrations.map((m) => (
                          <tr key={m._id} className="hover:bg-white/5 transition">
                            <td className="px-4 py-3 font-mono text-xs">{m.registrationId.slice(0, 8)}...</td>
                            <td className="px-4 py-3">{m.name}</td>
                            <td className="px-4 py-3 text-text-200 text-xs">{m.email}</td>
                            <td className="px-4 py-3">
                              <span
                                className="px-2 py-1 rounded text-xs font-semibold"
                                style={{ backgroundColor: m.color || '#ffffff', opacity: 0.3, color: m.color || '#ffffff' }}
                              >
                                {m.color}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-semibold">{m.amountXrp}</td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => setVerifyingMedbed(m)}
                                className="px-3 py-1 text-xs rounded bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition border border-blue-500/30"
                              >
                                Review
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-text-300">No pending verifications</div>
                )}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Admin Settings</h2>
              <div className="py-8 text-center text-text-300">Settings feature coming soon...</div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {/* View User Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="card w-full max-w-2xl p-6">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-bold">User Details</h2>
              <button onClick={() => setSelected(null)} className="p-1 hover:bg-white/10 rounded-lg transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-white/5 rounded-lg border border-border-default">
                <p className="text-xs text-text-300 uppercase mb-1">Full Name</p>
                <p className="font-semibold">{selected.fullName || '—'}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-border-default">
                <p className="text-xs text-text-300 uppercase mb-1">Email</p>
                <p className="font-semibold">{selected.email || '—'}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-border-default">
                <p className="text-xs text-text-300 uppercase mb-1">Account Number</p>
                <p className="font-mono font-semibold">{selected.accountNumber || '—'}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-border-default">
                <p className="text-xs text-text-300 uppercase mb-1">Balance</p>
                <p className="font-semibold text-primary">${(selected.balance ?? 0).toLocaleString()}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-border-default">
                <p className="text-xs text-text-300 uppercase mb-1">Status</p>
                <p className="font-semibold">{selected.accountStatus || '—'}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-border-default">
                <p className="text-xs text-text-300 uppercase mb-1">KYC Status</p>
                <span className={`text-xs px-2 py-1 rounded font-medium ${selected.kycVerified ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                  {selected.kycVerified ? 'Verified' : 'Not Verified'}
                </span>
              </div>
            </div>

            {selected.address && (
              <div className="p-4 bg-white/5 rounded-lg border border-border-default mb-6">
                <p className="text-xs text-text-300 uppercase mb-1">Address</p>
                <p className="text-sm">{selected.address}</p>
              </div>
            )}

            {transactions && transactions.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Recent Transactions</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {transactions.map((t) => (
                    <div key={t._id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-border-default">
                      <div>
                        <p className="font-medium text-sm">{t.type} — ${t.amount.toLocaleString()}</p>
                        <p className="text-xs text-text-300">{new Date(t.createdAt || '').toLocaleString()}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${t.status === 'Completed' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 rounded-lg border border-border-default hover:bg-white/5 transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top-up Modal */}
      {topUpUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="card w-full max-w-md p-6">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-xl font-bold">Top-up {topUpUser.fullName || topUpUser.email}</h2>
              <button
                onClick={() => {
                  setTopUpUser(null);
                  setUserAssets([]);
                  setTopUpAsset(null);
                }}
                className="p-1 hover:bg-white/10 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Asset</label>
                {loadingAssets ? (
                  <div className="py-4 text-center text-text-300">Loading...</div>
                ) : userAssets.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-border-default rounded-lg p-2 bg-white/5">
                    {userAssets.map((asset) => (
                      <button
                        key={asset._id}
                        onClick={() => setTopUpAsset(asset)}
                        className={`w-full text-left p-3 rounded-lg border transition ${
                          topUpAsset?._id === asset._id
                            ? 'border-primary bg-primary/20'
                            : 'border-border-default hover:border-primary/50'
                        }`}
                      >
                        <p className="font-semibold">{asset.symbol || asset.name}</p>
                        <p className="text-xs text-text-300 mt-1">Current: {asset.quantity?.toFixed(8)} {asset.type}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center text-text-300 text-sm">No assets found</div>
                )}
              </div>

              {topUpAsset && (
                <div>
                  <label className="block text-sm font-medium mb-2">Amount ({topUpAsset.symbol})</label>
                  <input
                    type="number"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(Number(e.target.value))}
                    placeholder="Enter amount"
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-border-default focus:border-primary outline-none transition"
                    min="0"
                    step="0.01"
                  />
                </div>
              )}

              {topUpAsset && topUpAmount > 0 && (
                <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Current:</span>
                    <span className="font-semibold">{topUpAsset.quantity?.toFixed(8)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>After top-up:</span>
                    <span className="font-semibold text-primary">{((topUpAsset.quantity || 0) + topUpAmount).toFixed(8)}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => {
                    setTopUpUser(null);
                    setUserAssets([]);
                    setTopUpAsset(null);
                    setTopUpAmount(0);
                  }}
                  className="px-4 py-2 rounded-lg border border-border-default hover:bg-white/5 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={doTopUp}
                  disabled={!topUpAsset || topUpAmount <= 0}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deleteUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="card w-full max-w-md p-6">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-xl font-bold text-red-400">Delete User</h2>
              <button onClick={() => setDeleteUser(null)} className="p-1 hover:bg-white/10 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-text-200">
                Are you sure you want to delete <span className="font-semibold text-white">{deleteUser.fullName || deleteUser.email}</span>?
              </p>
              <p className="text-sm text-red-400">This action cannot be undone. All user data will be permanently removed.</p>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setDeleteUser(null)}
                  className="px-4 py-2 rounded-lg border border-border-default hover:bg-white/5 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteUser}
                  className="px-4 py-2 rounded-lg bg-red-600/20 border border-red-600/50 text-red-300 hover:bg-red-600/30 transition font-medium"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Medbed Verification Modal */}
      {verifyingMedbed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-xl font-bold">Verify Medbed Registration</h2>
              <button
                onClick={() => {
                  setVerifyingMedbed(null);
                  setVerifyNotes('');
                }}
                className="p-1 hover:bg-white/10 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white/5 rounded-lg border border-border-default">
                  <p className="text-xs text-text-300 uppercase mb-1">Registration ID</p>
                  <p className="font-mono text-sm font-semibold">{verifyingMedbed.registrationId.slice(0, 12)}...</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-border-default">
                  <p className="text-xs text-text-300 uppercase mb-1">Status</p>
                  <p className="text-sm font-semibold">{verifyingMedbed.status}</p>
                </div>
                <div className="col-span-2 p-3 bg-white/5 rounded-lg border border-border-default">
                  <p className="text-xs text-text-300 uppercase mb-1">Name</p>
                  <p className="text-sm font-semibold">{verifyingMedbed.name}</p>
                </div>
                <div className="col-span-2 p-3 bg-white/5 rounded-lg border border-border-default">
                  <p className="text-xs text-text-300 uppercase mb-1">Email</p>
                  <p className="text-sm font-semibold">{verifyingMedbed.email}</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-border-default">
                  <p className="text-xs text-text-300 uppercase mb-1">Phone</p>
                  <p className="text-sm font-semibold">{verifyingMedbed.phone}</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-border-default">
                  <p className="text-xs text-text-300 uppercase mb-1">Amount (XRP)</p>
                  <p className="text-sm font-semibold">{verifyingMedbed.amountXrp}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Verification Notes</label>
                <textarea
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  placeholder="Add approval or rejection notes..."
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-border-default focus:border-primary outline-none transition text-sm"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setVerifyingMedbed(null);
                  setVerifyNotes('');
                }}
                className="px-4 py-2 rounded-lg border border-border-default hover:bg-white/5 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => verifyMedbedRegistration(verifyingMedbed.registrationId, 'reject')}
                className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition font-medium"
              >
                Reject
              </button>
              <button
                onClick={() => verifyMedbedRegistration(verifyingMedbed.registrationId, 'approve')}
                className="px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30 transition font-medium"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Dashboard Card Component
function DashboardCard({ icon: Icon, title, value, color }: { icon: any; title: string; value: string | number; color: string }) {
  const colorClass = {
    blue: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
    green: 'bg-green-500/20 border-green-500/30 text-green-300',
    yellow: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300',
    purple: 'bg-purple-500/20 border-purple-500/30 text-purple-300',
  }[color];

  return (
    <div className={`card p-6 border ${colorClass}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-300 mb-2">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <Icon className="w-8 h-8 opacity-50" />
      </div>
    </div>
  );
}


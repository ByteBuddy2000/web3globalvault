"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import {
  BarChart3, Wallet, FileText, Heart, Users, Settings,
  LogOut, Menu, X, TrendingUp, Clock,
  PlusCircle, Trash2, ChevronRight
} from "lucide-react";

import AdminKYCPage from "./components/kyc-page";
import AdminTransactionsPage from "./components/transaction-page";
import AdminMedbedPage from "./components/medbed-page";
import AdminWalletPage from "./components/wallet-page";
import AdminCardsVerificationPage from "./components/cards-verification-page";
import { UserDrawer } from "./components/UserDrawer";

type TabId = "dashboard" | "users" | "kyc" | "transactions" | "medbed" | "wallet" | "cards" | "settings";

type User = {
  _id: string;
  fullName?: string;
  email?: string;
  accountNumber?: string;
  balance?: number;
  role?: string;
  accountStatus?: string;
  kycVerified?: boolean;
};

type Asset = { _id: string; symbol?: string; name?: string; type?: string; quantity?: number; };
type Transaction = { _id: string; user?: string; type: string; amount: number; status: string; createdAt?: string; };
type MedbedReg = { _id: string; name: string; amountXrp: number; status: string; };

const NAV_ITEMS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "users", label: "Users", icon: Users },
  { id: "transactions", label: "Transactions", icon: Wallet },
  { id: "cards", label: "Card Verification", icon: FileText },
  { id: "kyc", label: "KYC", icon: FileText },
  { id: "medbed", label: "Medbed", icon: Heart },
  { id: "wallet", label: "Wallet Approval", icon: Wallet },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Users
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 15;

  // Drawer
  const [drawerUserId, setDrawerUserId] = useState<string | null>(null);

  // Modals
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [topUpUser, setTopUpUser] = useState<User | null>(null);
  const [topUpAsset, setTopUpAsset] = useState<Asset | null>(null);
  const [topUpAmount, setTopUpAmount] = useState(0);
  const [userAssets, setUserAssets] = useState<Asset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [roleChangeUser, setRoleChangeUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<string>("");
  const [processingRole, setProcessingRole] = useState(false);

  // Dashboard stats
  const [stats, setStats] = useState({ totalUsers: 0, pendingWithdrawals: 0, pendingKYC: 0 });
  const [pendingWithdrawals, setPendingWithdrawals] = useState<Transaction[]>([]);
  const [medbedRegs, setMedbedRegs] = useState<MedbedReg[]>([]);

  useEffect(() => {
    fetchUsers(1, "");
    loadDashboard();
  }, []);

  // Close mobile nav on tab change
  useEffect(() => { setMobileNavOpen(false); }, [activeTab]);

  async function loadDashboard() {
    try {
      const [statsRes, txRes, mbRes] = await Promise.all([
        fetch("/api/admin/dashboard"),
        fetch("/api/admin/transactions?status=Pending"),
        fetch("/api/admin/medbed/verify"),
      ]);
      if (statsRes.ok) { const d = await statsRes.json(); setStats({ totalUsers: d.totalUsers || 0, pendingWithdrawals: d.pendingWithdrawals || 0, pendingKYC: d.pendingKYC || 0 }); }
      if (txRes.ok) { const d = await txRes.json(); setPendingWithdrawals((d.transactions || []).slice(0, 5)); }
      if (mbRes.ok) { const d = await mbRes.json(); setMedbedRegs((d.registrations || []).slice(0, 5)); }
    } catch { toast.error("Failed to load dashboard"); }
  }

  async function fetchUsers(p = page, q = query) {
    setLoadingUsers(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(LIMIT) });
      if (q) params.set("q", q);
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.meta?.total || 0);
      setPage(data.meta?.page || p);
    } catch { toast.error("Failed to load users"); }
    finally { setLoadingUsers(false); }
  }

  async function confirmDeleteUser() {
    if (!deleteUser) return;
    try {
      const res = await fetch(`/api/admin/users/${deleteUser._id}`, { method: "DELETE" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      toast.success("User deleted");
      setDeleteUser(null);
      fetchUsers(page, query);
    } catch (e: any) { toast.error(e.message || "Delete failed"); }
  }

  async function openTopUpModal(u: User) {
    setTopUpUser(u); setTopUpAsset(null); setTopUpAmount(0);
    setLoadingAssets(true);
    try {
      const res = await fetch(`/api/admin/users/assets?userId=${u._id}`);
      const data = await res.json();
      setUserAssets(data.assets || []);
    } catch { toast.error("Failed to load assets"); }
    finally { setLoadingAssets(false); }
  }

  async function doTopUp() {
    if (!topUpUser || !topUpAsset) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: topUpUser._id, assetId: topUpAsset._id, amount: Number(topUpAmount) }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      toast.success("Top-up successful");
      setTopUpUser(null); setTopUpAsset(null); setTopUpAmount(0); setUserAssets([]);
      fetchUsers(page, query);
    } catch (e: any) { toast.error(e.message || "Top-up failed"); }
  }

  async function changeUserRole() {
    if (!roleChangeUser || !newRole) return;
    setProcessingRole(true);
    try {
      const res = await fetch(`/api/admin/users/${roleChangeUser._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      toast.success("User role updated successfully");
      setRoleChangeUser(null);
      setNewRole("");
      fetchUsers(page, query);
    } catch (e: any) {
      toast.error(e.message || "Failed to update role");
    } finally {
      setProcessingRole(false);
    }
  }

  const statusBadge = (s?: string) => ({
    Active: "bg-green-500/15 text-green-400 border-green-500/30",
    Suspended: "bg-red-500/15 text-red-400 border-red-500/30",
    Inactive: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  }[s ?? ""] ?? "bg-white/10 text-white/50 border-white/10");

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">

      {/* ── Desktop Sidebar ─────────────────────────────────────────────── */}
      <aside className={`hidden md:flex flex-col ${sidebarOpen ? "w-56" : "w-16"} border-r border-border-default bg-white/[0.02] transition-all duration-300 shrink-0`}>
        <div className="h-14 flex items-center justify-between px-3 border-b border-border-default">
          {sidebarOpen && <span className="font-bold text-primary text-sm">Admin</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-white/5 transition ml-auto">
            <Menu className="w-4 h-4" />
          </button>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg transition text-sm ${
                activeTab === id ? "bg-primary/20 text-primary border border-primary/30" : "hover:bg-white/5 text-text-200"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {sidebarOpen && <span className="font-medium">{label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-2 border-t border-border-default">
          <button
            onClick={() => signOut({ redirect: true, callbackUrl: "/signin" })}
            className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg hover:bg-red-500/10 text-red-400 transition text-sm"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Mobile Header ───────────────────────────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-background/95 backdrop-blur border-b border-border-default flex items-center justify-between px-4">
        <span className="font-bold text-primary">Admin</span>
        <button onClick={() => setMobileNavOpen(true)} className="p-2 rounded-lg hover:bg-white/5 transition">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* ── Mobile Nav Drawer ───────────────────────────────────────────── */}
      {mobileNavOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setMobileNavOpen(false)} />
          <div className="fixed top-0 left-0 bottom-0 z-50 w-64 bg-background border-r border-border-default flex flex-col md:hidden">
            <div className="h-14 flex items-center justify-between px-4 border-b border-border-default">
              <span className="font-bold text-primary">Admin</span>
              <button onClick={() => setMobileNavOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition text-sm ${
                    activeTab === id ? "bg-primary/20 text-primary border border-primary/30" : "hover:bg-white/5 text-text-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </nav>
            <div className="p-3 border-t border-border-default">
              <button
                onClick={() => signOut({ redirect: true, callbackUrl: "/signin" })}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-red-500/10 text-red-400 transition text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto md:pt-0 pt-14">

        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <button onClick={loadDashboard} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-border-default hover:bg-white/10 transition">Refresh</button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { label: "Total Users", value: stats.totalUsers, icon: Users, color: "blue" },
                { label: "Pending Withdrawals", value: stats.pendingWithdrawals, icon: Clock, color: "yellow" },
                { label: "Pending KYC", value: stats.pendingKYC, icon: FileText, color: "purple" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className={`card p-4 border ${
                  color === "blue" ? "border-blue-500/20" :
                  color === "green" ? "border-green-500/20" :
                  color === "yellow" ? "border-yellow-500/20" :
                  "border-purple-500/20"
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-text-300 mb-1">{label}</p>
                      <p className="text-xl sm:text-2xl font-bold">{value}</p>
                    </div>
                    <Icon className={`w-6 h-6 opacity-40 shrink-0 ${
                      color === "blue" ? "text-blue-400" :
                      color === "green" ? "text-green-400" :
                      color === "yellow" ? "text-yellow-400" :
                      "text-purple-400"
                    }`} />
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-sm">Pending Withdrawals</h2>
                  <button onClick={() => setActiveTab("transactions")} className="text-xs text-primary hover:underline flex items-center gap-1">
                    View all <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                {pendingWithdrawals.length === 0 ? (
                  <p className="text-sm text-text-300 py-4 text-center">None pending</p>
                ) : (
                  <div className="space-y-2">
                    {pendingWithdrawals.map((t) => (
                      <div key={t._id} className="flex justify-between items-center p-2.5 bg-white/5 rounded-lg border border-border-default text-sm">
                        <span className="text-text-200 truncate text-xs font-mono">{t.user || "—"}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-semibold">${t.amount.toLocaleString()}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-400">{t.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-sm">Pending Medbed</h2>
                  <button onClick={() => setActiveTab("medbed")} className="text-xs text-primary hover:underline flex items-center gap-1">
                    View all <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                {medbedRegs.length === 0 ? (
                  <p className="text-sm text-text-300 py-4 text-center">None pending</p>
                ) : (
                  <div className="space-y-2">
                    {medbedRegs.map((m) => (
                      <div key={m._id} className="flex justify-between items-center p-2.5 bg-white/5 rounded-lg border border-border-default text-sm">
                        <span className="font-medium truncate">{m.name}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-semibold text-yellow-400">{m.amountXrp} XRP</span>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/15 text-red-400">{m.status.replace("_", " ")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="p-4 sm:p-6 space-y-4 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold">Users</h1>

            {/* Search */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search name, email, account..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchUsers(1, query)}
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-border-default focus:border-primary outline-none text-sm transition"
              />
              <button
                onClick={() => fetchUsers(1, query)}
                className="px-4 py-2 bg-primary/20 border border-primary/30 text-primary rounded-lg text-sm font-medium hover:bg-primary/30 transition"
              >
                Search
              </button>
            </div>

            {/* Table — desktop */}
            <div className="card overflow-hidden hidden sm:block">
              {loadingUsers ? (
                <div className="py-12 text-center text-text-300">Loading...</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border-default bg-white/5">
                          {["User", "Email", "Account", "Balance", "Status", "KYC", "Actions"].map((h) => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-text-300 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-default">
                        {users.map((u) => (
                          <tr key={u._id} className="hover:bg-white/5 transition">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                                  {u.fullName?.charAt(0) ?? "U"}
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{u.fullName || "—"}</p>
                                  <p className="text-xs text-text-300">{u.role}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-text-200 text-xs max-w-[160px] truncate">{u.email}</td>
                            <td className="px-4 py-3 font-mono text-xs text-text-300">{u.accountNumber || "—"}</td>
                            <td className="px-4 py-3 font-semibold text-sm">${(u.balance ?? 0).toLocaleString()}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs px-2 py-1 rounded-full border font-medium ${statusBadge(u.accountStatus)}`}>
                                {u.accountStatus || "—"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs px-2 py-1 rounded-full border font-medium ${u.kycVerified ? "bg-green-500/15 text-green-400 border-green-500/30" : "bg-red-500/15 text-red-400 border-red-500/30"}`}>
                                {u.kycVerified ? "Yes" : "No"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1.5">
                                <button onClick={() => setDrawerUserId(u._id)} className="px-2.5 py-1 text-xs rounded-lg bg-white/10 border border-border-default hover:bg-white/20 transition">View</button>
                                <button onClick={() => { setRoleChangeUser(u); setNewRole(u.role || ""); }} className="px-2.5 py-1 text-xs rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25 transition">Role</button>
                                <button onClick={() => openTopUpModal(u)} className="px-2.5 py-1 text-xs rounded-lg bg-primary/15 border border-primary/30 text-primary hover:bg-primary/25 transition">Top-up</button>
                                <button onClick={() => setDeleteUser(u)} className="px-2.5 py-1 text-xs rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition">Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination */}
                  <div className="flex items-center justify-between px-4 py-3 border-t border-border-default bg-white/5">
                    <p className="text-xs text-text-300">
                      {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
                    </p>
                    <div className="flex gap-2">
                      <button disabled={page <= 1} onClick={() => fetchUsers(page - 1, query)} className="px-3 py-1 rounded-lg border border-border-default text-xs hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition">Prev</button>
                      <span className="px-3 py-1 text-xs text-text-300">{page}</span>
                      <button disabled={page * LIMIT >= total} onClick={() => fetchUsers(page + 1, query)} className="px-3 py-1 rounded-lg border border-border-default text-xs hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition">Next</button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Card layout — mobile */}
            <div className="sm:hidden space-y-3">
              {loadingUsers ? (
                <div className="py-12 text-center text-text-300">Loading...</div>
              ) : users.map((u) => (
                <div key={u._id} className="card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center">
                        {u.fullName?.charAt(0) ?? "U"}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{u.fullName || "—"}</p>
                        <p className="text-xs text-text-300">{u.email}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${statusBadge(u.accountStatus)}`}>{u.accountStatus}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-white/5 rounded-lg">
                      <p className="text-text-300">Balance</p>
                      <p className="font-bold">${(u.balance ?? 0).toLocaleString()}</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-lg">
                      <p className="text-text-300">KYC</p>
                      <p className={`font-bold ${u.kycVerified ? "text-green-400" : "text-red-400"}`}>{u.kycVerified ? "Verified" : "Pending"}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => setDrawerUserId(u._id)} className="flex-1 py-1.5 text-xs rounded-lg bg-white/10 border border-border-default hover:bg-white/20 transition text-center">View</button>
                    <button onClick={() => openTopUpModal(u)} className="flex-1 py-1.5 text-xs rounded-lg bg-primary/15 border border-primary/30 text-primary hover:bg-primary/25 transition text-center">Top-up</button>
                    <button onClick={() => setDeleteUser(u)} className="flex-1 py-1.5 text-xs rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition text-center">Delete</button>
                  </div>
                </div>
              ))}
              {/* Mobile pagination */}
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-text-300">{(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}</p>
                <div className="flex gap-2">
                  <button disabled={page <= 1} onClick={() => fetchUsers(page - 1, query)} className="px-3 py-1 rounded-lg border border-border-default text-xs hover:bg-white/5 disabled:opacity-40 transition">Prev</button>
                  <button disabled={page * LIMIT >= total} onClick={() => fetchUsers(page + 1, query)} className="px-3 py-1 rounded-lg border border-border-default text-xs hover:bg-white/5 disabled:opacity-40 transition">Next</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delegate to sub-pages */}
        {activeTab === "kyc" && <AdminKYCPage />}
        {activeTab === "transactions" && <AdminTransactionsPage />}
        {activeTab === "medbed" && <AdminMedbedPage />}
        {activeTab === "wallet" && <AdminWalletPage />}
        {activeTab === "cards" && <AdminCardsVerificationPage />}

        {/* Settings */}
        {activeTab === "settings" && (
          <div className="p-4 sm:p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Settings</h1>
            <div className="card p-8 text-center text-text-300">Coming soon...</div>
          </div>
        )}
      </main>

      {/* User Drawer */}
      <UserDrawer userId={drawerUserId} onClose={() => setDrawerUserId(null)} />

      {/* Delete Modal */}
      {deleteUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="card w-full max-w-sm p-6 space-y-4">
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-bold text-red-400">Delete User</h2>
              <button onClick={() => setDeleteUser(null)} className="p-1 rounded-lg hover:bg-white/10 transition"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-text-200">Are you sure you want to delete <strong className="text-foreground">{deleteUser.fullName || deleteUser.email}</strong>? This cannot be undone.</p>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setDeleteUser(null)} className="px-4 py-2 rounded-lg border border-border-default text-sm hover:bg-white/5 transition">Cancel</button>
              <button onClick={confirmDeleteUser} className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-sm hover:bg-red-500/30 transition">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Top-up Modal */}
      {topUpUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="card w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-bold">Top-up</h2>
              <button onClick={() => { setTopUpUser(null); setUserAssets([]); setTopUpAsset(null); }} className="p-1 rounded-lg hover:bg-white/10 transition"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-text-200">{topUpUser.fullName || topUpUser.email}</p>

            {loadingAssets ? (
              <div className="py-6 text-center text-text-300 text-sm">Loading assets...</div>
            ) : userAssets.length === 0 ? (
              <div className="py-6 text-center text-text-300 text-sm">No assets found</div>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto border border-border-default rounded-lg p-2 bg-white/5">
                {userAssets.map((a) => (
                  <button
                    key={a._id}
                    onClick={() => setTopUpAsset(a)}
                    className={`w-full text-left p-3 rounded-lg border transition text-sm ${topUpAsset?._id === a._id ? "border-primary bg-primary/15" : "border-border-default hover:border-primary/40"}`}
                  >
                    <p className="font-semibold">{a.symbol || a.name}</p>
                    <p className="text-xs text-text-300">Current: {a.quantity?.toFixed(8)}</p>
                  </button>
                ))}
              </div>
            )}

            {topUpAsset && (
              <div>
                <label className="block text-sm font-medium mb-1.5">Amount ({topUpAsset.symbol})</label>
                <input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-border-default focus:border-primary outline-none text-sm transition"
                  min="0" step="0.01"
                />
              </div>
            )}

            {topUpAsset && topUpAmount > 0 && (
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm space-y-1">
                <div className="flex justify-between"><span className="text-text-300">Current</span><span>{topUpAsset.quantity?.toFixed(8)}</span></div>
                <div className="flex justify-between"><span className="text-text-300">After</span><span className="text-primary font-semibold">{((topUpAsset.quantity || 0) + topUpAmount).toFixed(8)}</span></div>
              </div>
            )}

            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => { setTopUpUser(null); setUserAssets([]); setTopUpAsset(null); setTopUpAmount(0); }} className="px-4 py-2 rounded-lg border border-border-default text-sm hover:bg-white/5 transition">Cancel</button>
              <button onClick={doTopUp} disabled={!topUpAsset || topUpAmount <= 0} className="px-4 py-2 rounded-lg bg-primary/20 border border-primary/30 text-primary text-sm hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {roleChangeUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="card w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-bold">Change User Role</h2>
              <button onClick={() => setRoleChangeUser(null)} className="p-1 rounded-lg hover:bg-white/10 transition"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-text-200">
                Updating role for <strong className="text-foreground">{roleChangeUser.fullName || roleChangeUser.email}</strong>
              </p>
              <div className="p-3 bg-white/5 border border-border-default rounded-lg">
                <p className="text-xs text-text-300 mb-1">Current Role</p>
                <p className="text-sm font-semibold">{roleChangeUser.role || "Not assigned"}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">New Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                disabled={processingRole}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-border-default focus:border-primary outline-none text-sm transition"
              >
                <option value="">Select a role...</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              
              </select>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setRoleChangeUser(null)}
                disabled={processingRole}
                className="px-4 py-2 rounded-lg border border-border-default text-sm hover:bg-white/5 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={changeUserRole}
                disabled={!newRole || processingRole || newRole === roleChangeUser.role}
                className="px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-300 text-sm hover:bg-blue-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingRole ? "Updating..." : "Update Role"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
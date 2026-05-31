"use client";

import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  CheckCircle, XCircle, X, ChevronDown, ChevronUp,
  User, MapPin, FileText, Clock, Shield, RefreshCw, ZoomIn
} from "lucide-react";

interface KYCUser {
  _id: string;
  email: string;
  fullName: string;
  accountNumber: string;
}

interface KYCRecord {
  _id: string;
  user: KYCUser;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  documentType: string;
  documentNumber: string;
  documentImageId?: string;
  selfieImageId?: string;
  status: "pending" | "verified" | "rejected";
  submittedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
  remarks?: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

const STATUS_TABS = ["pending", "verified", "rejected"] as const;
type StatusTab = typeof STATUS_TABS[number];

export default function AdminKYCPage() {
  const [records, setRecords] = useState<KYCRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 10, pages: 1 });
  const [activeStatus, setActiveStatus] = useState<StatusTab>("pending");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [remarks, setRemarks] = useState("");
  const [showRejectInput, setShowRejectInput] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchRecords = useCallback(async (status: StatusTab = activeStatus, page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/kyc?status=${status}&page=${page}&limit=10`);
      const data = await res.json();
      if (data.success) {
        setRecords(data.data);
        setPagination(data.pagination);
      } else {
        toast.error("Failed to fetch KYC records");
      }
    } catch {
      toast.error("Error fetching KYC records");
    } finally {
      setLoading(false);
    }
  }, [activeStatus]);

  useEffect(() => { fetchRecords(activeStatus, 1); }, [activeStatus]);

  const handleApprove = async (kycId: string) => {
    setActionLoading(kycId);
    try {
      const res = await fetch("/api/admin/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kycId, action: "approve", remarks }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("KYC approved successfully");
        setRemarks(""); setExpandedId(null);
        fetchRecords(activeStatus, pagination.page);
      } else {
        toast.error(data.error || "Failed to approve");
      }
    } catch { toast.error("Error approving KYC"); }
    finally { setActionLoading(null); }
  };

  const handleReject = async (kycId: string) => {
    if (!rejectionReason.trim()) { toast.error("Please provide a rejection reason"); return; }
    setActionLoading(kycId);
    try {
      const res = await fetch("/api/admin/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kycId, action: "reject", rejectionReason, remarks }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("KYC rejected");
        setRejectionReason(""); setRemarks(""); setExpandedId(null); setShowRejectInput(null);
        fetchRecords(activeStatus, pagination.page);
      } else {
        toast.error(data.error || "Failed to reject");
      }
    } catch { toast.error("Error rejecting KYC"); }
    finally { setActionLoading(null); }
  };

  const statusColor = (s: string) => ({
    pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    verified: "bg-green-500/15 text-green-400 border-green-500/30",
    rejected: "bg-red-500/15 text-red-400 border-red-500/30",
  }[s] ?? "bg-white/10 text-white/60");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <Shield className="w-7 h-7 text-primary" /> KYC Verifications
            </h1>
            <p className="text-sm text-text-200 mt-1">{pagination.total} total records</p>
          </div>
          <button
            onClick={() => fetchRecords(activeStatus, pagination.page)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-border-default hover:bg-white/10 transition text-sm"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-border-default w-fit">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              onClick={() => { setActiveStatus(s); setExpandedId(null); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
                activeStatus === s ? "bg-primary/20 text-primary border border-primary/30" : "hover:bg-white/5 text-text-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Records */}
        {loading ? (
          <div className="py-16 text-center text-text-300">Loading records...</div>
        ) : records.length === 0 ? (
          <div className="card p-12 text-center text-text-300">No {activeStatus} KYC records.</div>
        ) : (
          <div className="space-y-3">
            {records.map((kyc) => (
              <div key={kyc._id} className="card border border-border-default overflow-hidden">
                {/* Row Header */}
                <div
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 cursor-pointer hover:bg-white/5 transition"
                  onClick={() => setExpandedId(expandedId === kyc._id ? null : kyc._id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {kyc.firstName?.charAt(0)}{kyc.lastName?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{kyc.firstName} {kyc.lastName}</p>
                      <p className="text-xs text-text-300 truncate">{kyc.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-12 sm:ml-0">
                    <span className={`text-xs px-2 py-1 rounded-full border font-medium capitalize ${statusColor(kyc.status)}`}>
                      {kyc.status}
                    </span>
                    <span className="text-xs text-text-300 hidden sm:block">
                      {new Date(kyc.submittedAt).toLocaleDateString()}
                    </span>
                    {expandedId === kyc._id ? <ChevronUp className="w-4 h-4 text-text-300" /> : <ChevronDown className="w-4 h-4 text-text-300" />}
                  </div>
                </div>

                {/* Expanded */}
                {expandedId === kyc._id && (
                  <div className="border-t border-border-default p-4 space-y-5">

                    {/* Personal + Address */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-300 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" /> Personal Info
                        </h3>
                        {[
                          ["Account", kyc.user?.accountNumber],
                          ["Date of Birth", new Date(kyc.dateOfBirth).toLocaleDateString()],
                          ["Document Type", kyc.documentType],
                          ["Document No.", kyc.documentNumber],
                        ].map(([label, value]) => (
                          <div key={label} className="flex justify-between text-sm">
                            <span className="text-text-300">{label}</span>
                            <span className="font-medium text-right ml-4 truncate max-w-[55%]">{value || "—"}</span>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-300 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" /> Address
                        </h3>
                        <div className="text-sm space-y-1">
                          <p>{kyc.address}</p>
                          <p>{kyc.city}, {kyc.state} {kyc.zipCode}</p>
                          <p className="text-text-200">{kyc.country}</p>
                        </div>
                        {kyc.rejectionReason && (
                          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-300">
                            <strong>Rejection:</strong> {kyc.rejectionReason}
                          </div>
                        )}
                        {kyc.remarks && (
                          <div className="p-3 bg-white/5 border border-border-default rounded-lg text-xs text-text-200">
                            <strong>Remarks:</strong> {kyc.remarks}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Document Images */}
                    {(kyc.documentImageId || kyc.selfieImageId) && (
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-300 flex items-center gap-1.5 mb-3">
                          <FileText className="w-3.5 h-3.5" /> Documents
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          {kyc.documentImageId && (
                            <div className="relative group cursor-pointer" onClick={() => setPreviewImage(`/api/kyc/file/${kyc.documentImageId}`)}>
                              <img
                                src={`/api/kyc/file/${kyc.documentImageId}`}
                                alt="Document"
                                className="w-full h-36 object-cover rounded-lg border border-border-default"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center">
                                <ZoomIn className="w-6 h-6 text-white" />
                              </div>
                              <p className="text-xs text-text-300 mt-1 text-center">Document</p>
                            </div>
                          )}
                          {kyc.selfieImageId && (
                            <div className="relative group cursor-pointer" onClick={() => setPreviewImage(`/api/kyc/file/${kyc.selfieImageId}`)}>
                              <img
                                src={`/api/kyc/file/${kyc.selfieImageId}`}
                                alt="Selfie"
                                className="w-full h-36 object-cover rounded-lg border border-border-default"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center">
                                <ZoomIn className="w-6 h-6 text-white" />
                              </div>
                              <p className="text-xs text-text-300 mt-1 text-center">Selfie</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions — only for pending */}
                    {kyc.status === "pending" && (
                      <div className="space-y-3 pt-2 border-t border-border-default">
                        <div>
                          <label className="block text-xs font-medium text-text-300 mb-1.5">Remarks (optional)</label>
                          <textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            rows={2}
                            placeholder="Add a note for the user..."
                            className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-border-default focus:border-primary outline-none resize-none transition"
                          />
                        </div>

                        {showRejectInput === kyc._id && (
                          <div>
                            <label className="block text-xs font-medium text-red-400 mb-1.5">Rejection Reason (required)</label>
                            <textarea
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              rows={2}
                              placeholder="Why is this KYC being rejected?"
                              className="w-full px-3 py-2 text-sm rounded-lg bg-red-500/10 border border-red-500/30 focus:border-red-400 outline-none resize-none transition"
                            />
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2 justify-end">
                          {showRejectInput !== kyc._id ? (
                            <>
                              <button
                                onClick={() => setShowRejectInput(kyc._id)}
                                disabled={!!actionLoading}
                                className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition disabled:opacity-50"
                              >
                                <XCircle className="w-4 h-4" /> Reject
                              </button>
                              <button
                                onClick={() => handleApprove(kyc._id)}
                                disabled={actionLoading === kyc._id}
                                className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-green-500/15 border border-green-500/30 text-green-400 hover:bg-green-500/25 transition disabled:opacity-50"
                              >
                                <CheckCircle className="w-4 h-4" />
                                {actionLoading === kyc._id ? "Approving..." : "Approve"}
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => { setShowRejectInput(null); setRejectionReason(""); }}
                                className="px-4 py-2 text-sm rounded-lg border border-border-default hover:bg-white/5 transition"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleReject(kyc._id)}
                                disabled={actionLoading === kyc._id}
                                className="px-4 py-2 text-sm rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 transition disabled:opacity-50"
                              >
                                {actionLoading === kyc._id ? "Rejecting..." : "Confirm Rejection"}
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

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-text-300">
              Page {pagination.page} of {pagination.pages} ({pagination.total} total)
            </p>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchRecords(activeStatus, pagination.page - 1)}
                className="px-3 py-1.5 text-sm rounded-lg border border-border-default hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchRecords(activeStatus, pagination.page + 1)}
                className="px-3 py-1.5 text-sm rounded-lg border border-border-default hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Image Lightbox */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition">
            <X className="w-5 h-5" />
          </button>
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
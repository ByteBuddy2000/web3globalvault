"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle, XCircle, Eye, X } from "lucide-react";

interface KYCRecord {
  _id: string;
  user: {
    _id: string;
    email: string;
    fullName: string;
    accountNumber: string;
  };
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
  documentImage: string;
  selfieImage: string;
  status: "pending" | "verified" | "rejected";
  submittedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

export default function KYCAdminPage() {
  const [kycRecords, setKycRecords] = useState<KYCRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState<string | null>(null);
  const [remarks, setRemarks] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageModal, setImageModal] = useState(false);

  useEffect(() => {
    fetchKYCRecords();
  }, []);

  const fetchKYCRecords = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/kyc?status=pending");
      const data = await res.json();

      if (data.success) {
        setKycRecords(data.data);
      } else {
        toast.error("Failed to fetch KYC records");
      }
    } catch (error) {
      toast.error("Error fetching KYC records");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (kycId: string) => {
    try {
      setActionLoading(kycId);
      const res = await fetch("/api/admin/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kycId,
          action: "approve",
          remarks,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("KYC approved successfully");
        setRemarks("");
        fetchKYCRecords();
        setExpandedId(null);
      } else {
        toast.error(data.error || "Failed to approve KYC");
      }
    } catch (error) {
      toast.error("Error approving KYC");
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (kycId: string) => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      setActionLoading(kycId);
      const res = await fetch("/api/admin/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kycId,
          action: "reject",
          rejectionReason: rejectionReason,
          remarks,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("KYC rejected successfully");
        setRejectionReason("");
        setRemarks("");
        fetchKYCRecords();
        setExpandedId(null);
        setShowRejectInput(null);
      } else {
        toast.error(data.error || "Failed to reject KYC");
      }
    } catch (error) {
      toast.error("Error rejecting KYC");
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--background)" }}>
        <div style={{ color: "var(--text-200)" }}>Loading KYC records...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "var(--space-6)", backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 style={{ fontSize: "var(--text-4xl)", fontWeight: 700, marginBottom: "var(--space-2)", color: "var(--foreground)" }}>
          KYC Verification
        </h1>

        <p style={{ color: "var(--text-200)", marginBottom: "var(--space-6)" }}>
          Review and verify pending KYC submissions ({kycRecords.length})
        </p>

        {kycRecords.length === 0 ? (
          <div className="card card-elevated" style={{ padding: "var(--space-6)", textAlign: "center" }}>
            <p style={{ color: "var(--text-200)" }}>No pending KYC records to verify.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "var(--space-4)" }}>
            {kycRecords.map((kyc) => (
              <div key={kyc._id} className="card" style={{ padding: "var(--space-4)" }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "var(--space-4)" }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: "var(--text-lg)", color: "var(--foreground)", marginBottom: "var(--space-1)" }}>
                      {kyc.firstName} {kyc.lastName}
                    </p>
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--text-200)", marginBottom: "var(--space-1)" }}>
                      Email: {kyc.user.email}
                    </p>
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--text-200)" }}>
                      Account: {kyc.user.accountNumber}
                    </p>
                  </div>
                  <button
                    onClick={() => setExpandedId(expandedId === kyc._id ? null : kyc._id)}
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--primary)",
                      fontSize: "1.5rem",
                    }}
                  >
                    {expandedId === kyc._id ? "−" : "+"}
                  </button>
                </div>

                {/* Expanded Details */}
                {expandedId === kyc._id && (
                  <div style={{ borderTop: "1px solid var(--border-default)", paddingTop: "var(--space-4)" }}>
                    {/* Personal Information */}
                    <div style={{ marginBottom: "var(--space-6)" }}>
                      <h3 style={{ fontWeight: 600, color: "var(--foreground)", marginBottom: "var(--space-2)" }}>
                        Personal Information
                      </h3>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-3)", fontSize: "var(--text-sm)" }}>
                        <div>
                          <p style={{ color: "var(--text-200)", marginBottom: "var(--space-1)" }}>Date of Birth</p>
                          <p style={{ color: "var(--foreground)" }}>
                            {new Date(kyc.dateOfBirth).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p style={{ color: "var(--text-200)", marginBottom: "var(--space-1)" }}>Document Type</p>
                          <p style={{ color: "var(--foreground)" }}>{kyc.documentType}</p>
                        </div>
                        <div>
                          <p style={{ color: "var(--text-200)", marginBottom: "var(--space-1)" }}>Document Number</p>
                          <p style={{ color: "var(--foreground)" }}>{kyc.documentNumber}</p>
                        </div>
                      </div>
                    </div>

                    {/* Address Information */}
                    <div style={{ marginBottom: "var(--space-6)" }}>
                      <h3 style={{ fontWeight: 600, color: "var(--foreground)", marginBottom: "var(--space-2)" }}>
                        Address
                      </h3>
                      <div style={{ fontSize: "var(--text-sm)", color: "var(--text-100)" }}>
                        <p>{kyc.address}</p>
                        <p>{kyc.city}, {kyc.state} {kyc.zipCode}</p>
                        <p>{kyc.country}</p>
                      </div>
                    </div>

                    {/* Document Preview */}
                    <div style={{ marginBottom: "var(--space-6)" }}>
                      <h3 style={{ fontWeight: 600, color: "var(--foreground)", marginBottom: "var(--space-2)" }}>
                        Documents
                      </h3>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
                        {kyc.documentImage && (
                          <div>
                            <p style={{ fontSize: "var(--text-xs)", color: "var(--text-200)", marginBottom: "var(--space-2)" }}>
                              Document Image
                            </p>
                            <img
                              src={kyc.documentImage}
                              alt="Document"
                              style={{
                                width: "100%",
                                height: "200px",
                                objectFit: "cover",
                                borderRadius: "var(--radius-md)",
                                border: "1px solid var(--border-default)",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                setPreviewImage(kyc.documentImage);
                                setImageModal(true);
                              }}
                            />
                          </div>
                        )}
                        {kyc.selfieImage && (
                          <div>
                            <p style={{ fontSize: "var(--text-xs)", color: "var(--text-200)", marginBottom: "var(--space-2)" }}>
                              Selfie
                            </p>
                            <img
                              src={kyc.selfieImage}
                              alt="Selfie"
                              style={{
                                width: "100%",
                                height: "200px",
                                objectFit: "cover",
                                borderRadius: "var(--radius-md)",
                                border: "1px solid var(--border-default)",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                setPreviewImage(kyc.selfieImage);
                                setImageModal(true);
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Remarks */}
                    <div style={{ marginBottom: "var(--space-6)" }}>
                      <label style={{ display: "block", fontWeight: 600, color: "var(--foreground)", marginBottom: "var(--space-2)" }}>
                        Remarks (Optional)
                      </label>
                      <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Add any remarks for the user..."
                        style={{
                          width: "100%",
                          backgroundColor: "var(--glass-white-sm)",
                          padding: "var(--space-3)",
                          borderRadius: "var(--radius-md)",
                          border: "1px solid var(--border-default)",
                          color: "var(--foreground)",
                          fontSize: "var(--text-sm)",
                          minHeight: "100px",
                          resize: "vertical",
                          transition: "all var(--duration-base) var(--ease-out)",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "var(--primary)";
                          e.currentTarget.style.backgroundColor = "var(--glass-white-md)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "var(--border-default)";
                          e.currentTarget.style.backgroundColor = "var(--glass-white-sm)";
                        }}
                      />
                    </div>

                    {/* Rejection Reason Input */}
                    {showRejectInput === kyc._id && (
                      <div style={{ marginBottom: "var(--space-6)", backgroundColor: "rgba(239, 68, 68, 0.1)", padding: "var(--space-4)", borderRadius: "var(--radius-md)", border: "1px solid var(--danger-500)" }}>
                        <label style={{ display: "block", fontWeight: 600, color: "var(--foreground)", marginBottom: "var(--space-2)" }}>
                          Rejection Reason (Required)
                        </label>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Explain why the KYC is being rejected..."
                          style={{
                            width: "100%",
                            backgroundColor: "var(--glass-white-sm)",
                            padding: "var(--space-3)",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--border-default)",
                            color: "var(--foreground)",
                            fontSize: "var(--text-sm)",
                            minHeight: "100px",
                            resize: "vertical",
                            transition: "all var(--duration-base) var(--ease-out)",
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = "var(--primary)";
                            e.currentTarget.style.backgroundColor = "var(--glass-white-md)";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = "var(--border-default)";
                            e.currentTarget.style.backgroundColor = "var(--glass-white-sm)";
                          }}
                        />
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
                      {showRejectInput !== kyc._id ? (
                        <>
                          <button
                            onClick={() => handleApprove(kyc._id)}
                            disabled={actionLoading === kyc._id}
                            className="btn-primary"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "var(--space-2)",
                              opacity: actionLoading === kyc._id ? 0.5 : 1,
                              cursor: actionLoading === kyc._id ? "not-allowed" : "pointer",
                            }}
                          >
                            <CheckCircle size={18} />
                            {actionLoading === kyc._id ? "Approving..." : "Approve"}
                          </button>
                          <button
                            onClick={() => setShowRejectInput(kyc._id)}
                            disabled={actionLoading === kyc._id}
                            className="btn-danger"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "var(--space-2)",
                              opacity: actionLoading === kyc._id ? 0.5 : 1,
                              cursor: actionLoading === kyc._id ? "not-allowed" : "pointer",
                            }}
                          >
                            <XCircle size={18} />
                            Reject
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleReject(kyc._id)}
                            disabled={actionLoading === kyc._id}
                            className="btn-danger"
                            style={{
                              opacity: actionLoading === kyc._id ? 0.5 : 1,
                              cursor: actionLoading === kyc._id ? "not-allowed" : "pointer",
                            }}
                          >
                            {actionLoading === kyc._id ? "Rejecting..." : "Confirm Rejection"}
                          </button>
                          <button
                            onClick={() => setShowRejectInput(null)}
                            disabled={actionLoading === kyc._id}
                            className="btn-secondary"
                            style={{
                              opacity: actionLoading === kyc._id ? 0.5 : 1,
                              cursor: actionLoading === kyc._id ? "not-allowed" : "pointer",
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {imageModal && previewImage && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
          <div style={{ position: "relative", width: "90%", maxWidth: "600px" }}>
            <button
              onClick={() => setImageModal(false)}
              style={{
                position: "absolute",
                top: "var(--space-2)",
                right: "var(--space-2)",
                backgroundColor: "transparent",
                border: "none",
                color: "white",
                cursor: "pointer",
                fontSize: "1.5rem",
                zIndex: 10,
              }}
            >
              <X />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              style={{
                width: "100%",
                height: "auto",
                borderRadius: "var(--radius-md)",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

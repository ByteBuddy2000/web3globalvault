"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  documentImageId?: string;
  documentImageFilename?: string;
  selfieImageId?: string;
  selfieImageFilename?: string;
  status: "pending" | "verified" | "rejected";
  submittedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

export default function KYCDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [kyc, setKyc] = useState<KYCRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [remarks, setRemarks] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageModal, setImageModal] = useState(false);

  useEffect(() => {
    // Unwrap params promise
    params.then((resolvedParams) => {
      setId(resolvedParams.id);
      fetchKYCDetail(resolvedParams.id);
    });
  }, [params]);

  const fetchKYCDetail = async (kycId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/kyc/${kycId}`);
      const data = await res.json();

      if (data.success) {
        setKyc(data.data);
      } else {
        toast.error(data.error || "Failed to fetch KYC record");
        router.push("/admin/kyc-verification");
      }
    } catch (error) {
      toast.error("Error fetching KYC record");
      console.error(error);
      router.push("/admin/kyc-verification");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!kyc) return;

    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kycId: kyc._id,
          action: "approve",
          remarks,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("KYC approved successfully");
        router.push("/admin/kyc-verification");
      } else {
        toast.error(data.error || "Failed to approve KYC");
      }
    } catch (error) {
      toast.error("Error approving KYC");
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!kyc) return;

    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kycId: kyc._id,
          action: "reject",
          rejectionReason,
          remarks,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("KYC rejected successfully");
        router.push("/admin/kyc-verification");
      } else {
        toast.error(data.error || "Failed to reject KYC");
      }
    } catch (error) {
      toast.error("Error rejecting KYC");
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--background)",
        }}
      >
        <div style={{ color: "var(--text-200)" }}>Loading KYC record...</div>
      </div>
    );
  }

  if (!kyc) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--background)",
          color: "var(--foreground)",
        }}
      >
        <p style={{ marginBottom: "var(--space-4)" }}>KYC record not found</p>
        <Link href="/admin/kyc-verification" style={{ color: "var(--primary)" }}>
          Back to KYC Verification
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        paddingBottom: "var(--space-6)",
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div style={{ marginBottom: "var(--space-6)" }}>
          <Link
            href="/admin/kyc-verification"
            style={{
              display: "flex",
              alignItems: "center",
              color: "var(--primary)",
              textDecoration: "none",
              marginBottom: "var(--space-4)",
              fontSize: "var(--text-sm)",
            }}
          >
            <ArrowLeft size={16} style={{ marginRight: "var(--space-1)" }} />
            Back to KYC Verification
          </Link>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <div>
              <h1
                style={{
                  fontSize: "var(--text-3xl)",
                  fontWeight: 700,
                  marginBottom: "var(--space-2)",
                  color: "var(--foreground)",
                }}
              >
                {kyc.firstName} {kyc.lastName}
              </h1>
              <p style={{ color: "var(--text-200)", marginBottom: "var(--space-1)" }}>
                Email: {kyc.user.email}
              </p>
              <p style={{ color: "var(--text-200)" }}>
                Account: {kyc.user.accountNumber}
              </p>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
                padding: "var(--space-2) var(--space-4)",
                backgroundColor:
                  kyc.status === "verified"
                    ? "rgba(34, 197, 94, 0.1)"
                    : kyc.status === "rejected"
                    ? "rgba(239, 68, 68, 0.1)"
                    : "rgba(59, 130, 246, 0.1)",
                borderRadius: "var(--radius-md)",
              }}
            >
              {kyc.status === "verified" ? (
                <CheckCircle
                  size={20}
                  style={{ color: "#22c55e" }}
                />
              ) : kyc.status === "rejected" ? (
                <XCircle
                  size={20}
                  style={{ color: "#ef4444" }}
                />
              ) : null}
              <span
                style={{
                  textTransform: "capitalize",
                  fontWeight: 600,
                  color:
                    kyc.status === "verified"
                      ? "#22c55e"
                      : kyc.status === "rejected"
                      ? "#ef4444"
                      : "#3b82f6",
                }}
              >
                {kyc.status}
              </span>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div
          className="card"
          style={{
            padding: "var(--space-6)",
            marginBottom: "var(--space-6)",
          }}
        >
          <h2
            style={{
              fontSize: "var(--text-xl)",
              fontWeight: 700,
              marginBottom: "var(--space-4)",
              color: "var(--foreground)",
            }}
          >
            Personal Information
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "var(--space-4)",
            }}
          >
            <div>
              <p style={{ color: "var(--text-200)", marginBottom: "var(--space-1)", fontSize: "var(--text-sm)" }}>
                Date of Birth
              </p>
              <p style={{ color: "var(--foreground)", fontWeight: 500 }}>
                {new Date(kyc.dateOfBirth).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p style={{ color: "var(--text-200)", marginBottom: "var(--space-1)", fontSize: "var(--text-sm)" }}>
                Document Type
              </p>
              <p style={{ color: "var(--foreground)", fontWeight: 500 }}>
                {kyc.documentType}
              </p>
            </div>
            <div>
              <p style={{ color: "var(--text-200)", marginBottom: "var(--space-1)", fontSize: "var(--text-sm)" }}>
                Document Number
              </p>
              <p style={{ color: "var(--foreground)", fontWeight: 500 }}>
                {kyc.documentNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Address */}
        <div
          className="card"
          style={{
            padding: "var(--space-6)",
            marginBottom: "var(--space-6)",
          }}
        >
          <h2
            style={{
              fontSize: "var(--text-xl)",
              fontWeight: 700,
              marginBottom: "var(--space-4)",
              color: "var(--foreground)",
            }}
          >
            Address
          </h2>
          <div style={{ fontSize: "var(--text-sm)" }}>
            <p style={{ color: "var(--foreground)", marginBottom: "var(--space-1)" }}>
              {kyc.address}
            </p>
            <p style={{ color: "var(--foreground)", marginBottom: "var(--space-1)" }}>
              {kyc.city}, {kyc.state} {kyc.zipCode}
            </p>
            <p style={{ color: "var(--foreground)" }}>{kyc.country}</p>
          </div>
        </div>

        {/* Documents */}
        <div
          className="card"
          style={{
            padding: "var(--space-6)",
            marginBottom: "var(--space-6)",
          }}
        >
          <h2
            style={{
              fontSize: "var(--text-xl)",
              fontWeight: 700,
              marginBottom: "var(--space-4)",
              color: "var(--foreground)",
            }}
          >
            Documents
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--space-4)",
            }}
          >
            {kyc.documentImageId && (
              <div>
                <p
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-200)",
                    marginBottom: "var(--space-2)",
                  }}
                >
                  Document Image
                </p>
                <img
                  src={`/api/kyc/file/${kyc.documentImageId}`}
                  alt="Document"
                  style={{
                    width: "100%",
                    height: "250px",
                    objectFit: "cover",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-default)",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setPreviewImage(`/api/kyc/file/${kyc.documentImageId}`);
                    setImageModal(true);
                  }}
                />
              </div>
            )}
            {kyc.selfieImageId && (
              <div>
                <p
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-200)",
                    marginBottom: "var(--space-2)",
                  }}
                >
                  Selfie
                </p>
                <img
                  src={`/api/kyc/file/${kyc.selfieImageId}`}
                  alt="Selfie"
                  style={{
                    width: "100%",
                    height: "250px",
                    objectFit: "cover",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-default)",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setPreviewImage(`/api/kyc/file/${kyc.selfieImageId}`);
                    setImageModal(true);
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Action Section - Only if pending */}
        {kyc.status === "pending" && (
          <div
            className="card"
            style={{
              padding: "var(--space-6)",
            }}
          >
            <h2
              style={{
                fontSize: "var(--text-xl)",
                fontWeight: 700,
                marginBottom: "var(--space-4)",
                color: "var(--foreground)",
              }}
            >
              Verification Action
            </h2>

            {/* Remarks */}
            <div style={{ marginBottom: "var(--space-6)" }}>
              <label
                style={{
                  display: "block",
                  fontWeight: 600,
                  color: "var(--foreground)",
                  marginBottom: "var(--space-2)",
                }}
              >
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
                }}
              />
            </div>

            {/* Rejection Reason */}
            <div style={{ marginBottom: "var(--space-6)" }}>
              <label
                style={{
                  display: "block",
                  fontWeight: 600,
                  color: "var(--foreground)",
                  marginBottom: "var(--space-2)",
                }}
              >
                Rejection Reason (if rejecting)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Specify the reason for rejection..."
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
                }}
              />
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                gap: "var(--space-4)",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={handleReject}
                disabled={actionLoading}
                style={{
                  padding: "var(--space-2) var(--space-4)",
                  backgroundColor: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                  cursor: actionLoading ? "not-allowed" : "pointer",
                  opacity: actionLoading ? 0.7 : 1,
                }}
              >
                {actionLoading ? "Processing..." : "Reject"}
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                style={{
                  padding: "var(--space-2) var(--space-4)",
                  backgroundColor: "#22c55e",
                  color: "white",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                  cursor: actionLoading ? "not-allowed" : "pointer",
                  opacity: actionLoading ? 0.7 : 1,
                }}
              >
                {actionLoading ? "Processing..." : "Approve"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {imageModal && previewImage && (
        <div
          onClick={() => setImageModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            cursor: "pointer",
          }}
        >
          <img
            src={previewImage}
            alt="Preview"
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              objectFit: "contain",
              borderRadius: "var(--radius-md)",
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

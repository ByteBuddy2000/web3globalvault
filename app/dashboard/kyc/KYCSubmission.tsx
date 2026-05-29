"use client";

import React, { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { CheckCircle, AlertCircle, Clock, Upload } from "lucide-react";

interface KYCData {
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
}

interface KYCStatus {
  status: "pending" | "verified" | "rejected" | null;
  remarks?: string;
  rejectionReason?: string;
}

export default function KYCPage() {
  const { data: session } = useSession();
  const [kycStatus, setKycStatus] = useState<KYCStatus>({
    status: null,
  });
  const [formData, setFormData] = useState<KYCData>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    documentType: "passport",
    documentNumber: "",
    documentImage: "",
    selfieImage: "",
  });
  const [loading, setLoading] = useState(false);
  const [documentImagePreview, setDocumentImagePreview] = useState<string>("");
  const [selfieImagePreview, setSelfieImagePreview] = useState<string>("");

  useEffect(() => {
    if (session?.user) {
      fetchKYCStatus();
    }
  }, [session]);

  const fetchKYCStatus = async () => {
    try {
      const res = await fetch("/api/kyc/submit");
      const data = await res.json();

      if (data.success && data.data) {
        setKycStatus({
          status: data.data.status,
          remarks: data.data.remarks,
          rejectionReason: data.data.rejectionReason,
        });
      }
    } catch (error) {
      console.error("Error fetching KYC status:", error);
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (
    e: ChangeEvent<HTMLInputElement>,
    imageType: "document" | "selfie"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (imageType === "document") {
        setFormData((prev) => ({ ...prev, documentImage: base64 }));
        setDocumentImagePreview(base64);
      } else {
        setFormData((prev) => ({ ...prev, selfieImage: base64 }));
        setSelfieImagePreview(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !formData.documentImage ||
      !formData.selfieImage
    ) {
      toast.error("Please upload both document and selfie images");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/kyc/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("KYC submitted successfully!");
        setKycStatus({ status: "pending" });
        setFormData({
          firstName: "",
          lastName: "",
          dateOfBirth: "",
          address: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
          documentType: "passport",
          documentNumber: "",
          documentImage: "",
          selfieImage: "",
        });
        setDocumentImagePreview("");
        setSelfieImagePreview("");
      } else {
        toast.error(data.error || "Failed to submit KYC");
      }
    } catch (error) {
      toast.error("Error submitting KYC");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "var(--space-6)", backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="card card-elevated" style={{ padding: "var(--space-6)" }}>
          <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 700, marginBottom: "var(--space-2)", color: "var(--foreground)" }}>
            Know Your Customer (KYC)
          </h1>

          <p style={{ color: "var(--text-200)", marginBottom: "var(--space-6)" }}>
            Complete your KYC verification to unlock additional features and higher transaction limits.
          </p>

          {/* KYC Status Display */}
          {kycStatus.status === "verified" && (
            <div style={{ marginBottom: "var(--space-6)", display: "flex", flexDirection: "column", alignItems: "flex-start", backgroundColor: "rgba(34, 197, 94, 0.1)", padding: "var(--space-4)", borderRadius: "var(--radius-md)", border: "1px solid var(--success-500)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
                <CheckCircle style={{ color: "var(--success-500)", width: "1.5rem", height: "1.5rem" }} />
                <span style={{ fontWeight: 600, color: "var(--success-500)" }}>KYC Verified</span>
              </div>
              <p style={{ color: "var(--text-200)", fontSize: "var(--text-sm)" }}>
                Your KYC has been verified successfully. You can now enjoy all platform features.
              </p>
              {kycStatus.remarks && (
                <p style={{ color: "var(--text-100)", fontSize: "var(--text-sm)", marginTop: "var(--space-2)" }}>
                  <strong>Admin Remarks:</strong> {kycStatus.remarks}
                </p>
              )}
            </div>
          )}

          {kycStatus.status === "pending" && (
            <div style={{ marginBottom: "var(--space-6)", display: "flex", flexDirection: "column", alignItems: "flex-start", backgroundColor: "rgba(59, 130, 246, 0.1)", padding: "var(--space-4)", borderRadius: "var(--radius-md)", border: "1px solid var(--info-500)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
                <Clock style={{ color: "var(--info-500)", width: "1.5rem", height: "1.5rem", animation: "spin 2s linear infinite" }} />
                <span style={{ fontWeight: 600, color: "var(--info-500)" }}>Pending Verification</span>
              </div>
              <p style={{ color: "var(--text-200)", fontSize: "var(--text-sm)" }}>
                Your KYC is under review. Please wait for admin verification.
              </p>
            </div>
          )}

          {kycStatus.status === "rejected" && (
            <div style={{ marginBottom: "var(--space-6)", display: "flex", flexDirection: "column", alignItems: "flex-start", backgroundColor: "rgba(239, 68, 68, 0.1)", padding: "var(--space-4)", borderRadius: "var(--radius-md)", border: "1px solid var(--danger-500)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
                <AlertCircle style={{ color: "var(--danger-500)", width: "1.5rem", height: "1.5rem" }} />
                <span style={{ fontWeight: 600, color: "var(--danger-500)" }}>KYC Rejected</span>
              </div>
              <p style={{ color: "var(--text-200)", fontSize: "var(--text-sm)" }}>
                Your KYC was rejected. Please review the reason below and resubmit.
              </p>
              {kycStatus.rejectionReason && (
                <p style={{ color: "var(--text-100)", fontSize: "var(--text-sm)", marginTop: "var(--space-2)" }}>
                  <strong>Reason:</strong> {kycStatus.rejectionReason}
                </p>
              )}
            </div>
          )}

          {/* Form */}
          {kycStatus.status !== "verified" && (
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
                {/* Personal Information */}
                <div>
                  <label style={{ display: "block", fontWeight: 600, color: "var(--foreground)", marginBottom: "var(--space-2)" }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    placeholder="John"
                    style={{
                      width: "100%",
                      backgroundColor: "var(--glass-white-sm)",
                      padding: "var(--space-3)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-default)",
                      color: "var(--foreground)",
                      fontSize: "var(--text-sm)",
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

                <div>
                  <label style={{ display: "block", fontWeight: 600, color: "var(--foreground)", marginBottom: "var(--space-2)" }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    placeholder="Doe"
                    style={{
                      width: "100%",
                      backgroundColor: "var(--glass-white-sm)",
                      padding: "var(--space-3)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-default)",
                      color: "var(--foreground)",
                      fontSize: "var(--text-sm)",
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

                <div>
                  <label style={{ display: "block", fontWeight: 600, color: "var(--foreground)", marginBottom: "var(--space-2)" }}>
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: "100%",
                      backgroundColor: "var(--glass-white-sm)",
                      padding: "var(--space-3)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-default)",
                      color: "var(--foreground)",
                      fontSize: "var(--text-sm)",
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

                {/* Address Information */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontWeight: 600, color: "var(--foreground)", marginBottom: "var(--space-2)" }}>
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    placeholder="123 Main Street"
                    style={{
                      width: "100%",
                      backgroundColor: "var(--glass-white-sm)",
                      padding: "var(--space-3)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-default)",
                      color: "var(--foreground)",
                      fontSize: "var(--text-sm)",
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

                <div>
                  <label style={{ display: "block", fontWeight: 600, color: "var(--foreground)", marginBottom: "var(--space-2)" }}>
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    placeholder="New York"
                    style={{
                      width: "100%",
                      backgroundColor: "var(--glass-white-sm)",
                      padding: "var(--space-3)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-default)",
                      color: "var(--foreground)",
                      fontSize: "var(--text-sm)",
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

                <div>
                  <label style={{ display: "block", fontWeight: 600, color: "var(--foreground)", marginBottom: "var(--space-2)" }}>
                    State/Province
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    placeholder="NY"
                    style={{
                      width: "100%",
                      backgroundColor: "var(--glass-white-sm)",
                      padding: "var(--space-3)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-default)",
                      color: "var(--foreground)",
                      fontSize: "var(--text-sm)",
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

                <div>
                  <label style={{ display: "block", fontWeight: 600, color: "var(--foreground)", marginBottom: "var(--space-2)" }}>
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                    placeholder="10001"
                    style={{
                      width: "100%",
                      backgroundColor: "var(--glass-white-sm)",
                      padding: "var(--space-3)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-default)",
                      color: "var(--foreground)",
                      fontSize: "var(--text-sm)",
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

                <div>
                  <label style={{ display: "block", fontWeight: 600, color: "var(--foreground)", marginBottom: "var(--space-2)" }}>
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    placeholder="United States"
                    style={{
                      width: "100%",
                      backgroundColor: "var(--glass-white-sm)",
                      padding: "var(--space-3)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-default)",
                      color: "var(--foreground)",
                      fontSize: "var(--text-sm)",
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

                {/* Document Information */}
                <div>
                  <label style={{ display: "block", fontWeight: 600, color: "var(--foreground)", marginBottom: "var(--space-2)" }}>
                    Document Type
                  </label>
                  <select
                    name="documentType"
                    value={formData.documentType}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: "100%",
                      backgroundColor: "var(--glass-white-sm)",
                      padding: "var(--space-3)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-default)",
                      color: "var(--foreground)",
                      fontSize: "var(--text-sm)",
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
                  >
                    <option value="passport">Passport</option>
                    <option value="drivers-license">Driver's License</option>
                    <option value="national-id">National ID</option>
                    <option value="id-card">ID Card</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 600, color: "var(--foreground)", marginBottom: "var(--space-2)" }}>
                    Document Number
                  </label>
                  <input
                    type="text"
                    name="documentNumber"
                    value={formData.documentNumber}
                    onChange={handleInputChange}
                    required
                    placeholder="ABC123456"
                    style={{
                      width: "100%",
                      backgroundColor: "var(--glass-white-sm)",
                      padding: "var(--space-3)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-default)",
                      color: "var(--foreground)",
                      fontSize: "var(--text-sm)",
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

                {/* Document Upload */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontWeight: 600, color: "var(--foreground)", marginBottom: "var(--space-2)" }}>
                    Document Image
                  </label>
                  <div style={{ display: "flex", gap: "var(--space-4)" }}>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%",
                          borderRadius: "var(--radius-md)",
                          border: "2px dashed var(--border-brand)",
                          padding: "var(--space-6)",
                          cursor: "pointer",
                          transition: "all var(--duration-base) var(--ease-out)",
                          backgroundColor: "var(--glass-brand-sm)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "var(--glass-brand-md)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "var(--glass-brand-sm)";
                        }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageChange(e, "document")}
                          style={{ display: "none" }}
                          id="document-upload"
                        />
                        <label
                          htmlFor="document-upload"
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "var(--space-2)",
                            cursor: "pointer",
                          }}
                        >
                          <Upload style={{ color: "var(--primary)", width: "2rem", height: "2rem" }} />
                          <span style={{ fontSize: "var(--text-sm)", color: "var(--text-200)" }}>
                            Click to upload document
                          </span>
                        </label>
                      </div>
                    </div>
                    {documentImagePreview && (
                      <div style={{ flex: 1 }}>
                        <img
                          src={documentImagePreview}
                          alt="Document preview"
                          style={{
                            width: "100%",
                            height: "200px",
                            objectFit: "cover",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--border-default)",
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Selfie Upload */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontWeight: 600, color: "var(--foreground)", marginBottom: "var(--space-2)" }}>
                    Selfie with Document
                  </label>
                  <div style={{ display: "flex", gap: "var(--space-4)" }}>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%",
                          borderRadius: "var(--radius-md)",
                          border: "2px dashed var(--border-brand)",
                          padding: "var(--space-6)",
                          cursor: "pointer",
                          transition: "all var(--duration-base) var(--ease-out)",
                          backgroundColor: "var(--glass-brand-sm)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "var(--glass-brand-md)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "var(--glass-brand-sm)";
                        }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageChange(e, "selfie")}
                          style={{ display: "none" }}
                          id="selfie-upload"
                        />
                        <label
                          htmlFor="selfie-upload"
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "var(--space-2)",
                            cursor: "pointer",
                          }}
                        >
                          <Upload style={{ color: "var(--primary)", width: "2rem", height: "2rem" }} />
                          <span style={{ fontSize: "var(--text-sm)", color: "var(--text-200)" }}>
                            Click to upload selfie
                          </span>
                        </label>
                      </div>
                    </div>
                    {selfieImagePreview && (
                      <div style={{ flex: 1 }}>
                        <img
                          src={selfieImagePreview}
                          alt="Selfie preview"
                          style={{
                            width: "100%",
                            height: "200px",
                            objectFit: "cover",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--border-default)",
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={loading || kycStatus.status === "pending"}
                style={{
                  opacity: loading || kycStatus.status === "pending" ? 0.5 : 1,
                  cursor: loading || kycStatus.status === "pending" ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Submitting..." : "Submit KYC"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

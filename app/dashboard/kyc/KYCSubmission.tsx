"use client";

import React, { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { CheckCircle, AlertCircle, Clock, Upload, User, MapPin, FileText, Camera, ChevronRight, ChevronLeft, Shield } from "lucide-react";

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
  documentImage: File | string;
  selfieImage: File | string;
}

interface KYCStatus {
  status: "pending" | "verified" | "rejected" | null;
  remarks?: string;
  rejectionReason?: string;
}

const STEPS = [
  { id: 1, label: "Personal Info", icon: User },
  { id: 2, label: "Address", icon: MapPin },
  { id: 3, label: "Document", icon: FileText },
  { id: 4, label: "Upload", icon: Camera },
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  backgroundColor: "var(--glass-white-sm)",
  padding: "var(--space-3)",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--border-default)",
  color: "var(--foreground)",
  fontSize: "var(--text-sm)",
  transition: "all var(--duration-base) var(--ease-out)",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontWeight: 600,
  color: "var(--foreground)",
  marginBottom: "var(--space-2)",
  fontSize: "var(--text-sm)",
};

function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = true,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        style={{
          ...inputStyle,
          borderColor: focused ? "var(--primary)" : "var(--border-default)",
          backgroundColor: focused ? "var(--glass-white-md)" : "var(--glass-white-sm)",
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required
        style={{
          ...inputStyle,
          borderColor: focused ? "var(--primary)" : "var(--border-default)",
          backgroundColor: focused ? "var(--glass-white-md)" : "var(--glass-white-sm)",
        }}
        onFocus={() => setFocused(false)}
        onBlur={() => setFocused(false)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function UploadZone({
  id,
  label,
  hint,
  preview,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  preview: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              minHeight: "160px",
              borderRadius: "var(--radius-md)",
              border: `2px dashed ${hover ? "var(--primary)" : "var(--border-brand)"}`,
              padding: "var(--space-6)",
              cursor: "pointer",
              transition: "all var(--duration-base) var(--ease-out)",
              backgroundColor: hover ? "var(--glass-brand-md)" : "var(--glass-brand-sm)",
              boxSizing: "border-box",
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            <input
              type="file"
              accept="image/*"
              onChange={onChange}
              style={{ display: "none" }}
              id={id}
            />
            <label htmlFor={id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-2)", cursor: "pointer", width: "100%" }}>
              <div style={{
                width: "3rem",
                height: "3rem",
                borderRadius: "50%",
                backgroundColor: "var(--glass-brand-sm)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--border-brand)",
                transition: "transform var(--duration-base) var(--ease-out)",
                transform: hover ? "scale(1.1)" : "scale(1)",
              }}>
                <Upload style={{ color: "var(--primary)", width: "1.25rem", height: "1.25rem" }} />
              </div>
              <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--foreground)" }}>
                {preview ? "Replace image" : "Click to upload"}
              </span>
              <span style={{ fontSize: "var(--text-xs, 0.75rem)", color: "var(--text-200)", textAlign: "center" }}>
                {hint}
              </span>
            </label>
          </div>
        </div>
        {preview && (
          <div style={{ flex: 1, position: "relative" }}>
            <img
              src={preview}
              alt="Preview"
              style={{
                width: "100%",
                height: "160px",
                objectFit: "cover",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-default)",
              }}
            />
            <div style={{
              position: "absolute",
              bottom: "var(--space-2)",
              right: "var(--space-2)",
              backgroundColor: "rgba(34,197,94,0.9)",
              borderRadius: "var(--radius-sm, 4px)",
              padding: "2px 8px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}>
              <CheckCircle style={{ width: "0.75rem", height: "0.75rem", color: "#fff" }} />
              <span style={{ fontSize: "0.65rem", color: "#fff", fontWeight: 600 }}>Uploaded</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function KYCPage() {
  const { data: session } = useSession();
  const [kycStatus, setKycStatus] = useState<KYCStatus>({ status: null });
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<KYCData>({
    firstName: "", lastName: "", dateOfBirth: "",
    address: "", city: "", state: "", zipCode: "", country: "",
    documentType: "passport", documentNumber: "",
    documentImage: "", selfieImage: "",
  });
  const [loading, setLoading] = useState(false);
  const [documentImagePreview, setDocumentImagePreview] = useState<string>("");
  const [selfieImagePreview, setSelfieImagePreview] = useState<string>("");

  useEffect(() => {
    if (session?.user) fetchKYCStatus();
  }, [session]);

  const fetchKYCStatus = async () => {
    try {
      const res = await fetch("/api/kyc/submit");
      const data = await res.json();
      if (data.success && data.data) {
        setKycStatus({ status: data.data.status, remarks: data.data.remarks, rejectionReason: data.data.rejectionReason });
      }
    } catch (error) {
      console.error("Error fetching KYC status:", error);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>, imageType: "document" | "selfie") => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image size must be less than 5MB"); return; }
    if (!file.type.startsWith("image/")) { toast.error("Please upload a valid image file"); return; }
    
    // Store the file object directly
    if (imageType === "document") {
      setFormData((prev) => ({ ...prev, documentImage: file }));
    } else {
      setFormData((prev) => ({ ...prev, selfieImage: file }));
    }
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    if (imageType === "document") {
      setDocumentImagePreview(previewUrl);
    } else {
      setSelfieImagePreview(previewUrl);
    }
  };

  const validateStep = () => {
    if (step === 1) return formData.firstName && formData.lastName && formData.dateOfBirth;
    if (step === 2) return formData.address && formData.city && formData.state && formData.zipCode && formData.country;
    if (step === 3) return formData.documentType && formData.documentNumber;
    if (step === 4) return formData.documentImage && formData.selfieImage;
    return true;
  };

  const handleNext = () => { if (validateStep()) setStep((s) => Math.min(s + 1, 4)); else toast.error("Please fill all required fields"); };
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.documentImage || !formData.selfieImage) { toast.error("Please upload both document and selfie images"); return; }
    setLoading(true);
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("firstName", formData.firstName);
      formDataToSend.append("lastName", formData.lastName);
      formDataToSend.append("dateOfBirth", formData.dateOfBirth);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("city", formData.city);
      formDataToSend.append("state", formData.state);
      formDataToSend.append("zipCode", formData.zipCode);
      formDataToSend.append("country", formData.country);
      formDataToSend.append("documentType", formData.documentType);
      formDataToSend.append("documentNumber", formData.documentNumber);
      
      // Append files
      if (formData.documentImage instanceof File) {
        formDataToSend.append("documentImage", formData.documentImage);
      }
      if (formData.selfieImage instanceof File) {
        formDataToSend.append("selfieImage", formData.selfieImage);
      }

      const res = await fetch("/api/kyc/submit", { 
        method: "POST",
        body: formDataToSend
      });
      const data = await res.json();
      if (data.success) {
        toast.success("KYC submitted successfully!");
        setKycStatus({ status: "pending" });
        setFormData({ firstName: "", lastName: "", dateOfBirth: "", address: "", city: "", state: "", zipCode: "", country: "", documentType: "passport", documentNumber: "", documentImage: "", selfieImage: "" });
        setDocumentImagePreview(""); setSelfieImagePreview("");
      } else { toast.error(data.error || "Failed to submit KYC"); }
    } catch (error) { toast.error("Error submitting KYC"); console.error(error); }
    finally { setLoading(false); }
  };

  const stepProgress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "var(--space-6)", backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Header */}
        <div style={{ marginBottom: "var(--space-6)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-2)" }}>
            <div style={{
              width: "2.5rem", height: "2.5rem", borderRadius: "var(--radius-md)",
              backgroundColor: "var(--glass-brand-sm)", border: "1px solid var(--border-brand)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Shield style={{ color: "var(--primary)", width: "1.25rem", height: "1.25rem" }} />
            </div>
            <div>
              <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 700, color: "var(--foreground)", margin: 0 }}>
                Identity Verification
              </h1>
              <p style={{ color: "var(--text-200)", fontSize: "var(--text-sm)", margin: 0 }}>
                Secure KYC verification to unlock full platform access
              </p>
            </div>
          </div>
        </div>

        {/* Status Banners */}
        {kycStatus.status === "verified" && (
          <div style={{ marginBottom: "var(--space-6)", backgroundColor: "rgba(34, 197, 94, 0.08)", padding: "var(--space-4)", borderRadius: "var(--radius-md)", border: "1px solid var(--success-500)", display: "flex", gap: "var(--space-3)" }}>
            <CheckCircle style={{ color: "var(--success-500)", width: "1.5rem", height: "1.5rem", flexShrink: 0, marginTop: "2px" }} />
            <div>
              <p style={{ fontWeight: 600, color: "var(--success-500)", margin: "0 0 4px" }}>Verification Complete</p>
              <p style={{ color: "var(--text-200)", fontSize: "var(--text-sm)", margin: 0 }}>Your identity has been verified. You have full access to all platform features.</p>
              {kycStatus.remarks && <p style={{ color: "var(--text-100)", fontSize: "var(--text-sm)", marginTop: "var(--space-2)" }}><strong>Admin Remarks:</strong> {kycStatus.remarks}</p>}
            </div>
          </div>
        )}

        {kycStatus.status === "pending" && (
          <div style={{ marginBottom: "var(--space-6)", backgroundColor: "rgba(59, 130, 246, 0.08)", padding: "var(--space-4)", borderRadius: "var(--radius-md)", border: "1px solid var(--info-500)", display: "flex", gap: "var(--space-3)" }}>
            <Clock style={{ color: "var(--info-500)", width: "1.5rem", height: "1.5rem", flexShrink: 0, marginTop: "2px" }} />
            <div>
              <p style={{ fontWeight: 600, color: "var(--info-500)", margin: "0 0 4px" }}>Under Review</p>
              <p style={{ color: "var(--text-200)", fontSize: "var(--text-sm)", margin: 0 }}>Your documents are being reviewed. This typically takes 1–2 business days.</p>
            </div>
          </div>
        )}

        {kycStatus.status === "rejected" && (
          <div style={{ marginBottom: "var(--space-6)", backgroundColor: "rgba(239, 68, 68, 0.08)", padding: "var(--space-4)", borderRadius: "var(--radius-md)", border: "1px solid var(--danger-500)", display: "flex", gap: "var(--space-3)" }}>
            <AlertCircle style={{ color: "var(--danger-500)", width: "1.5rem", height: "1.5rem", flexShrink: 0, marginTop: "2px" }} />
            <div>
              <p style={{ fontWeight: 600, color: "var(--danger-500)", margin: "0 0 4px" }}>Verification Failed</p>
              <p style={{ color: "var(--text-200)", fontSize: "var(--text-sm)", margin: 0 }}>Please review the reason below and resubmit your information.</p>
              {kycStatus.rejectionReason && <p style={{ color: "var(--text-100)", fontSize: "var(--text-sm)", marginTop: "var(--space-2)" }}><strong>Reason:</strong> {kycStatus.rejectionReason}</p>}
            </div>
          </div>
        )}

        {kycStatus.status !== "verified" && (
          <div className="card card-elevated" style={{ padding: "var(--space-6)" }}>

            {/* Step Progress */}
            <div style={{ marginBottom: "var(--space-8, 2rem)" }}>
              {/* Step Indicators */}
              <div style={{ display: "flex", justifyContent: "space-between", position: "relative", marginBottom: "var(--space-4)" }}>
                {/* Progress track */}
                <div style={{
                  position: "absolute", top: "1.1rem", left: "1.25rem", right: "1.25rem",
                  height: "2px", backgroundColor: "var(--border-default)", zIndex: 0,
                }}>
                  <div style={{
                    height: "100%", backgroundColor: "var(--primary)",
                    width: `${stepProgress}%`, transition: "width 0.4s ease",
                  }} />
                </div>

                {STEPS.map((s) => {
                  const Icon = s.icon;
                  const isCompleted = step > s.id;
                  const isCurrent = step === s.id;
                  return (
                    <div key={s.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-2)", zIndex: 1 }}>
                      <div style={{
                        width: "2.25rem", height: "2.25rem", borderRadius: "50%",
                        border: `2px solid ${isCompleted || isCurrent ? "var(--primary)" : "var(--border-default)"}`,
                        backgroundColor: isCompleted ? "var(--primary)" : isCurrent ? "var(--glass-brand-sm)" : "var(--background)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.3s ease",
                      }}>
                        {isCompleted
                          ? <CheckCircle style={{ width: "1rem", height: "1rem", color: "#fff" }} />
                          : <Icon style={{ width: "1rem", height: "1rem", color: isCurrent ? "var(--primary)" : "var(--text-200)" }} />
                        }
                      </div>
                      <span style={{
                        fontSize: "0.7rem", fontWeight: isCurrent ? 700 : 500,
                        color: isCurrent ? "var(--primary)" : isCompleted ? "var(--foreground)" : "var(--text-200)",
                        whiteSpace: "nowrap",
                      }}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Step label */}
              <div style={{
                backgroundColor: "var(--glass-brand-sm)", borderRadius: "var(--radius-md)",
                padding: "var(--space-3) var(--space-4)", border: "1px solid var(--border-brand)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--foreground)" }}>
                  Step {step} of {STEPS.length} — {STEPS[step - 1].label}
                </span>
                <span style={{ fontSize: "var(--text-sm)", color: "var(--text-200)" }}>
                  {Math.round(((step - 1) / STEPS.length) * 100)}% complete
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Step 1: Personal Info */}
              {step === 1 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "var(--space-4)" }}>
                  <InputField label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="John" />
                  <InputField label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Doe" />
                  <div style={{ gridColumn: "1 / -1" }}>
                    <InputField label="Date of Birth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} type="date" />
                  </div>
                </div>
              )}

              {/* Step 2: Address */}
              {step === 2 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "var(--space-4)" }}>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <InputField label="Street Address" name="address" value={formData.address} onChange={handleInputChange} placeholder="123 Main Street" />
                  </div>
                  <InputField label="City" name="city" value={formData.city} onChange={handleInputChange} placeholder="New York" />
                  <InputField label="State / Province" name="state" value={formData.state} onChange={handleInputChange} placeholder="NY" />
                  <InputField label="ZIP / Postal Code" name="zipCode" value={formData.zipCode} onChange={handleInputChange} placeholder="10001" />
                  <InputField label="Country" name="country" value={formData.country} onChange={handleInputChange} placeholder="United States" />
                </div>
              )}

              {/* Step 3: Document */}
              {step === 3 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "var(--space-4)" }}>
                  <SelectField
                    label="Document Type"
                    name="documentType"
                    value={formData.documentType}
                    onChange={handleInputChange}
                    options={[
                      { value: "passport", label: "Passport" },
                      { value: "drivers-license", label: "Driver's License" },
                      { value: "national-id", label: "National ID" },
                      { value: "id-card", label: "ID Card" },
                    ]}
                  />
                  <InputField label="Document Number" name="documentNumber" value={formData.documentNumber} onChange={handleInputChange} placeholder="ABC123456" />

                  {/* Info tip */}
                  <div style={{ gridColumn: "1 / -1", backgroundColor: "var(--glass-white-sm)", borderRadius: "var(--radius-md)", padding: "var(--space-3) var(--space-4)", border: "1px solid var(--border-default)", display: "flex", gap: "var(--space-2)" }}>
                    <AlertCircle style={{ width: "1rem", height: "1rem", color: "var(--text-200)", flexShrink: 0, marginTop: "2px" }} />
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--text-200)", margin: 0 }}>
                      Ensure the document number matches exactly as shown on your ID. You'll need to upload a clear photo in the next step.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 4: Upload */}
              {step === 4 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
                  <UploadZone
                    id="document-upload"
                    label="Document Photo"
                    hint="Front side of your ID — JPG, PNG up to 5MB"
                    preview={documentImagePreview}
                    onChange={(e) => handleImageChange(e, "document")}
                  />
                  <UploadZone
                    id="selfie-upload"
                    label="Selfie Holding Document"
                    hint="Hold your document clearly visible — JPG, PNG up to 5MB"
                    preview={selfieImagePreview}
                    onChange={(e) => handleImageChange(e, "selfie")}
                  />
                </div>
              )}

              {/* Navigation */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "var(--space-8, 2rem)", paddingTop: "var(--space-6)", borderTop: "1px solid var(--border-default)" }}>
                <div>
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      style={{
                        display: "flex", alignItems: "center", gap: "var(--space-2)",
                        padding: "var(--space-2) var(--space-4)",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-default)",
                        backgroundColor: "transparent",
                        color: "var(--foreground)",
                        fontSize: "var(--text-sm)",
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "all var(--duration-base) var(--ease-out)",
                      }}
                    >
                      <ChevronLeft style={{ width: "1rem", height: "1rem" }} />
                      Back
                    </button>
                  )}
                </div>
                <div>
                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="btn-primary"
                      style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}
                    >
                      Continue
                      <ChevronRight style={{ width: "1rem", height: "1rem" }} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={loading || kycStatus.status === "pending"}
                      style={{
                        display: "flex", alignItems: "center", gap: "var(--space-2)",
                        opacity: loading || kycStatus.status === "pending" ? 0.5 : 1,
                        cursor: loading || kycStatus.status === "pending" ? "not-allowed" : "pointer",
                      }}
                    >
                      {loading ? (
                        <>
                          <div style={{ width: "1rem", height: "1rem", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.8s linear infinite" }} />
                          Submitting…
                        </>
                      ) : (
                        <>
                          <Shield style={{ width: "1rem", height: "1rem" }} />
                          Submit for Verification
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>

          </div>
        )}

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}
"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, CheckCircle2, Loader2 } from "lucide-react";

interface PaymentInfo {
  registrationId: string;
  amountXrp: number;
  receiverAddress: string;
}

interface RegisterResponse {
  success: boolean;
  registrationId: string;
  amountXrp: number;
  receiverAddress?: string;
  error?: string;
}

interface ConfirmResponse {
  success: boolean;
  error?: string;
}

export default function MedbedSignupPage() {
  const router = useRouter();

  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [color, setColor] = useState<string>("white");

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);

  const [txHash, setTxHash] = useState<string>("");
  const [confirming, setConfirming] = useState<boolean>(false);

  const [step, setStep] = useState<number>(1);
  const [copyStatus, setCopyStatus] = useState<string>("");

  const fee = 10000;

  const RECEIVER_ADDRESS: string =
    process.env.NEXT_PUBLIC_XRP_RECEIVER_ADDRESS ||
    "rp5PMThCE9FtANy7ULtN4X43fNf7oXW6mt";

  const handleCopyAddress = async (): Promise<void> => {
    if (!paymentInfo) return;

    try {
      await navigator.clipboard.writeText(paymentInfo.receiverAddress);
      setCopyStatus("Copied!");

      setTimeout(() => {
        setCopyStatus("");
      }, 1500);
    } catch (err) {
      console.error(err);
      setCopyStatus("Copy failed");
    }
  };

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!name || !phone || !email || !address) {
      toast.error("Please fill all required fields.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/medbed/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          phone,
          email,
          address,
          color,
        }),
      });

      const data: RegisterResponse = await res.json();

      if (res.ok && data.success) {
        setPaymentInfo({
          registrationId: data.registrationId,
          amountXrp: data.amountXrp,
          receiverAddress:
            data.receiverAddress || RECEIVER_ADDRESS,
        });

        setStep(2);

        toast.success(
          "Registration saved. Complete XRP payment to finish."
        );
      } else {
        toast.error(data.error || "Registration failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async (): Promise<void> => {
    if (!txHash) {
      toast.error("Please enter the transaction hash.");
      return;
    }

    if (!paymentInfo) return;

    setConfirming(true);

    try {
      const response = await fetch("/api/medbed/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrationId: paymentInfo.registrationId,
          txHash,
        }),
      });

      const result: ConfirmResponse = await response.json();

      if (response.ok && result.success) {
        setStep(3);

        toast.success("Payment confirmed successfully.");

        setTimeout(() => {
          router.push("/dashboard");
        }, 1400);
      } else {
        toast.error(result.error || "Confirmation failed.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error. Please try again.");
    } finally {
      setConfirming(false);
    }
  };

  const formatStatus = (s: string): string => {
    if (s === "pending_payment") return "Pending payment";
    if (s === "paid") return "Paid";
    if (s === "cancelled") return "Cancelled";

    return s;
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-8">
      <div className="mx-auto w-full max-w-3xl py-10 px-4 sm:px-8">
        <div className="bg-card border border-border rounded-2xl shadow-lg p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-primary">
              Medbed Registration
            </h1>

            <p className="mt-2 text-muted-foreground">
              Secure a medbed slot with XRP payment and confirm
              with transaction hash.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mb-6">
            {["Register", "Pay", "Confirm"].map((label, idx) => {
              const current = idx + 1;

              return (
                <div key={label} className="flex-1">
                  <div
                    className={`w-full rounded-xl border px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide ${
                      step === current
                        ? "bg-primary border-border text-primary-foreground"
                        : step > current
                        ? "bg-emerald-600/20 border-emerald-500 text-emerald-200"
                        : "bg-card border-border text-muted-foreground"
                    }`}
                  >
                    {label}
                  </div>
                </div>
              );
            })}
          </div>

          {step === 1 && (
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Full name"
                  value={name}
                  onChange={setName}
                />

                <InputField
                  label="Phone"
                  value={phone}
                  onChange={setPhone}
                  type="tel"
                />

                <InputField
                  label="Email"
                  value={email}
                  onChange={setEmail}
                  type="email"
                />

                <SelectField
                  label="Bed color"
                  value={color}
                  onChange={setColor}
                  options={[
                    "white",
                    "black",
                    "silver",
                    "gold",
                    "blue",
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  Home address
                </label>

                <textarea
                  rows={3}
                  value={address}
                  onChange={(
                    e: React.ChangeEvent<HTMLTextAreaElement>
                  ) => setAddress(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  placeholder="e.g. 123 Main Street, City, Country"
                  required
                />
              </div>

              <div className="rounded-lg bg-card p-4 border border-border text-sm flex items-center justify-between">
                <span>Registration fee</span>

                <strong className="text-primary">
                  ${fee.toLocaleString()} USD
                </strong>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-primary px-5 py-2.5 text-primary-foreground font-bold shadow-lg hover:opacity-95 disabled:opacity-60"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  "Submit registration"
                )}
              </button>
            </form>
          )}

          {step >= 2 && paymentInfo && (
            <div className="mt-4 rounded-xl border border-border bg-card p-4">
              <h2 className="text-lg font-semibold text-primary mb-2">
                Payment details
              </h2>

              <div className="grid gap-2 sm:grid-cols-2">
                <StatCard
                  label="Invoice"
                  value={`#${paymentInfo.registrationId?.slice(
                    -8
                  )}`}
                />

                <StatCard
                  label="Amount"
                  value={`${paymentInfo.amountXrp} XRP`}
                />

                <StatCard
                  label="Status"
                  value={
                    step === 3
                      ? "confirmed"
                      : "awaiting payment"
                  }
                />
              </div>

              <div className="mt-3 text-sm text-muted-foreground">
                Send XRP to the address below and verify with
                transaction hash.
              </div>

              <div className="mt-2 flex items-center gap-2 rounded-lg bg-card px-3 py-2 border border-border">
                <div className="break-words text-sm text-foreground">
                  {paymentInfo.receiverAddress}
                </div>

                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="ml-auto rounded-lg bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground hover:opacity-95"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>

              {copyStatus && (
                <div className="text-xs text-emerald-300 mt-1">
                  {copyStatus}
                </div>
              )}

              <div className="mt-4 space-y-3">
                <input
                  value={txHash}
                  onChange={(
                    e: React.ChangeEvent<HTMLInputElement>
                  ) => setTxHash(e.target.value)}
                  placeholder="Transaction hash"
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />

                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={confirming}
                  className="w-full rounded-xl bg-primary px-5 py-2.5 text-primary-foreground text-base font-semibold shadow-lg hover:opacity-95 disabled:opacity-60"
                >
                  {confirming ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Confirming...
                    </span>
                  ) : (
                    "Confirm payment"
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="mt-5 rounded-xl border border-emerald-500 bg-emerald-500/10 p-4 text-emerald-200">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5" />

                <div>
                  <p className="font-semibold">
                    Payment confirmed!
                  </p>

                  <p className="text-sm text-muted-foreground">
                    We received your transaction hash and your
                    request is now marked as paid.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="mt-4 w-full rounded-xl border border-border bg-card px-5 py-2 text-sm font-semibold text-foreground hover:opacity-95"
            >
              Back to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
}: InputFieldProps){
  return (
    <div>
      <label className="block text-sm text-muted-foreground mb-1">
        {label}
      </label>

      <input
        value={value}
        type={type}
        onChange={(
          e: React.ChangeEvent<HTMLInputElement>
        ) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        required
      />
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: SelectFieldProps){
  return (
    <div>
      <label className="block text-sm text-muted-foreground mb-1">
        {label}
      </label>

      <select
        value={value}
        onChange={(
          e: React.ChangeEvent<HTMLSelectElement>
        ) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none"
      >
        {options.map((opt) => (
          <option
            key={opt}
            value={opt}
            className="bg-card text-foreground"
          >
            {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
}

function StatCard({
  label,
  value,
}: StatCardProps){
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="text-xs uppercase text-muted-foreground">
        {label}
      </div>

      <div className="mt-1 font-semibold text-foreground">
        {value}
      </div>
    </div>
  );
}
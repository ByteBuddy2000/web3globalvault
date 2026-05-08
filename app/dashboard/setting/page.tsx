'use client';

import React, { ChangeEvent, useEffect, useState } from "react";
import { User, Lock, Mail, ShieldCheck, Upload, Trash, Phone, MapPin, CreditCard } from "lucide-react";
import { toast } from "sonner";

const tabs = ["Profile", "Password", "Email", "Verification"];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Profile");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // profile fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  // password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      setLoadingProfile(true);
      try {
        const res = await fetch("/api/user/profile", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load profile");
        const json = await res.json();
        if (!mounted) return;
        setUsername(json.fullName || "");
        setEmail(json.email || "");
        setPhone(json.phone || "");
        setAddress(json.address || "");
        setAccountNumber(json.accountNumber || "");
      } catch (err: any) {
        console.error("Profile load error:", err);
        toast.error("Failed to load profile");
      } finally {
        if (mounted) setLoadingProfile(false);
      }
    }
    loadProfile();
    return () => { mounted = false; };
  }, []);

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function handleSaveProfile() {
    setError("");
    setSuccess("");
    setSavingProfile(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: username, phone, address }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(j?.message || "Failed to update profile");
        return;
      }
      toast.success("Profile updated");
      setSuccess("Profile updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleUpdatePassword() {
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill out all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(j?.message || "Failed to update password");
        setError(j?.message || "Failed to update password");
        return;
      }
      toast.success("Password updated successfully");
      setSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleEmailChange() {
    if (!email) {
      toast.error("Enter a valid email");
      return;
    }
    setSavingEmail(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(j?.message || "Failed to update email");
        return;
      }
      toast.success("Email updated");
      setSuccess("Email updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    } finally {
      setSavingEmail(false);
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case "Profile":
        return (
          <div className="bg-gradient-to-br from-black via-[#1c1c1c] to-[#200338ff] p-6 rounded-xl shadow border space-y-6">
            <h2 className="text-2xl font-bold text-white">Profile Information</h2>

            {/* Profile Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Profile Photo</label>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div className="flex gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
                    <Upload className="w-4 h-4" /> Update
                    <input type="file" className="hidden" onChange={handleImageUpload} />
                  </label>
                  <button onClick={() => setProfileImage(null)} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-red-600 hover:text-white">
                    <Trash className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-900 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                placeholder="Enter full name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Account Number (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Account Number
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-800 text-gray-400 cursor-not-allowed"
                value={accountNumber}
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Account number cannot be changed</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" /> Phone Number
              </label>
              <input
                type="tel"
                className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-900 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Address
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-900 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                placeholder="Enter your address"
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            {success && <div className="p-3 bg-green-900/30 border border-green-500 text-green-300 rounded-lg text-sm">{success}</div>}
            {error && <div className="p-3 bg-red-900/30 border border-red-500 text-red-300 rounded-lg text-sm">{error}</div>}

            <div className="pt-4 flex gap-3">
              <button 
                onClick={handleSaveProfile} 
                className="bg-yellow-500 text-black px-6 py-2 rounded-lg hover:bg-yellow-600 font-semibold" 
                disabled={savingProfile}
              >
                {savingProfile ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        );

      case "Password":
        return (
          <div className="bg-gradient-to-br from-black via-[#1c1c1c] to-[#200338ff] p-6 rounded-xl shadow border space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Lock className="w-6 h-6" /> Change Password
            </h2>

            {error && <div className="p-3 bg-red-900/30 border border-red-500 text-red-300 rounded-lg text-sm">{error}</div>}
            {success && <div className="p-3 bg-green-900/30 border border-green-500 text-green-300 rounded-lg text-sm">{success}</div>}

            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-900 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-900 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                  placeholder="Enter new password (min 8 chars)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-900 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div className="pt-4">
              <button 
                onClick={handleUpdatePassword} 
                className="bg-yellow-500 text-black px-6 py-2 rounded-lg hover:bg-yellow-600 font-semibold" 
                disabled={savingPassword}
              >
                {savingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        );

      case "Email":
        return (
          <div className="bg-gradient-to-br from-black via-[#1c1c1c] to-[#200338ff] p-6 rounded-xl shadow border space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Mail className="w-6 h-6" /> Update Email
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Enter new email" 
                className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-900 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
              />
            </div>

            <div className="pt-4">
              <button 
                onClick={handleEmailChange} 
                className="bg-yellow-500 text-black px-6 py-2 rounded-lg hover:bg-yellow-600 font-semibold" 
                disabled={savingEmail}
              >
                {savingEmail ? "Saving..." : "Save Email"}
              </button>
            </div>

            {success && <div className="p-3 bg-green-900/30 border border-green-500 text-green-300 rounded-lg text-sm">{success}</div>}
          </div>
        );

      case "Verification":
        return (
          <div className="bg-gradient-to-br from-black via-[#1c1c1c] to-[#200338ff] p-6 rounded-xl shadow border space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6" /> Account Verification
            </h2>
            <p className="text-gray-400">Upload a valid government-issued ID to verify your account.</p>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Upload ID Document</label>
              <input type="file" accept="image/*,application/pdf" className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-900 text-gray-300" />
            </div>

            <button className="bg-yellow-500 text-black px-6 py-2 rounded-lg hover:bg-yellow-600 font-semibold">
              Submit for Verification
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-black via-[#1c1c1c] to-[#200338ff] py-16 px-4 lg:px-20">
      <div className="max-w-5xl mx-auto bg-black/50 rounded-2xl shadow p-8 border border-white/10">
        <h1 className="text-4xl font-bold text-white mb-2">⚙️ Account Settings</h1>
        <p className="text-gray-400 mb-8">Manage your profile, security, and preferences</p>

        <div className="flex gap-4 border-b border-gray-700 mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab 
                  ? "border-b-2 border-yellow-500 text-yellow-400" 
                  : "text-gray-400 hover:text-yellow-400"
              }`}
            >
              {tab === "Profile" && <User className="w-4 h-4" />}
              {tab === "Password" && <Lock className="w-4 h-4" />}
              {tab === "Email" && <Mail className="w-4 h-4" />}
              {tab === "Verification" && <ShieldCheck className="w-4 h-4" />}
              {tab}
            </button>
          ))}
        </div>

        <div>{loadingProfile ? <div className="text-gray-400 text-center py-8">Loading profile...</div> : renderContent()}</div>
      </div>
    </section>
  );
}

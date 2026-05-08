'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function ResetPasswordContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim() || !confirmPassword.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to reset password');
        toast.error(data.message || 'Failed to reset password');
        return;
      }

      toast.success('Password reset successfully!');
      setSuccess(true);

      setTimeout(() => {
        router.push('/signin');
      }, 3000);
    } catch (err) {
      console.error('Error:', err);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[radial-gradient(circle_at_20%_20%,rgba(201,168,76,0.08),transparent_40%),radial-gradient(circle_at_85%_20%,rgba(201,168,76,0.05),transparent_40%),linear-gradient(120deg,#050607_0%,#0d1014_40%,#0b0d11_100%)] p-4">
        <Toaster richColors position="top-center" />
        <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl backdrop-blur bg-slate-900/60 border border-slate-700 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Invalid Link</h2>
          <p className="text-slate-300 mb-6">
            The password reset link is invalid or has expired.
          </p>
          <Link
            href="/forgot-password"
            className="inline-block px-6 py-2 rounded-lg font-semibold bg-gradient-to-r from-[#C9A84C] to-[#F5D78E] text-black hover:shadow-lg hover:shadow-yellow-500/20 transition"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[radial-gradient(circle_at_20%_20%,rgba(201,168,76,0.08),transparent_40%),radial-gradient(circle_at_85%_20%,rgba(201,168,76,0.05),transparent_40%),linear-gradient(120deg,#050607_0%,#0d1014_40%,#0b0d11_100%)] p-4">
        <Toaster richColors position="top-center" />
        <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl backdrop-blur bg-slate-900/60 border border-slate-700 text-center">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Password Reset!</h2>
          <p className="text-slate-300 mb-6">
            Your password has been successfully reset. You can now log in with your new password.
          </p>
          <p className="text-sm text-slate-400 mb-6">
            Redirecting to signin in a few seconds...
          </p>
          <Link
            href="/signin"
            className="inline-block px-6 py-2 rounded-lg font-semibold bg-gradient-to-r from-[#C9A84C] to-[#F5D78E] text-black hover:shadow-lg hover:shadow-yellow-500/20 transition"
          >
            Go to signin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[radial-gradient(circle_at_20%_20%,rgba(201,168,76,0.08),transparent_40%),radial-gradient(circle_at_85%_20%,rgba(201,168,76,0.05),transparent_40%),linear-gradient(120deg,#050607_0%,#0d1014_40%,#0b0d11_100%)] p-4">
      <Toaster richColors position="top-center" />
      <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl backdrop-blur bg-slate-900/60 border border-slate-700">
        <div className="flex flex-col items-center mb-6">
          <ShieldCheck className="w-12 h-12 text-yellow-300 mb-2" />
          <h1 className="text-3xl font-bold text-white mb-1">Reset Password</h1>
          <p className="text-slate-300 text-sm text-center">Enter your new password to regain access to your account.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
            <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5 w-5 h-5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-yellow-300 transition"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">At least 6 characters</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-yellow-300 transition"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-semibold bg-gradient-to-r from-[#C9A84C] to-[#F5D78E] text-black hover:shadow-lg hover:shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Resetting...
              </span>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            <Link href="/signin" className="text-yellow-300 hover:text-yellow-200 font-semibold transition">
              Back to signin
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

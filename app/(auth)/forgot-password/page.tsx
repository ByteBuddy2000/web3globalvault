'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Failed to send reset email');
        return;
      }

      toast.success('Reset email sent! Check your inbox.');
      setSubmitted(true);

      // Redirect to signin after 3 seconds
      setTimeout(() => {
        router.push('/signin');
      }, 3000);
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center p-4">
        <div className="card w-full max-w-md p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Email Sent!</h2>
          <p className="text-muted mb-6">
            If an account exists with <span className="text-accent">{email}</span>, you will receive a password reset link shortly.
          </p>
          <p className="text-sm text-muted mb-6">
            Redirecting to signin in a few seconds...
          </p>
          <Link
            href="/signin"
            className="btn-accent inline-block px-6 py-2 rounded-lg font-semibold"
          >
            Back to signin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app flex items-center justify-center p-4">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-white mb-2">Forgot Password?</h1>
        <p className="text-muted mb-8">
          Enter your email and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-muted w-5 h-5" />
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-black/20 border border-white/6 text-white placeholder-muted focus:outline-none focus:border-accent transition"
                disabled={loading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-accent py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Back to signin Link */}
        <div className="mt-6 text-center">
          <p className="text-muted text-sm">
            Remember your password?{' '}
            <Link href="/signin" className="text-accent hover:underline font-semibold">
              Back to signin
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

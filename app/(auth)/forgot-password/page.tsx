'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';

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

      setTimeout(() => router.push('/signin'), 3000);
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-background text-foreground font-body relative overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap');
      `}</style>
      <Toaster richColors position="top-center" />

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-10 left-1/5 h-80 w-80 rounded-full bg-brand-glow-sm blur-3xl" />
        <div className="absolute bottom-8 right-1/4 h-72 w-72 rounded-full bg-cyan-glow-sm blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-[28px] border border-border bg-card/95 p-8 shadow-lg backdrop-blur-xl">
          {!submitted ? (
            <>
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold mb-2 font-display">Forgot Password?</h1>
                <p className="text-sm text-muted-foreground">
                  Enter your email and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-muted-foreground w-5 h-5" />
                    <input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl border border-border bg-glass-white-sm px-3.5 py-3.5 pl-11 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20"
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-3 text-sm font-semibold text-primary-foreground shadow-brand-md transition hover:shadow-brand-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <CheckCircle2 className="mx-auto mb-6 h-16 w-16 text-success-500" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Email Sent!</h2>
              <p className="text-muted-foreground mb-4">
                If an account exists with <span className="text-brand-400">{email}</span>, you will receive a password reset link shortly.
              </p>
              <p className="text-sm text-muted-foreground mb-6">Redirecting to signin in a few seconds...</p>
              <Link
                href="/signin"
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-semibold text-primary-foreground shadow-brand-md transition hover:shadow-brand-lg"
              >
                Back to signin
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

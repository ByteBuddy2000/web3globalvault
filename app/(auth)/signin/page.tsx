// signin.tsx
'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { toast, Toaster } from 'sonner';
import { signIn } from 'next-auth/react';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
export const dynamic = 'force-dynamic';

export default function signinPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const res = await signIn('credentials', {
      redirect: false,
      email: formData.email,
      password: formData.password,
    });

    if (res?.ok) {
      try {
        const sessionRes = await fetch('/api/auth/session');
        const session = await sessionRes.json();
        toast.success('signin successful!');
        const redirectUrl = session?.user?.role === 'admin' ? '/admin' : '/dashboard';
        setTimeout(() => (window.location.href = redirectUrl), 1500);
      } catch {
        toast.success('signin successful!');
        setTimeout(() => (window.location.href = '/dashboard'), 1500);
      }
    } else {
      toast.error(res?.error || 'Invalid email or password');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative">
      <Toaster richColors position="top-center" />

      <div className="relative z-10 w-full max-w-sm">
        {/* card */}
        <div className="card p-8 md:p-10">
          {/* header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-[var(--vio-500)] border-opacity-50">
                <Image src="/asset/logo.jpeg" width={36} height={36} alt="Genesis" className="object-cover" />
              </div>
              <span className="text-lg font-bold text-transparent bg-clip-text" style={{ backgroundImage: 'var(--grad-holo)' }}>
                Web3GlobalVault
              </span>
            </Link>

            <h1 className="text-3xl font-bold mb-2 font-display">
              Welcome Back
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">Sign in to access your account and dashboard.</p>
          </div>

          {/* form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <FieldInput
              icon={Mail}
              type="email"
              name="email"
              placeholder="Email Address"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
            />

            <div className="space-y-1.5">
              <FieldInput
                icon={Lock}
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                toggle={
                  <button type="button" onClick={() => setShowPassword(p => !p)}
                    className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
              <div className="text-right">
                <a href="/forgot-password"
                  className="text-xs transition-colors duration-200 hover:text-[var(--cyan-500)]"
                  style={{ color: 'var(--cyan-500)' }}>
                  Forgot Password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full inline-flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Signing In…
                </>
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: 'var(--surface-border)' }} />
            <span className="text-xs text-[var(--text-muted)] tracking-widest uppercase">or</span>
            <div className="flex-1 h-px" style={{ background: 'var(--surface-border)' }} />
          </div>

          <p className="text-center text-sm text-[var(--text-secondary)]">
            Don't have an account?{' '}
            <a href="/signup"
              className="font-semibold transition-colors duration-200 hover:text-[var(--cyan-500)]"
              style={{ color: 'var(--cyan-500)' }}>
              Create Account
            </a>
          </p>
        </div>

        {/* bottom note */}
        <p className="text-center text-xs text-[var(--text-muted)] mt-6">
          By signing in to Web3GlobalVault, you agree to our{' '}
          <a href="#" className="hover:text-[var(--text-secondary)] transition-colors" style={{ color: 'var(--text-muted)' }}>Terms</a>
          {' '}and{' '}
          <a href="#" className="hover:text-[var(--text-secondary)] transition-colors" style={{ color: 'var(--text-muted)' }}>Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}

/* ─── Field Input ───────────────────────────────────────────── */
function FieldInput({ icon: Icon, type, name, placeholder, autoComplete, value, onChange, toggle = null }: {
  icon: any; type: string; name: string; placeholder: string;
  autoComplete: string; value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  toggle?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div
      className="relative flex items-center rounded-xl transition-all duration-300"
      style={{
        background: 'var(--input)',
        border: focused ? '1px solid var(--cyan-500)' : '1px solid var(--border)',
        boxShadow: focused ? '0 0 0 3px rgba(0,229,255,0.1)' : 'none',
      }}
    >
      <div className="pl-4 shrink-0">
        <Icon className="w-4 h-4" style={{ color: focused ? 'var(--cyan-500)' : 'var(--text-muted)', transition: 'color 0.2s' }} />
      </div>
      <input
        type={type}
        name={name}
        id={name}
        required
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full bg-transparent px-3 py-3.5 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
      />
      {toggle && <div className="pr-4 shrink-0">{toggle}</div>}
    </div>
  );
}
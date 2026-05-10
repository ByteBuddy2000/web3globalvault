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
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16 relative"
      style={{
        background: 'linear-gradient(160deg, #0A0A0B 0%, #0D0E10 40%, #0A0C0F 100%)',
        fontFamily: "'DM Sans', system-ui, sans-serif",
        color: '#E8E8E8',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { -webkit-font-smoothing: antialiased; }
        ::selection { background: rgba(201,168,76,0.25); }
        ::placeholder { color: #4B5563; }
      `}</style>

      <Toaster richColors position="top-center" />

      {/* ambient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)', filter: 'blur(50px)' }} />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)', filter: 'blur(50px)' }} />
      </div>

      <div className="relative z-10 w-full max-w-sm">

        {/* card */}
        <div
          className="rounded-2xl p-8 md:p-10"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
            border: '1px solid rgba(201,168,76,0.2)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.05)',
          }}
        >
          {/* header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-full overflow-hidden"
                style={{ border: '2px solid rgba(201,168,76,0.5)' }}>
                <Image src="/asset/logo.jpeg" width={36} height={36} alt="Genesis" className="object-cover" />
              </div>
              <span className="text-lg font-bold"
                style={{ fontFamily: "'Playfair Display', serif", background: 'linear-gradient(135deg, #F5D78E 0%, #C9A84C 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Web3GlobalVault
              </span>
            </Link>

            <h1 className="text-3xl font-bold mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              Welcome Back
            </h1>
            <p className="text-sm text-gray-400">Sign in to access your account and dashboard.</p>
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
                    className="text-gray-500 hover:text-gray-300 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
              <div className="text-right">
                <a href="/forgot-password"
                  className="text-xs transition-colors duration-200 hover:opacity-80"
                  style={{ color: '#C9A84C' }}>
                  Forgot Password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mt-2"
              style={{
                background: 'linear-gradient(135deg, #C9A84C 0%, #F5D78E 50%, #C9A84C 100%)',
                color: '#0A0A0B',
                boxShadow: '0 6px 24px rgba(201,168,76,0.35)',
              }}
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
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <span className="text-xs text-gray-600 tracking-widest uppercase">or</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>

          <p className="text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <a href="/signup"
              className="font-semibold transition-colors duration-200 hover:opacity-80"
              style={{ color: '#C9A84C' }}>
              Create Account
            </a>
          </p>
        </div>

        {/* bottom note */}
        <p className="text-center text-xs text-gray-700 mt-6">
          By signing in to Web3GlobalVault, you agree to our{' '}
          <a href="#" className="hover:text-gray-400 transition-colors" style={{ color: '#6B7280' }}>Terms</a>
          {' '}and{' '}
          <a href="#" className="hover:text-gray-400 transition-colors" style={{ color: '#6B7280' }}>Privacy Policy</a>.
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
        background: 'rgba(255,255,255,0.03)',
        border: focused ? '1px solid rgba(201,168,76,0.5)' : '1px solid rgba(255,255,255,0.07)',
        boxShadow: focused ? '0 0 0 3px rgba(201,168,76,0.07)' : 'none',
      }}
    >
      <div className="pl-4 flex-shrink-0">
        <Icon className="w-4 h-4" style={{ color: focused ? '#C9A84C' : '#4B5563', transition: 'color 0.2s' }} />
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
        className="w-full bg-transparent px-3 py-3.5 text-sm text-gray-200 outline-none"
      />
      {toggle && <div className="pr-4 flex-shrink-0">{toggle}</div>}
    </div>
  );
}
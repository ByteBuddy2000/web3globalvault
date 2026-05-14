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
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative bg-background text-foreground font-body">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { -webkit-font-smoothing: antialiased; }
        ::selection { background: rgba(59, 130, 246, 0.3); }
        ::placeholder { color: var(--text-300); }
      `}</style>

      <Toaster richColors position="top-center" />

      {/* ambient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, var(--brand-glow-sm) 0%, transparent 70%)', filter: 'blur(50px)' }} />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, var(--cyan-glow-sm) 0%, transparent 70%)', filter: 'blur(50px)' }} />
      </div>

      <div className="relative z-10 w-full max-w-sm">

        {/* card */}
        <div className="rounded-2xl p-8 md:p-10 bg-card border border-border backdrop-blur-xl shadow-lg"
          style={{
            boxShadow: 'var(--shadow-lg), 0 0 0 1px var(--glass-brand-xs)',
          }}
        >
          {/* header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-brand-400">
                <Image src="/asset/web3.png" width={36} height={36} alt="GlobalVault" className="object-cover" />
              </div>
              <span className="text-lg font-bold font-display bg-gradient-to-r from-brand-400 to-brand-500 bg-clip-text text-transparent">
                Web3GlobalVault
              </span>
            </Link>

            <h1 className="text-3xl font-bold mb-2 font-display">
              Welcome Back
            </h1>
            <p className="text-sm text-muted-foreground">Sign in to access your account and dashboard.</p>
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
                    className="text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
              <div className="text-right">
                <a href="/forgot-password"
                  className="text-xs transition-colors duration-200 hover:opacity-80 text-brand-400 hover:text-brand-300">
                  Forgot Password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mt-2 bg-gradient-to-r from-brand-500 to-brand-600 text-primary-foreground shadow-brand-md hover:shadow-brand-lg"
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
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground tracking-widest uppercase">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <a href="/signup"
              className="font-semibold transition-colors duration-200 hover:opacity-80 text-brand-400 hover:text-brand-300">
              Create Account
            </a>
          </p>
        </div>

        {/* bottom note */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          By signing in to Web3GlobalVault, you agree to our{' '}
          <a href="#" className="hover:text-foreground transition-colors text-muted-foreground">Terms</a>
          {' '}and{' '}
          <a href="#" className="hover:text-foreground transition-colors text-muted-foreground">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}

/* --- Field Input --------------------------------------------- */
function FieldInput({ icon: Icon, type, name, placeholder, autoComplete, value, onChange, toggle = null }: {
  icon: any; type: string; name: string; placeholder: string;
  autoComplete: string; value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  toggle?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={`relative flex items-center rounded-xl transition-all duration-300 bg-glass-white-sm border ${
        focused ? 'border-brand-400 shadow-brand-sm' : 'border-border'
      }`}
    >
      <div className="pl-4 flex-shrink-0">
        <Icon className={`w-4 h-4 transition-colors ${focused ? 'text-brand-400' : 'text-muted-foreground'}`} />
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
        className="w-full bg-transparent px-3 py-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />
      {toggle && <div className="pr-4 flex-shrink-0">{toggle}</div>}
    </div>
  );
}

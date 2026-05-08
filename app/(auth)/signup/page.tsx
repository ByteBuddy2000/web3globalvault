'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { toast, Toaster } from 'sonner';
import { User, Mail, Phone, Home, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
export const dynamic = 'force-dynamic';
export default function signupPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Registration successful!');
        setTimeout(() => { window.location.href = '/signin'; }, 1500);
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch {
      toast.error('Please try again later, Thank you.');
    }
    setLoading(false);
  };

  const fields = [
    { name: 'fullName', icon: User, type: 'text', placeholder: 'Full Name', autoComplete: 'name' },
    { name: 'email', icon: Mail, type: 'email', placeholder: 'Email Address', autoComplete: 'email' },
    { name: 'phone', icon: Phone, type: 'text', placeholder: 'Phone Number', autoComplete: 'tel' },
    { name: 'address', icon: Home, type: 'text', placeholder: 'Home Address', autoComplete: 'street-address' },
  ];

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

      <div className="relative z-10 w-full max-w-md">

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
            {/* logo */}
            <a href="/" className="inline-flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-full overflow-hidden"
                style={{ border: '2px solid rgba(201,168,76,0.5)' }}>
                <Image src="/asset/logo.jpeg" width={36} height={36} alt="Genesis" className="object-cover" />
              </div>
              <span className="text-lg font-bold"
                style={{ fontFamily: "'Playfair Display', serif", background: 'linear-gradient(135deg, #F5D78E 0%, #C9A84C 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Genesis Bank
              </span>
            </a>

            <h1 className="text-3xl font-bold mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              Create Account
            </h1>
            <p className="text-sm text-gray-400">Join 2M+ customers and unlock your financial future.</p>
          </div>

          {/* form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* standard fields */}
            {fields.map(({ name, icon: Icon, type, placeholder, autoComplete }) => (
              <FieldInput
                key={name}
                icon={Icon}
                type={type}
                name={name}
                placeholder={placeholder}
                autoComplete={autoComplete}
                value={formData[name as keyof typeof formData]}
                onChange={handleChange}
              />
            ))}

            {/* password */}
            <FieldInput
              icon={Lock}
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              toggle={<button type="button" onClick={() => setShowPassword(p => !p)} className="text-gray-500 hover:text-gray-300 transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>}
            />

            {/* confirm password */}
            <FieldInput
              icon={Lock}
              type={showConfirm ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm Password"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              toggle={<button type="button" onClick={() => setShowConfirm(p => !p)} className="text-gray-500 hover:text-gray-300 transition-colors">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>}
            />

            {/* password strength hint */}
            {formData.password && (
              <PasswordStrength password={formData.password} />
            )}

            {/* submit */}
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
                  Creating Account…
                </>
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
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
            Already have an account?{' '}
            <a href="/signin"
              className="font-semibold transition-colors duration-200 hover:opacity-80"
              style={{ color: '#C9A84C' }}>
              Sign In
            </a>
          </p>
        </div>

        {/* bottom note */}
        <p className="text-center text-xs text-gray-700 mt-6">
          By signuping, you agree to our{' '}
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

/* ─── Password Strength ─────────────────────────────────────── */
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const label = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'][score];
  const color = ['#EF4444', '#F97316', '#EAB308', '#84CC16', '#C9A84C'][score];

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ background: i < score ? color : 'rgba(255,255,255,0.08)' }} />
        ))}
      </div>
      <p className="text-xs" style={{ color }}>{label}</p>
    </div>
  );
}
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
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative">
      <Toaster richColors position="top-center" />

      <div className="relative z-10 w-full max-w-md">

        {/* card */}
        <div className="card p-8 md:p-10">
          {/* header */}
          <div className="text-center mb-8">
            {/* logo */}
            <a href="/" className="inline-flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-[var(--vio-500)] border-opacity-50">
                <Image src="/asset/logo.jpeg" width={36} height={36} alt="Genesis" className="object-cover" />
              </div>
              <span className="text-lg font-bold text-transparent bg-clip-text" style={{ backgroundImage: 'var(--grad-holo)' }}>
                Web3GlobalVault
              </span>
            </a>

            <h1 className="text-3xl font-bold mb-2 font-display">
              Create Account
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">Join 2M+ customers and unlock your financial future.</p>
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
                color: '#btn-primary w-full inline-flex items-center justify-center gap-2 mt-2"<>
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
              className="font-semibold transition-colors durativar(--surface-border)' }} />
            <span className="text-xs text-[var(--text-muted)] tracking-widest uppercase">or</span>
            <div className="flex-1 h-px" style={{ background: 'var(--surface-border)' }} />
          </div>

          <p className="text-center text-sm text-[var(--text-secondary)]">
            Already have an account?{' '}
            <a href="/signin"
              className="font-semibold transition-colors duration-200 hover:text-[var(--cyan-500)]"
              style={{ color: 'var(--cyan-500)ur{' '}
          <a href="#" className="hover:text-gray-400 transition-colors" style={{ color: '#6B7280' }}>Terms</a>
          {' '}and{' '}
          <a href="#" className="hover:text-gray-400 transition-colors" style={{ color: '#6B7280' }}>Privacy Policy</a>.
        </p>
      </div>
    </div>
  );[var(--text-muted)] mt-6">
          By signuping, you agree to our{' '}
          <a href="#" className="hover:text-[var(--text-secondary)] transition-colors" style={{ color: 'var(--text-muted)' }}>Terms</a>
          {' '}and{' '}
          <a href="#" className="hover:text-[var(--text-secondary)] transition-colors" style={{ color: 'var(--text-muted) = null }: {
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
      <inputvar(--input)',
        border: focused ? '1px solid var(--cyan-500)' : '1px solid var(--border)',
        boxShadow: focused ? '0 0 0 3px rgba(0,229,255,0.1)' : 'none',
      }}
    >
      <div className="pl-4 flex-shrink-0">
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
        className="w-full bg-transparent px-3 py-3.5 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]
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
        ))}s = ['var(--mag-500)', 'var(--amber-500)', 'var(--vio-500)', 'var(--green-500)', 'var(--cyan-500)'];
  const color = colors[score];

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ background: i < score ? color : 'var(--input
'use client';

import { useState, ChangeEvent, FormEvent } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Handle password reset logic
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-0">
      <div className="bg-card p-8 rounded-2xl shadow-lg w-full max-w-md space-y-6 border border-border">
        <h2 className="text-2xl font-bold text-center text-foreground font-display">Forgot Password</h2>
        <p className="text-center text-muted-foreground font-body">Enter your email and we'll send you instructions to reset your password.</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={handleChange}
              required
              className="mt-1 w-full border border-border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-brand-400 bg-surface-100"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-primary-foreground font-bold py-2 rounded-lg transition-all shadow-brand-md hover:shadow-brand-lg"
          >
            Send Reset Link
          </button>
        </form>

        <div className="text-center text-sm">
          <a href="/signin" className="text-brand-400 hover:text-brand-300 hover:underline">Back to signin</a>
        </div>
      </div>
    </div>
  );
}

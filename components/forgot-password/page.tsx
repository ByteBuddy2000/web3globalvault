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
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold text-center text-black">Forgot Password</h2>
        <p className="text-center text-gray-600">Enter your email and we'll send you instructions to reset your password.</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={handleChange}
              required
              className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gold-500 hover:bg-gold-600 text-white font-bold py-2 rounded-lg"
          >
            Send Reset Link
          </button>
        </form>

        <div className="text-center text-sm">
          <a href="/signin" className="text-gold-500 hover:underline">Back to signin</a>
        </div>
      </div>
    </div>
  );
}

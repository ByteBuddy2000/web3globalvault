'use client';

import { Suspense } from 'react';
import ResetPasswordContent from './reset-password-content';


export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[radial-gradient(circle_at_20%_20%,rgba(201,168,76,0.08),transparent_40%),radial-gradient(circle_at_85%_20%,rgba(201,168,76,0.05),transparent_40%),linear-gradient(120deg,#050607_0%,#0d1014_40%,#0b0d11_100%)]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-300"></div>
            <p className="text-slate-300 mt-4">Loading...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

'use client';

import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useKYCStatus } from '@/lib/hooks/useKYCStatus';

interface KYCGuardProps {
  children: React.ReactNode;
  requiredFor: string;
}

export function KYCGuard({ children, requiredFor }: KYCGuardProps) {
  const { isVerified, status, loading, rejectionReason } = useKYCStatus();

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-border rounded-lg"></div>
            <div className="h-32 bg-border rounded-lg"></div>
            <div className="h-12 bg-border rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="max-w-md w-full">
          {status === 'pending' && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-md animate-pulse"></div>
                  <AlertCircle className="w-12 h-12 text-blue-400 relative z-10 animate-spin" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-blue-300 mb-2">KYC Verification Pending</h3>
              <p className="text-blue-200/80 text-sm mb-4">
                Your KYC is currently under review. Once verified, you'll be able to {requiredFor}.
              </p>
              <Link
                href="/dashboard/kyc"
                className="inline-block px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
              >
                View KYC Status
              </Link>
            </div>
          )}

          {status === 'rejected' && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-red-500/20 blur-md"></div>
                  <AlertCircle className="w-12 h-12 text-red-400 relative z-10" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-red-300 mb-2">KYC Verification Failed</h3>
              {rejectionReason && (
                <p className="text-red-200/80 text-sm mb-3">
                  <strong>Reason:</strong> {rejectionReason}
                </p>
              )}
              <p className="text-red-200/80 text-sm mb-4">
                Please review the rejection reason and resubmit your KYC.
              </p>
              <Link
                href="/dashboard/kyc"
                className="inline-block px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
              >
                Resubmit KYC
              </Link>
            </div>
          )}

          {!status && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-md"></div>
                  <AlertCircle className="w-12 h-12 text-amber-400 relative z-10" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-amber-300 mb-2">KYC Required</h3>
              <p className="text-amber-200/80 text-sm mb-4">
                You must complete your KYC verification to {requiredFor}.
              </p>
              <Link
                href="/dashboard/kyc"
                className="inline-block px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors"
              >
                Complete KYC
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  // KYC is verified, show children
  return <>{children}</>;
}

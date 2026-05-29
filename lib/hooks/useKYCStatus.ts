import { useEffect, useState } from 'react';

export interface KYCStatusData {
  status: 'pending' | 'verified' | 'rejected' | null;
  remarks?: string;
  rejectionReason?: string;
}

export function useKYCStatus() {
  const [kycStatus, setKycStatus] = useState<KYCStatusData>({ status: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKYCStatus = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/kyc/submit');
        const data = await res.json();

        if (data.success && data.data) {
          setKycStatus({
            status: data.data.status,
            remarks: data.data.remarks,
            rejectionReason: data.data.rejectionReason,
          });
        } else {
          setKycStatus({ status: null });
        }
      } catch (err) {
        console.error('Error fetching KYC status:', err);
        setError('Failed to fetch KYC status');
      } finally {
        setLoading(false);
      }
    };

    fetchKYCStatus();
  }, []);

  const isVerified = kycStatus.status === 'verified';

  return {
    ...kycStatus,
    isVerified,
    loading,
    error,
  };
}

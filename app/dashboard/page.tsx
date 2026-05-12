'use client';

import DashboardContent from './DashboardContent';

export default function Dashboard() {
  return (
    <div className="flex min-h-screen text-white overflow-hidden" style={{ background: 'var(--grad-bg)' }}>
      <div className="flex-1 flex flex-col">
        <DashboardContent />
      </div>
    </div>
  );
}

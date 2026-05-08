'use client';

import DashboardContent from './DashboardContent';

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-[ #8d6e08] to-[#200338] text-white overflow-hidden">
      <div className="flex-1 flex flex-col">
        <DashboardContent />
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Navbar from '../../components/navbar/navbar';
import Sidebar from './components/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`flex h-screen overflow-hidden bg-[#0a0b0e] text-white font-mono`}>
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <Navbar onMenu={() => setSidebarOpen(s => !s)} />

        <div className="flex-1 relative overflow-hidden">
          {/* Grid texture */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)
              `,
              backgroundSize: '48px 48px',
            }}
          />

          <main className="absolute inset-0 z-10 overflow-y-auto p-3 sm:p-4 md:p-6">
            <div className="w-full max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
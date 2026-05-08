// app/dashboard/swap/page.tsx
'use client';

import SwapPage from '../components/SwapPage';

export default function Swap() {
    return (
        <div className="flex min-h-screen bg-app text-white">
            <div className="flex-1 p-6">
                <SwapPage />
            </div>
        </div>
    );
}

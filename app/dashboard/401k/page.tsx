'use client';

import React from 'react';
import K401Page from './401kPage';

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#8d6e08] to-[#200338] text-white p-4">
      <K401Page />
    </div>
  );
}
'use client';

import React from 'react';
import K401Page from './401kPage';

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-0 via-surface-100 to-surface-200 text-foreground p-4 font-body">
      <K401Page />
    </div>
  );
}
'use client';

import React from 'react';

interface SparklineProps {
  data?: number[];
  positive?: boolean;
}

export default function Sparkline({
  data,
  positive = true,
}: SparklineProps) {
  // fallback dataset if none provided
  const points = data && data.length > 0
    ? data
    : [40, 45, 42, 55, 50, 60, 58, 70, 65, 80, 75, 85];

  const max = Math.max(...points);
  const min = Math.min(...points);

  const normalized = points.map((p) => {
    const range = max - min || 1;
    return 100 - ((p - min) / range) * 80 - 10;
  });

  const path = normalized
    .map(
      (y, i) =>
        `${i === 0 ? 'M' : 'L'} ${
          (i / (points.length - 1)) * 100
        },${y}`
    )
    .join(' ');

  const fillPath = `${path} L100,100 L0,100 Z`;

  const color = positive ? '#10b981' : '#f43f5e';

  return (
    <svg
      viewBox="0 0 100 100"
      className="w-14 h-7"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient
          id={`spark-${positive ? 'up' : 'down'}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0%"
            stopColor={color}
            stopOpacity="0.35"
          />
          <stop
            offset="100%"
            stopColor={color}
            stopOpacity="0"
          />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <path
        d={fillPath}
        fill={`url(#spark-${positive ? 'up' : 'down'})`}
      />

      {/* Line */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
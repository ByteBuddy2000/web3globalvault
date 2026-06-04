'use client';

import React, { useState } from 'react';
import Image from 'next/image';

import Sparkline from '../ui/Sparkline';
import Tag from './Tag';
import { fmt } from '../utils/fmt';
import { getAssetImagePath } from '../utils/getAssetImagePath';

/* ─── Types ───────────────────────────── */
export type Asset = {
  _id: string;
  name: string;
  symbol: string;
  type: string;
  quantity: number;
  image?: string;
  changePercent?: number;
};

/* ─── Component ───────────────────────── */
function AssetRow({
  a,
  price,
  value,
}: {
  a: Asset;
  price: number;
  value: number;
}) {
  const [imgErr, setImgErr] = useState(false);

  const chg = a.changePercent ?? 0;
  const isPos = chg >= 0;

  const imagePath =
    a.image || getAssetImagePath(a.symbol, a.type);

  return (
    <div className="dashboard-row flex items-center justify-between py-2">
      {/* LEFT SIDE */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-md overflow-hidden flex-shrink-0 border border-white/10">
          {!imgErr ? (
            <Image
              src={imagePath}
              alt={a.name}
              width={36}
              height={36}
              className="object-cover w-full h-full"
              onError={() => setImgErr(true)}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-xs font-bold text-white"
              style={{
                background:
                  'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(16,185,129,0.2))',
              }}
            >
              {a.symbol?.[0]}
            </div>
          )}
        </div>

        <div>
          <div className="text-xs font-semibold text-white">
            {a.name}
          </div>
          <div className="text-[10px] text-white/40">
            {a.quantity?.toLocaleString(undefined, {
              maximumFractionDigits: 4,
            })}{' '}
            {a.symbol}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-3">
        <Sparkline positive={isPos} />

        <div className="text-right">
          <div className="text-xs font-bold text-white mb-1">
            ${fmt(value)}
          </div>

          <Tag type={a.type} />
        </div>
      </div>
    </div>
  );
}

export default AssetRow;
import React, { useState } from "react";
import { Sparklines, SparklinesLine } from "react-sparklines";

type Asset = {
  _id: string;
  name: string;
  symbol: string;
  type: string;
  quantity: number;
  livePrice?: number;
  change?: number;
  changePercent?: number;
  sparkline?: number[];
};

type AssetListProps = {
  assets: Asset[];
};

export default function AssetList({ assets }: AssetListProps) {
  const [visibleCount, setVisibleCount] = useState(5);

  const handleShowMore = () => {
    setVisibleCount((prev) => Math.min(prev + 5, assets.length));
  };

  return (
    <div className="card rounded-3xl p-6 shadow-xl border border-yellow-400/12">
      <h3 className="text-2xl font-bold mb-6 text-accent tracking-wide">My Assets</h3>
      <ul className="space-y-4">
        {assets.length ? (
          assets.slice(0, visibleCount).map((asset) => {
            const price = asset.livePrice ?? 0;
            const change = asset.change ?? 0;
            const changePercent = asset.changePercent ?? 0;
            const value = price * asset.quantity;

            const changeColor =
              change > 0 ? "text-green-400" : change < 0 ? "text-red-400" : "text-gray-400";

            return (
              <li key={asset._id} className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 bg-white/2 rounded-2xl p-4 hover:bg-white/5 transition duration-200 shadow-sm">
                {/* Left: Asset name + type */}
                <div>
                  <span className="font-semibold text-white text-lg">
                    {asset.name} {" "}
                    <span className="text-muted text-sm">({asset.symbol})</span>
                  </span>
                  <div className="text-muted text-sm">Type: {asset.type}</div>
                </div>

                {/* Middle: Balance + Value */}
                <div className="text-muted text-sm">
                  <div>
                    Balance:{" "}
                    <span className="font-semibold text-white">
                      {asset.quantity} {asset.symbol}
                    </span>
                  </div>
                  <div>
                    Value:{" "}
                    <span className="font-semibold text-white">
                      ${value.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Right: Price + Change + Sparkline */}
                <div className="flex flex-col items-end">
                  <span className={`font-bold text-lg ${changeColor}`}>
                    ${price.toLocaleString()}
                  </span>
                  {changePercent !== 0 && (
                    <span className={`text-sm ${changeColor}`}>
                      {change > 0 ? "▲" : "▼"} {change.toFixed(2)} ({changePercent.toFixed(2)}%)
                    </span>
                  )}

                  {asset.sparkline && asset.sparkline.length > 0 && (
                    <div className="mt-2 w-32">
                      <Sparklines data={asset.sparkline.slice(-20)} width={100} height={25}>
                        <SparklinesLine color={change > 0 ? "#4ade80" : "#f87171"} />
                      </Sparklines>
                    </div>
                  )}
                </div>
              </li>
            );
          })
        ) : (
          <li className="text-muted text-center py-6">No assets found.</li>
        )}
      </ul>

      {visibleCount < assets.length && (
        <div className="mt-4 flex justify-center">
          <button onClick={handleShowMore} className="btn-accent">Show More</button>
        </div>
      )}
    </div>
  );
}

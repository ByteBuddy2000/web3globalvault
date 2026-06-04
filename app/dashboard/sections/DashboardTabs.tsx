'use client';

type Asset = {
  _id: string;
  name: string;
  symbol: string;
  type: string;
  quantity: number;
  price?: number;
};

type Transaction = {
  _id: string;
  type: string;
  asset: string;
  amount: number;
  status: string;
  date: string;
};

type Props = {
  active: 'assets' | 'transactions';
  setActive: (v: 'assets' | 'transactions') => void;
  assets: Asset[];
  transactions: Transaction[];
  marketPrices: Record<string, number>;
};

export default function DashboardTabs({
  active,
  setActive,
  assets,
  transactions,
  marketPrices,
}: Props) {
  return (
    <div className="space-y-4">
      {/* Tab Buttons */}
      <div className="flex gap-2 bg-white/5 p-1 rounded-lg w-fit border border-white/10">
        {(['assets', 'transactions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-3 py-1.5 text-xs font-bold uppercase rounded-md transition ${
              active === tab
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            {tab === 'assets' ? 'Holdings' : 'Transactions'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="dashboard-card">
        {active === 'assets' ? (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Holdings</h2>
            {assets.length === 0 ? (
              <p className="text-white/40">No assets yet</p>
            ) : (
              <div className="space-y-3">
                {assets.map((asset) => (
                  <div
                    key={asset._id}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div>
                      <p className="font-semibold text-white">{asset.name}</p>
                      <p className="text-xs text-white/40">{asset.symbol}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">
                        {asset.quantity} {asset.symbol}
                      </p>
                      <p className="text-xs text-white/40">
                        ${(
                          asset.quantity *
                          (marketPrices[asset.symbol] || asset.price || 0)
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Transactions</h2>
            {transactions.length === 0 ? (
              <p className="text-white/40">No transactions yet</p>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div
                    key={tx._id}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div>
                      <p className="font-semibold text-white capitalize">
                        {tx.type}
                      </p>
                      <p className="text-xs text-white/40">{tx.asset}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">
                        ${tx.amount.toLocaleString()}
                      </p>
                      <p
                        className={`text-xs ${
                          tx.status === 'completed'
                            ? 'text-green-400'
                            : tx.status === 'pending'
                            ? 'text-yellow-400'
                            : 'text-red-400'
                        }`}
                      >
                        {tx.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
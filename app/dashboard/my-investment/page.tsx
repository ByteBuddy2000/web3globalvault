'use client';

import { useState, useEffect } from 'react';
import InvestmentWizard from './InvestmentWizard';
import WithdrawalModal from './WithdrawalModal';
import GrowthChart from './GrowthChart';
import { motion } from 'framer-motion';
import { TrendingUp, Loader, Zap, Target, PieChart, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

export default function Page() {
  const [investments, setInvestments] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [expandedSections, setExpandedSections] = useState({
    chart: true,
    investments: true,
    assets: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const res = await fetch('/api/investment', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setInvestments(data.investments || []);
        setAssets(data.assets || []);
      }
    } catch (err) {
      console.error('Failed to fetch investments:', err);
      toast.error('Failed to load investments');
    } finally {
      setLoading(false);
    }
  }

  const handleInvestmentSuccess = () => {
    setShowWizard(false);
    fetchData();
    toast.success('Investment created successfully!');
  };

  const handleWithdrawalSuccess = () => {
    setSelectedWithdrawal(null);
    fetchData();
    toast.success('Withdrawal processed successfully!');
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const activeInvestments = investments.filter(inv => inv.status === 'Active').length;
  const totalAssets = assets.reduce((sum, a) => sum + (a.quantity * (a.livePrice || a.price || 0)), 0);

  return (
    <div className="min-h-screen text-white">
      {/* Header - Responsive */}
      <div className="sticky top-0 z-40 bg-app/70 backdrop-blur border-b border-white/6">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="p-2 sm:p-3 card rounded-lg border border-white/6 flex-shrink-0">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-accent" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate">Portfolio</h1>
              <p className="text-xs sm:text-sm text-muted truncate">Manage investments</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowWizard(true)}
            className="w-full sm:w-auto mt-2 sm:mt-0 px-3 sm:px-4 py-2 sm:py-2 btn-accent font-bold rounded-lg transition shadow-lg text-xs sm:text-sm"
          >
            + Invest
          </motion.button>
        </div>
      </div>

      {/* Main Content - Mobile First */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6">
        
        {/* 1. Portfolio Summary Cards - Mobile First: 1 column, md: 2, xl: 3-4 */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0 }}
        >
          <h2 className="text-sm sm:text-base font-semibold text-muted mb-3 uppercase tracking-wide">Balance</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            {[
              {
                label: 'Total Invested',
                value: `$${totalInvested.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
                icon: Zap,
                textColor: 'text-amber-400'
              },
              {
                label: 'Active Plans',
                value: activeInvestments,
                icon: Target,
                textColor: 'text-emerald-400'
              },
              {
                label: 'Total Assets',
                value: `$${totalAssets.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
                icon: PieChart,
                textColor: 'text-blue-400'
              },
              {
                label: 'Available',
                value: assets.length,
                icon: TrendingUp,
                textColor: 'text-purple-400',
                hideOn: 'hidden xl:block'
              }
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className={`card rounded-lg p-3 sm:p-4 md:p-6 hover:border-opacity-50 transition ${card.hideOn || ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-muted text-xs sm:text-sm font-medium truncate">{card.label}</p>
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-accent flex-shrink-0" />
                  </div>
                  <p className={`text-base sm:text-lg md:text-2xl font-bold ${card.textColor} truncate`}>{card.value}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* 2. Quick Actions - Mobile First */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
          className="card rounded-lg p-3 sm:p-4 md:p-6"
        >
          <h2 className="text-sm sm:text-base font-semibold text-muted mb-3 uppercase tracking-wide">Actions</h2>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowWizard(true)}
              className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 btn-accent font-bold rounded-lg transition text-xs sm:text-sm"
            >
              Start Investment
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => window.location.href = '/dashboard/assets'}
              className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 bg-purple-600/10 text-purple-400 border border-purple-500/20 font-bold rounded-lg hover:bg-purple-600/20 transition text-xs sm:text-sm hidden sm:inline-block"
            >
              My Assets
            </motion.button>
          </div>
        </motion.div>

        {/* 3. Growth Chart - Responsive with Horizontal Scroll on Mobile */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="card rounded-lg p-3 sm:p-4 md:p-6"
        >
          <div className="flex items-center justify-between mb-3 gap-2">
            <h2 className="text-sm sm:text-base font-semibold text-accent">Growth</h2>
            <button
              onClick={() => toggleSection('chart')}
              className="p-1 hover:bg-white/5 rounded transition"
            >
              <ChevronDown 
                className={`w-4 h-4 text-muted transition-transform ${expandedSections.chart ? 'rotate-0' : '-rotate-90'}`}
              />
            </button>
          </div>
          
          {expandedSections.chart && (
            <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6">
              <div className="px-3 sm:px-4 md:px-6">
                <div className="h-48 sm:h-64 md:h-96 w-full" style={{ minWidth: '600px' }}>
                  <GrowthChart investments={investments} />
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* 4. Investments List - Fully Responsive Card Layout */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.3 }}
          className="card rounded-lg p-3 sm:p-4 md:p-6"
        >
          <div className="flex items-center justify-between mb-3 gap-2">
            <h2 className="text-sm sm:text-base font-semibold text-accent">Investments</h2>
            <button
              onClick={() => toggleSection('investments')}
              className="p-1 hover:bg-white/5 rounded transition"
            >
              <ChevronDown 
                className={`w-4 h-4 text-muted transition-transform ${expandedSections.investments ? 'rotate-0' : '-rotate-90'}`}
              />
            </button>
          </div>

          {expandedSections.investments && (
            <>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="w-5 h-5 animate-spin text-accent" />
                </div>
              ) : investments.length > 0 ? (
                <div className="space-y-3">
                  {investments.map((inv) => (
                    <motion.div 
                      key={inv._id} 
                      initial={{ opacity: 0, x: -12 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      className="card p-3 sm:p-4 md:p-6 hover:shadow-lg transition"
                    >
                      {/* Mobile Card Layout: Stacked */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        
                        {/* Left Section */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <p className="text-xs text-muted uppercase tracking-wide">Plan</p>
                          <p className="font-semibold text-white truncate text-sm sm:text-base">{inv.planName}</p>
                          <p className="text-xs sm:text-sm text-muted">{new Date(inv.startDate).toLocaleDateString()}</p>
                        </div>

                        {/* Middle Section - Mobile: Hidden by default, lg:block */}
                        <div className="hidden sm:flex sm:gap-4 lg:gap-6">
                          <div className="min-w-0">
                            <p className="text-xs text-muted uppercase tracking-wide mb-1">Amount</p>
                            <p className="font-semibold text-accent text-sm">${Number(inv.amount).toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs text-muted uppercase tracking-wide mb-1">Asset</p>
                            <p className="font-semibold text-white text-sm truncate">{inv.assetSymbol}</p>
                          </div>
                        </div>

                        {/* Mobile Summary Info */}
                        <div className="sm:hidden flex justify-between items-center py-2 border-t border-white/5">
                          <div>
                            <p className="text-xs text-muted">Amount</p>
                            <p className="text-sm font-semibold text-accent">${Number(inv.amount).toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted">Asset</p>
                            <p className="text-sm font-semibold text-white">{inv.assetSymbol}</p>
                          </div>
                        </div>

                        {/* Right Section - Status & Actions */}
                        <div className="flex flex-wrap items-center gap-2 justify-between sm:justify-end">
                          <span className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${inv.status === 'Active' ? 'bg-emerald-500/12 text-emerald-400 border border-emerald-500/20' : 'bg-black/20 text-muted border border-white/5'}`}>
                            {inv.status || 'Active'}
                          </span>
                          {inv.status === 'Active' && (
                            <motion.button 
                              whileHover={{ scale: 1.03 }} 
                              whileTap={{ scale: 0.97 }} 
                              onClick={() => setSelectedWithdrawal(inv)} 
                              className="px-2.5 sm:px-3 py-1 text-xs font-semibold bg-red-600/10 text-red-400 border border-red-500/12 rounded hover:bg-red-600/20 transition whitespace-nowrap"
                            >
                              Withdraw
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-muted mx-auto mb-3" />
                  <p className="text-xs sm:text-sm text-muted">No investments yet. Click "Start Investment" to begin.</p>
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* 5. Assets Section - Hidden on Mobile, lg:block */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.4 }}
          className="hidden lg:block card rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4 gap-2">
            <h2 className="text-base font-semibold text-accent">Available Assets</h2>
            <button
              onClick={() => toggleSection('assets')}
              className="p-1 hover:bg-white/5 rounded transition"
            >
              <ChevronDown 
                className={`w-4 h-4 text-muted transition-transform ${expandedSections.assets ? 'rotate-0' : '-rotate-90'}`}
              />
            </button>
          </div>

          {expandedSections.assets && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assets.length > 0 ? (
                assets.map((asset) => (
                  <div key={asset._id} className="card p-4 hover:shadow-lg transition">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm text-muted mb-1">Asset</p>
                        <p className="font-semibold text-white">{asset.symbol}</p>
                      </div>
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">{asset.type}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div>
                        <p className="text-xs text-muted">Price</p>
                        <p className="text-sm font-semibold text-accent">${(asset.livePrice || asset.price).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted">Qty</p>
                        <p className="text-sm font-semibold text-white">{Number(asset.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted text-sm col-span-full text-center py-4">No assets available</p>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Investment Wizard Modal */}
      {showWizard && (
        <InvestmentWizard
          assets={assets}
          onClose={() => setShowWizard(false)}
          onSuccess={handleInvestmentSuccess}
        />
      )}

      {/* Withdrawal Modal */}
      {selectedWithdrawal && (
        <WithdrawalModal
          investment={selectedWithdrawal}
          onClose={() => setSelectedWithdrawal(null)}
          onSuccess={handleWithdrawalSuccess}
        />
      )}
    </div>
  );
}
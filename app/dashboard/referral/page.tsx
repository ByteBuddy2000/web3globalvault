'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Loader, Users, Gift, Share2, Copy, CheckCircle2, Facebook, Instagram, Twitter, Mail, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

export default function ReferralPage() {
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    howItWorks: true,
    invite: true,
    share: true,
    referrals: true
  });

  const referralCode = "linda-draper";
  const referralLink = `https://genesis-bank.com/referral/${referralCode}`;

  useEffect(() => {
    fetchReferrals();
  }, []);

  async function fetchReferrals() {
    try {
      setLoading(true);
      const res = await fetch('/api/referrals', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setReferrals(data.referrals || []);
      }
    } catch (err) {
      console.error('Failed to load referrals:', err);
      toast.error('Failed to load referrals');
    } finally {
      setLoading(false);
    }
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const totalEarnings = useMemo(() => {
    return referrals.reduce((sum, r) => {
      const num = typeof r.reward === 'string' ? Number(r.reward.replace(/[^0-9.-]+/g, '')) : Number(r.reward || 0);
      return sum + (Number.isFinite(num) ? num : 0);
    }, 0);
  }, [referrals]);

  const activeReferrals = referrals.filter(r => String(r.status || '').toLowerCase() === 'active').length;
  const pendingReferrals = referrals.filter(r => String(r.status || '').toLowerCase() === 'pending').length;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Copy failed');
    }
  };

  const handleSendInvite = async () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }
    try {
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Invite failed');
      const data = await res.json();
      setReferrals((prev) => [data.referral, ...prev]);
      toast.success(`Invitation sent to ${email}`);
      setEmail('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to send invite');
    }
  };

  const shareTo = (platform: 'facebook' | 'twitter' | 'instagram') => {
    const encoded = encodeURIComponent(referralLink);
    let url = '#';
    if (platform === 'facebook') url = `https://www.facebook.com/sharer/sharer.php?u=${encoded}`;
    if (platform === 'twitter') url = `https://twitter.com/intent/tweet?url=${encoded}&text=${encodeURIComponent('Join me at Web3GlobalVault!')}`;
    if (platform === 'instagram') url = `https://www.instagram.com/`;
    window.open(url, '_blank', 'noopener');
  };

  const formatDate = (d: string) => {
    if (!d) return '--';
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  };

  const getStatusClasses = (status?: string) => {
    const s = String(status ?? '').toLowerCase();
    if (s === 'active' || s === 'completed') return 'bg-emerald-500/12 text-emerald-400 border border-emerald-500/20';
    if (s === 'pending' || s === 'waiting') return 'bg-yellow-500/12 text-yellow-400 border border-yellow-500/20';
    if (s === 'rejected' || s === 'failed') return 'bg-red-500/12 text-red-400 border border-red-500/20';
    return 'bg-black/20 text-muted border border-white/5';
  };

  return (
    <div className="min-h-screen text-white">
      {/* Header - Responsive */}
      <div className="sticky top-0 z-40 bg-app/70 backdrop-blur border-b border-white/6">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="p-2 sm:p-3 card rounded-lg border border-white/6 flex-shrink-0">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-accent" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate">Referrals</h1>
              <p className="text-xs sm:text-sm text-muted truncate">Earn rewards by inviting friends</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Mobile First */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6">

        {/* 1. Referral Stats - Mobile First */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <h2 className="text-sm sm:text-base font-semibold text-muted mb-3 uppercase tracking-wide">Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {[
              {
                label: 'Total Earnings',
                value: `$${totalEarnings.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
                icon: TrendingUp,
                textColor: 'text-green-400'
              },
              {
                label: 'Active Referrals',
                value: activeReferrals,
                icon: Users,
                textColor: 'text-blue-400'
              },
              {
                label: 'Pending Rewards',
                value: pendingReferrals,
                icon: Gift,
                textColor: 'text-purple-400'
              }
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className="card rounded-lg p-3 sm:p-4 md:p-6 hover:border-opacity-50 transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-muted text-xs sm:text-sm font-medium truncate">{card.label}</p>
                    <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${card.textColor} flex-shrink-0`} />
                  </div>
                  <p className={`text-base sm:text-lg md:text-2xl font-bold ${card.textColor} truncate`}>{card.value}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* 2. How It Works - Collapsible */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card rounded-lg p-3 sm:p-4 md:p-6"
        >
          <div className="flex items-center justify-between mb-3 gap-2">
            <h2 className="text-sm sm:text-base font-semibold text-accent flex items-center gap-2">
              <Gift className="w-4 h-4" />
              How It Works
            </h2>
            <button
              onClick={() => toggleSection('howItWorks')}
              className="p-1 hover:bg-white/5 rounded transition"
            >
              <ChevronDown
                className={`w-4 h-4 text-muted transition-transform ${expandedSections.howItWorks ? 'rotate-0' : '-rotate-90'}`}
              />
            </button>
          </div>

          {expandedSections.howItWorks && (
            <div className="space-y-4">
              {[
                { step: 1, title: 'Invite Friends', desc: 'Share your unique referral link or send invites via email' },
                { step: 2, title: 'They Sign Up', desc: 'Your friends create an account using your referral link' },
                { step: 3, title: 'You Both Earn', desc: 'Get $250 each when they complete their first transaction' }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3 sm:gap-4">
                  <div className="flex-shrink-0">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-accent/20 flex items-center justify-center font-bold text-xs sm:text-sm text-accent border border-accent/30"
                    >
                      {item.step}
                    </motion.div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm sm:text-base mb-1">{item.title}</p>
                    <p className="text-xs sm:text-sm text-muted">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* 3. Send Invites - Collapsible */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card rounded-lg p-3 sm:p-4 md:p-6"
        >
          <div className="flex items-center justify-between mb-3 gap-2">
            <h2 className="text-sm sm:text-base font-semibold text-accent flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Send Invites
            </h2>
            <button
              onClick={() => toggleSection('invite')}
              className="p-1 hover:bg-white/5 rounded transition"
            >
              <ChevronDown
                className={`w-4 h-4 text-muted transition-transform ${expandedSections.invite ? 'rotate-0' : '-rotate-90'}`}
              />
            </button>
          </div>

          {expandedSections.invite && (
            <>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="flex-1 bg-app border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-white placeholder-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition text-sm"
                />
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSendInvite}
                  className="px-4 sm:px-6 py-2 sm:py-3 btn-accent font-bold rounded-lg transition text-xs sm:text-sm whitespace-nowrap"
                >
                  Send Invite
                </motion.button>
              </div>
              <div className="p-3 bg-app/50 border border-white/10 rounded-lg">
                <p className="text-xs text-muted flex items-center gap-2">
                  <Mail className="w-3 h-3" />
                  You can send multiple invites separated by commas
                </p>
              </div>
            </>
          )}
        </motion.div>

        {/* 4. Share Link - Collapsible */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card rounded-lg p-3 sm:p-4 md:p-6"
        >
          <div className="flex items-center justify-between mb-3 gap-2">
            <h2 className="text-sm sm:text-base font-semibold text-accent flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Your Referral Link
            </h2>
            <button
              onClick={() => toggleSection('share')}
              className="p-1 hover:bg-white/5 rounded transition"
            >
              <ChevronDown
                className={`w-4 h-4 text-muted transition-transform ${expandedSections.share ? 'rotate-0' : '-rotate-90'}`}
              />
            </button>
          </div>

          {expandedSections.share && (
            <>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="flex-1 bg-app border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-white text-xs sm:text-sm focus:outline-none"
                />
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCopyLink}
                  className={`px-4 sm:px-6 py-2 sm:py-3 font-bold rounded-lg transition text-xs sm:text-sm whitespace-nowrap flex items-center gap-2 ${
                    copied
                      ? 'bg-green-600 text-white'
                      : 'bg-app border border-white/10 text-white hover:bg-white/5'
                  }`}
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                      Copy
                    </>
                  )}
                </motion.button>
              </div>

              <div className="mb-4">
                <p className="text-xs text-muted mb-3">Share on social media:</p>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => shareTo('facebook')}
                    className="px-3 sm:px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/20 font-bold rounded-lg hover:bg-blue-600/30 transition text-xs sm:text-sm flex items-center gap-2"
                  >
                    <Facebook className="w-3 h-3 sm:w-4 sm:h-4" />
                    Facebook
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => shareTo('twitter')}
                    className="px-3 sm:px-4 py-2 bg-sky-600/20 text-sky-400 border border-sky-500/20 font-bold rounded-lg hover:bg-sky-600/30 transition text-xs sm:text-sm flex items-center gap-2"
                  >
                    <Twitter className="w-3 h-3 sm:w-4 sm:h-4" />
                    Twitter
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => shareTo('instagram')}
                    className="px-3 sm:px-4 py-2 bg-pink-600/20 text-pink-400 border border-pink-500/20 font-bold rounded-lg hover:bg-pink-600/30 transition text-xs sm:text-sm flex items-center gap-2"
                  >
                    <Instagram className="w-3 h-3 sm:w-4 sm:h-4" />
                    Instagram
                  </motion.button>
                </div>
              </div>

              <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
                <p className="text-xs text-accent flex items-center gap-2">
                  💡 Share this link with friends to earn $250 when they sign up
                </p>
              </div>
            </>
          )}
        </motion.div>

        {/* 5. Your Referrals - Collapsible */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="card rounded-lg p-3 sm:p-4 md:p-6"
        >
          <div className="flex items-center justify-between mb-3 gap-2">
            <h2 className="text-sm sm:text-base font-semibold text-accent flex items-center gap-2">
              <Users className="w-4 h-4" />
              Your Referrals
            </h2>
            <button
              onClick={() => toggleSection('referrals')}
              className="p-1 hover:bg-white/5 rounded transition"
            >
              <ChevronDown
                className={`w-4 h-4 text-muted transition-transform ${expandedSections.referrals ? 'rotate-0' : '-rotate-90'}`}
              />
            </button>
          </div>

          {expandedSections.referrals && (
            <>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="w-5 h-5 animate-spin text-accent" />
                </div>
              ) : referrals.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {referrals.map((referral, idx) => (
                    <motion.div
                      key={referral.id || idx}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + idx * 0.03 }}
                      className="card p-3 sm:p-4 hover:shadow-lg transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white text-sm sm:text-base truncate">{referral.name || referral.email}</p>
                          <p className="text-xs sm:text-sm text-muted">{formatDate(referral.date)}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 justify-between sm:justify-end">
                          <span className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusClasses(referral.status)}`}>
                            {String(referral.status ?? '').replace(/^(.)/, s => s.toUpperCase())}
                          </span>
                          <div className="text-right">
                            <p className="text-xs text-muted">Earned</p>
                            <p className="text-sm sm:text-base font-bold text-green-400">{referral.reward || '$0'}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-8 h-8 sm:w-10 sm:h-10 text-muted mx-auto mb-3" />
                  <p className="text-xs sm:text-sm text-muted">No referrals yet</p>
                  <p className="text-xs text-muted mt-1">Start inviting to earn rewards!</p>
                </div>
              )}

              {/* Reward Info */}
              <div className="mt-6 pt-4 sm:pt-6 border-t border-white/10 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="card p-3 sm:p-4">
                    <p className="text-xs text-muted mb-1">Reward Per Referral</p>
                    <p className="text-lg sm:text-xl font-bold text-accent">$250</p>
                  </div>
                  <div className="card p-3 sm:p-4">
                    <p className="text-xs text-muted mb-2">Requirements</p>
                    <ul className="text-xs text-muted space-y-1">
                      <li>✓ Valid email signup</li>
                      <li>✓ First transaction</li>
                      <li>✓ Account verified</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="card rounded-lg p-3 sm:p-4 md:p-6 text-center"
        >
          <p className="text-xs text-muted">
            By participating in the Genesis Referral Program, you agree to our{' '}
            <a href="#" className="text-accent hover:underline">Terms & Conditions</a>.
            Rewards are subject to verification and may take up to 24 hours to process.
          </p>
        </motion.div>
      </div>
    </div>
  );
}



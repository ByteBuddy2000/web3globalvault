'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Plus, Loader, ArrowRight, Crown, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

type Card = {
  _id: string;
  cardNumber: string;
  cardHolder: string;
  cardType: 'VIRTUAL' | 'PHYSICAL';
  tierLevel: 'BASIC' | 'SILVER' | 'GOLD' | 'PLATINUM';
  validThru: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING';
  balance: number;
  dailyLimit: number;
  dailySpent: number;
};

const tierColors: Record<string, { bg: string; text: string; icon: string; glow: string }> = {
  BASIC: { bg: 'from-gray-600 to-gray-700', text: 'text-gray-300', icon: '💳', glow: 'rgba(107, 114, 128, 0.2)' },
  SILVER: { bg: 'from-slate-500 to-slate-600', text: 'text-slate-100', icon: '✨', glow: 'rgba(148, 163, 184, 0.2)' },
  GOLD: { bg: 'from-yellow-500 to-amber-600', text: 'text-yellow-50', icon: '👑', glow: 'rgba(234, 179, 8, 0.3)' },
  PLATINUM: { bg: 'from-purple-600 to-indigo-700', text: 'text-purple-50', icon: '⭐', glow: 'rgba(147, 51, 234, 0.3)' },
};

export function CardDisplay() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await fetch('/api/cards', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setCards(data.cards || []);
        }
      } catch (error) {
        console.error('Error fetching cards:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, []);

  const primaryCard = cards[0];
  const maskCardNumber = (num: string) => num.slice(-4).padStart(num.length, '•');

  const tierConfig: Record<string, any> = {
    BASIC: { daily: '$5K', monthly: '$50K', fee: 'Free' },
    SILVER: { daily: '$10K', monthly: '$100K', fee: '$5/mo' },
    GOLD: { daily: '$25K', monthly: '$250K', fee: '$15/mo' },
    PLATINUM: { daily: '$50K', monthly: '$500K', fee: '$30/mo' },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="dashboard-hero"
    >
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(167, 139, 250, 0.15) 0%, transparent 70%)',
        filter: 'blur(30px)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}>
          <div>
            <div className="dashboard-metric-label" style={{ marginBottom: 8 }}>
              Card Management
            </div>
            <h3 style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '-0.02em',
            }}>
              {loading ? 'Loading...' : cards.length} {cards.length === 1 ? 'Card' : 'Cards'}
            </h3>
          </div>
          <button
            onClick={() => router.push('/dashboard/cards')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 10,
              background: 'rgba(99,102,241,0.15)',
              border: '1px solid rgba(99,102,241,0.3)',
              color: '#6366f1',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.25)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(99,102,241,0.5)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.15)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(99,102,241,0.3)';
            }}
          >
            <Plus size={12} /> Apply Card
          </button>
        </div>

        {/* Divider */}
        <div style={{
          height: 1,
          background: 'rgba(255,255,255,0.06)',
          marginBottom: 20,
        }} />

        {/* Content */}
        {loading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}>
            <Loader size={18} style={{
              color: '#6366f1',
              animation: 'spin 1s linear infinite',
            }} />
          </div>
        ) : cards.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '16px',
          }}>
            <CreditCard size={24} style={{
              color: 'rgba(255,255,255,0.2)',
              marginBottom: 8,
            }} />
            <p style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.4)',
              marginBottom: 12,
            }}>
              No cards yet
            </p>
            <button
              onClick={() => router.push('/dashboard/cards')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 12px',
                borderRadius: 6,
                background: 'rgba(99,102,241,0.15)',
                border: '1px solid rgba(99,102,241,0.3)',
                color: '#6366f1',
                fontSize: 10,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Plus size={10} /> Create
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Compact Primary Card Badge */}
            {primaryCard && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  background: `linear-gradient(135deg, ${tierColors[primaryCard.tierLevel].bg})`,
                  borderRadius: 10,
                  padding: 12,
                  color: '#fff',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ position: 'relative', zIndex: 10 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <div>
                      <div style={{
                        fontSize: 9,
                        opacity: 0.7,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}>
                        Primary Card
                      </div>
                      <div style={{
                        fontSize: 12,
                        fontWeight: 700,
                        marginTop: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                      }}>
                        <span>{tierColors[primaryCard.tierLevel].icon}</span>
                        {primaryCard.tierLevel}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: 9,
                        opacity: 0.7,
                        marginBottom: 2,
                      }}>
                        Balance
                      </div>
                      <div style={{
                        fontSize: 12,
                        fontWeight: 700,
                      }}>
                        ${primaryCard.balance}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Status/Additional Cards */}
            {cards.length > 1 && (
              <div style={{
                padding: 10,
                borderRadius: 8,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.5)',
                }}>
                  +{cards.length - 1} more card{cards.length > 2 ? 's' : ''}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

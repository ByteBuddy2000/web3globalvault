import React, { useEffect, useState } from 'react';



function TxRow({ tx }: { tx: Transaction }) {
  const s = String(tx.status ?? '').toLowerCase().trim();
  const isCompleted = s === 'completed';
  const isPending = s === 'pending';
  const statusColor = isCompleted ? 'var(--success-400)' : isPending ? 'var(--warning-400)' : 'var(--danger-400)';
  const statusBg = isCompleted ? 'var(--success-glow)' : isPending ? 'var(--warning-glow)' : 'var(--danger-glow)';
  const date = tx.date ? new Date(tx.date) : null;
  const dateStr = date && !isNaN(date.getTime()) ? date.toLocaleDateString() : '--';
  const isCredit = tx.type?.toLowerCase().includes('deposit') || tx.type?.toLowerCase().includes('receive');

  return (
    <div className="dashboard-row">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 'var(--radius-xs)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isCredit ? 'var(--success-glow)' : 'var(--danger-glow)',
          border: `1px solid ${isCredit ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
          color: isCredit ? 'var(--success-400)' : 'var(--danger-400)', flexShrink: 0,
        }}>
          {isCredit ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-0)', marginBottom: 1 }}>{tx.type}</div>
          <div style={{ fontSize: 9, color: 'var(--text-400)' }}>{tx.asset} · {dateStr}</div>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: isCredit ? 'var(--success-400)' : 'var(--text-0)', marginBottom: 2 }}>
          {isCredit ? '+' : '-'}${tx.amount?.toLocaleString()}
        </div>
        <span style={{
          fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', padding: '2px 5px',
          borderRadius: 'var(--radius-xs)', textTransform: 'uppercase', color: statusColor,
          background: statusBg, border: `1px solid ${statusColor}`,
          opacity: 0.9,
        }}>
          {tx.status}
        </span>
      </div>
    </div>
  );
}
export default TxRow;
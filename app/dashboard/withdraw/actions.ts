'use server';

import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import Asset from '@/models/Asset';
import { authOptions } from '@/lib/authOptions';

interface WithdrawalData {
  method: string;
  amount: string;
  // Fee fields (populated by the updated withdrawal page)
  fee?: number;
  feeLabel?: string;
  youReceive?: number;
  // Bank-specific
  bankName?: string;
  accountNumber?: string;
  // Crypto-specific
  coin?: string;
  network?: string;
  walletAddress?: string;
}

export async function submitWithdrawal(data: WithdrawalData) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const userId = (session.user as any).id || session.user.email;

    await connectDB();

    // ── Amount validation ──────────────────────────────────────────────────
    const parsedAmount = Number(data.amount);
    if (!data.method || isNaN(parsedAmount) || parsedAmount <= 0) {
      throw new Error('Invalid withdrawal request');
    }

    // ── Fee validation ─────────────────────────────────────────────────────
    const parsedFee       = Number(data.fee ?? 0);
    const parsedReceive   = Number(data.youReceive ?? parsedAmount);

    if (isNaN(parsedFee) || parsedFee < 0) {
      throw new Error('Invalid fee amount');
    }

    // Basic sanity check: youReceive should equal amount − fee
    const expectedReceive = parseFloat((parsedAmount - parsedFee).toFixed(2));
    if (Math.abs(parsedReceive - expectedReceive) > 0.02) {
      throw new Error('Fee calculation mismatch — please refresh and try again');
    }

    // ── Method-specific validation ─────────────────────────────────────────
    if (data.method === 'bank') {
      if (!data.bankName?.trim() || !data.accountNumber?.trim()) {
        throw new Error('Bank name and account number are required');
      }

      // ── Deduct USD from user balance ────────────────────────────────────
      const usdAsset = await Asset.findOne({ user: userId, symbol: 'USD' });
      if (!usdAsset || usdAsset.quantity < parsedAmount) {
        throw new Error('Insufficient USD balance');
      }

      usdAsset.quantity -= parsedAmount;
      usdAsset.pendingWithdrawal = (usdAsset.pendingWithdrawal || 0) + parsedAmount;
      await usdAsset.save();
    }

    if (data.method === 'crypto') {
      if (!data.coin?.trim() || !data.network?.trim() || !data.walletAddress?.trim()) {
        throw new Error('Coin, network, and wallet address are required');
      }

      // ── Deduct crypto from user balance ─────────────────────────────────
      const cryptoAsset = await Asset.findOne({ user: userId, symbol: data.coin });
      if (!cryptoAsset || cryptoAsset.quantity < parsedAmount) {
        throw new Error(`Insufficient ${data.coin} balance`);
      }

      cryptoAsset.quantity -= parsedAmount;
      cryptoAsset.pendingWithdrawal = (cryptoAsset.pendingWithdrawal || 0) + parsedAmount;
      await cryptoAsset.save();
    }

    // ── Build human-readable details string ────────────────────────────────
    const details =
      data.method === 'bank'
        ? [
            `Bank withdrawal of $${parsedAmount.toLocaleString()}`,
            `to ${data.bankName} (acc: ****${data.accountNumber!.slice(-4)})`,
            `| Fee (${data.feeLabel ?? '—'}): $${parsedFee.toLocaleString()}`,
            `| You receive: $${parsedReceive.toLocaleString()}`,
          ].join(' ')
        : [
            `Crypto withdrawal of $${parsedAmount.toLocaleString()} worth ${data.coin}`,
            `on ${data.network} to ${data.walletAddress}`,
            `| Fee (${data.feeLabel ?? '—'}): $${parsedFee.toLocaleString()}`,
            `| You receive: $${parsedReceive.toLocaleString()}`,
          ].join(' ');

    // ── Persist transaction ────────────────────────────────────────────────
    const transaction = new Transaction({
      user:      userId,
      type:      'Withdraw',
      amount:    parsedAmount,
      fee:       parsedFee,
      feeLabel:  data.feeLabel ?? '',
      youReceive: parsedReceive,
      status:    'Pending',           // admin reviews after verifying fee payment
      feePaid:   true,                // user confirmed fee payment in the UI flow
      reference: `WD-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      details,
      // Method-level metadata stored flat for easy admin filtering
      ...(data.method === 'bank' && {
        bankName:      data.bankName,
        accountNumber: data.accountNumber,
      }),
      ...(data.method === 'crypto' && {
        coin:          data.coin,
        network:       data.network,
        walletAddress: data.walletAddress,
      }),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await transaction.save();

    return {
      success:     true,
      message:     'Withdrawal request submitted',
      reference:   transaction.reference,
      fee:         parsedFee,
      youReceive:  parsedReceive,
    };

  } catch (error) {
    console.error('[submitWithdrawal] error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Server error',
    };
  }
}

// ── Decline withdrawal & revert balance ────────────────────────────────────
export async function declineWithdrawal(transactionId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error('Unauthorized');

    await connectDB();

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) throw new Error('Transaction not found');

    // ── Revert the balance ─────────────────────────────────────────────────
    const symbol = transaction.coin || 'USD';
    const asset = await Asset.findOne({ user: transaction.user, symbol });

    if (asset) {
      asset.quantity += transaction.amount; // Add back the withdrawn amount
      asset.pendingWithdrawal = Math.max(0, (asset.pendingWithdrawal || 0) - transaction.amount);
      await asset.save();
    }

    // Update transaction status
    transaction.status = 'Declined';
    transaction.updatedAt = new Date();
    await transaction.save();

    return { success: true, message: 'Withdrawal declined and balance restored' };
  } catch (error) {
    console.error('[declineWithdrawal] error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Server error',
    };
  }
}

// ── Approve withdrawal & clear pending ─────────────────────────────────────
export async function approveWithdrawal(transactionId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error('Unauthorized');

    await connectDB();

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) throw new Error('Transaction not found');

    const symbol = transaction.coin || 'USD';
    const asset = await Asset.findOne({ user: transaction.user, symbol });

    if (asset) {
      // Clear pending withdrawal (amount already deducted on submission)
      asset.pendingWithdrawal = Math.max(0, (asset.pendingWithdrawal || 0) - transaction.amount);
      await asset.save();
    }

    // Update transaction status
    transaction.status = 'Approved';
    transaction.updatedAt = new Date();
    await transaction.save();

    return { success: true, message: 'Withdrawal approved' };
  } catch (error) {
    console.error('[approveWithdrawal] error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Server error',
    };
  }
}
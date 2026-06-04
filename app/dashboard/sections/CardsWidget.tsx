"use client";

import { CreditCard, ArrowRight, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

type Card = {
  tierLevel: "BASIC" | "SILVER" | "GOLD" | "PLATINUM";
  cardNumber: string;
  balance: number;
  status: "ACTIVE" | "INACTIVE" | "BLOCKED" | "PENDING";
};

const TIERS = {
  BASIC: "#888a96",
  SILVER: "#b0b8c8",
  GOLD: "#c9a84c",
  PLATINUM: "#818cf8",
};

function mask(num: string) {
  return "•••• •••• •••• " + num.slice(-4);
}

export default function CardsWidget({ card }: { card?: Card }) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full max-w-sm"
    >
      {/* container */}
      <div className="relative rounded-2xl p-5 border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl overflow-hidden">

        {/* glow */}
        <div
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20"
          style={{
            background: card ? TIERS[card.tierLevel] : "#818cf8",
          }}
        />

        {/* header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-white/70" />
            <p className="text-[11px] tracking-widest text-white/40 uppercase">
              Card Wallet
            </p>
          </div>

          <span className="text-[10px] px-2 py-1 rounded-md border border-white/10 text-white/50">
            {card?.status || "NO CARD"}
          </span>
        </div>

        {/* main card preview */}
        {card ? (
          <div>
            <h2
              className="text-xl font-bold mb-1"
              style={{ color: TIERS[card.tierLevel] }}
            >
              {card.tierLevel}
            </h2>

            <p className="text-white/60 text-sm font-mono tracking-widest">
              {mask(card.cardNumber)}
            </p>

            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-[10px] text-white/40 uppercase">Balance</p>
                <p className="text-lg font-bold text-emerald-400">
                  ${card.balance.toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-white/50">
                ● {card.status}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-white/40 text-sm py-6">
            No active card found
          </div>
        )}

        {/* actions */}
        <div className="mt-5 flex flex-col gap-2">
          <button
            onClick={() => router.push("/dashboard/cards")}
            className="flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition"
          >
            View Cards <ArrowRight size={14} />
          </button>

          <button
            onClick={() => router.push("/dashboard/cards")}
            className="flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 transition"
          >
            Apply for Card <Plus size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
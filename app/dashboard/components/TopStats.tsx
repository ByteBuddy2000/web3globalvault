import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

type Stat = {
  title: string;
  value: string;
  change: string;
};

type TopStatsProps = {
  stats: Stat[];
};

export default function TopStats({ stats }: TopStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, idx) => (
        <div key={idx} className="card rounded-xl p-3 sm:p-4">
          <h3 className="text-xs sm:text-sm font-semibold text-muted uppercase tracking-wide mb-1">
            {stat.title}
          </h3>
          <p className="text-lg sm:text-2xl font-bold text-accent mb-1">{stat.value}</p>
          <p className={`text-xs sm:text-sm font-medium ${stat.change.startsWith("+") ? "text-green-400" : "text-red-400"}`}>
            {stat.change}
          </p>
        </div>
      ))}
    </div>
  );
}

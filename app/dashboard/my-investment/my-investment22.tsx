// "use client";
// import React, { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   ComposedChart,
//   Line,
//   Area,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   Customized,
// } from "recharts";
// import { toast } from "sonner";
// import { TrendingUp, ShieldCheck, AlertTriangle, ChevronDown, BarChart3, Plus } from "lucide-react";
// import InvestmentWizard from "./InvestmentWizard";
// import WithdrawalModal from "./WithdrawalModal";

// const plans = [
//   { name: "Gold", expectedReturn: "12% per annum", riskLevel: "Moderate", minAmount: 10000, hourlyRate: 0.0139 },
//   { name: "Silver", expectedReturn: "9% per annum", riskLevel: "Low", minAmount: 5000, hourlyRate: 0.0080 },
//   { name: "Diamond", expectedReturn: "15% per annum", riskLevel: "High", minAmount: 20000, hourlyRate: 0.0171 },
// ];

// export default function MyInvestment() {
//   const [investments, setInvestments] = useState<any[]>([]);
//   const [assets, setAssets] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [showWizard, setShowWizard] = useState(false);
//   const [withdrawalInvestment, setWithdrawalInvestment] = useState<any>(null);
//   const [isClient, setIsClient] = useState(false);
//   const [timeframe, setTimeframe] = useState<"1M" | "3M" | "6M" | "1Y">("1Y");

//   // Fetch investments and assets
//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch("/api/investment", { method: "GET", credentials: "include" });
//       const data = await res.json();
//       setInvestments(data.investments || []);
//       setAssets(data.assets || []);
//     } catch {
//       setInvestments([]);
//       setAssets([]);
//     }
//     setLoading(false);
//     setIsClient(true);
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);
//     }
//     fetchData();
//   }, []);

//   // TradingView-style candlestick data builder
//   const buildCandleData = () => {
//     let points = 12;
//     if (timeframe === "3M") points = 12;
//     else if (timeframe === "6M") points = 24;
//     else if (timeframe === "1Y") points = 12;
//     else points = 4;

//     const months = Array.from({ length: points }, (_, i) => {
//       const d = new Date();
//       d.setMonth(d.getMonth() - points + 1 + i);
//       return timeframe === "1M"
//         ? d.toLocaleString("default", { day: "numeric", month: "short" })
//         : d.toLocaleString("default", { month: "short", year: "2-digit" });
//     });

//     const defaultMonthly = 0.005;

//     return months.map((month, idx) => {
//       let open = 0;
//       let close = 0;
//       let high = -Infinity;
//       let low = Infinity;
//       let invested = 0;
//       let projected = 0;

//       investments.forEach((inv) => {
//         const amt = Number(inv.amount || 0);
//         invested += amt;
//         const annual = Number(inv.expectedAnnualReturn ?? 6) / 100;
//         const monthlyRate = Math.pow(1 + annual, 1 / 12) - 1 || defaultMonthly;
//         const projectedValue = amt * Math.pow(1 + monthlyRate, idx + 1);
//         projected += projectedValue;

//         open += amt;
//         close += projectedValue;
//         high = Math.max(high, projectedValue * 1.05, amt * 1.02);
//         low = Math.min(low, projectedValue * 0.95, amt * 0.98);
//       });

//       if (investments.length === 0) {
//         open = close = high = low = invested = projected = 0;
//       }

//       open = Number(open || 0);
//       close = Number(close || 0);
//       high = Math.max(open, close, Number(high || 0));
//       low = Math.min(open, close, Number(low || 0));

//       return {
//         month,
//         open: Math.round(open * 100) / 100,
//         close: Math.round(close * 100) / 100,
//         high: Math.round(high * 100) / 100,
//         low: Math.round(low * 100) / 100,
//         invested: Math.round(invested * 100) / 100,
//         projected: Math.round(projected * 100) / 100,
//       };
//     });
//   };

//   // Premium TradingView-style candlestick renderer
//   const renderTradingViewCandles = (props: any) => {
//     const { payload, xAxisMap, yAxisMap } = props;
//     if (!payload || !xAxisMap || !yAxisMap) return null;
//     const xScale = xAxisMap[0]?.scale;
//     const yScale = yAxisMap[0]?.scale;
//     if (typeof xScale !== "function" || typeof yScale !== "function") return null;

//     let candleWidth = 16;
//     if (payload.length >= 2) {
//       const x0 = xScale(payload[0].month);
//       const x1 = xScale(payload[1].month);
//       const step = Math.abs(x1 - x0) || 30;
//       candleWidth = Math.max(8, Math.min(35, Math.floor(step * 0.65)));
//     }

//     return (
//       <g>
//         {payload.map((entry: any, index: number) => {
//           const x = xScale(entry.month);
//           const cx = Number.isFinite(x) ? x : xScale(index);
//           const openY = yScale(entry.open);
//           const closeY = yScale(entry.close);
//           const highY = yScale(entry.high);
//           const lowY = yScale(entry.low);

//           const top = Math.min(openY, closeY);
//           const bottom = Math.max(openY, closeY);
//           const bodyHeight = Math.max(2, bottom - top);
//           const half = Math.floor(candleWidth / 2);
//           const up = entry.close >= entry.open;

//           // TradingView color scheme
//           const bodyColor = up ? "#00D084" : "#F7243D";
//           const wickColor = up ? "#00D084" : "#F7243D";
//           const bodyOpacity = up ? 0.9 : 0.9;

//           return (
//             <g key={`candle-${index}`} transform={`translate(${cx},0)`}>
//               {/* Wick (shadow) */}
//               <line
//                 x1={0}
//                 y1={highY}
//                 x2={0}
//                 y2={lowY}
//                 stroke={wickColor}
//                 strokeWidth={1.2}
//                 strokeLinecap="round"
//                 opacity={0.6}
//               />
//               {/* Body */}
//               <rect
//                 x={-half}
//                 y={top}
//                 width={candleWidth}
//                 height={bodyHeight}
//                 fill={bodyColor}
//                 stroke={bodyColor}
//                 strokeWidth={1}
//                 rx={2}
//                 opacity={bodyOpacity}
//               />
//               {/* Glow effect for big moves */}
//               {Math.abs(entry.high - entry.low) > 1000 && (
//                 <rect
//                   x={-half - 2}
//                   y={top - 2}
//                   width={candleWidth + 4}
//                   height={bodyHeight + 4}
//                   fill="none"
//                   stroke={bodyColor}
//                   strokeWidth={0.5}
//                   rx={3}
//                   opacity={0.2}
//                 />
//               )}
//             </g>
//           );
//         })}
//       </g>
//     );
//   };

//   // Metrics
//   const planObj = plans.find((p) => p.name === selectedPlan) || plans[0];
//   const minAmount = planObj.minAmount;
//   const hourlyRate = planObj.hourlyRate;
//   const enteredAmount = Number(amount) >= minAmount ? Number(amount) : minAmount;
//   const profit = enteredAmount * (Math.pow(1 + hourlyRate / 100, 180) - 1);

//   const assetObj = assets.find((a) => a.symbol === selectedAsset);
//   const assetBalance = assetObj?.quantity ?? 0;
//   const assetPrice = assetObj?.price ?? assetObj?.livePrice ?? 0;
//   const assetDollarValue = assetBalance * assetPrice;

//   const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
//   const candleData = buildCandleData();
//   const currentValue = candleData.length > 0 ? candleData[candleData.length - 1].projected : 0;
//   const gains = currentValue - totalInvested;
//   const gainsPercent = totalInvested > 0 ? ((gains / totalInvested) * 100).toFixed(2) : "0";

//   const handleInvest = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!selectedAsset) {
//       toast.error("Please select an asset");
//       return;
//     }
//     if (Number(amount) < minAmount) {
//       toast.error(`Minimum: $${minAmount}`);
//       return;
//     }
//     if (assetDollarValue < Number(amount)) {
//       toast.error(`Insufficient balance`);
//       return;
//     }
//     setInvesting(true);
//     try {
//       const res = await fetch("/api/investment", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({
//           planName: selectedPlan,
//           amount: Number(amount),
//           assetSymbol: selectedAsset,
//         }),
//       });
//       const data = await res.json();
//       if (res.ok) {
//         setShowInvestForm(false);
//         setAmount("");
//         setSelectedAsset("");
//         setInvestments((prev) => [...prev, data.investment]);
//         toast.success(`Investment successful!`);
//         setAssets(data.assets || assets);
//       } else {
//         toast.error(data.message || "Failed");
//       }
//     } catch {
//       toast.error("Server error");
//     }
//     setInvesting(false);
//   };

//   // Withdraw handler
//   const handleWithdraw = async (investmentId: string) => {
//     const inv = investments.find((i) => i._id === investmentId);
//     if (!inv) return;
//     if (!confirm(`Withdraw ${inv.planName} (${inv.amount}) ?`)) return;
//     setWithdrawingId(investmentId);
//     try {
//       const res = await fetch("/api/investment", {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ action: "withdraw", investmentId }),
//       });
//       const data = await res.json().catch(() => ({}));
//       if (!res.ok) {
//         toast.error(data?.message || `Withdraw failed (${res.status})`);
//       } else {
//         if (data?.investment) {
//           setInvestments((prev) => prev.map((p) => (p._id === data.investment._id ? data.investment : p)));
//         } else {
//           setInvestments((prev) => prev.filter((p) => p._id !== investmentId));
//         }
//         toast.success("Withdrawal processed");
//         if (data?.assets) setAssets(data.assets);
//       }
//     } catch (err) {
//       console.error("Withdraw error:", err);
//       toast.error("Withdrawal failed");
//     } finally {
//       setWithdrawingId(null);
//     }
//   };

//   return (
//     <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
//       {/* Header */}
//       <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-700/50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <BarChart3 className="w-8 h-8 text-amber-400" />
//             <h1 className="text-2xl font-bold">Portfolio Manager</h1>
//           </div>
//           <button
//             onClick={() => setShowInvestForm(true)}
//             className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-semibold rounded-lg hover:from-amber-300 hover:to-amber-400 transition shadow-lg"
//           >
//             + New Investment
//           </button>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
//         {/* Key Metrics */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:bg-slate-800/70 transition">
//             <p className="text-sm text-slate-400 mb-1">Portfolio Value</p>
//             <h3 className="text-2xl font-bold text-amber-400">${currentValue.toLocaleString("en-US", { maximumFractionDigits: 2 })}</h3>
//           </div>
//           <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:bg-slate-800/70 transition">
//             <p className="text-sm text-slate-400 mb-1">Total Invested</p>
//             <h3 className="text-2xl font-bold text-slate-100">${totalInvested.toLocaleString("en-US", { maximumFractionDigits: 0 })}</h3>
//           </div>
//           <div className={`bg-slate-800/50 border rounded-lg p-4 hover:bg-slate-800/70 transition ${gains >= 0 ? "border-emerald-600" : "border-red-600"}`}>
//             <p className="text-sm text-slate-400 mb-1">Unrealized P&L</p>
//             <h3 className={`text-2xl font-bold ${gains >= 0 ? "text-emerald-400" : "text-red-400"}`}>${gains.toLocaleString("en-US", { maximumFractionDigits: 2 })}</h3>
//           </div>
//           <div className={`bg-slate-800/50 border rounded-lg p-4 hover:bg-slate-800/70 transition ${gains >= 0 ? "border-emerald-600" : "border-red-600"}`}>
//             <p className="text-sm text-slate-400 mb-1">Return %</p>
//             <h3 className={`text-2xl font-bold ${gains >= 0 ? "text-emerald-400" : "text-red-400"}`}>{gainsPercent}%</h3>
//           </div>
//         </div>

//         {/* TradingView-style Chart */}
//         <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
//           <div className="bg-slate-800/80 border-b border-slate-700/50 px-6 py-4 flex items-center justify-between">
//             <h2 className="text-lg font-semibold text-slate-100">Investment Growth</h2>
//             <div className="flex gap-2">
//               {(["1M", "3M", "6M", "1Y"] as const).map((tf) => (
//                 <button
//                   key={tf}
//                   onClick={() => setTimeframe(tf)}
//                   className={`px-3 py-1 text-sm font-medium rounded transition ${
//                     timeframe === tf
//                       ? "bg-amber-500 text-slate-950"
//                       : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
//                   }`}
//                 >
//                   {tf}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Chart Container */}
//           <div className="p-6 bg-gradient-to-b from-slate-800/20 to-slate-900/40">
//             <div style={{ width: "100%", height: 450 }}>
//               {isClient ? (
//                 <ResponsiveContainer width="100%" height="100%">
//                   <ComposedChart data={candleData} margin={{ top: 20, right: 30, left: 60, bottom: 50 }}>
//                     <defs>
//                       <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
//                         <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.15} />
//                         <stop offset="100%" stopColor="#fbbf24" stopOpacity={0} />
//                       </linearGradient>
//                     </defs>
//                     <CartesianGrid strokeDasharray="4 4" stroke="#334155" opacity={0.3} />
//                     <XAxis
//                       dataKey="month"
//                       tick={{ fill: "#94a3b8", fontSize: 12 }}
//                       axisLine={{ stroke: "#475569" }}
//                       tickLine={{ stroke: "#475569" }}
//                     />
//                     <YAxis
//                       tick={{ fill: "#94a3b8", fontSize: 12 }}
//                       axisLine={{ stroke: "#475569" }}
//                       tickLine={{ stroke: "#475569" }}
//                       label={{ value: "USD ($)", angle: -90, position: "insideLeft", fill: "#94a3b8" }}
//                     />
//                     <Tooltip
//                       contentStyle={{
//                         background: "#0f172a",
//                         border: "2px solid #475569",
//                         borderRadius: 8,
//                         boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
//                       }}
//                       labelStyle={{ color: "#fff" }}
//                       formatter={(v: number, name: string) => {
//                         const names: Record<string, string> = {
//                           open: "Open",
//                           close: "Close",
//                           high: "High",
//                           low: "Low",
//                           invested: "Invested",
//                           projected: "Projected",
//                         };
//                         return [`$${Number(v).toLocaleString("en-US", { maximumFractionDigits: 2 })}`, names[name] || name];
//                       }}
//                     />
//                     <Customized component={renderTradingViewCandles} />
//                     <Area
//                       type="monotone"
//                       dataKey="projected"
//                       name="Projected"
//                       stroke="#fbbf24"
//                       fill="url(#areaGrad)"
//                       strokeWidth={2}
//                       dot={false}
//                       isAnimationActive={false}
//                     />
//                     <Line
//                       type="monotone"
//                       dataKey="invested"
//                       name="Invested"
//                       stroke="#3b82f6"
//                       strokeWidth={1.5}
//                       dot={false}
//                       isAnimationActive={false}
//                     />
//                   </ComposedChart>
//                 </ResponsiveContainer>
//               ) : (
//                 <div className="flex items-center justify-center h-full text-slate-400">Loading chart...</div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Investment Plans Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           {plans.map((p) => (
//             <motion.div
//               key={p.name}
//               whileHover={{ scale: 1.02 }}
//               className="bg-slate-800/50 border border-slate-700 rounded-lg p-5 hover:border-amber-500/50 transition cursor-pointer"
//               onClick={() => {
//                 setSelectedPlan(p.name);
//                 setShowInvestForm(true);
//               }}
//             >
//               <div className="flex items-start justify-between mb-3">
//                 <h3 className="text-lg font-bold text-slate-100">{p.name}</h3>
//                 <div
//                   className={`px-2 py-1 rounded text-xs font-semibold ${
//                     p.riskLevel === "High"
//                       ? "bg-red-900/30 text-red-400"
//                       : p.riskLevel === "Moderate"
//                       ? "bg-yellow-900/30 text-yellow-400"
//                       : "bg-emerald-900/30 text-emerald-400"
//                   }`}
//                 >
//                   {p.riskLevel}
//                 </div>
//               </div>
//               <p className="text-amber-400 font-semibold mb-2">{p.expectedReturn}</p>
//               <p className="text-sm text-slate-400 mb-4">Min: ${p.minAmount.toLocaleString()}</p>
//               <button className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold rounded hover:from-amber-400 hover:to-amber-500 transition">
//                 Invest Now
//               </button>
//             </motion.div>
//           ))}
//         </div>

//         {/* Investments Table */}
//         <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
//           <div className="bg-slate-800/80 border-b border-slate-700/50 px-6 py-4">
//             <h2 className="text-lg font-semibold text-slate-100">Active Positions</h2>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="bg-slate-700/50 text-slate-300 uppercase text-xs font-semibold">
//                   <th className="px-6 py-3 text-left">Plan</th>
//                   <th className="px-6 py-3 text-left">Amount</th>
//                   <th className="px-6 py-3 text-left">Asset</th>
//                   <th className="px-6 py-3 text-left">Entry Date</th>
//                   <th className="px-6 py-3 text-left">Status</th>
//                   <th className="px-6 py-3 text-left">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-700">
//                 {loading ? (
//                   <tr>
//                     <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading...</td>
//                   </tr>
//                 ) : investments.length ? (
//                   investments.map((plan, idx) => (
//                     <tr key={idx} className="hover:bg-slate-700/30 transition border-slate-700/50">
//                       <td className="px-6 py-4 font-semibold text-slate-100">{plan.planName}</td>
//                       <td className="px-6 py-4 text-amber-400">${Number(plan.amount).toLocaleString()}</td>
//                       <td className="px-6 py-4 text-slate-300">{plan.assetSymbol}</td>
//                       <td className="px-6 py-4 text-slate-400 text-sm">
//                         {plan.startDate ? new Date(plan.startDate).toLocaleDateString() : "—"}
//                       </td>
//                       <td className="px-6 py-4">
//                         <span
//                           className={`px-3 py-1 rounded-full text-xs font-semibold ${
//                             plan.status === "Active"
//                               ? "bg-emerald-900/30 text-emerald-400"
//                               : "bg-slate-700 text-slate-300"
//                           }`}
//                         >
//                           {plan.status || "Active"}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex gap-2">
//                           <button
//                             onClick={() => handleWithdraw(plan._id)}
//                             disabled={withdrawingId === plan._id}
//                             className="px-3 py-1 bg-red-600 text-white rounded text-sm disabled:opacity-50"
//                           >
//                             {withdrawingId === plan._id ? "Withdrawing..." : "Withdraw"}
//                           </button>
//                           <button
//                             onClick={() => navigator.clipboard?.writeText(JSON.stringify(plan))}
//                             className="px-3 py-1 bg-white/5 text-white rounded text-sm"
//                           >
//                             Details
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No investments yet</td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       {/* Invest Modal */}
//       <AnimatePresence>
//         {showInvestForm && (
//           <motion.div
//             className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//           >
//             <motion.div
//               initial={{ scale: 0.9, y: 20 }}
//               animate={{ scale: 1, y: 0 }}
//               exit={{ scale: 0.9, y: 20 }}
//               className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-8 w-full max-w-md mx-4"
//             >
//               <div className="flex items-center justify-between mb-6">
//                 <h2 className="text-xl font-bold text-slate-100">New Investment</h2>
//                 <button
//                   onClick={() => setShowInvestForm(false)}
//                   className="text-slate-400 hover:text-white text-2xl"
//                 >
//                   ×
//                 </button>
//               </div>

//               <form onSubmit={handleInvest} className="space-y-5">
//                 {/* Plan Select */}
//                 <div>
//                   <label className="block text-sm font-semibold text-slate-300 mb-2">Investment Plan</label>
//                   <select
//                     value={selectedPlan}
//                     onChange={(e) => setSelectedPlan(e.target.value)}
//                     className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
//                   >
//                     {plans.map((p) => (
//                       <option key={p.name} value={p.name}>
//                         {p.name} - {p.expectedReturn}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Amount Input */}
//                 <div>
//                   <label className="block text-sm font-semibold text-slate-300 mb-2">Amount (USD)</label>
//                   <input
//                     type="number"
//                     inputMode="decimal"
//                     min={minAmount}
//                     required
//                     value={amount}
//                     onChange={(e) => setAmount(e.target.value)}
//                     placeholder={`Min: $${minAmount}`}
//                     className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
//                   />
//                 </div>

//                 {/* Asset Select */}
//                 <div>
//                   <label className="block text-sm font-semibold text-slate-300 mb-2">Fund With Asset</label>
//                   <select
//                     value={selectedAsset}
//                     onChange={(e) => setSelectedAsset(e.target.value)}
//                     required
//                     className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
//                   >
//                     <option value="">Select asset</option>
//                     {assets.map((a) => (
//                       <option key={a.symbol} value={a.symbol}>
//                         {a.name} ({a.symbol})
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {selectedAsset && (
//                   <div className="bg-slate-800/50 border border-slate-600/30 rounded-lg p-4 space-y-2 text-sm">
//                     <div className="flex justify-between">
//                       <span className="text-slate-400">Price:</span>
//                       <span className="text-amber-400 font-semibold">${assetPrice.toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-slate-400">Balance:</span>
//                       <span className="text-slate-200">{assetBalance.toFixed(8)} {selectedAsset}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-slate-400">Value:</span>
//                       <span className={assetDollarValue >= enteredAmount ? "text-emerald-400" : "text-red-400"}>
//                         ${assetDollarValue.toFixed(2)}
//                       </span>
//                     </div>
//                   </div>
//                 )}

//                 {/* Profit Display */}
//                 <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-lg p-4 text-center">
//                   <p className="text-sm text-slate-400 mb-1">Est. Profit (72h)</p>
//                   <p className="text-2xl font-bold text-amber-400">${profit.toFixed(2)}</p>
//                 </div>

//                 {/* Submit Button */}
//                 <button
//                   type="submit"
//                   disabled={investing}
//                   className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold rounded-lg hover:from-amber-300 hover:to-amber-400 transition disabled:opacity-50"
//                 >
//                   {investing ? "Processing..." : "Invest Now"}
//                 </button>
//               </form>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

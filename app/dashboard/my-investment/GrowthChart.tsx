"use client";
import { LineSeries } from "lightweight-charts";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  ColorType,
  IChartApi,
} from "lightweight-charts";

interface Investment {
  _id?: string;
  amount: number;
  expectedAnnualReturn?: number;
  createdAt?: string;
  status?: string;
}

interface InvestmentHistory {
  date: string;
  value: number;
  gain: number;
}

interface Props {
  investments: Investment[];
}

const TIMEFRAMES = ["1M", "3M", "6M", "1Y"] as const;
type Timeframe = (typeof TIMEFRAMES)[number];

// Calculate portfolio growth from actual investment data
function calculatePortfolioGrowth(investments: Investment[], timeframe: Timeframe): InvestmentHistory[] {
  const now = new Date();
  let startDate = new Date(now);

  // Set start date based on timeframe
  if (timeframe === "1M") {
    startDate.setMonth(now.getMonth() - 1);
  } else if (timeframe === "3M") {
    startDate.setMonth(now.getMonth() - 3);
  } else if (timeframe === "6M") {
    startDate.setMonth(now.getMonth() - 6);
  } else {
    startDate.setFullYear(now.getFullYear() - 1);
  }

  // Sort investments by date
  const sortedInvestments = [...investments].sort((a, b) => {
    const dateA = new Date(a.createdAt || now).getTime();
    const dateB = new Date(b.createdAt || now).getTime();
    return dateA - dateB;
  });

  const history: InvestmentHistory[] = [];
  let currentDate = new Date(startDate);
  const trackedInvestments = new Set<string>();

  // Generate daily data points
  while (currentDate <= now) {
    let totalInvested = 0;
    let dailyPortfolioValue = 0;

    // Calculate total invested and current value on this date
    sortedInvestments.forEach((inv) => {
      const invDate = new Date(inv.createdAt || now);
      if (invDate <= currentDate) {
        // Add to total invested
        totalInvested += inv.amount;

        // Calculate growth
        const daysInvested = Math.floor((currentDate.getTime() - invDate.getTime()) / (1000 * 60 * 60 * 24));
        const rate = (inv.expectedAnnualReturn ?? 6) / 100 / 365; // Daily rate
        const value = inv.amount * Math.pow(1 + rate, daysInvested);
        dailyPortfolioValue += value;
      }
    });

    // Only add to history if there are investments
    if (totalInvested > 0) {
      const gain = dailyPortfolioValue - totalInvested;

      history.push({
        date: currentDate.toISOString(),
        value: dailyPortfolioValue,
        gain,
      });
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return history.length > 0 ? history : [];
}

export default function TradingViewProChart({ investments }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<IChartApi | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [timeframe, setTimeframe] = useState<Timeframe>("1Y");
  const [investmentData, setInvestmentData] = useState<InvestmentHistory[]>([]);
  const [fetchedInvestments, setFetchedInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch actual investment growth data
  useEffect(() => {
    const fetchInvestmentData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/investment", { credentials: "include" });
        if (!response.ok) throw new Error("Failed to fetch investment data");
        
        const data = await response.json();
        const apiInvestments = data.investments || [];
        
        // Store the fetched investments for stats calculation
        setFetchedInvestments(apiInvestments);
        
        // Calculate portfolio value over time based on transactions
        const history = calculatePortfolioGrowth(apiInvestments, timeframe);
        setInvestmentData(history);
      } catch (error) {
        console.error("Error fetching investment data:", error);
        setInvestmentData([]);
        setFetchedInvestments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInvestmentData();
  }, [timeframe]);

  useEffect(() => {
    if (!chartRef.current || !containerRef.current || loading || investmentData.length === 0) return;

    // Clear previous chart safely
    if (chartInstance.current) {
      try {
        chartInstance.current.remove();
      } catch (error) {
        console.warn('Error removing previous chart:', error);
      }
      chartInstance.current = null;
    }

    const containerHeight = containerRef.current.clientHeight;
    const chartHeight = Math.max(containerHeight - 50, 250); // Subtract space for controls

    const chart = createChart(chartRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#8b949e",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.04)" },
        horzLines: { color: "rgba(255,255,255,0.04)" },
      },
      width: chartRef.current.clientWidth,
      height: chartHeight,
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.1)",
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.1)",
      },
    });

    chartInstance.current = chart;

    // Portfolio value line series
    const portfolioSeries = chart.addSeries(LineSeries, {
      color: "#10b981",
      lineWidth: 2,
      title: "Portfolio Value",
    });

    // Generate line chart data from investment history
    const lineData: any[] = [];

    investmentData.forEach((entry, index) => {
      const time = Math.floor(new Date(entry.date).getTime() / 1000);
      lineData.push({
        time,
        value: entry.value,
      });
    });

    portfolioSeries.setData(lineData);
    chart.timeScale().fitContent();

    // 🔄 Resize
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries.length) return;
      chart.applyOptions({
        width: entries[0].contentRect.width,
      });
    });

    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
      if (chartInstance.current) {
        try {
          chartInstance.current.remove();
        } catch (error) {
          console.warn('Error cleaning up chart:', error);
        }
        chartInstance.current = null;
      }
    };
  }, [investmentData, timeframe]);

  if (loading || !investmentData || investmentData.length === 0) {
    return (
      <div style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "250px"
      }}>
        <div style={{ textAlign: "center", color: "#8b949e" }}>
          {loading ? (
            <>
              <p style={{ fontSize: 14, marginBottom: 8 }}>Loading investment growth data...</p>
              <div style={{
                width: 24,
                height: 24,
                border: "2px solid rgba(139, 148, 158, 0.2)",
                borderTop: "2px solid #8b949e",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto",
              }} />
              <style>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </>
          ) : (
            <>
              <p style={{ fontSize: 14, marginBottom: 8 }}>No investment growth data available</p>
              <p style={{ fontSize: 12, opacity: 0.7 }}>Create an investment to see growth projections</p>
            </>
          )}
        </div>
      </div>
    );
  }

  // Calculate stats from investment data - use actual invested amount
  const calculateStats = () => {
    if (investmentData.length === 0 || fetchedInvestments.length === 0) return null;

    const lastEntry = investmentData[investmentData.length - 1];

    // Calculate current total invested from fetched investments
    const totalInvested = fetchedInvestments.reduce((sum, inv) => sum + (inv.amount || 0), 0);

    const currentValue = lastEntry.value;
    const totalGain = lastEntry.gain;
    const gainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

    return {
      currentValue,
      totalGain,
      gainPercent,
      totalInvested,
    };
  };

  const stats = calculateStats();

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      
      {/* Performance Stats */}
      {stats && (
        <div style={{
          display: "flex",
          gap: 16,
          marginBottom: 16,
          flexWrap: "wrap",
          padding: "12px",
          borderRadius: "8px",
          background: "rgba(255, 255, 255, 0.04)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}>
          <div>
            <p style={{ fontSize: 10, color: "#8b949e", marginBottom: 4 }}>Current Value</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>
              ${stats.currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p style={{ fontSize: 10, color: "#8b949e", marginBottom: 4 }}>Total Gain</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: stats.totalGain >= 0 ? "#10b981" : "#ef4444" }}>
              ${stats.totalGain.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p style={{ fontSize: 10, color: "#8b949e", marginBottom: 4 }}>Return %</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: stats.gainPercent >= 0 ? "#10b981" : "#ef4444" }}>
              {stats.gainPercent.toFixed(2)}%
            </p>
          </div>
        </div>
      )}
      
      {/* Controls */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
        flexWrap: "wrap",
        gap: 8,
        minHeight: "32px"
      }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Legend color="#10B981" label="Portfolio Value" />
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              style={{
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: 500,
                borderRadius: 4,
                border:
                  tf === timeframe
                    ? "1px solid #f0b429"
                    : "1px solid rgba(255,255,255,0.1)",
                background:
                  tf === timeframe
                    ? "rgba(240,180,41,0.1)"
                    : "rgba(255,255,255,0.05)",
                color:
                  tf === timeframe ? "#f0b429" : "#8b949e",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (tf !== timeframe) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                }
              }}
              onMouseLeave={(e) => {
                if (tf !== timeframe) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }
              }}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div
        ref={chartRef}
        style={{
          width: "100%",
          flex: 1,
          minHeight: "250px",
        }}
      />
    </div>
  );
}

/* 🔹 Legend */
function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <div
        style={{
          width: 10,
          height: 10,
          background: color,
          borderRadius: 2,
        }}
      />
      <span style={{ fontSize: 11, color: "#8b949e" }}>{label}</span>
    </div>
  );
}
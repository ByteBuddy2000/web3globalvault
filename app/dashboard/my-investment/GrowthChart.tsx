"use client";
import { CandlestickSeries } from "lightweight-charts";
import { HistogramSeries } from "lightweight-charts";
import { LineSeries } from "lightweight-charts";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
} from "lightweight-charts";

interface Investment {
  amount: number;
  expectedAnnualReturn?: number;
}

interface Props {
  investments: Investment[];
}

const TIMEFRAMES = ["1M", "3M", "6M", "1Y"] as const;
type Timeframe = (typeof TIMEFRAMES)[number];

export default function TradingViewProChart({ investments }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<IChartApi | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [timeframe, setTimeframe] = useState<Timeframe>("1Y");

  useEffect(() => {
    if (!chartRef.current || !containerRef.current) return;

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

    // 🔥 Candlestick Series

const candleSeries = chart.addSeries(CandlestickSeries, {
  upColor: "#10B981",
  downColor: "#ef4444",
  borderUpColor: "#10B981",
  borderDownColor: "#ef4444",
  wickUpColor: "#10B981",
  wickDownColor: "#ef4444",
});
    // 🔥 Volume Series
    

const volumeSeries = chart.addSeries(HistogramSeries, {
  priceFormat: { type: "volume" },
  priceScaleId: "",
});
    // 🔥 EMA Line
    const emaSeries = chart.addSeries(LineSeries, {
  color: "#f0b429",
  lineWidth: 2,
});

    // 📊 Generate Data Based on Timeframe
    const points =
      timeframe === "1M" ? 30 :
      timeframe === "3M" ? 90 :
      timeframe === "6M" ? 180 :
      365;

    const candleData: any[] = [];
    const volumeData: any[] = [];

    let emaPrev = 0;
    const k = 2 / (10 + 1); // EMA 10

    for (let i = 0; i < points; i++) {
      let open = 0;
      let close = 0;

      investments.forEach((inv) => {
        const amt = inv.amount;
        const rate = (inv.expectedAnnualReturn ?? 6) / 100;
        const monthly = Math.pow(1 + rate, 1 / 12) - 1;

        open += amt;
        close += amt * Math.pow(1 + monthly, i + 1);
      });

      const high = Math.max(open, close) * 1.02;
      const low = Math.min(open, close) * 0.98;

      const time = Math.floor(Date.now() / 1000) - (points - i) * 86400;

      candleData.push({ time, open, high, low, close });

      const volume = Math.abs(close - open) * 10;

      volumeData.push({
        time,
        value: volume,
        color: close >= open ? "#10B98155" : "#ef444455",
      });

      // EMA Calculation
      const price = close;
      emaPrev = i === 0 ? price : price * k + emaPrev * (1 - k);

      emaSeries.update({ time: time as any, value: emaPrev });
    }

    candleSeries.setData(candleData);
    volumeSeries.setData(volumeData);

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
  }, [investments, timeframe]);

  if (!investments || investments.length === 0) {
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
          <p style={{ fontSize: 14, marginBottom: 8 }}>No investments yet</p>
          <p style={{ fontSize: 12, opacity: 0.7 }}>Create an investment to see growth projections</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      
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
          <Legend color="#10B981" label="Bullish" />
          <Legend color="#ef4444" label="Bearish" />
          <Legend color="#f0b429" label="EMA 10" />
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
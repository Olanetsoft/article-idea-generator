// @ts-nocheck - Recharts has type incompatibility with React 18
import { useMemo } from "react";
import { ClientPieChart, Pie, Cell, Tooltip } from "./ChartWrappers";

interface SourceComparisonProps {
  qrScans: number;
  directClicks: number;
}

export function SourceComparison({
  qrScans,
  directClicks,
}: SourceComparisonProps) {
  const total = qrScans + directClicks;

  const chartData = useMemo(() => {
    if (total === 0) return [];
    return [
      {
        name: "Direct Clicks",
        value: directClicks,
        percentage: ((directClicks / total) * 100).toFixed(1),
        icon: "🔗",
        color: "#06b6d4", // cyan
      },
      {
        name: "QR Scans",
        value: qrScans,
        percentage: ((qrScans / total) * 100).toFixed(1),
        icon: "📱",
        color: "#8b5cf6", // purple
      },
    ];
  }, [qrScans, directClicks, total]);

  if (total === 0) {
    return (
      <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">
          QR vs Direct Traffic
        </h3>
        <div className="h-40 flex items-center justify-center text-slate-500">
          No traffic data yet
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50">
      <h3 className="text-lg font-semibold text-white mb-4">
        QR vs Direct Traffic
      </h3>
      <div className="flex items-center gap-6">
        {/* Donut Chart */}
        <div className="h-40 w-40 flex-shrink-0 relative">
          <ClientPieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={60}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </ClientPieChart>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-white">{total}</span>
            <span className="text-xs text-slate-400">Total</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 space-y-4">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-lg">{item.icon}</span>
                <span className="text-slate-300">{item.name}</span>
              </div>
              <div className="text-right">
                <span className="text-white font-semibold">
                  {item.value.toLocaleString()}
                </span>
                <span className="text-slate-500 text-sm ml-2">
                  ({item.percentage}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload: { name: string; value: number; percentage: string; icon: string };
  }>;
}) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-white font-semibold">
          {data.icon} {data.name}
        </p>
        <p className="text-slate-400 text-sm">
          {data.value.toLocaleString()} ({data.percentage}%)
        </p>
      </div>
    );
  }
  return null;
}

// @ts-nocheck - Recharts has type incompatibility with React 18
import { useMemo } from "react";
import {
  ClientAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "./ChartWrappers";

interface ClicksChartProps {
  data: Array<{ date: string; clicks: number }>;
  title?: string;
}

export function ClicksChart({
  data,
  title = "Clicks Over Time",
}: ClicksChartProps) {
  // Format data for display
  const chartData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      // Format date for x-axis
      displayDate: formatDate(item.date),
    }));
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center text-slate-500">
          No click data yet
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="h-64">
        <ClientAreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="displayDate"
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "#64748b", strokeDasharray: "5 5" }}
          />
          <Area
            type="monotone"
            dataKey="clicks"
            stroke="#06b6d4"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorClicks)"
          />
        </ClientAreaChart>
      </div>
    </div>
  );
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-slate-400 text-xs">{label}</p>
        <p className="text-white font-semibold">
          {payload[0].value.toLocaleString()} clicks
        </p>
      </div>
    );
  }
  return null;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

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
    if (!data || data.length === 0) return [];
    return data.map((item) => ({
      ...item,
      // Format date for x-axis
      displayDate: formatDate(item.date),
    }));
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">
          No click data yet
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      <div className="h-64">
        <ClientAreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-gray-200 dark:stroke-zinc-700"
          />
          <XAxis
            dataKey="displayDate"
            className="text-gray-500 dark:text-gray-400"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            className="text-gray-500 dark:text-gray-400"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "#a78bfa", strokeDasharray: "5 5" }}
          />
          <Area
            type="monotone"
            dataKey="clicks"
            stroke="#8b5cf6"
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
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-gray-500 dark:text-gray-400 text-xs">{label}</p>
        <p className="text-gray-900 dark:text-white font-semibold">
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

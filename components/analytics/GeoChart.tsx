// @ts-nocheck - Recharts has type incompatibility with React 18
import { useMemo } from "react";
import {
  ClientBarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
} from "./ChartWrappers";

interface GeoChartProps {
  data: Array<{ name: string; count: number }>;
  title?: string;
  type?: "country" | "city";
}

// Country flag emojis (common ones)
const COUNTRY_FLAGS: Record<string, string> = {
  US: "🇺🇸",
  GB: "🇬🇧",
  DE: "🇩🇪",
  FR: "🇫🇷",
  CA: "🇨🇦",
  AU: "🇦🇺",
  JP: "🇯🇵",
  CN: "🇨🇳",
  IN: "🇮🇳",
  BR: "🇧🇷",
  NG: "🇳🇬",
  ZA: "🇿🇦",
  KE: "🇰🇪",
  GH: "🇬🇭",
  EG: "🇪🇬",
  MX: "🇲🇽",
  ES: "🇪🇸",
  IT: "🇮🇹",
  NL: "🇳🇱",
  SE: "🇸🇪",
  SG: "🇸🇬",
  KR: "🇰🇷",
  PH: "🇵🇭",
  ID: "🇮🇩",
  TH: "🇹🇭",
  PL: "🇵🇱",
  RU: "🇷🇺",
  UA: "🇺🇦",
  TR: "🇹🇷",
  AE: "🇦🇪",
};

const COLORS = [
  "#8b5cf6",
  "#a78bfa",
  "#c4b5fd",
  "#10b981",
  "#f59e0b",
  "#3b82f6",
];

export function GeoChart({
  data,
  title = "Top Countries",
  type = "country",
}: GeoChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const total = data.reduce((acc, item) => acc + item.count, 0);
    return data.slice(0, 6).map((item) => ({
      ...item,
      percentage: total > 0 ? ((item.count / total) * 100).toFixed(1) : "0",
      flag: type === "country" ? COUNTRY_FLAGS[item.name] || "🌍" : "📍",
    }));
  }, [data, type]);

  if (!data || data.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">
          No location data yet
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
        <ClientBarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <XAxis
            type="number"
            className="text-gray-500 dark:text-gray-400"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            className="text-gray-500 dark:text-gray-400"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={60}
            tick={({ x, y, payload }: any) => (
              <g transform={`translate(${x},${y})`}>
                <text
                  x={0}
                  y={0}
                  dy={4}
                  textAnchor="end"
                  className="fill-gray-600 dark:fill-gray-400"
                  fontSize={12}
                >
                  <tspan aria-hidden="true">
                    {chartData.find((d) => d.name === payload.value)?.flag}
                  </tspan>{" "}
                  {payload.value}
                </text>
              </g>
            )}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(139, 92, 246, 0.1)" }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={24}>
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Bar>
        </ClientBarChart>
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
    payload: { name: string; count: number; percentage: string; flag: string };
  }>;
}) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-gray-900 dark:text-white font-semibold">
          {data.flag} {data.name}
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {data.count.toLocaleString()} clicks ({data.percentage}%)
        </p>
      </div>
    );
  }
  return null;
}

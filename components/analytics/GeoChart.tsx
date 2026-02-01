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
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
];

export function GeoChart({
  data,
  title = "Top Countries",
  type = "country",
}: GeoChartProps) {
  const chartData = useMemo(() => {
    const total = data.reduce((acc, item) => acc + item.count, 0);
    return data.slice(0, 6).map((item) => ({
      ...item,
      percentage: total > 0 ? ((item.count / total) * 100).toFixed(1) : "0",
      flag: type === "country" ? COUNTRY_FLAGS[item.name] || "🌍" : "📍",
    }));
  }, [data, type]);

  if (data.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center text-slate-500">
          No location data yet
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="h-64">
        <ClientBarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <XAxis
            type="number"
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#64748b"
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
                  fill="#94a3b8"
                  fontSize={12}
                >
                  {chartData.find((d) => d.name === payload.value)?.flag}{" "}
                  {payload.value}
                </text>
              </g>
            )}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#334155" }} />
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
      <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-white font-semibold">
          {data.flag} {data.name}
        </p>
        <p className="text-slate-400 text-sm">
          {data.count.toLocaleString()} clicks ({data.percentage}%)
        </p>
      </div>
    );
  }
  return null;
}

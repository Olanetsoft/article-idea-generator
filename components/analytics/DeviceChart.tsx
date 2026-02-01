// @ts-nocheck - Recharts has type incompatibility with React 18
import { useMemo } from "react";
import { ClientPieChart, Pie, Cell, Tooltip } from "./ChartWrappers";

interface DeviceChartProps {
  data: Array<{ name: string; count: number }>;
  title?: string;
  type?: "device" | "browser" | "os";
}

// Color palettes for different chart types
const COLORS = {
  device: ["#06b6d4", "#3b82f6", "#8b5cf6"], // cyan, blue, purple
  browser: ["#06b6d4", "#f59e0b", "#ef4444", "#22c55e", "#8b5cf6", "#64748b"], // cyan, amber, red, green, purple, slate
  os: ["#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#06b6d4", "#64748b"], // blue, green, amber, purple, cyan, slate
};

// Device icons
const DEVICE_ICONS: Record<string, string> = {
  mobile: "📱",
  tablet: "📲",
  desktop: "💻",
};

// Browser icons
const BROWSER_ICONS: Record<string, string> = {
  Chrome: "🌐",
  Safari: "🧭",
  Firefox: "🦊",
  Edge: "📐",
  Opera: "🔴",
  Other: "🌍",
};

export function DeviceChart({
  data,
  title = "Device Breakdown",
  type = "device",
}: DeviceChartProps) {
  const chartData = useMemo(() => {
    const total = data.reduce((acc, item) => acc + item.count, 0);
    return data.map((item) => ({
      ...item,
      percentage: total > 0 ? ((item.count / total) * 100).toFixed(1) : "0",
    }));
  }, [data]);

  const colors = COLORS[type] || COLORS.device;

  if (data.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center text-slate-500">
          No data yet
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="flex flex-col lg:flex-row items-center gap-4">
        {/* Pie Chart */}
        <div className="h-48 w-48 flex-shrink-0">
          <ClientPieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={2}
              dataKey="count"
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </ClientPieChart>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2 w-full">
          {chartData.map((item, index) => (
            <div
              key={item.name}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-700/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-slate-300">
                  {type === "device" && DEVICE_ICONS[item.name.toLowerCase()]}{" "}
                  {type === "browser" && BROWSER_ICONS[item.name]} {item.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-400 text-sm">
                  {item.count.toLocaleString()}
                </span>
                <span className="text-slate-500 text-sm w-12 text-right">
                  {item.percentage}%
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
    name: string;
    value: number;
    payload: { percentage: string };
  }>;
}) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-white font-semibold">{payload[0].name}</p>
        <p className="text-slate-400 text-sm">
          {payload[0].value.toLocaleString()} ({payload[0].payload.percentage}%)
        </p>
      </div>
    );
  }
  return null;
}

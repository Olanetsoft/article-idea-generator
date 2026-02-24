import { useMemo } from "react";

interface ReferrerListProps {
  data: Array<{ name: string; count: number }>;
  title?: string;
}

// Referrer icons
const REFERRER_ICONS: Record<string, string> = {
  "twitter.com": "𝕏",
  "x.com": "𝕏",
  "facebook.com": "📘",
  "linkedin.com": "💼",
  "instagram.com": "📷",
  "reddit.com": "🤖",
  "youtube.com": "▶️",
  "github.com": "🐙",
  "google.com": "🔍",
  "bing.com": "🔎",
  "t.co": "𝕏",
  Direct: "🔗",
};

export function ReferrerList({
  data,
  title = "Top Referrers",
}: ReferrerListProps) {
  const listData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const total = data.reduce((acc, item) => acc + item.count, 0);
    return data.slice(0, 10).map((item) => ({
      ...item,
      percentage: total > 0 ? ((item.count / total) * 100).toFixed(1) : "0",
      icon: REFERRER_ICONS[item.name] || "🌐",
    }));
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
        <div className="py-8 text-center text-gray-400 dark:text-gray-500">
          No referrer data yet
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      <div className="space-y-3">
        {listData.map((item, index) => (
          <ReferrerRow key={item.name} item={item} index={index} />
        ))}
      </div>
    </div>
  );
}

function ReferrerRow({
  item,
  index,
}: {
  item: { name: string; count: number; percentage: string; icon: string };
  index: number;
}) {
  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 dark:text-gray-500 text-sm w-5">
            {index + 1}.
          </span>
          <span className="text-base">{item.icon}</span>
          <span className="text-gray-700 dark:text-gray-300 text-sm truncate max-w-[120px] sm:max-w-[200px]">
            {item.name}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            {item.count.toLocaleString()}
          </span>
          <span className="text-gray-400 dark:text-gray-500 text-sm w-12 text-right">
            {item.percentage}%
          </span>
        </div>
      </div>
      <div className="ml-7 h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full transition-all duration-500"
          style={{ width: `${item.percentage}%` }}
        />
      </div>
    </div>
  );
}

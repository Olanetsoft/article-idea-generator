import { useTranslation } from "@/hooks/useTranslation";

export interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTime: number;
  speakingTime: number;
  topKeywords: [string, number][];
}

interface StatItemProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

function StatItem({ label, value, highlight = false }: StatItemProps) {
  return (
    <div
      className={`p-3 rounded-lg ${
        highlight
          ? "bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800"
          : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700"
      }`}
    >
      <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p
        className={`text-2xl font-bold ${
          highlight
            ? "text-indigo-600 dark:text-indigo-400"
            : "text-zinc-900 dark:text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

interface StatsPanelProps {
  stats: TextStats;
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  const { t } = useTranslation();

  return (
    <div className="w-full lg:w-80 space-y-4">
      {/* Main Stats Grid */}
      <div className="bg-zinc-100 dark:bg-darkOffset rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
          {t("tools.wordCounter.stats")}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <StatItem
            label={t("tools.wordCounter.words")}
            value={stats.words.toLocaleString()}
            highlight
          />
          <StatItem
            label={t("tools.wordCounter.characters")}
            value={stats.characters.toLocaleString()}
          />
          <StatItem
            label={t("tools.wordCounter.charactersNoSpaces")}
            value={stats.charactersNoSpaces.toLocaleString()}
          />
          <StatItem
            label={t("tools.wordCounter.sentences")}
            value={stats.sentences.toLocaleString()}
          />
          <StatItem
            label={t("tools.wordCounter.paragraphs")}
            value={stats.paragraphs.toLocaleString()}
          />
        </div>
      </div>

      {/* Time Estimates */}
      <div className="bg-zinc-100 dark:bg-darkOffset rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
          {t("tools.wordCounter.timeEstimates")}
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {t("tools.wordCounter.readingTime")}
            </span>
            <span className="text-sm font-semibold text-zinc-900 dark:text-white">
              {stats.readingTime} {t("tools.wordCounter.minutes")}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {t("tools.wordCounter.speakingTime")}
            </span>
            <span className="text-sm font-semibold text-zinc-900 dark:text-white">
              {stats.speakingTime} {t("tools.wordCounter.minutes")}
            </span>
          </div>
        </div>
      </div>

      {/* Top Keywords */}
      {stats.topKeywords.length > 0 && (
        <div className="bg-zinc-100 dark:bg-darkOffset rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
            {t("tools.wordCounter.topKeywords")}
          </h3>
          <div className="space-y-2">
            {stats.topKeywords.map(([word, count], index) => (
              <div
                key={word}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-zinc-600 dark:text-zinc-400">
                  <span className="text-zinc-400 dark:text-zinc-500 mr-2">
                    {index + 1}.
                  </span>
                  {word}
                </span>
                <span className="text-zinc-900 dark:text-white font-medium">
                  {count}x
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

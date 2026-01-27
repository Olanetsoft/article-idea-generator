import Link from "next/link";
import {
  DocumentTextIcon,
  CalculatorIcon,
  ChartBarIcon,
  ClockIcon,
  QrcodeIcon,
} from "@heroicons/react/outline";
import { useTranslation } from "@/hooks/useTranslation";
import { trackToolClick } from "@/lib/gtag";
import type { ToolCardProps, ToolIcon } from "@/types";

const iconMap: Record<ToolIcon, typeof DocumentTextIcon> = {
  document: DocumentTextIcon,
  calculator: CalculatorIcon,
  chart: ChartBarIcon,
  clock: ClockIcon,
  qrcode: QrcodeIcon,
};

export default function ToolCard({
  nameKey,
  descriptionKey,
  href,
  icon,
  available = true,
}: ToolCardProps) {
  const { t } = useTranslation();
  const Icon = iconMap[icon];
  const toolName = t(nameKey);

  const handleClick = () => {
    if (available) {
      trackToolClick(toolName);
    }
  };

  const cardContent = (
    <div
      className={`bg-zinc-100 dark:bg-darkOffset rounded-lg p-4 sm:p-6 border border-zinc-200 dark:border-zinc-800 transition-all min-h-[100px] ${
        available
          ? "hover:border-indigo-500 hover:shadow-md cursor-pointer"
          : "opacity-60 cursor-not-allowed"
      }`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="p-2 sm:p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex-shrink-0">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 dark:text-zinc-100 text-sm sm:text-base">
              {t(nameKey)}
            </h3>
            {!available && (
              <span className="text-xs px-2 py-0.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 rounded-full">
                {t("tools.comingSoon")}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t(descriptionKey)}
          </p>
        </div>
      </div>
    </div>
  );

  if (!available) {
    return cardContent;
  }

  return (
    <Link href={href} className="block" onClick={handleClick}>
      {cardContent}
    </Link>
  );
}

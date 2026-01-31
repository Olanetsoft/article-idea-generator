import Link from "next/link";
import { tools } from "@/lib/tools-config";
import { useTranslation } from "@/hooks/useTranslation";
import {
  PhotographIcon,
  DocumentTextIcon,
  LinkIcon,
  CodeIcon,
  QrcodeIcon,
  PencilIcon,
  ClockIcon,
  CalculatorIcon,
  ChartBarIcon,
  ScissorsIcon,
} from "@heroicons/react/outline";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  photograph: PhotographIcon,
  document: DocumentTextIcon,
  link: LinkIcon,
  code: CodeIcon,
  qrcode: QrcodeIcon,
  pencil: PencilIcon,
  clock: ClockIcon,
  calculator: CalculatorIcon,
  chart: ChartBarIcon,
  text: DocumentTextIcon,
  scissors: ScissorsIcon,
};

interface RelatedToolsProps {
  currentToolId: string;
  maxTools?: number;
  title?: string;
}

export const RelatedTools = ({
  currentToolId,
  maxTools = 3,
  title = "Explore More Free Tools",
}: RelatedToolsProps) => {
  const { t } = useTranslation();

  // Get available tools excluding current, prioritize available ones
  const relatedTools = tools
    .filter((tool) => tool.id !== currentToolId)
    .sort((a, b) => (b.available ? 1 : 0) - (a.available ? 1 : 0))
    .slice(0, maxTools);

  return (
    <section className="w-full max-w-6xl mt-12 sm:mt-16">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {title}
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatedTools.map((tool) => {
          const Icon = iconMap[tool.icon] || DocumentTextIcon;
          return (
            <Link
              key={tool.id}
              href={tool.available ? tool.href : "/tools"}
              className="group p-5 bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border hover:border-violet-500 dark:hover:border-violet-500 hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-violet-200 dark:group-hover:bg-violet-900/50 transition-colors">
                  <Icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    {t(tool.nameKey)}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {t(tool.descriptionKey)}
                  </p>
                  {!tool.available && (
                    <span className="text-xs text-violet-600 dark:text-violet-400 mt-2 inline-block font-medium">
                      Coming Soon
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* CTA to all tools */}
      <div className="mt-6 text-center">
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
        >
          View all free tools
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
};

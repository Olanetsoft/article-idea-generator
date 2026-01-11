import { useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import {
  ClipboardCopyIcon,
  DocumentDuplicateIcon,
  ShareIcon,
  RefreshIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/outline";
import { useTranslation } from "@/hooks/useTranslation";

interface AbstractDisplayProps {
  abstract: string;
  title: string;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export default function AbstractDisplay({
  abstract,
  title,
  onRegenerate,
  isRegenerating = false,
}: AbstractDisplayProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Clean the abstract text
  const cleanAbstract = useMemo(() => {
    return abstract.replace(/^["']|["']$/g, "").trim();
  }, [abstract]);

  // Parse abstract into paragraphs
  const paragraphs = useMemo(() => {
    // Split by double newlines or single newlines
    const parts = cleanAbstract
      .split(/\n\n|\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    // If no natural breaks, try to split into logical chunks
    if (parts.length === 1 && cleanAbstract.length > 300) {
      const sentences = cleanAbstract.match(/[^.!?]+[.!?]+/g) || [
        cleanAbstract,
      ];
      const chunks: string[] = [];
      let currentChunk = "";

      sentences.forEach((sentence) => {
        if (
          currentChunk.length + sentence.length > 200 &&
          currentChunk.length > 0
        ) {
          chunks.push(currentChunk.trim());
          currentChunk = sentence;
        } else {
          currentChunk += sentence;
        }
      });

      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }

      return chunks.length > 1 ? chunks : parts;
    }

    return parts;
  }, [cleanAbstract]);

  // Calculate stats
  const stats = useMemo(() => {
    const words = cleanAbstract.split(/\s+/).filter((w) => w.length > 0);
    const wordCount = words.length;
    const charCount = cleanAbstract.length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200)); // ~200 WPM

    return { wordCount, charCount, readingTime };
  }, [cleanAbstract]);

  // Copy handlers
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(cleanAbstract);
      toast.success(t("success.abstractCopied"));
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const handleCopyMarkdown = async () => {
    const markdown = `## Abstract: ${title}\n\n${paragraphs.join("\n\n")}`;
    try {
      await navigator.clipboard.writeText(markdown);
      toast.success("Markdown copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  // Share handlers
  const shareOnTwitter = () => {
    const text = `📝 ${title}\n\n${cleanAbstract.slice(0, 200)}${
      cleanAbstract.length > 200 ? "..." : ""
    }`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent("https://articleideagenerator.com")}`;
    window.open(url, "_blank");
    setShowShareMenu(false);
  };

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      "https://articleideagenerator.com"
    )}`;
    window.open(url, "_blank");
    setShowShareMenu(false);
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            <span className="text-lg flex-shrink-0">📄</span>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                Abstract for:
              </p>
              <h3 className="font-semibold text-gray-900 dark:text-zinc-100 text-sm sm:text-base line-clamp-2">
                {title}
              </h3>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-zinc-800 transition-colors flex-shrink-0"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <ChevronUpIcon className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-4 sm:p-5">
          <div className="space-y-3">
            {paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="text-gray-700 dark:text-zinc-300 text-sm sm:text-base leading-relaxed"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              📊 {stats.wordCount} words
            </span>
            <span>·</span>
            <span>{stats.charCount} characters</span>
            <span>·</span>
            <span>~{stats.readingTime} min read</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
          <div className="flex flex-wrap items-center gap-2">
            {/* Copy Text */}
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
            >
              <ClipboardCopyIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Copy</span>
            </button>

            {/* Copy Markdown */}
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
            >
              <DocumentDuplicateIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Copy MD</span>
            </button>

            {/* Share Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
              >
                <ShareIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>

              {showShareMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowShareMenu(false)}
                  />
                  <div className="absolute bottom-full left-0 mb-2 w-40 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 py-1 z-20">
                    <button
                      onClick={shareOnTwitter}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    >
                      🐦 Twitter / X
                    </button>
                    <button
                      onClick={shareOnLinkedIn}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    >
                      💼 LinkedIn
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Regenerate Button */}
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                disabled={isRegenerating}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
              >
                <RefreshIcon
                  className={`w-4 h-4 ${isRegenerating ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">
                  {isRegenerating ? "Regenerating..." : "Regenerate"}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Collapsed State Preview */}
      {!isExpanded && (
        <div
          className="px-4 py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
          onClick={() => setIsExpanded(true)}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
            {cleanAbstract}
          </p>
          <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1">
            Click to expand
          </p>
        </div>
      )}
    </div>
  );
}

import { useState, useMemo, useEffect, useRef } from "react";
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
  const shareButtonRef = useRef<HTMLButtonElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        shareMenuRef.current &&
        !shareMenuRef.current.contains(event.target as Node) &&
        shareButtonRef.current &&
        !shareButtonRef.current.contains(event.target as Node)
      ) {
        setShowShareMenu(false);
      }
    };

    if (showShareMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showShareMenu]);

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
      toast.error(t("errors.copyFailed"));
    }
  };

  const handleCopyMarkdown = async () => {
    const markdown = `## Abstract: ${title}\n\n${paragraphs.join("\n\n")}`;
    try {
      await navigator.clipboard.writeText(markdown);
      toast.success(t("success.markdownCopied"));
    } catch (err) {
      toast.error(t("errors.copyFailed"));
    }
  };

  // Share handlers
  const shareOnTwitter = () => {
    const text = `📝 ${title}\n\n${cleanAbstract.slice(0, 200)}${
      cleanAbstract.length > 200 ? "..." : ""
    }`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text,
    )}&url=${encodeURIComponent("https://articleideagenerator.com")}`;
    window.open(url, "_blank");
    setShowShareMenu(false);
  };

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      "https://articleideagenerator.com",
    )}`;
    window.open(url, "_blank");
    setShowShareMenu(false);
  };

  return (
    <div className="w-full bg-white dark:bg-dark-card rounded-xl border border-zinc-200 dark:border-dark-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-3 sm:px-4 py-3 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border-b border-zinc-200 dark:border-dark-border">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            <span className="text-base sm:text-lg flex-shrink-0 mt-0.5">
              📄
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                Abstract for:
              </p>
              <h3 className="font-semibold text-gray-900 dark:text-zinc-100 text-sm sm:text-base leading-tight line-clamp-2 break-words">
                {title}
              </h3>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-zinc-800 transition-colors flex-shrink-0 active:scale-95 min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label={isExpanded ? "Collapse abstract" : "Expand abstract"}
            aria-expanded={isExpanded}
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
          isExpanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-3 sm:p-4 md:p-5 overflow-y-auto max-h-[400px]">
          <div className="space-y-3">
            {paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="text-gray-700 dark:text-zinc-300 text-sm sm:text-base leading-relaxed break-words"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="px-3 sm:px-4 py-2 bg-zinc-50 dark:bg-dark-card/50 border-t border-zinc-200 dark:border-dark-border">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              📊 {stats.wordCount} words
            </span>
            <span className="hidden xs:inline">·</span>
            <span className="hidden sm:inline">{stats.charCount} chars</span>
            <span className="hidden sm:inline">·</span>
            <span>~{stats.readingTime} min read</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-3 sm:px-4 py-3 border-t border-zinc-200 dark:border-dark-border bg-zinc-50/50 dark:bg-dark-card/30">
          <div className="flex flex-wrap items-center gap-2">
            {/* Copy Text */}
            <button
              onClick={handleCopyText}
              className="flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-card border border-zinc-200 dark:border-dark-border rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors active:scale-95 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
              aria-label="Copy text"
            >
              <ClipboardCopyIcon className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Copy</span>
            </button>

            {/* Copy Markdown */}
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-card border border-zinc-200 dark:border-dark-border rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors active:scale-95 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
              aria-label="Copy as Markdown"
            >
              <DocumentDuplicateIcon className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Copy MD</span>
            </button>

            {/* Share Dropdown */}
            <div className="relative">
              <button
                ref={shareButtonRef}
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-card border border-zinc-200 dark:border-dark-border rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors active:scale-95 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
                aria-label="Share"
                aria-expanded={showShareMenu}
              >
                <ShareIcon className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Share</span>
              </button>

              {showShareMenu && (
                <div
                  ref={shareMenuRef}
                  className="absolute bottom-full left-0 sm:left-auto sm:right-0 mb-2 w-44 bg-white dark:bg-dark-card rounded-lg shadow-lg border border-zinc-200 dark:border-dark-border py-1 z-20"
                >
                  <button
                    onClick={shareOnTwitter}
                    className="w-full px-4 py-3 sm:py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 active:bg-zinc-200 dark:active:bg-zinc-600"
                  >
                    🐦 Twitter / X
                  </button>
                  <button
                    onClick={shareOnLinkedIn}
                    className="w-full px-4 py-3 sm:py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 active:bg-zinc-200 dark:active:bg-zinc-600"
                  >
                    💼 LinkedIn
                  </button>
                </div>
              )}
            </div>

            {/* Spacer for mobile - push regenerate to end */}
            <div className="flex-1 min-w-0" />

            {/* Regenerate Button */}
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                disabled={isRegenerating}
                className="flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 text-sm font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
                aria-label={isRegenerating ? "Regenerating" : "Regenerate"}
              >
                <RefreshIcon
                  className={`w-4 h-4 flex-shrink-0 ${
                    isRegenerating ? "animate-spin" : ""
                  }`}
                />
                <span className="hidden sm:inline">
                  {isRegenerating ? "..." : "Regenerate"}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Collapsed State Preview */}
      {!isExpanded && (
        <button
          className="w-full px-3 sm:px-4 py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-left active:bg-zinc-100 dark:active:bg-zinc-800"
          onClick={() => setIsExpanded(true)}
          aria-label="Expand abstract"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 break-words">
            {cleanAbstract}
          </p>
          <p className="text-xs text-violet-500 dark:text-violet-400 mt-2 font-medium">
            Tap to expand ↓
          </p>
        </button>
      )}
    </div>
  );
}

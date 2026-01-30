import React, { useRef } from "react";
import { PhotographIcon, XIcon } from "@heroicons/react/outline";

interface LogoUploadSectionProps {
  logoDataUrl: string | null;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  t: (key: string) => string;
  compact?: boolean;
}

export function LogoUploadSection({
  logoDataUrl,
  onUpload,
  onRemove,
  t,
  compact = false,
}: LogoUploadSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = `logo-upload-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
        {t("tools.qrCode.addLogo")}
      </label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onUpload}
        className="hidden"
        id={inputId}
      />
      {logoDataUrl ? (
        <div
          className={`flex items-center gap-3 ${compact ? "p-2" : "p-3"} bg-white dark:bg-dark-card rounded-lg border border-zinc-200 dark:border-dark-border`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoDataUrl}
            alt="Logo preview"
            className={`${compact ? "w-8 h-8" : "w-12 h-12"} object-contain rounded`}
          />
          <div className="flex-1 min-w-0">
            <p
              className={`${compact ? "text-xs" : "text-sm"} font-medium text-zinc-700 dark:text-zinc-300 truncate`}
            >
              {t("tools.qrCode.logoUploaded")}
            </p>
            {!compact && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {t("tools.qrCode.logoHint")}
              </p>
            )}
          </div>
          <button
            onClick={onRemove}
            className="p-1.5 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            title={t("tools.qrCode.removeLogo")}
          >
            <XIcon className={`${compact ? "w-4 h-4" : "w-5 h-5"}`} />
          </button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className={`flex items-center gap-3 ${compact ? "p-2" : "p-3"} bg-white dark:bg-dark-card rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-600 hover:border-violet-400 dark:hover:border-violet-500 cursor-pointer transition-colors`}
        >
          <PhotographIcon
            className={`${compact ? "w-6 h-6" : "w-8 h-8"} text-zinc-400 dark:text-zinc-500`}
          />
          <div>
            <span
              className={`${compact ? "text-xs" : "text-sm"} text-zinc-600 dark:text-zinc-400 block`}
            >
              {t("tools.qrCode.uploadLogo")}
            </span>
            {!compact && (
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                PNG, JPG, SVG (max 2MB)
              </span>
            )}
          </div>
        </label>
      )}
    </div>
  );
}

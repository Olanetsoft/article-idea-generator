/**
 * Social Media QR Code Forms
 *
 * Forms for generating social media QR codes: Twitter, YouTube, Facebook, App Store
 */

import { useEffect, useId, useState } from "react";
import { InputField, SelectField } from "@/components/qr-code";
import type { FormProps } from "./types";

export function TwitterForm({ data, updateField, t }: FormProps) {
  return (
    <InputField
      label={t("tools.qrCode.twitterUsername")}
      value={(data.username as string) || ""}
      onChange={(v: string) => updateField("username", v)}
      placeholder={t("tools.qrCode.twitterPlaceholder")}
      name="username"
      autoComplete="off"
      spellCheck={false}
      required
    />
  );
}

export function YouTubeForm({ data, updateField, t }: FormProps) {
  // Only surface the either/or validation once the user has typed something
  const [touched, setTouched] = useState(false);
  const errorId = useId();
  const videoId = (data.videoId as string) || "";
  const channelId = (data.channelId as string) || "";
  const bothFilled = videoId.trim() !== "" && channelId.trim() !== "";
  const neitherFilled = videoId.trim() === "" && channelId.trim() === "";
  const showError = touched && (bothFilled || neitherFilled);

  return (
    <div className="space-y-4">
      <InputField
        label={t("tools.qrCode.youtubeVideo")}
        value={videoId}
        onChange={(v: string) => {
          setTouched(true);
          updateField("videoId", v);
        }}
        placeholder={t("tools.qrCode.youtubeVideoPlaceholder")}
        name="videoId"
        autoComplete="off"
        spellCheck={false}
        ariaInvalid={showError || undefined}
        ariaDescribedBy={showError ? errorId : undefined}
      />
      <div className="flex items-center gap-4 my-3">
        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
        <span className="text-xs text-zinc-400">{t("tools.qrCode.or")}</span>
        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
      </div>
      <InputField
        label={t("tools.qrCode.youtubeChannel")}
        value={channelId}
        onChange={(v: string) => {
          setTouched(true);
          updateField("channelId", v);
        }}
        placeholder={t("tools.qrCode.youtubeChannelPlaceholder")}
        name="channelId"
        autoComplete="off"
        spellCheck={false}
        ariaInvalid={showError || undefined}
        ariaDescribedBy={showError ? errorId : undefined}
      />
      <p
        id={errorId}
        aria-live="polite"
        className="text-xs text-red-500 dark:text-red-400"
      >
        {showError
          ? bothFilled
            ? t("tools.qrCode.youtubeValidationBoth")
            : t("tools.qrCode.youtubeValidationRequired")
          : null}
      </p>
    </div>
  );
}

export function FacebookForm({ data, updateField, t }: FormProps) {
  return (
    <div className="space-y-4">
      <InputField
        label={t("tools.qrCode.facebookUsername")}
        value={(data.username as string) || ""}
        onChange={(v: string) => updateField("username", v)}
        placeholder={t("tools.qrCode.facebookPlaceholder")}
      />
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        {t("tools.qrCode.facebookHint")}
      </p>
    </div>
  );
}

export function AppStoreForm({ data, updateField, t }: FormProps) {
  // Set default platform to "ios" when component mounts or when platform is undefined
  useEffect(() => {
    if (data.platform == null) {
      updateField("platform", "ios");
    }
  }, [data.platform, updateField]);

  const platform = (data.platform as string) || "ios";

  return (
    <div className="space-y-4">
      <SelectField
        label={t("tools.qrCode.appstorePlatform")}
        value={platform}
        onChange={(v: string) => updateField("platform", v)}
        options={[
          { value: "ios", label: t("tools.qrCode.platformIos") },
          { value: "android", label: t("tools.qrCode.platformAndroid") },
        ]}
      />
      <InputField
        label={t("tools.qrCode.appstoreId")}
        value={(data.appId as string) || ""}
        onChange={(v: string) => updateField("appId", v)}
        placeholder={
          platform === "android"
            ? t("tools.qrCode.appstoreAndroidPlaceholder")
            : t("tools.qrCode.appstoreIosPlaceholder")
        }
        required
      />
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        {platform === "android"
          ? t("tools.qrCode.appstoreAndroidHint")
          : t("tools.qrCode.appstoreIosHint")}
      </p>
    </div>
  );
}

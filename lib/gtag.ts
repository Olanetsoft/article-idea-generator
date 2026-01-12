/**
 * Google Analytics 4 (GA4) utility functions
 * @see https://developers.google.com/analytics/devguides/collection/ga4
 */

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Check if GA is available
export const isGAEnabled = (): boolean => {
  return (
    typeof window !== "undefined" &&
    !!GA_MEASUREMENT_ID &&
    typeof window.gtag === "function"
  );
};

// Track page views
export const pageview = (url: string, title?: string): void => {
  if (!isGAEnabled()) return;

  window.gtag("config", GA_MEASUREMENT_ID!, {
    page_path: url,
    page_title: title,
  });
};

// Generic event tracking
interface EventParams {
  action: string;
  category: string;
  label?: string;
  value?: number;
  [key: string]: string | number | undefined;
}

export const event = ({
  action,
  category,
  label,
  value,
  ...rest
}: EventParams): void => {
  if (!isGAEnabled()) return;

  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value: value,
    ...rest,
  });
};

// ===================
// Custom Event Helpers
// ===================

// Main generator events
export const trackGenerateTitles = (topic: string, seoMode: boolean): void => {
  event({
    action: "generate_titles",
    category: "engagement",
    label: topic,
    seo_mode: seoMode ? "enabled" : "disabled",
  });
};

export const trackGenerateAbstract = (title: string): void => {
  event({
    action: "generate_abstract",
    category: "engagement",
    label: title,
  });
};

export const trackCopyTitle = (title: string): void => {
  event({
    action: "copy_title",
    category: "engagement",
    label: title,
  });
};

export const trackCopyAbstract = (): void => {
  event({
    action: "copy_abstract",
    category: "engagement",
  });
};

export const trackShareTitle = (
  platform: "twitter" | "linkedin",
  title: string
): void => {
  event({
    action: "share_title",
    category: "engagement",
    label: title,
    platform: platform,
  });
};

export const trackVoiceInputUsed = (): void => {
  event({
    action: "voice_input_used",
    category: "engagement",
  });
};

export const trackSeoModeToggle = (enabled: boolean): void => {
  event({
    action: "seo_mode_toggle",
    category: "settings",
    label: enabled ? "enabled" : "disabled",
  });
};

// Tools events
export const trackToolClick = (toolName: string): void => {
  event({
    action: "tool_click",
    category: "tools",
    label: toolName,
  });
};

export const trackToolUsage = (
  toolName: string,
  action: string,
  details?: string
): void => {
  event({
    action: `tool_${action}`,
    category: "tools",
    label: toolName,
    details: details,
  });
};

// Navigation/Conversion events
export const trackCtaClick = (location: string, destination: string): void => {
  event({
    action: "cta_click",
    category: "conversion",
    label: location,
    destination: destination,
  });
};

export const trackToolsToGenerator = (): void => {
  event({
    action: "tools_to_generator",
    category: "conversion",
    label: "navigation",
  });
};

// Type declaration for gtag
declare global {
  interface Window {
    gtag: (
      command: "config" | "event" | "js",
      targetId: string,
      params?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}

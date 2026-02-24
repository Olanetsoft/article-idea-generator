"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const CONSENT_KEY = "cookie-consent";

export type ConsentPreferences = {
  necessary: boolean; // Always true, can't be disabled
  analytics: boolean;
  marketing: boolean;
};

const DEFAULT_PREFERENCES: ConsentPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
};

export function getConsentPreferences(): ConsentPreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore
  }
  return null;
}

export function hasConsented(): boolean {
  return getConsentPreferences() !== null;
}

export function hasAnalyticsConsent(): boolean {
  const prefs = getConsentPreferences();
  return prefs?.analytics ?? false;
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] =
    useState<ConsentPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    // Check if user has already made a choice
    const existing = getConsentPreferences();
    if (!existing) {
      // Small delay to avoid layout shift on initial load
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const savePreferences = (prefs: ConsentPreferences) => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(prefs));
    setShowBanner(false);
    setShowSettings(false);
    // Dispatch event so other components can react
    window.dispatchEvent(new CustomEvent("consent-updated", { detail: prefs }));
    // Reload to apply consent (simplest approach)
    window.location.reload();
  };

  const acceptAll = () => {
    savePreferences({
      necessary: true,
      analytics: true,
      marketing: true,
    });
  };

  const rejectAll = () => {
    savePreferences({
      necessary: true,
      analytics: false,
      marketing: false,
    });
  };

  const saveCustom = () => {
    savePreferences(preferences);
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4"
      >
        <div className="max-w-4xl mx-auto bg-white dark:bg-dark-card border border-zinc-200 dark:border-dark-border rounded-xl shadow-2xl overflow-hidden">
          {!showSettings ? (
            // Simple banner view
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">
                    🍪 We value your privacy
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    We use cookies to enhance your experience, analyze site
                    traffic, and for marketing. You can customize your
                    preferences or accept all.{" "}
                    <Link
                      href="/privacy"
                      className="text-violet-600 dark:text-violet-400 hover:underline"
                    >
                      Learn more
                    </Link>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                  <button
                    onClick={() => setShowSettings(true)}
                    className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-dark-hover rounded-lg transition-colors"
                  >
                    Customize
                  </button>
                  <button
                    onClick={rejectAll}
                    className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-dark-border hover:bg-zinc-100 dark:hover:bg-dark-hover rounded-lg transition-colors"
                  >
                    Reject All
                  </button>
                  <button
                    onClick={acceptAll}
                    className="px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
                  >
                    Accept All
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Settings view
            <div className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                Cookie Preferences
              </h3>

              <div className="space-y-4">
                {/* Necessary cookies */}
                <div className="flex items-start justify-between p-3 bg-zinc-50 dark:bg-dark-hover rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-zinc-900 dark:text-white">
                      Necessary
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Essential for the website to function. Cannot be disabled.
                    </p>
                  </div>
                  <div className="ml-4">
                    <span className="text-sm text-zinc-500">Always on</span>
                  </div>
                </div>

                {/* Analytics cookies */}
                <div className="flex items-start justify-between p-3 bg-zinc-50 dark:bg-dark-hover rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-zinc-900 dark:text-white">
                      Analytics
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Help us understand how visitors interact with our website
                      (Google Analytics, link click tracking, geolocation).
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() =>
                        setPreferences((p) => ({
                          ...p,
                          analytics: !p.analytics,
                        }))
                      }
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        preferences.analytics
                          ? "bg-violet-600"
                          : "bg-zinc-300 dark:bg-zinc-600"
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          preferences.analytics
                            ? "translate-x-7"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Marketing cookies */}
                <div className="flex items-start justify-between p-3 bg-zinc-50 dark:bg-dark-hover rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-zinc-900 dark:text-white">
                      Marketing
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Used to deliver personalized ads and track ad performance.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() =>
                        setPreferences((p) => ({
                          ...p,
                          marketing: !p.marketing,
                        }))
                      }
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        preferences.marketing
                          ? "bg-violet-600"
                          : "bg-zinc-300 dark:bg-zinc-600"
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          preferences.marketing
                            ? "translate-x-7"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-dark-hover rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={saveCustom}
                  className="px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

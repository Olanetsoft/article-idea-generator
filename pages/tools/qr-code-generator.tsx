import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Space_Grotesk } from "@next/font/google";
import { QRCodeCanvas } from "qrcode.react";
import { Header, Footer } from "@/components";
import { useTranslation } from "@/hooks/useTranslation";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import { trackToolUsage } from "@/lib/gtag";
import {
  DownloadIcon,
  RefreshIcon,
  ClipboardCopyIcon,
  TrashIcon,
  ChevronDownIcon,
  CheckIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/outline";
import type {
  QRContentType,
  QRStyleSettings,
  ErrorCorrectionLevel,
} from "@/types/qr-code";
import {
  COLOR_PRESETS,
  SIZE_OPTIONS,
  ERROR_CORRECTION_OPTIONS,
} from "@/types/qr-code";
import {
  generateQRValue,
  validateQRContent,
  downloadAsPNG,
  downloadAsJPG,
  downloadAsSVG,
  copyQRToClipboard,
  saveToHistory,
  getHistory,
  clearHistory,
  deleteHistoryItem,
} from "@/lib/qr-code-utils";

// ============================================================================
// Constants
// ============================================================================

const LOCALE_MAP: Record<string, string> = {
  en: "en_US",
  fr: "fr_FR",
  es: "es_ES",
  de: "de_DE",
};

const spaceGrotesk = Space_Grotesk({
  weight: "700",
  display: "swap",
  subsets: ["latin"],
});

// QR Content Type Config
const QR_TYPES: {
  id: QRContentType;
  icon: string;
}[] = [
  { id: "url", icon: "🔗" },
  { id: "text", icon: "📝" },
  { id: "wifi", icon: "📶" },
  { id: "vcard", icon: "👤" },
  { id: "email", icon: "✉️" },
  { id: "phone", icon: "📞" },
  { id: "sms", icon: "💬" },
  { id: "location", icon: "📍" },
  { id: "event", icon: "📅" },
];

// Default style settings
const DEFAULT_STYLE: QRStyleSettings = {
  size: 256,
  fgColor: "#000000",
  bgColor: "#FFFFFF",
  errorCorrection: "M",
  includeMargin: true,
  logoSize: 50,
};

// Initial data for each QR type
const getInitialData = (type: QRContentType): Record<string, unknown> => {
  switch (type) {
    case "text":
      return { text: "" };
    case "url":
      return { url: "" };
    case "email":
      return { email: "", subject: "", body: "" };
    case "phone":
      return { phone: "" };
    case "sms":
      return { phone: "", message: "" };
    case "wifi":
      return { ssid: "", password: "", encryption: "WPA", hidden: false };
    case "vcard":
      return {
        firstName: "",
        lastName: "",
        organization: "",
        title: "",
        email: "",
        phone: "",
        mobile: "",
        website: "",
        street: "",
        city: "",
        state: "",
        zip: "",
        country: "",
      };
    case "location":
      return { latitude: "", longitude: "", query: "" };
    case "event":
      return {
        title: "",
        location: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        description: "",
      };
    default:
      return {};
  }
};

// ============================================================================
// Types
// ============================================================================

interface HistoryItem {
  id: string;
  type: QRContentType;
  value: string;
  timestamp: number;
  style: { fgColor: string; bgColor: string };
}

type DownloadFormat = "png" | "svg" | "jpg";

// ============================================================================
// Sub-Components
// ============================================================================

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  multiline = false,
  rows = 3,
}: InputFieldProps) {
  const baseClasses =
    "w-full px-4 py-3 border rounded-lg bg-white dark:bg-dark-card border-zinc-200 dark:border-dark-border focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none text-zinc-900 dark:text-white placeholder-zinc-400 text-sm transition-colors";

  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={`${baseClasses} resize-none`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={baseClasses}
        />
      )}
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

function SelectField({ label, value, onChange, options }: SelectFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-dark-card border-zinc-200 dark:border-dark-border focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none text-zinc-900 dark:text-white text-sm transition-colors appearance-none cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function CheckboxField({ label, checked, onChange }: CheckboxFieldProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <div
        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          checked
            ? "bg-indigo-600 border-indigo-600"
            : "bg-white dark:bg-dark-card border-zinc-300 dark:border-zinc-600 group-hover:border-indigo-400"
        }`}
        onClick={() => onChange(!checked)}
      >
        {checked && <CheckIcon className="w-3.5 h-3.5 text-white" />}
      </div>
      <span className="text-sm text-zinc-700 dark:text-zinc-300">{label}</span>
    </label>
  );
}

// ============================================================================
// Input Form Components by Type
// ============================================================================

interface FormProps {
  data: Record<string, unknown>;
  updateField: (field: string, value: unknown) => void;
  t: (key: string) => string;
}

function URLForm({ data, updateField, t }: FormProps) {
  return (
    <InputField
      label={t("tools.qrCode.urlLabel")}
      value={(data.url as string) || ""}
      onChange={(v) => updateField("url", v)}
      placeholder={t("tools.qrCode.urlPlaceholder")}
      type="url"
      required
    />
  );
}

function TextForm({ data, updateField, t }: FormProps) {
  return (
    <InputField
      label={t("tools.qrCode.textLabel")}
      value={(data.text as string) || ""}
      onChange={(v) => updateField("text", v)}
      placeholder={t("tools.qrCode.textPlaceholder")}
      multiline
      rows={4}
      required
    />
  );
}

function EmailForm({ data, updateField, t }: FormProps) {
  return (
    <div className="space-y-4">
      <InputField
        label={t("tools.qrCode.emailLabel")}
        value={(data.email as string) || ""}
        onChange={(v) => updateField("email", v)}
        placeholder={t("tools.qrCode.emailPlaceholder")}
        type="email"
        required
      />
      <InputField
        label={t("tools.qrCode.emailSubject")}
        value={(data.subject as string) || ""}
        onChange={(v) => updateField("subject", v)}
        placeholder={t("tools.qrCode.emailSubjectPlaceholder")}
      />
      <InputField
        label={t("tools.qrCode.emailBody")}
        value={(data.body as string) || ""}
        onChange={(v) => updateField("body", v)}
        placeholder={t("tools.qrCode.emailBodyPlaceholder")}
        multiline
        rows={3}
      />
    </div>
  );
}

function PhoneForm({ data, updateField, t }: FormProps) {
  return (
    <InputField
      label={t("tools.qrCode.phoneLabel")}
      value={(data.phone as string) || ""}
      onChange={(v) => updateField("phone", v)}
      placeholder={t("tools.qrCode.phonePlaceholder")}
      type="tel"
      required
    />
  );
}

function SMSForm({ data, updateField, t }: FormProps) {
  return (
    <div className="space-y-4">
      <InputField
        label={t("tools.qrCode.smsPhone")}
        value={(data.phone as string) || ""}
        onChange={(v) => updateField("phone", v)}
        placeholder={t("tools.qrCode.phonePlaceholder")}
        type="tel"
        required
      />
      <InputField
        label={t("tools.qrCode.smsMessage")}
        value={(data.message as string) || ""}
        onChange={(v) => updateField("message", v)}
        placeholder={t("tools.qrCode.smsMessagePlaceholder")}
        multiline
        rows={3}
      />
    </div>
  );
}

function WiFiForm({ data, updateField, t }: FormProps) {
  return (
    <div className="space-y-4">
      <InputField
        label={t("tools.qrCode.wifiSSID")}
        value={(data.ssid as string) || ""}
        onChange={(v) => updateField("ssid", v)}
        placeholder={t("tools.qrCode.wifiSSIDPlaceholder")}
        required
      />
      <InputField
        label={t("tools.qrCode.wifiPassword")}
        value={(data.password as string) || ""}
        onChange={(v) => updateField("password", v)}
        placeholder={t("tools.qrCode.wifiPasswordPlaceholder")}
        type="password"
      />
      <SelectField
        label={t("tools.qrCode.wifiEncryption")}
        value={(data.encryption as string) || "WPA"}
        onChange={(v) => updateField("encryption", v)}
        options={[
          { value: "WPA", label: "WPA/WPA2/WPA3" },
          { value: "WEP", label: "WEP" },
          { value: "nopass", label: t("tools.qrCode.wifiNoPassword") },
        ]}
      />
      <CheckboxField
        label={t("tools.qrCode.wifiHidden")}
        checked={(data.hidden as boolean) || false}
        onChange={(v) => updateField("hidden", v)}
      />
    </div>
  );
}

function VCardForm({ data, updateField, t }: FormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InputField
          label={t("tools.qrCode.vcardFirstName")}
          value={(data.firstName as string) || ""}
          onChange={(v) => updateField("firstName", v)}
          placeholder={t("tools.qrCode.vcardFirstNamePlaceholder")}
          required
        />
        <InputField
          label={t("tools.qrCode.vcardLastName")}
          value={(data.lastName as string) || ""}
          onChange={(v) => updateField("lastName", v)}
          placeholder={t("tools.qrCode.vcardLastNamePlaceholder")}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InputField
          label={t("tools.qrCode.vcardOrganization")}
          value={(data.organization as string) || ""}
          onChange={(v) => updateField("organization", v)}
          placeholder={t("tools.qrCode.vcardOrganizationPlaceholder")}
        />
        <InputField
          label={t("tools.qrCode.vcardTitle")}
          value={(data.title as string) || ""}
          onChange={(v) => updateField("title", v)}
          placeholder={t("tools.qrCode.vcardTitlePlaceholder")}
        />
      </div>
      <InputField
        label={t("tools.qrCode.vcardEmail")}
        value={(data.email as string) || ""}
        onChange={(v) => updateField("email", v)}
        placeholder={t("tools.qrCode.emailPlaceholder")}
        type="email"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InputField
          label={t("tools.qrCode.vcardPhone")}
          value={(data.phone as string) || ""}
          onChange={(v) => updateField("phone", v)}
          placeholder={t("tools.qrCode.phonePlaceholder")}
          type="tel"
        />
        <InputField
          label={t("tools.qrCode.vcardMobile")}
          value={(data.mobile as string) || ""}
          onChange={(v) => updateField("mobile", v)}
          placeholder={t("tools.qrCode.vcardMobilePlaceholder")}
          type="tel"
        />
      </div>
      <InputField
        label={t("tools.qrCode.vcardWebsite")}
        value={(data.website as string) || ""}
        onChange={(v) => updateField("website", v)}
        placeholder={t("tools.qrCode.urlPlaceholder")}
        type="url"
      />
      <div className="border-t border-zinc-200 dark:border-dark-border pt-4 mt-4">
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
          {t("tools.qrCode.vcardAddressOptional")}
        </p>
        <div className="space-y-3">
          <InputField
            label={t("tools.qrCode.vcardStreet")}
            value={(data.street as string) || ""}
            onChange={(v) => updateField("street", v)}
            placeholder={t("tools.qrCode.vcardStreetPlaceholder")}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField
              label={t("tools.qrCode.vcardCity")}
              value={(data.city as string) || ""}
              onChange={(v) => updateField("city", v)}
              placeholder={t("tools.qrCode.vcardCityPlaceholder")}
            />
            <InputField
              label={t("tools.qrCode.vcardState")}
              value={(data.state as string) || ""}
              onChange={(v) => updateField("state", v)}
              placeholder={t("tools.qrCode.vcardStatePlaceholder")}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField
              label={t("tools.qrCode.vcardZip")}
              value={(data.zip as string) || ""}
              onChange={(v) => updateField("zip", v)}
              placeholder={t("tools.qrCode.vcardZipPlaceholder")}
            />
            <InputField
              label={t("tools.qrCode.vcardCountry")}
              value={(data.country as string) || ""}
              onChange={(v) => updateField("country", v)}
              placeholder={t("tools.qrCode.vcardCountryPlaceholder")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function LocationForm({ data, updateField, t }: FormProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        {t("tools.qrCode.locationHint")}
      </p>
      <InputField
        label={t("tools.qrCode.locationQuery")}
        value={(data.query as string) || ""}
        onChange={(v) => updateField("query", v)}
        placeholder={t("tools.qrCode.locationQueryPlaceholder")}
      />
      <div className="flex items-center gap-4 my-3">
        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
        <span className="text-xs text-zinc-400">{t("tools.qrCode.or")}</span>
        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InputField
          label={t("tools.qrCode.locationLatitude")}
          value={(data.latitude as string) || ""}
          onChange={(v) => updateField("latitude", v)}
          placeholder="e.g., 40.7128"
        />
        <InputField
          label={t("tools.qrCode.locationLongitude")}
          value={(data.longitude as string) || ""}
          onChange={(v) => updateField("longitude", v)}
          placeholder="e.g., -74.0060"
        />
      </div>
    </div>
  );
}

function EventForm({ data, updateField, t }: FormProps) {
  return (
    <div className="space-y-4">
      <InputField
        label={t("tools.qrCode.eventTitle")}
        value={(data.title as string) || ""}
        onChange={(v) => updateField("title", v)}
        placeholder={t("tools.qrCode.eventTitlePlaceholder")}
        required
      />
      <InputField
        label={t("tools.qrCode.eventLocation")}
        value={(data.location as string) || ""}
        onChange={(v) => updateField("location", v)}
        placeholder={t("tools.qrCode.eventLocationPlaceholder")}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InputField
          label={t("tools.qrCode.eventStartDate")}
          value={(data.startDate as string) || ""}
          onChange={(v) => updateField("startDate", v)}
          type="date"
          required
        />
        <InputField
          label={t("tools.qrCode.eventStartTime")}
          value={(data.startTime as string) || ""}
          onChange={(v) => updateField("startTime", v)}
          type="time"
          required
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InputField
          label={t("tools.qrCode.eventEndDate")}
          value={(data.endDate as string) || ""}
          onChange={(v) => updateField("endDate", v)}
          type="date"
        />
        <InputField
          label={t("tools.qrCode.eventEndTime")}
          value={(data.endTime as string) || ""}
          onChange={(v) => updateField("endTime", v)}
          type="time"
        />
      </div>
      <InputField
        label={t("tools.qrCode.eventDescription")}
        value={(data.description as string) || ""}
        onChange={(v) => updateField("description", v)}
        placeholder={t("tools.qrCode.eventDescriptionPlaceholder")}
        multiline
        rows={3}
      />
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function QRCodeGeneratorPage(): JSX.Element {
  const { t } = useTranslation();
  const router = useRouter();

  // State
  const [contentType, setContentType] = useState<QRContentType>("url");
  const [data, setData] = useState<Record<string, unknown>>(
    getInitialData("url"),
  );
  const [style, setStyle] = useState<QRStyleSettings>(DEFAULT_STYLE);
  const [isGenerated, setIsGenerated] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [downloadDropdown, setDownloadDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "style">("content");

  // Refs
  const qrRef = useRef<HTMLDivElement>(null);
  const hasTrackedUsage = useRef(false);
  const downloadRef = useRef<HTMLDivElement>(null);

  // Load history on mount
  useEffect(() => {
    setHistory(getHistory());
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        downloadRef.current &&
        !downloadRef.current.contains(event.target as Node)
      ) {
        setDownloadDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Computed values
  const qrValue = useMemo(
    () => generateQRValue(contentType, data),
    [contentType, data],
  );

  const validation = useMemo(
    () => validateQRContent(contentType, data),
    [contentType, data],
  );

  // Handlers
  const handleTypeChange = useCallback((type: QRContentType) => {
    setContentType(type);
    setData(getInitialData(type));
    setIsGenerated(false);
    hasTrackedUsage.current = false;
  }, []);

  const updateField = useCallback((field: string, value: unknown) => {
    setData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateStyle = useCallback(
    <K extends keyof QRStyleSettings>(key: K, value: QRStyleSettings[K]) => {
      setStyle((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleGenerate = useCallback(() => {
    if (!validation.isValid) return;

    if (!hasTrackedUsage.current) {
      trackToolUsage("QR Code Generator", `generate_${contentType}`);
      hasTrackedUsage.current = true;
    }

    setIsGenerated(true);

    // Save to history
    if (qrValue) {
      saveToHistory(contentType, qrValue, style.fgColor, style.bgColor);
      setHistory(getHistory());
    }
  }, [validation.isValid, contentType, qrValue, style.fgColor, style.bgColor]);

  const handleDownload = useCallback(
    (format: DownloadFormat) => {
      const canvas = qrRef.current?.querySelector("canvas");
      if (!canvas) return;

      trackToolUsage("QR Code Generator", `download_${format}`);
      const filename = `qrcode-${contentType}-${Date.now()}`;

      switch (format) {
        case "png":
          downloadAsPNG(canvas, filename);
          break;
        case "jpg":
          downloadAsJPG(canvas, filename, style.bgColor);
          break;
        case "svg":
          downloadAsSVG(
            canvas,
            style.size,
            style.fgColor,
            style.bgColor,
            filename,
          );
          break;
      }

      setDownloadDropdown(false);
    },
    [contentType, style.size, style.fgColor, style.bgColor],
  );

  const handleCopy = useCallback(async () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;

    trackToolUsage("QR Code Generator", "copy_to_clipboard");
    const success = await copyQRToClipboard(canvas);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  }, []);

  const handleReset = useCallback(() => {
    setData(getInitialData(contentType));
    setStyle(DEFAULT_STYLE);
    setIsGenerated(false);
    hasTrackedUsage.current = false;
  }, [contentType]);

  const handleClearHistory = useCallback(() => {
    clearHistory();
    setHistory([]);
  }, []);

  const handleDeleteHistoryItem = useCallback((id: string) => {
    deleteHistoryItem(id);
    setHistory(getHistory());
  }, []);

  // Render form based on type
  const renderForm = () => {
    const formProps = { data, updateField, t };
    switch (contentType) {
      case "url":
        return <URLForm {...formProps} />;
      case "text":
        return <TextForm {...formProps} />;
      case "email":
        return <EmailForm {...formProps} />;
      case "phone":
        return <PhoneForm {...formProps} />;
      case "sms":
        return <SMSForm {...formProps} />;
      case "wifi":
        return <WiFiForm {...formProps} />;
      case "vcard":
        return <VCardForm {...formProps} />;
      case "location":
        return <LocationForm {...formProps} />;
      case "event":
        return <EventForm {...formProps} />;
      default:
        return null;
    }
  };

  // SEO
  const currentLocale = router.locale || router.defaultLocale || "en";
  const locales = router.locales || ["en"];
  const defaultLocale = router.defaultLocale || "en";
  const pageUrl =
    currentLocale === defaultLocale
      ? `${SITE_URL}/tools/qr-code-generator`
      : `${SITE_URL}/${currentLocale}/tools/qr-code-generator`;
  const ogLocale = LOCALE_MAP[currentLocale] || "en_US";

  const pageTitle = `${t("tools.qrCode.pageTitle")} | ${SITE_NAME}`;

  return (
    <div className="flex flex-col items-center m-0 min-h-screen">
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={t("tools.qrCode.pageDescription")} />
        <meta
          name="keywords"
          content="qr code generator, free qr code, create qr code, qr code maker, custom qr code, wifi qr code, vcard qr code, url qr code, qr code online, business qr code"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href={pageUrl} />

        {/* Hreflang */}
        {locales.map((locale) => (
          <link
            key={locale}
            rel="alternate"
            hrefLang={locale}
            href={
              locale === defaultLocale
                ? `${SITE_URL}/tools/qr-code-generator`
                : `${SITE_URL}/${locale}/tools/qr-code-generator`
            }
          />
        ))}
        <link
          rel="alternate"
          hrefLang="x-default"
          href={`${SITE_URL}/tools/qr-code-generator`}
        />

        {/* Robots */}
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />

        {/* Open Graph */}
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={pageTitle} />
        <meta
          property="og:description"
          content={t("tools.qrCode.pageDescription")}
        />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="QR Code Generator - Free Online QR Code Maker Tool"
        />
        <meta property="og:locale" content={ogLocale} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta
          name="twitter:description"
          content={t("tools.qrCode.pageDescription")}
        />
        <meta name="twitter:image" content={`${SITE_URL}/og-image.png`} />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: t("tools.qrCode.pageTitle"),
              description: t("tools.qrCode.pageDescription"),
              url: pageUrl,
              applicationCategory: "UtilityApplication",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              featureList: [
                "Generate QR codes for URLs, text, WiFi, vCard, email, phone, SMS, location, and events",
                "Custom colors and sizes",
                "Multiple download formats (PNG, SVG, JPG)",
                "Copy to clipboard",
                "QR code history",
                "Mobile responsive",
                "Free to use with no signup",
              ],
            }),
          }}
        />

        {/* Breadcrumb Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: t("header.home"),
                  item: SITE_URL,
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: t("header.tools"),
                  item: `${SITE_URL}/tools`,
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: t("tools.qrCode.name"),
                  item: pageUrl,
                },
              ],
            }),
          }}
        />

        {/* FAQ Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "What types of QR codes can I create?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "You can create QR codes for URLs/websites, plain text, WiFi networks, vCard contacts, email addresses, phone numbers, SMS messages, geographic locations, and calendar events.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Is this QR code generator free?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes! This QR code generator is completely free with no limits, no signup required, and no watermarks. You can generate unlimited QR codes.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What download formats are available?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "You can download your QR code as PNG (best for web), SVG (best for print, scalable), or JPG (smaller file size).",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can I customize the QR code colors?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes! You can choose from 8 pre-designed color presets or create custom colors with our color picker. You can also adjust the size and error correction level for optimal scanning.",
                  },
                },
              ],
            }),
          }}
        />
      </Head>

      <Header />

      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav className="w-full max-w-screen-lg mb-6">
          <ol className="flex items-center text-sm text-zinc-500 dark:text-zinc-400">
            <li>
              <Link
                href="/"
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {t("header.home")}
              </Link>
            </li>
            <li className="mx-2">/</li>
            <li>
              <Link
                href="/tools"
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {t("header.tools")}
              </Link>
            </li>
            <li className="mx-2">/</li>
            <li className="text-zinc-900 dark:text-white font-medium">
              {t("tools.qrCode.name")}
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="w-full max-w-screen-lg text-center mb-8">
          <h1
            className={`${spaceGrotesk.className} text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-white mb-4`}
          >
            {t("tools.qrCode.title")}
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            {t("tools.qrCode.subtitle")}
          </p>
        </div>

        {/* QR Type Selector */}
        <div className="w-full max-w-screen-lg mb-6">
          <div className="flex flex-wrap justify-center gap-2">
            {QR_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => handleTypeChange(type.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  contentType === type.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : "bg-zinc-100 dark:bg-dark-card text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-dark-border"
                }`}
              >
                <span>{type.icon}</span>
                <span>
                  {t(
                    `tools.qrCode.type${type.id.charAt(0).toUpperCase() + type.id.slice(1)}`,
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6 w-full max-w-screen-lg">
          {/* Left Panel - Input & Settings */}
          <div className="flex-1 bg-zinc-50 dark:bg-darkOffset rounded-xl border border-zinc-200 dark:border-dark-border overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-zinc-200 dark:border-dark-border">
              <button
                onClick={() => setActiveTab("content")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === "content"
                    ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-white dark:bg-dark-card"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                {t("tools.qrCode.tabContent")}
              </button>
              <button
                onClick={() => setActiveTab("style")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === "style"
                    ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-white dark:bg-dark-card"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                {t("tools.qrCode.tabStyle")}
              </button>
            </div>

            <div className="p-4 sm:p-6">
              {activeTab === "content" ? (
                <div className="space-y-6">
                  {/* Form */}
                  {renderForm()}

                  {/* Validation Error */}
                  {!validation.isValid && validation.error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                      <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
                      <span>{validation.error}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Color Presets */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                      {t("tools.qrCode.colorPresets")}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() =>
                            setStyle((s) => ({
                              ...s,
                              fgColor: preset.fgColor,
                              bgColor: preset.bgColor,
                            }))
                          }
                          className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all ${
                            style.fgColor === preset.fgColor &&
                            style.bgColor === preset.bgColor
                              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                              : "border-zinc-200 dark:border-dark-border hover:border-zinc-300 dark:hover:border-zinc-600"
                          }`}
                        >
                          <div
                            className="w-8 h-8 rounded-md border border-zinc-300 dark:border-zinc-600"
                            style={{ backgroundColor: preset.bgColor }}
                          >
                            <div
                              className="w-full h-full rounded-md"
                              style={{
                                backgroundColor: preset.fgColor,
                                clipPath:
                                  "polygon(20% 20%, 40% 20%, 40% 40%, 20% 40%, 20% 60%, 40% 60%, 40% 80%, 60% 80%, 60% 60%, 80% 60%, 80% 40%, 60% 40%, 60% 20%, 80% 20%, 80% 40%, 60% 40%)",
                              }}
                            />
                          </div>
                          <span className="text-xs text-zinc-600 dark:text-zinc-400">
                            {preset.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Colors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        {t("tools.qrCode.foregroundColor")}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={style.fgColor}
                          onChange={(e) =>
                            updateStyle("fgColor", e.target.value)
                          }
                          className="w-10 h-10 rounded-lg cursor-pointer border border-zinc-300 dark:border-zinc-600"
                        />
                        <input
                          type="text"
                          value={style.fgColor}
                          onChange={(e) =>
                            updateStyle("fgColor", e.target.value)
                          }
                          className="flex-1 px-3 py-2 text-sm border rounded-lg bg-white dark:bg-dark-card border-zinc-200 dark:border-dark-border focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none text-zinc-900 dark:text-white uppercase"
                          maxLength={7}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        {t("tools.qrCode.backgroundColor")}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={style.bgColor}
                          onChange={(e) =>
                            updateStyle("bgColor", e.target.value)
                          }
                          className="w-10 h-10 rounded-lg cursor-pointer border border-zinc-300 dark:border-zinc-600"
                        />
                        <input
                          type="text"
                          value={style.bgColor}
                          onChange={(e) =>
                            updateStyle("bgColor", e.target.value)
                          }
                          className="flex-1 px-3 py-2 text-sm border rounded-lg bg-white dark:bg-dark-card border-zinc-200 dark:border-dark-border focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none text-zinc-900 dark:text-white uppercase"
                          maxLength={7}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Size */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                      {t("tools.qrCode.size")}
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {SIZE_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => updateStyle("size", option.value)}
                          className={`px-2 py-2 text-xs font-medium rounded-lg transition-colors ${
                            style.size === option.value
                              ? "bg-indigo-600 text-white"
                              : "bg-white dark:bg-dark-card text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-dark-border hover:border-indigo-300 dark:hover:border-indigo-600"
                          }`}
                        >
                          {option.value}px
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Error Correction */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                      {t("tools.qrCode.errorCorrection")}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ERROR_CORRECTION_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() =>
                            updateStyle("errorCorrection", option.value)
                          }
                          className={`flex flex-col items-start px-3 py-2.5 rounded-lg text-left transition-colors ${
                            style.errorCorrection === option.value
                              ? "bg-indigo-600 text-white"
                              : "bg-white dark:bg-dark-card text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-dark-border hover:border-indigo-300 dark:hover:border-indigo-600"
                          }`}
                        >
                          <span className="font-medium text-sm">
                            {option.label} ({option.recovery})
                          </span>
                          <span
                            className={`text-xs mt-0.5 ${
                              style.errorCorrection === option.value
                                ? "text-indigo-100"
                                : "text-zinc-500 dark:text-zinc-400"
                            }`}
                          >
                            {option.description}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Include Margin */}
                  <CheckboxField
                    label={t("tools.qrCode.includeMargin")}
                    checked={style.includeMargin}
                    onChange={(v) => updateStyle("includeMargin", v)}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-zinc-200 dark:border-dark-border">
                <button
                  onClick={handleGenerate}
                  disabled={!validation.isValid}
                  className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors shadow-md shadow-indigo-500/20 disabled:shadow-none"
                >
                  {t("tools.qrCode.generate")}
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-3 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 font-medium rounded-lg transition-colors"
                  title={t("tools.qrCode.reset")}
                >
                  <RefreshIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="lg:w-[380px] bg-zinc-50 dark:bg-darkOffset rounded-xl border border-zinc-200 dark:border-dark-border overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-dark-border">
              <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t("tools.qrCode.preview")}
              </h3>
            </div>

            <div className="p-4 sm:p-6">
              <div
                ref={qrRef}
                className="flex items-center justify-center bg-white dark:bg-dark-card rounded-xl p-6 min-h-[280px] border border-zinc-200 dark:border-dark-border"
                style={{ backgroundColor: style.bgColor }}
              >
                {isGenerated && qrValue ? (
                  <QRCodeCanvas
                    value={qrValue}
                    size={Math.min(style.size, 280)}
                    fgColor={style.fgColor}
                    bgColor={style.bgColor}
                    level={style.errorCorrection}
                    includeMargin={style.includeMargin}
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                ) : (
                  <div className="text-center text-zinc-400 dark:text-zinc-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1}
                      stroke="currentColor"
                      className="w-20 h-20 mx-auto mb-3 opacity-30"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z"
                      />
                    </svg>
                    <p className="text-sm">
                      {t("tools.qrCode.previewPlaceholder")}
                    </p>
                  </div>
                )}
              </div>

              {/* Download & Copy Buttons */}
              {isGenerated && qrValue && (
                <div className="flex gap-2 mt-4">
                  {/* Download Dropdown */}
                  <div ref={downloadRef} className="relative flex-1">
                    <button
                      onClick={() => setDownloadDropdown(!downloadDropdown)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors text-sm"
                    >
                      <DownloadIcon className="w-4 h-4" />
                      {t("tools.qrCode.download")}
                      <ChevronDownIcon
                        className={`w-4 h-4 transition-transform ${downloadDropdown ? "rotate-180" : ""}`}
                      />
                    </button>
                    {downloadDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-dark-card border border-zinc-200 dark:border-dark-border rounded-lg shadow-lg overflow-hidden z-10">
                        <button
                          onClick={() => handleDownload("png")}
                          className="w-full px-4 py-2.5 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                        >
                          <span className="font-medium">PNG</span>
                          <span className="text-zinc-500 dark:text-zinc-400 ml-2">
                            - {t("tools.qrCode.formatPngDesc")}
                          </span>
                        </button>
                        <button
                          onClick={() => handleDownload("svg")}
                          className="w-full px-4 py-2.5 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                        >
                          <span className="font-medium">SVG</span>
                          <span className="text-zinc-500 dark:text-zinc-400 ml-2">
                            - {t("tools.qrCode.formatSvgDesc")}
                          </span>
                        </button>
                        <button
                          onClick={() => handleDownload("jpg")}
                          className="w-full px-4 py-2.5 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                        >
                          <span className="font-medium">JPG</span>
                          <span className="text-zinc-500 dark:text-zinc-400 ml-2">
                            - {t("tools.qrCode.formatJpgDesc")}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Copy Button */}
                  <button
                    onClick={handleCopy}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 font-medium rounded-lg transition-colors text-sm ${
                      copySuccess
                        ? "bg-green-500 text-white"
                        : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600"
                    }`}
                    title={t("tools.qrCode.copyToClipboard")}
                  >
                    {copySuccess ? (
                      <CheckIcon className="w-4 h-4" />
                    ) : (
                      <ClipboardCopyIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}

              {/* QR Code Info */}
              {isGenerated && qrValue && (
                <div className="mt-4 p-3 bg-zinc-100 dark:bg-dark-card rounded-lg">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                    {t("tools.qrCode.encodedData")}
                  </p>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 break-all line-clamp-2">
                    {qrValue}
                  </p>
                </div>
              )}
            </div>

            {/* History Section */}
            {history.length > 0 && (
              <div className="border-t border-zinc-200 dark:border-dark-border">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <span>{t("tools.qrCode.recentHistory")}</span>
                  <ChevronDownIcon
                    className={`w-4 h-4 transition-transform ${showHistory ? "rotate-180" : ""}`}
                  />
                </button>

                {showHistory && (
                  <div className="px-4 pb-4">
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {history.slice(0, 5).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-2 bg-zinc-100 dark:bg-dark-card rounded-lg group"
                        >
                          <div
                            className="w-8 h-8 rounded flex items-center justify-center text-xs"
                            style={{
                              backgroundColor: item.style.bgColor,
                              color: item.style.fgColor,
                            }}
                          >
                            {QR_TYPES.find((t) => t.id === item.type)?.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">
                              {item.value}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              {new Date(item.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteHistoryItem(item.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-red-500 transition-all"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleClearHistory}
                      className="w-full mt-3 px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      {t("tools.qrCode.clearHistory")}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <section className="w-full max-w-screen-lg mt-12">
          <div className="bg-zinc-50 dark:bg-darkOffset rounded-xl p-6 sm:p-8 border border-zinc-200 dark:border-dark-border">
            <h2
              className={`${spaceGrotesk.className} text-2xl font-bold text-zinc-900 dark:text-white mb-6`}
            >
              {t("tools.qrCode.aboutTitle")}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature Cards */}
              <div className="p-4 bg-white dark:bg-dark-card rounded-lg border border-zinc-200 dark:border-dark-border">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-xl">🎨</span>
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">
                  {t("tools.qrCode.featureCustomTitle")}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {t("tools.qrCode.featureCustomDesc")}
                </p>
              </div>

              <div className="p-4 bg-white dark:bg-dark-card rounded-lg border border-zinc-200 dark:border-dark-border">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-xl">📱</span>
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">
                  {t("tools.qrCode.featureTypesTitle")}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {t("tools.qrCode.featureTypesDesc")}
                </p>
              </div>

              <div className="p-4 bg-white dark:bg-dark-card rounded-lg border border-zinc-200 dark:border-dark-border">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-xl">⬇️</span>
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">
                  {t("tools.qrCode.featureDownloadTitle")}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {t("tools.qrCode.featureDownloadDesc")}
                </p>
              </div>

              <div className="p-4 bg-white dark:bg-dark-card rounded-lg border border-zinc-200 dark:border-dark-border">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-xl">🔒</span>
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">
                  {t("tools.qrCode.featurePrivacyTitle")}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {t("tools.qrCode.featurePrivacyDesc")}
                </p>
              </div>

              <div className="p-4 bg-white dark:bg-dark-card rounded-lg border border-zinc-200 dark:border-dark-border">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-xl">♾️</span>
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">
                  {t("tools.qrCode.featureUnlimitedTitle")}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {t("tools.qrCode.featureUnlimitedDesc")}
                </p>
              </div>

              <div className="p-4 bg-white dark:bg-dark-card rounded-lg border border-zinc-200 dark:border-dark-border">
                <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-xl">⚡</span>
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">
                  {t("tools.qrCode.featureInstantTitle")}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {t("tools.qrCode.featureInstantDesc")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="w-full max-w-screen-lg mt-12">
          <div className="bg-zinc-50 dark:bg-darkOffset rounded-xl p-6 sm:p-8 border border-zinc-200 dark:border-dark-border">
            <h2
              className={`${spaceGrotesk.className} text-2xl font-bold text-zinc-900 dark:text-white mb-4`}
            >
              {t("tools.qrCode.useCasesTitle")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-3 bg-white dark:bg-dark-card rounded-lg">
                <span className="text-lg">🏢</span>
                <div>
                  <h4 className="font-medium text-zinc-900 dark:text-white text-sm">
                    {t("tools.qrCode.useCase1Title")}
                  </h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                    {t("tools.qrCode.useCase1Desc")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-white dark:bg-dark-card rounded-lg">
                <span className="text-lg">🍽️</span>
                <div>
                  <h4 className="font-medium text-zinc-900 dark:text-white text-sm">
                    {t("tools.qrCode.useCase2Title")}
                  </h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                    {t("tools.qrCode.useCase2Desc")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-white dark:bg-dark-card rounded-lg">
                <span className="text-lg">📦</span>
                <div>
                  <h4 className="font-medium text-zinc-900 dark:text-white text-sm">
                    {t("tools.qrCode.useCase3Title")}
                  </h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                    {t("tools.qrCode.useCase3Desc")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-white dark:bg-dark-card rounded-lg">
                <span className="text-lg">🎫</span>
                <div>
                  <h4 className="font-medium text-zinc-900 dark:text-white text-sm">
                    {t("tools.qrCode.useCase4Title")}
                  </h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                    {t("tools.qrCode.useCase4Desc")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <div className="w-full max-w-screen-lg mt-12 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-center border border-indigo-100 dark:border-indigo-800">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
            {t("tools.bottomCtaTitle")}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            {t("tools.bottomCtaDescription")}
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
          >
            {t("tools.tryGenerator")}
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

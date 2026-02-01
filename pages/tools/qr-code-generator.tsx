import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Space_Grotesk } from "@next/font/google";
import { QRCodeCanvas } from "qrcode.react";
import { Toaster, toast } from "react-hot-toast";
import { Header, Footer } from "@/components";
import { RelatedTools } from "@/components/tools";
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
  PhotographIcon,
  XIcon,
  CollectionIcon,
  UploadIcon,
  LinkIcon,
  ChartBarIcon,
} from "@heroicons/react/outline";
import {
  generateShortCode,
  saveLocalShortUrl,
  SHORT_URL_BASE,
} from "@/lib/analytics";
import type {
  QRContentType,
  QRStyleSettings,
  ErrorCorrectionLevel,
  FrameStyle,
} from "@/types/qr-code";
import {
  COLOR_PRESETS,
  SIZE_OPTIONS,
  ERROR_CORRECTION_OPTIONS,
  FRAME_TEMPLATES,
  FRAME_TEXT_PRESETS,
  STYLE_PRESETS,
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
import {
  StylePresetsSection,
  LogoUploadSection,
  FrameStyleSection,
  ColorPickerSection,
  BatchStylePanel,
  InputField,
  SelectField,
  CheckboxField,
} from "@/components/qr-code";

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
  category?: "basic" | "social" | "payment";
}[] = [
  // Basic types
  { id: "url", icon: "🔗", category: "basic" },
  { id: "text", icon: "📝", category: "basic" },
  { id: "wifi", icon: "📶", category: "basic" },
  { id: "vcard", icon: "👤", category: "basic" },
  { id: "email", icon: "✉️", category: "basic" },
  { id: "phone", icon: "📞", category: "basic" },
  { id: "sms", icon: "💬", category: "basic" },
  { id: "location", icon: "📍", category: "basic" },
  { id: "event", icon: "📅", category: "basic" },
  // Social types
  { id: "twitter", icon: "🐦", category: "social" },
  { id: "youtube", icon: "▶️", category: "social" },
  { id: "facebook", icon: "👍", category: "social" },
  { id: "appstore", icon: "📱", category: "social" },
  // Payment types
  { id: "bitcoin", icon: "₿", category: "payment" },
  { id: "ethereum", icon: "⟠", category: "payment" },
  { id: "cardano", icon: "🔷", category: "payment" },
  { id: "solana", icon: "◎", category: "payment" },
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
    case "twitter":
      return { username: "" };
    case "youtube":
      return { videoId: "", channelId: "" };
    case "facebook":
      return { username: "", pageId: "" };
    case "bitcoin":
      return { address: "", amount: "", label: "", message: "" };
    case "ethereum":
      return { address: "", amount: "", tokenAddress: "", chainId: "" };
    case "cardano":
      return { address: "", amount: "" };
    case "solana":
      return { address: "", amount: "", reference: "", label: "", message: "" };
    case "appstore":
      return { appId: "", platform: "ios" };
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
      onChange={(v: string) => updateField("url", v)}
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
      onChange={(v: string) => updateField("text", v)}
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
        onChange={(v: string) => updateField("email", v)}
        placeholder={t("tools.qrCode.emailPlaceholder")}
        type="email"
        required
      />
      <InputField
        label={t("tools.qrCode.emailSubject")}
        value={(data.subject as string) || ""}
        onChange={(v: string) => updateField("subject", v)}
        placeholder={t("tools.qrCode.emailSubjectPlaceholder")}
      />
      <InputField
        label={t("tools.qrCode.emailBody")}
        value={(data.body as string) || ""}
        onChange={(v: string) => updateField("body", v)}
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
      onChange={(v: string) => updateField("phone", v)}
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
        onChange={(v: string) => updateField("phone", v)}
        placeholder={t("tools.qrCode.phonePlaceholder")}
        type="tel"
        required
      />
      <InputField
        label={t("tools.qrCode.smsMessage")}
        value={(data.message as string) || ""}
        onChange={(v: string) => updateField("message", v)}
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
        onChange={(v: string) => updateField("ssid", v)}
        placeholder={t("tools.qrCode.wifiSSIDPlaceholder")}
        required
      />
      <InputField
        label={t("tools.qrCode.wifiPassword")}
        value={(data.password as string) || ""}
        onChange={(v: string) => updateField("password", v)}
        placeholder={t("tools.qrCode.wifiPasswordPlaceholder")}
        type="password"
      />
      <SelectField
        label={t("tools.qrCode.wifiEncryption")}
        value={(data.encryption as string) || "WPA"}
        onChange={(v: string) => updateField("encryption", v)}
        options={[
          { value: "WPA", label: "WPA/WPA2/WPA3" },
          { value: "WEP", label: "WEP" },
          { value: "nopass", label: t("tools.qrCode.wifiNoPassword") },
        ]}
      />
      <CheckboxField
        label={t("tools.qrCode.wifiHidden")}
        checked={(data.hidden as boolean) || false}
        onChange={(v: boolean) => updateField("hidden", v)}
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
          onChange={(v: string) => updateField("firstName", v)}
          placeholder={t("tools.qrCode.vcardFirstNamePlaceholder")}
          required
        />
        <InputField
          label={t("tools.qrCode.vcardLastName")}
          value={(data.lastName as string) || ""}
          onChange={(v: string) => updateField("lastName", v)}
          placeholder={t("tools.qrCode.vcardLastNamePlaceholder")}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InputField
          label={t("tools.qrCode.vcardOrganization")}
          value={(data.organization as string) || ""}
          onChange={(v: string) => updateField("organization", v)}
          placeholder={t("tools.qrCode.vcardOrganizationPlaceholder")}
        />
        <InputField
          label={t("tools.qrCode.vcardTitle")}
          value={(data.title as string) || ""}
          onChange={(v: string) => updateField("title", v)}
          placeholder={t("tools.qrCode.vcardTitlePlaceholder")}
        />
      </div>
      <InputField
        label={t("tools.qrCode.vcardEmail")}
        value={(data.email as string) || ""}
        onChange={(v: string) => updateField("email", v)}
        placeholder={t("tools.qrCode.emailPlaceholder")}
        type="email"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InputField
          label={t("tools.qrCode.vcardPhone")}
          value={(data.phone as string) || ""}
          onChange={(v: string) => updateField("phone", v)}
          placeholder={t("tools.qrCode.phonePlaceholder")}
          type="tel"
        />
        <InputField
          label={t("tools.qrCode.vcardMobile")}
          value={(data.mobile as string) || ""}
          onChange={(v: string) => updateField("mobile", v)}
          placeholder={t("tools.qrCode.vcardMobilePlaceholder")}
          type="tel"
        />
      </div>
      <InputField
        label={t("tools.qrCode.vcardWebsite")}
        value={(data.website as string) || ""}
        onChange={(v: string) => updateField("website", v)}
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
            onChange={(v: string) => updateField("street", v)}
            placeholder={t("tools.qrCode.vcardStreetPlaceholder")}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField
              label={t("tools.qrCode.vcardCity")}
              value={(data.city as string) || ""}
              onChange={(v: string) => updateField("city", v)}
              placeholder={t("tools.qrCode.vcardCityPlaceholder")}
            />
            <InputField
              label={t("tools.qrCode.vcardState")}
              value={(data.state as string) || ""}
              onChange={(v: string) => updateField("state", v)}
              placeholder={t("tools.qrCode.vcardStatePlaceholder")}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField
              label={t("tools.qrCode.vcardZip")}
              value={(data.zip as string) || ""}
              onChange={(v: string) => updateField("zip", v)}
              placeholder={t("tools.qrCode.vcardZipPlaceholder")}
            />
            <InputField
              label={t("tools.qrCode.vcardCountry")}
              value={(data.country as string) || ""}
              onChange={(v: string) => updateField("country", v)}
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
        onChange={(v: string) => updateField("query", v)}
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
          onChange={(v: string) => updateField("latitude", v)}
          placeholder="e.g., 40.7128"
        />
        <InputField
          label={t("tools.qrCode.locationLongitude")}
          value={(data.longitude as string) || ""}
          onChange={(v: string) => updateField("longitude", v)}
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
        onChange={(v: string) => updateField("title", v)}
        placeholder={t("tools.qrCode.eventTitlePlaceholder")}
        required
      />
      <InputField
        label={t("tools.qrCode.eventLocation")}
        value={(data.location as string) || ""}
        onChange={(v: string) => updateField("location", v)}
        placeholder={t("tools.qrCode.eventLocationPlaceholder")}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InputField
          label={t("tools.qrCode.eventStartDate")}
          value={(data.startDate as string) || ""}
          onChange={(v: string) => updateField("startDate", v)}
          type="date"
          required
        />
        <InputField
          label={t("tools.qrCode.eventStartTime")}
          value={(data.startTime as string) || ""}
          onChange={(v: string) => updateField("startTime", v)}
          type="time"
          required
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InputField
          label={t("tools.qrCode.eventEndDate")}
          value={(data.endDate as string) || ""}
          onChange={(v: string) => updateField("endDate", v)}
          type="date"
        />
        <InputField
          label={t("tools.qrCode.eventEndTime")}
          value={(data.endTime as string) || ""}
          onChange={(v: string) => updateField("endTime", v)}
          type="time"
        />
      </div>
      <InputField
        label={t("tools.qrCode.eventDescription")}
        value={(data.description as string) || ""}
        onChange={(v: string) => updateField("description", v)}
        placeholder={t("tools.qrCode.eventDescriptionPlaceholder")}
        multiline
        rows={3}
      />
    </div>
  );
}

function TwitterForm({ data, updateField, t }: FormProps) {
  return (
    <InputField
      label={t("tools.qrCode.twitterUsername")}
      value={(data.username as string) || ""}
      onChange={(v: string) => updateField("username", v)}
      placeholder={t("tools.qrCode.twitterPlaceholder")}
      required
    />
  );
}

function YouTubeForm({ data, updateField, t }: FormProps) {
  return (
    <div className="space-y-4">
      <InputField
        label={t("tools.qrCode.youtubeVideo")}
        value={(data.videoId as string) || ""}
        onChange={(v: string) => updateField("videoId", v)}
        placeholder={t("tools.qrCode.youtubeVideoPlaceholder")}
      />
      <div className="flex items-center gap-4 my-3">
        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
        <span className="text-xs text-zinc-400">{t("tools.qrCode.or")}</span>
        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
      </div>
      <InputField
        label={t("tools.qrCode.youtubeChannel")}
        value={(data.channelId as string) || ""}
        onChange={(v: string) => updateField("channelId", v)}
        placeholder={t("tools.qrCode.youtubeChannelPlaceholder")}
      />
    </div>
  );
}

function FacebookForm({ data, updateField, t }: FormProps) {
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

function BitcoinForm({ data, updateField, t }: FormProps) {
  return (
    <div className="space-y-4">
      <InputField
        label={t("tools.qrCode.bitcoinAddress")}
        value={(data.address as string) || ""}
        onChange={(v: string) => updateField("address", v)}
        placeholder={t("tools.qrCode.bitcoinAddressPlaceholder")}
        required
      />
      <InputField
        label={t("tools.qrCode.bitcoinAmount")}
        value={(data.amount as string) || ""}
        onChange={(v: string) => updateField("amount", v)}
        placeholder={t("tools.qrCode.bitcoinAmountPlaceholder")}
      />
      <InputField
        label={t("tools.qrCode.bitcoinLabel")}
        value={(data.label as string) || ""}
        onChange={(v: string) => updateField("label", v)}
        placeholder={t("tools.qrCode.bitcoinLabelPlaceholder")}
      />
      <InputField
        label={t("tools.qrCode.bitcoinMessage")}
        value={(data.message as string) || ""}
        onChange={(v: string) => updateField("message", v)}
        placeholder={t("tools.qrCode.bitcoinMessagePlaceholder")}
        multiline
        rows={2}
      />
    </div>
  );
}

function EthereumForm({ data, updateField, t }: FormProps) {
  return (
    <div className="space-y-4">
      <InputField
        label={t("tools.qrCode.ethereumAddress")}
        value={(data.address as string) || ""}
        onChange={(v: string) => updateField("address", v)}
        placeholder={t("tools.qrCode.ethereumAddressPlaceholder")}
        required
      />
      <InputField
        label={t("tools.qrCode.ethereumAmount")}
        value={(data.amount as string) || ""}
        onChange={(v: string) => updateField("amount", v)}
        placeholder={t("tools.qrCode.ethereumAmountPlaceholder")}
      />
      <InputField
        label={t("tools.qrCode.ethereumToken")}
        value={(data.tokenAddress as string) || ""}
        onChange={(v: string) => updateField("tokenAddress", v)}
        placeholder={t("tools.qrCode.ethereumTokenPlaceholder")}
      />
      <SelectField
        label={t("tools.qrCode.ethereumNetwork")}
        value={(data.chainId as string) || ""}
        onChange={(v: string) => updateField("chainId", v)}
        options={[
          { value: "", label: "Mainnet (default)" },
          { value: "1", label: "Ethereum Mainnet" },
          { value: "137", label: "Polygon" },
          { value: "56", label: "BNB Smart Chain" },
          { value: "42161", label: "Arbitrum One" },
          { value: "10", label: "Optimism" },
        ]}
      />
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        {t("tools.qrCode.ethereumHint")}
      </p>
    </div>
  );
}

function CardanoForm({ data, updateField, t }: FormProps) {
  return (
    <div className="space-y-4">
      <InputField
        label={t("tools.qrCode.cardanoAddress")}
        value={(data.address as string) || ""}
        onChange={(v: string) => updateField("address", v)}
        placeholder={t("tools.qrCode.cardanoAddressPlaceholder")}
        required
      />
      <InputField
        label={t("tools.qrCode.cardanoAmount")}
        value={(data.amount as string) || ""}
        onChange={(v: string) => updateField("amount", v)}
        placeholder={t("tools.qrCode.cardanoAmountPlaceholder")}
      />
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        {t("tools.qrCode.cardanoHint")}
      </p>
    </div>
  );
}

function SolanaForm({ data, updateField, t }: FormProps) {
  return (
    <div className="space-y-4">
      <InputField
        label={t("tools.qrCode.solanaAddress")}
        value={(data.address as string) || ""}
        onChange={(v: string) => updateField("address", v)}
        placeholder={t("tools.qrCode.solanaAddressPlaceholder")}
        required
      />
      <InputField
        label={t("tools.qrCode.solanaAmount")}
        value={(data.amount as string) || ""}
        onChange={(v: string) => updateField("amount", v)}
        placeholder={t("tools.qrCode.solanaAmountPlaceholder")}
      />
      <InputField
        label={t("tools.qrCode.solanaLabel")}
        value={(data.label as string) || ""}
        onChange={(v: string) => updateField("label", v)}
        placeholder={t("tools.qrCode.solanaLabelPlaceholder")}
      />
      <InputField
        label={t("tools.qrCode.solanaMessage")}
        value={(data.message as string) || ""}
        onChange={(v: string) => updateField("message", v)}
        placeholder={t("tools.qrCode.solanaMessagePlaceholder")}
        multiline
        rows={2}
      />
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        {t("tools.qrCode.solanaHint")}
      </p>
    </div>
  );
}

function AppStoreForm({ data, updateField, t }: FormProps) {
  return (
    <div className="space-y-4">
      <SelectField
        label={t("tools.qrCode.appstorePlatform")}
        value={(data.platform as string) || "ios"}
        onChange={(v: string) => updateField("platform", v)}
        options={[
          { value: "ios", label: "iOS (App Store)" },
          { value: "android", label: "Android (Google Play)" },
        ]}
      />
      <InputField
        label={t("tools.qrCode.appstoreId")}
        value={(data.appId as string) || ""}
        onChange={(v: string) => updateField("appId", v)}
        placeholder={
          (data.platform as string) === "android"
            ? t("tools.qrCode.appstoreAndroidPlaceholder")
            : t("tools.qrCode.appstoreIosPlaceholder")
        }
        required
      />
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        {(data.platform as string) === "android"
          ? t("tools.qrCode.appstoreAndroidHint")
          : t("tools.qrCode.appstoreIosHint")}
      </p>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

// Batch QR item type
interface BatchQRItem {
  id: string;
  value: string;
  label: string;
  isValid: boolean;
}

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
  const [hasInteracted, setHasInteracted] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [downloadDropdown, setDownloadDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "style" | "batch">(
    "content",
  );
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [frameStyle, setFrameStyle] = useState<FrameStyle>("none");
  const [frameText, setFrameText] = useState("SCAN ME");
  const [showTypeCategories, setShowTypeCategories] = useState(false);
  const [showAdvancedStyle, setShowAdvancedStyle] = useState(false);

  // Short URL state for URL-type QR codes
  const [generatedShortUrl, setGeneratedShortUrl] = useState<string | null>(
    null,
  );
  const [shortUrlCopied, setShortUrlCopied] = useState(false);

  // Batch mode state
  const [batchInput, setBatchInput] = useState("");
  const [batchItems, setBatchItems] = useState<BatchQRItem[]>([]);
  const [batchGenerated, setBatchGenerated] = useState(false);
  const [isDownloadingBatch, setIsDownloadingBatch] = useState(false);
  const [batchDownloadProgress, setBatchDownloadProgress] = useState(0);
  const batchQrRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Refs
  const qrRef = useRef<HTMLDivElement>(null);
  const hasTrackedUsage = useRef(false);
  const downloadRef = useRef<HTMLDivElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  // Load history on mount
  // Track if we've processed a URL query to prevent re-processing
  const hasProcessedUrlQuery = useRef(false);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  // Handle URL query parameter (for integration with URL shortener)
  useEffect(() => {
    const { url } = router.query;
    if (url && typeof url === "string" && !hasProcessedUrlQuery.current) {
      hasProcessedUrlQuery.current = true;

      // Set content type to URL and pre-fill the URL
      setContentType("url");
      setData({ url: url });
      setHasInteracted(true);
      // Auto-generate the QR code
      setIsGenerated(true);

      // If the URL is already a short URL (from URL shortener), display it
      // The URL contains ?source=qr which we should strip for display
      if (url.includes("aigl.ink")) {
        const displayUrl = url.replace(/[?&]source=qr/i, "");
        setGeneratedShortUrl(displayUrl);
      }

      // Clear the query param from URL without reload
      router.replace("/tools/qr-code-generator", undefined, { shallow: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query]);

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

  // The actual value encoded in the QR code - uses short URL with ?source=qr for tracking
  const qrEncodedValue = useMemo(() => {
    // For URL types with a generated short URL, use the short URL with source=qr
    if (contentType === "url" && generatedShortUrl) {
      return `${generatedShortUrl}?source=qr`;
    }
    // For all other types, use the regular qrValue
    return qrValue;
  }, [contentType, generatedShortUrl, qrValue]);

  const validation = useMemo(
    () => validateQRContent(contentType, data),
    [contentType, data],
  );

  // Handlers
  const handleTypeChange = useCallback(
    (type: QRContentType) => {
      setContentType(type);
      setData(getInitialData(type));
      setIsGenerated(false);
      setHasInteracted(false);
      setGeneratedShortUrl(null);
      setShortUrlCopied(false);
      hasTrackedUsage.current = false;
      // Switch away from batch tab if changing to non-URL type
      if (type !== "url" && activeTab === "batch") {
        setActiveTab("content");
      }
    },
    [activeTab],
  );

  const updateField = useCallback((field: string, value: unknown) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setHasInteracted(true);
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

    // For URL-type QR codes, generate a short URL for tracking
    if (contentType === "url" && data.url) {
      const urlStr = data.url as string;
      // Only create short URL if the URL is not already a short URL
      if (!urlStr.includes("aigl.ink")) {
        const code = generateShortCode();
        const shortUrl = `${SHORT_URL_BASE}/${code}`;

        // Save to local storage for tracking
        saveLocalShortUrl({
          id: code,
          code,
          originalUrl: urlStr,
          shortUrl,
          title: `QR Code - ${new URL(urlStr).hostname}`,
          createdAt: new Date().toISOString(),
          clicks: 0,
        });

        setGeneratedShortUrl(shortUrl);
      }
    }

    // Save to history
    if (qrValue) {
      saveToHistory(contentType, qrValue, style.fgColor, style.bgColor);
      setHistory(getHistory());
    }
  }, [
    validation.isValid,
    contentType,
    qrValue,
    style.fgColor,
    style.bgColor,
    data.url,
  ]);

  // Helper function to generate a styled QR code canvas with frames and logo
  const generateStyledQRCanvas = useCallback(
    async (value: string, size: number): Promise<HTMLCanvasElement> => {
      const QRCode = (await import("qrcode")).default;

      // Calculate dimensions based on frame style
      const hasFrame = frameStyle !== "none";
      const padding = hasFrame ? 20 : 0;
      const textHeight = hasFrame && frameStyle !== "banner" ? 24 : 0;
      const bannerHeight = frameStyle === "banner" ? 28 : 0;
      const qrSize = size;
      const totalWidth = qrSize + padding * 2;
      const totalHeight = qrSize + padding * 2 + textHeight + bannerHeight;

      // Create the final canvas
      const finalCanvas = document.createElement("canvas");
      finalCanvas.width = totalWidth;
      finalCanvas.height = totalHeight;
      const ctx = finalCanvas.getContext("2d")!;

      // Fill background
      ctx.fillStyle = style.bgColor;
      ctx.fillRect(0, 0, totalWidth, totalHeight);

      // Draw frame border if needed
      if (hasFrame) {
        ctx.strokeStyle = style.fgColor;
        ctx.lineWidth = 2;

        if (frameStyle === "simple") {
          ctx.strokeRect(1, 1, totalWidth - 2, totalHeight - 2);
        } else if (frameStyle === "rounded" || frameStyle === "badge") {
          const radius = frameStyle === "badge" ? 16 : 12;
          ctx.beginPath();
          ctx.roundRect(1, 1, totalWidth - 2, totalHeight - 2, radius);
          ctx.stroke();
        } else if (frameStyle === "banner") {
          ctx.strokeRect(1, 1, totalWidth - 2, totalHeight - 2);
          // Draw banner background
          ctx.fillStyle = style.fgColor;
          ctx.fillRect(1, 1, totalWidth - 2, bannerHeight);
          // Draw banner text
          ctx.fillStyle = style.bgColor;
          ctx.font = "bold 10px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(
            frameText.toUpperCase(),
            totalWidth / 2,
            bannerHeight / 2 + 1,
          );
        }
      }

      // Generate QR code
      const qrCanvas = document.createElement("canvas");
      await QRCode.toCanvas(qrCanvas, value, {
        width: qrSize,
        margin: style.includeMargin ? 2 : 0,
        color: {
          dark: style.fgColor,
          light: style.bgColor,
        },
        errorCorrectionLevel: style.errorCorrection,
      });

      // Position QR code
      const qrX = padding;
      const qrY = padding + bannerHeight;
      ctx.drawImage(qrCanvas, qrX, qrY);

      // Draw logo if present
      if (logoDataUrl) {
        const logoSize = Math.round(qrSize * 0.2);
        const logoX = qrX + (qrSize - logoSize) / 2;
        const logoY = qrY + (qrSize - logoSize) / 2;

        // Create white background for logo
        ctx.fillStyle = style.bgColor;
        ctx.fillRect(logoX - 2, logoY - 2, logoSize + 4, logoSize + 4);

        // Load and draw logo
        const logoImg = new Image();
        logoImg.crossOrigin = "anonymous";
        await new Promise<void>((resolve) => {
          logoImg.onload = () => {
            ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
            resolve();
          };
          logoImg.onerror = () => resolve();
          logoImg.src = logoDataUrl;
        });
      }

      // Draw frame text (except for banner which has text in header)
      if (hasFrame && frameStyle !== "banner" && frameText) {
        const textY = totalHeight - textHeight / 2 - padding / 2;

        if (frameStyle === "badge") {
          // Badge style: pill-shaped background
          ctx.font = "bold 10px Arial";
          const textWidth = ctx.measureText(frameText.toUpperCase()).width;
          const pillWidth = textWidth + 16;
          const pillHeight = 18;
          const pillX = (totalWidth - pillWidth) / 2;
          const pillY = textY - pillHeight / 2;

          ctx.fillStyle = style.fgColor;
          ctx.beginPath();
          ctx.roundRect(pillX, pillY, pillWidth, pillHeight, pillHeight / 2);
          ctx.fill();

          ctx.fillStyle = style.bgColor;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(frameText.toUpperCase(), totalWidth / 2, textY);
        } else {
          ctx.fillStyle = style.fgColor;
          ctx.font = "bold 10px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(frameText.toUpperCase(), totalWidth / 2, textY);
        }
      }

      return finalCanvas;
    },
    [
      frameStyle,
      frameText,
      logoDataUrl,
      style.bgColor,
      style.fgColor,
      style.errorCorrection,
      style.includeMargin,
    ],
  );

  const handleDownload = useCallback(
    async (format: DownloadFormat) => {
      if (!qrEncodedValue) return;

      trackToolUsage("QR Code Generator", `download_${format}`);
      const filename = `qrcode-${contentType}-${Date.now()}`;

      try {
        // Generate high-resolution QR code (2048px) for download
        const highResSize = 2048;
        const canvas = await generateStyledQRCanvas(
          qrEncodedValue,
          highResSize,
        );

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
              highResSize,
              style.fgColor,
              style.bgColor,
              filename,
            );
            break;
        }
        toast.success(t("tools.qrCode.successDownloaded"));
      } catch (error) {
        console.error("Failed to generate high-res QR:", error);
        // Fallback to preview canvas if high-res fails
        const previewCanvas = qrRef.current?.querySelector("canvas");
        if (previewCanvas) {
          switch (format) {
            case "png":
              downloadAsPNG(previewCanvas, filename);
              break;
            case "jpg":
              downloadAsJPG(previewCanvas, filename, style.bgColor);
              break;
            case "svg":
              downloadAsSVG(
                previewCanvas,
                style.size,
                style.fgColor,
                style.bgColor,
                filename,
              );
              break;
          }
          toast.success(t("tools.qrCode.successDownloaded"));
        } else {
          toast.error(t("tools.qrCode.errorDownloadFailed"));
        }
      }

      setDownloadDropdown(false);
    },
    [
      contentType,
      qrEncodedValue,
      style.size,
      style.fgColor,
      style.bgColor,
      generateStyledQRCanvas,
      t,
    ],
  );

  const handleCopy = useCallback(async () => {
    if (!qrEncodedValue) return;

    trackToolUsage("QR Code Generator", "copy_to_clipboard");

    try {
      // Generate high-resolution QR code for clipboard
      const highResSize = 1024;
      const canvas = await generateStyledQRCanvas(qrEncodedValue, highResSize);
      const success = await copyQRToClipboard(canvas);
      if (success) {
        setCopySuccess(true);
        toast.success(t("tools.qrCode.successQrCopied"));
        setTimeout(() => setCopySuccess(false), 2000);
      } else {
        toast.error(t("tools.qrCode.errorCopyFailed"));
      }
    } catch (error) {
      // Fallback to preview canvas
      const previewCanvas = qrRef.current?.querySelector("canvas");
      if (previewCanvas) {
        const success = await copyQRToClipboard(previewCanvas);
        if (success) {
          setCopySuccess(true);
          toast.success(t("tools.qrCode.successQrCopied"));
          setTimeout(() => setCopySuccess(false), 2000);
        } else {
          toast.error(t("tools.qrCode.errorCopyFailed"));
        }
      } else {
        toast.error(t("tools.qrCode.errorCopyFailed"));
      }
    }
  }, [qrEncodedValue, generateStyledQRCanvas, t]);

  const handleReset = useCallback(() => {
    setData(getInitialData(contentType));
    setStyle(DEFAULT_STYLE);
    setIsGenerated(false);
    setLogoDataUrl(null);
    setFrameStyle("none");
    setFrameText("SCAN ME");
    setGeneratedShortUrl(null);
    setShortUrlCopied(false);
    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
    hasTrackedUsage.current = false;
  }, [contentType]);

  // Handle copying short URL
  const handleCopyShortUrl = useCallback(async () => {
    if (!generatedShortUrl) return;
    try {
      await navigator.clipboard.writeText(generatedShortUrl);
      setShortUrlCopied(true);
      toast.success("Short URL copied!");
      setTimeout(() => setShortUrlCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  }, [generatedShortUrl]);

  const handleLogoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error(t("tools.qrCode.errorLogoInvalidType"));
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error(t("tools.qrCode.errorLogoTooLarge"));
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoDataUrl(event.target?.result as string);
        // Auto-increase error correction for better logo visibility
        if (style.errorCorrection === "L" || style.errorCorrection === "M") {
          updateStyle("errorCorrection", "H");
        }
        toast.success(t("tools.qrCode.successLogoAdded"));
      };
      reader.readAsDataURL(file);
    },
    [style.errorCorrection, updateStyle, t],
  );

  const handleRemoveLogo = useCallback(() => {
    setLogoDataUrl(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
    toast.success(t("tools.qrCode.successLogoRemoved"));
  }, [t]);

  const handleClearHistory = useCallback(() => {
    clearHistory();
    setHistory([]);
    toast.success(t("tools.qrCode.successHistoryCleared"));
  }, [t]);

  const handleDeleteHistoryItem = useCallback((id: string) => {
    deleteHistoryItem(id);
    setHistory(getHistory());
  }, []);

  // Batch mode handlers
  const parseBatchInput = useCallback((input: string): BatchQRItem[] => {
    const lines = input
      .split(/[\n\r]+/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    return lines.map((line, index) => {
      // Check if line has a label format: "label,value" or "label|value"
      const separatorMatch = line.match(/^([^,|]+)[,|](.+)$/);
      let label = `QR ${index + 1}`;
      let value = line;

      if (separatorMatch) {
        label = separatorMatch[1].trim();
        value = separatorMatch[2].trim();
      }

      // Validate the value
      const isValid = value.length > 0 && value.length <= 2953; // QR code max capacity

      return {
        id: `batch-${Date.now()}-${index}`,
        value,
        label,
        isValid,
      };
    });
  }, []);

  // Memoized batch preview items (defined after parseBatchInput)
  const batchPreviewItems = useMemo(
    () => parseBatchInput(batchInput),
    [batchInput, parseBatchInput],
  );

  const handleBatchInputChange = useCallback((input: string) => {
    setBatchInput(input);
    setBatchGenerated(false);
  }, []);

  const handleBatchGenerate = useCallback(() => {
    const items = parseBatchInput(batchInput);
    setBatchItems(items);
    setBatchGenerated(true);
    trackToolUsage("QR Code Generator", `batch_generate_${items.length}`);
    const validCount = items.filter((item) => item.isValid).length;
    if (validCount > 0) {
      toast.success(t("tools.qrCode.successBatchGenerated"));
    }
  }, [batchInput, parseBatchInput, t]);

  const handleCSVUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setBatchInput(text);
        setBatchGenerated(false);
      };
      reader.readAsText(file);

      // Reset input
      if (csvInputRef.current) {
        csvInputRef.current.value = "";
      }
    },
    [],
  );

  const handleBatchDownloadSingle = useCallback(
    async (item: BatchQRItem, format: "png" | "jpg" = "png") => {
      // Generate high-resolution styled QR code for download
      const filename = `qr-${item.label.replace(/[^a-zA-Z0-9]/g, "-")}-${Date.now()}`;

      try {
        const canvas = await generateStyledQRCanvas(item.value, style.size);

        if (format === "png") {
          downloadAsPNG(canvas, filename);
        } else {
          downloadAsJPG(canvas, filename, style.bgColor);
        }
      } catch (error) {
        console.error("Single batch download error:", error);
        toast.error(t("tools.qrCode.errorDownloadFailed"));
      }
    },
    [generateStyledQRCanvas, style.size, style.bgColor, t],
  );

  const handleBatchDownloadAll = useCallback(async () => {
    if (batchItems.length === 0) return;

    setIsDownloadingBatch(true);
    setBatchDownloadProgress(0);

    try {
      // Dynamically import JSZip for ZIP creation
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      const validItems = batchItems.filter((item) => item.isValid);

      for (let i = 0; i < validItems.length; i++) {
        const item = validItems[i];

        // Generate high-resolution styled QR code with frames and logo
        const canvas = await generateStyledQRCanvas(item.value, style.size);

        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(resolve, "image/png");
        });

        if (blob) {
          const filename = `${item.label.replace(/[^a-zA-Z0-9]/g, "-")}.png`;
          zip.file(filename, blob);
        }

        setBatchDownloadProgress(
          Math.round(((i + 1) / validItems.length) * 100),
        );
      }

      // Generate and download ZIP
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `qr-codes-batch-${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      trackToolUsage(
        "QR Code Generator",
        `batch_download_zip_${validItems.length}`,
      );
      toast.success(t("tools.qrCode.successBatchDownloaded"));
    } catch (error) {
      console.error("Batch download error:", error);
      toast.error(t("tools.qrCode.errorDownloadFailed"));
    } finally {
      setIsDownloadingBatch(false);
      setBatchDownloadProgress(0);
    }
  }, [batchItems, generateStyledQRCanvas, style.size, t]);

  const handleBatchClear = useCallback(() => {
    setBatchInput("");
    setBatchItems([]);
    setBatchGenerated(false);
    batchQrRefs.current.clear();
  }, []);

  const handleRemoveBatchItem = useCallback((itemId: string) => {
    setBatchItems((prev) => prev.filter((item) => item.id !== itemId));
    batchQrRefs.current.delete(itemId);
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
      case "twitter":
        return <TwitterForm {...formProps} />;
      case "youtube":
        return <YouTubeForm {...formProps} />;
      case "facebook":
        return <FacebookForm {...formProps} />;
      case "bitcoin":
        return <BitcoinForm {...formProps} />;
      case "ethereum":
        return <EthereumForm {...formProps} />;
      case "cardano":
        return <CardanoForm {...formProps} />;
      case "solana":
        return <SolanaForm {...formProps} />;
      case "appstore":
        return <AppStoreForm {...formProps} />;
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
          content="qr code generator, free qr code, create qr code, qr code maker, custom qr code, wifi qr code, vcard qr code, bitcoin qr code, ethereum qr code, crypto payment qr, twitter qr code, youtube qr code, qr code with logo, qr code online"
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
                "17+ QR code types: URL, WiFi, vCard, email, phone, SMS, location, calendar",
                "Social media QR codes: Twitter/X, YouTube, Facebook, App Store",
                "Crypto payment QR codes: Bitcoin, Ethereum, Cardano, Solana",
                "Custom logo upload with automatic error correction",
                "Customizable colors and style presets",
                "Frame styles with custom text labels",
                "Multiple download formats: PNG, SVG, JPG",
                "Batch generation with ZIP download",
                "Copy to clipboard functionality",
                "QR code history saved locally",
                "Mobile responsive design",
                "100% free with no signup required",
                "No watermarks or limits",
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
                    text: "You can create 17+ types of QR codes: Basic (URLs, text, WiFi, vCard, email, phone, SMS, location, calendar), Social Media (Twitter/X, YouTube, Facebook, App Store), and Crypto Payments (Bitcoin, Ethereum, Cardano, Solana).",
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
                  name: "Can I add a logo to my QR code?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes! You can upload your own logo (PNG, JPG, SVG up to 2MB) and it will be centered in the QR code. The error correction is automatically increased for reliable scanning.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What crypto payments are supported?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "We support Bitcoin (BIP21), Ethereum (EIP-681 with multi-chain support), Cardano (CIP-13), and Solana Pay. You can include amount, labels, and messages in payment QR codes.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How do I create a WiFi QR code?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Select 'WiFi' from the QR type options, enter your network name (SSID), password, and security type (WPA/WPA2/WEP). Users can scan the QR code to instantly connect to your WiFi without typing the password.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can I generate multiple QR codes at once?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes! Use Batch Mode to generate multiple QR codes at once. Enter multiple URLs (one per line) or upload a CSV file, customize the style for all codes, and download them all as a ZIP file.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What is the best QR code size for printing?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "For printing, we recommend at least 300x300 pixels for small prints (business cards) and 512x512 or larger for posters and banners. Download as SVG for infinite scalability without quality loss.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Do QR codes expire?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "No! QR codes generated here are static and never expire. They contain the data directly encoded, so they will work forever as long as the destination (like a URL) remains active.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What download formats are available?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "You can download QR codes as PNG (best for web), SVG (best for print, infinite scalability), or JPG (smaller file size). All formats support custom sizes and transparent backgrounds.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How do I create a vCard QR code for my business card?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Select 'vCard' type, fill in your contact details (name, phone, email, company, address, website), and generate. When scanned, recipients can save your contact info directly to their phone.",
                  },
                },
              ],
            }),
          }}
        />

        {/* HowTo Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "HowTo",
              name: "How to Create a QR Code",
              description:
                "Step-by-step guide to creating custom QR codes with logo and colors",
              totalTime: "PT1M",
              tool: {
                "@type": "HowToTool",
                name: "Article Idea Generator QR Code Tool",
              },
              step: [
                {
                  "@type": "HowToStep",
                  position: 1,
                  name: "Select QR Code Type",
                  text: "Choose from 17+ QR code types: URL, WiFi, vCard, email, phone, social media, or crypto payment.",
                  url: `${pageUrl}#type-selector`,
                },
                {
                  "@type": "HowToStep",
                  position: 2,
                  name: "Enter Your Content",
                  text: "Fill in the required information for your chosen QR type. For example, enter a URL, WiFi credentials, or contact details.",
                  url: `${pageUrl}#content-form`,
                },
                {
                  "@type": "HowToStep",
                  position: 3,
                  name: "Customize Style",
                  text: "Choose colors, add your logo, select a frame style, and adjust the size. Use style presets for quick customization.",
                  url: `${pageUrl}#style-options`,
                },
                {
                  "@type": "HowToStep",
                  position: 4,
                  name: "Download Your QR Code",
                  text: "Download your QR code as PNG, SVG, or JPG. You can also copy it to clipboard or save to history for later.",
                  url: `${pageUrl}#download`,
                },
              ],
            }),
          }}
        />
      </Head>

      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />

      <Header />

      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav className="w-full max-w-screen-lg mb-6">
          <ol className="flex items-center text-sm text-zinc-500 dark:text-zinc-400">
            <li>
              <Link
                href="/"
                className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                {t("header.home")}
              </Link>
            </li>
            <li className="mx-2">/</li>
            <li>
              <Link
                href="/tools"
                className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
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
            {t("tools.qrCode.h1Title") || t("tools.qrCode.title")}
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            {t("tools.qrCode.subtitle")}
          </p>
        </div>

        {/* QR Type Selector */}
        <div className="w-full max-w-screen-lg mb-6">
          {/* Main types - always visible */}
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
            {QR_TYPES.filter((t) => t.category === "basic")
              .slice(0, 6)
              .map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleTypeChange(type.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm font-medium transition-all ${
                    contentType === type.id
                      ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                      : "bg-zinc-100 dark:bg-dark-card text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-dark-border"
                  }`}
                >
                  <span>{type.icon}</span>
                  <span className="hidden sm:inline">
                    {t(
                      `tools.qrCode.type${type.id.charAt(0).toUpperCase() + type.id.slice(1)}`,
                    )}
                  </span>
                </button>
              ))}
            <button
              onClick={() => setShowTypeCategories(!showTypeCategories)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm font-medium transition-all ${
                showTypeCategories ||
                QR_TYPES.filter(
                  (t) =>
                    t.category !== "basic" ||
                    QR_TYPES.filter((x) => x.category === "basic").indexOf(t) >=
                      6,
                ).some((t) => t.id === contentType)
                  ? "bg-violet-600 text-white"
                  : "bg-zinc-100 dark:bg-dark-card text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-dark-border"
              }`}
            >
              <span>+</span>
              <span>{t("tools.qrCode.moreTypes")}</span>
            </button>
          </div>

          {/* Expanded types */}
          {showTypeCategories && (
            <div className="mt-4 p-4 bg-zinc-50 dark:bg-darkOffset rounded-xl border border-zinc-200 dark:border-dark-border">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* More Basic */}
                <div>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
                    {t("tools.qrCode.categoryBasic")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {QR_TYPES.filter((t) => t.category === "basic")
                      .slice(6)
                      .map((type) => (
                        <button
                          key={type.id}
                          onClick={() => handleTypeChange(type.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            contentType === type.id
                              ? "bg-violet-600 text-white"
                              : "bg-white dark:bg-dark-card text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-dark-border"
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

                {/* Social */}
                <div>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
                    {t("tools.qrCode.categorySocial")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {QR_TYPES.filter((t) => t.category === "social").map(
                      (type) => (
                        <button
                          key={type.id}
                          onClick={() => handleTypeChange(type.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            contentType === type.id
                              ? "bg-violet-600 text-white"
                              : "bg-white dark:bg-dark-card text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-dark-border"
                          }`}
                        >
                          <span>{type.icon}</span>
                          <span>
                            {t(
                              `tools.qrCode.type${type.id.charAt(0).toUpperCase() + type.id.slice(1)}`,
                            )}
                          </span>
                        </button>
                      ),
                    )}
                  </div>
                </div>

                {/* Payment */}
                <div>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
                    {t("tools.qrCode.categoryPayment")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {QR_TYPES.filter((t) => t.category === "payment").map(
                      (type) => (
                        <button
                          key={type.id}
                          onClick={() => handleTypeChange(type.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            contentType === type.id
                              ? "bg-violet-600 text-white"
                              : "bg-white dark:bg-dark-card text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-dark-border"
                          }`}
                        >
                          <span>{type.icon}</span>
                          <span>
                            {t(
                              `tools.qrCode.type${type.id.charAt(0).toUpperCase() + type.id.slice(1)}`,
                            )}
                          </span>
                        </button>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row lg:items-stretch gap-6 w-full max-w-screen-lg">
          {/* Left Panel - Input & Settings */}
          <div className="flex-1 bg-zinc-50 dark:bg-darkOffset rounded-xl border border-zinc-200 dark:border-dark-border overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-zinc-200 dark:border-dark-border">
              <button
                onClick={() => setActiveTab("content")}
                className={`flex-1 px-4 py-3.5 sm:py-3 text-sm font-medium transition-colors ${
                  activeTab === "content"
                    ? "text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 dark:border-violet-400 bg-white dark:bg-dark-card"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                {t("tools.qrCode.tabContent")}
              </button>
              <button
                onClick={() => setActiveTab("style")}
                className={`flex-1 px-4 py-3.5 sm:py-3 text-sm font-medium transition-colors flex items-center justify-center gap-1 sm:gap-1.5 ${
                  activeTab === "style"
                    ? "text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 dark:border-violet-400 bg-white dark:bg-dark-card"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                {t("tools.qrCode.tabStyle")}
                <span className="hidden sm:inline-flex text-[10px] px-1.5 py-0.5 bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 rounded-full font-semibold uppercase tracking-wide">
                  + Logo
                </span>
              </button>
              {/* Batch tab - only show for URL content type */}
              {contentType === "url" && (
                <button
                  onClick={() => setActiveTab("batch")}
                  className={`flex-1 px-4 py-3.5 sm:py-3 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                    activeTab === "batch"
                      ? "text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 dark:border-violet-400 bg-white dark:bg-dark-card"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  <CollectionIcon className="w-4 h-4" />
                  <span>{t("tools.qrCode.tabBatch")}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full font-semibold uppercase tracking-wide">
                    New
                  </span>
                </button>
              )}
            </div>

            <div className="p-4 sm:p-6">
              {activeTab === "content" ? (
                <div className="space-y-6">
                  {/* Form */}
                  {renderForm()}

                  {/* Validation Error - only show after user interaction */}
                  {hasInteracted && !validation.isValid && validation.error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                      <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
                      <span>{validation.error}</span>
                    </div>
                  )}
                </div>
              ) : activeTab === "style" ? (
                <div className="space-y-5">
                  {/* Quick Style Presets - Most impactful, show first */}
                  <StylePresetsSection
                    onSelect={(preset: {
                      fgColor: string;
                      bgColor: string;
                      frameStyle: FrameStyle;
                      frameText?: string;
                    }) => {
                      setStyle((s) => ({
                        ...s,
                        fgColor: preset.fgColor,
                        bgColor: preset.bgColor,
                      }));
                      setFrameStyle(preset.frameStyle);
                      if (preset.frameText) {
                        setFrameText(preset.frameText);
                      }
                    }}
                    t={t}
                  />

                  {/* Logo Upload - High value feature */}
                  <LogoUploadSection
                    logoDataUrl={logoDataUrl}
                    onUpload={handleLogoUpload}
                    onRemove={handleRemoveLogo}
                    t={t}
                  />

                  {/* Frame Style - Visible customization */}
                  <FrameStyleSection
                    frameStyle={frameStyle}
                    frameText={frameText}
                    onFrameStyleChange={setFrameStyle}
                    onFrameTextChange={setFrameText}
                    t={t}
                  />

                  {/* Advanced Options - Collapsible */}
                  <div className="border-t border-zinc-200 dark:border-dark-border pt-4">
                    <button
                      onClick={() => setShowAdvancedStyle(!showAdvancedStyle)}
                      className="flex items-center justify-between w-full text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                    >
                      <span>{t("tools.qrCode.advancedOptions")}</span>
                      <ChevronDownIcon
                        className={`w-5 h-5 transition-transform ${showAdvancedStyle ? "rotate-180" : ""}`}
                      />
                    </button>

                    {showAdvancedStyle && (
                      <div className="mt-4 space-y-5">
                        {/* Color Presets & Custom Colors */}
                        <ColorPickerSection
                          style={style}
                          onColorChange={(
                            type: "fgColor" | "bgColor",
                            color: string,
                          ) => updateStyle(type, color)}
                          t={t}
                        />

                        {/* Size */}
                        <div>
                          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                            {t("tools.qrCode.size")}
                          </label>
                          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                            {SIZE_OPTIONS.map((option) => (
                              <button
                                key={option.value}
                                onClick={() =>
                                  updateStyle("size", option.value)
                                }
                                className={`px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                                  style.size === option.value
                                    ? "bg-violet-600 text-white"
                                    : "bg-white dark:bg-dark-card text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-dark-border hover:border-violet-300 dark:hover:border-violet-600"
                                }`}
                              >
                                {option.value}px
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Error Correction */}
                        <div>
                          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                            {t("tools.qrCode.errorCorrection")}
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {ERROR_CORRECTION_OPTIONS.map((option) => (
                              <button
                                key={option.value}
                                onClick={() =>
                                  updateStyle("errorCorrection", option.value)
                                }
                                className={`flex flex-col items-start px-3 py-2 rounded-lg text-left transition-colors ${
                                  style.errorCorrection === option.value
                                    ? "bg-violet-600 text-white"
                                    : "bg-white dark:bg-dark-card text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-dark-border hover:border-violet-300 dark:hover:border-violet-600"
                                }`}
                              >
                                <span className="font-medium text-xs">
                                  {option.label} ({option.recovery})
                                </span>
                                <span
                                  className={`text-[10px] mt-0.5 ${
                                    style.errorCorrection === option.value
                                      ? "text-violet-100"
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
                          onChange={(v: boolean) =>
                            updateStyle("includeMargin", v)
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Batch Tab Content */
                <div className="space-y-5">
                  {/* Batch Instructions */}
                  <div className="p-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg">
                    <h4 className="text-sm font-medium text-violet-800 dark:text-violet-300 mb-2">
                      {t("tools.qrCode.batchTitle")}
                    </h4>
                    <p className="text-xs text-violet-600 dark:text-violet-400">
                      {t("tools.qrCode.batchDescription")}
                    </p>
                  </div>

                  {/* Batch Input */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      {t("tools.qrCode.batchInputLabel")}
                    </label>
                    <textarea
                      value={batchInput}
                      onChange={(e) => handleBatchInputChange(e.target.value)}
                      placeholder={t("tools.qrCode.batchInputPlaceholder")}
                      rows={10}
                      className="w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-dark-card border-zinc-200 dark:border-dark-border focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:outline-none text-zinc-900 dark:text-white placeholder-zinc-400 text-sm transition-colors resize-y font-mono"
                    />
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">
                      {t("tools.qrCode.batchFormatHint")}
                    </p>
                  </div>

                  {/* CSV Upload */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <input
                      ref={csvInputRef}
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleCSVUpload}
                      className="hidden"
                      id="csv-upload"
                    />
                    <label
                      htmlFor="csv-upload"
                      className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-dark-card border border-zinc-200 dark:border-dark-border rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                    >
                      <UploadIcon className="w-4 h-4" />
                      {t("tools.qrCode.batchUploadCSV")}
                    </label>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {t("tools.qrCode.batchUploadHint")}
                    </span>
                  </div>

                  {/* Batch Stats */}
                  {batchInput && (
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm">
                      <div>
                        <span className="text-zinc-500 dark:text-zinc-400">
                          {t("tools.qrCode.batchItemsCount")}:{" "}
                        </span>
                        <span className="font-medium text-zinc-900 dark:text-white">
                          {batchPreviewItems.length}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 dark:text-zinc-400">
                          {t("tools.qrCode.batchValidCount")}:{" "}
                        </span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          {batchPreviewItems.filter((i) => i.isValid).length}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Batch Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleBatchGenerate}
                      disabled={!batchInput.trim()}
                      className="flex-1 px-4 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors shadow-md shadow-violet-500/20 disabled:shadow-none flex items-center justify-center gap-2"
                    >
                      <CollectionIcon className="w-5 h-5" />
                      {t("tools.qrCode.batchGenerate")}
                    </button>
                    <button
                      onClick={handleBatchClear}
                      disabled={!batchInput && batchItems.length === 0}
                      className="px-4 py-3 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-700 dark:text-zinc-300 font-medium rounded-lg transition-colors"
                      title={t("tools.qrCode.batchClear")}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Download All Button */}
                  {batchGenerated && batchItems.length > 0 && (
                    <button
                      onClick={handleBatchDownloadAll}
                      disabled={isDownloadingBatch}
                      className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium rounded-lg transition-colors shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
                    >
                      {isDownloadingBatch ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          <span>
                            {t("tools.qrCode.batchDownloading")} (
                            {batchDownloadProgress}%)
                          </span>
                        </>
                      ) : (
                        <>
                          <DownloadIcon className="w-5 h-5" />
                          {t("tools.qrCode.batchDownloadAll")} (
                          {batchItems.filter((i) => i.isValid).length}{" "}
                          {t("tools.qrCode.batchFilesZip")})
                        </>
                      )}
                    </button>
                  )}

                  {/* Batch Style Options */}
                  <BatchStylePanel
                    style={style}
                    frameStyle={frameStyle}
                    frameText={frameText}
                    logoDataUrl={logoDataUrl}
                    onStyleChange={(updates: Partial<QRStyleSettings>) =>
                      setStyle((s) => ({ ...s, ...updates }))
                    }
                    onFrameStyleChange={setFrameStyle}
                    onFrameTextChange={setFrameText}
                    onLogoUpload={handleLogoUpload}
                    onLogoRemove={handleRemoveLogo}
                    t={t}
                  />
                </div>
              )}

              {/* Action Buttons - Only show for Content and Style tabs */}
              {activeTab !== "batch" && (
                <div className="flex gap-3 mt-6 pt-6 border-t border-zinc-200 dark:border-dark-border">
                  <button
                    onClick={handleGenerate}
                    disabled={!validation.isValid}
                    className="flex-1 px-4 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors shadow-md shadow-violet-500/20 disabled:shadow-none"
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
              )}
            </div>
          </div>

          {/* Right Panel - Preview (Single Mode) or Batch Preview */}
          {activeTab !== "batch" ? (
            <div className="w-full lg:w-[380px] lg:flex-shrink-0 bg-zinc-50 dark:bg-darkOffset rounded-xl border border-zinc-200 dark:border-dark-border overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-dark-border">
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {t("tools.qrCode.preview")}
                </h3>
              </div>

              <div className="p-4 sm:p-6">
                <div
                  ref={qrRef}
                  className="flex flex-col items-center justify-center bg-white dark:bg-dark-card rounded-xl p-4 sm:p-6 min-h-[240px] sm:min-h-[280px] border border-zinc-200 dark:border-dark-border"
                  style={{
                    backgroundColor:
                      frameStyle !== "none" ? "#FFFFFF" : style.bgColor,
                  }}
                >
                  {isGenerated && qrValue ? (
                    <div
                      className={`flex flex-col items-center ${
                        frameStyle === "simple"
                          ? "border-2 p-3"
                          : frameStyle === "rounded"
                            ? "border-2 rounded-xl p-4"
                            : frameStyle === "badge"
                              ? "border-2 rounded-2xl p-4 pb-2"
                              : frameStyle === "banner"
                                ? "border-2 rounded-lg overflow-hidden"
                                : ""
                      }`}
                      style={{
                        borderColor:
                          frameStyle !== "none" ? style.fgColor : "transparent",
                        backgroundColor: style.bgColor,
                      }}
                    >
                      {frameStyle === "banner" && (
                        <div
                          className="w-full py-1.5 px-3 text-center text-xs font-bold uppercase tracking-wider"
                          style={{
                            backgroundColor: style.fgColor,
                            color: style.bgColor,
                          }}
                        >
                          {frameText}
                        </div>
                      )}
                      <div className={frameStyle === "banner" ? "p-3" : ""}>
                        <QRCodeCanvas
                          value={qrEncodedValue}
                          size={Math.min(
                            style.size,
                            frameStyle !== "none" ? 220 : 280,
                          )}
                          fgColor={style.fgColor}
                          bgColor={style.bgColor}
                          level={style.errorCorrection}
                          includeMargin={style.includeMargin}
                          imageSettings={
                            logoDataUrl
                              ? {
                                  src: logoDataUrl,
                                  height: Math.round(
                                    Math.min(
                                      style.size,
                                      frameStyle !== "none" ? 220 : 280,
                                    ) * 0.2,
                                  ),
                                  width: Math.round(
                                    Math.min(
                                      style.size,
                                      frameStyle !== "none" ? 220 : 280,
                                    ) * 0.2,
                                  ),
                                  excavate: true,
                                }
                              : undefined
                          }
                          style={{ maxWidth: "100%", height: "auto" }}
                        />
                      </div>
                      {frameStyle !== "none" && frameStyle !== "banner" && (
                        <p
                          className={`text-center font-bold uppercase tracking-wide mt-2 ${
                            frameStyle === "badge"
                              ? "text-xs px-3 py-1 rounded-full"
                              : "text-xs"
                          }`}
                          style={{
                            color:
                              frameStyle === "badge"
                                ? style.bgColor
                                : style.fgColor,
                            backgroundColor:
                              frameStyle === "badge"
                                ? style.fgColor
                                : "transparent",
                          }}
                        >
                          {frameText}
                        </p>
                      )}
                    </div>
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
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors text-sm"
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
                      {qrEncodedValue}
                    </p>
                  </div>
                )}

                {/* Short URL Section - For URL-type QR codes */}
                {isGenerated && generatedShortUrl && contentType === "url" && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-violet-50 to-cyan-50 dark:from-violet-900/20 dark:to-cyan-900/20 border border-violet-200 dark:border-violet-800/50 rounded-lg">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <LinkIcon className="w-4 h-4 text-violet-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-violet-600 dark:text-violet-400 font-medium">
                            Trackable Short Link
                          </p>
                          <p className="text-sm text-violet-700 dark:text-violet-300 font-mono truncate">
                            {generatedShortUrl}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleCopyShortUrl}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                          shortUrlCopied
                            ? "bg-green-500 text-white"
                            : "bg-violet-500 hover:bg-violet-600 text-white"
                        }`}
                      >
                        {shortUrlCopied ? (
                          <>
                            <CheckIcon className="w-3.5 h-3.5" />
                            Copied
                          </>
                        ) : (
                          <>
                            <ClipboardCopyIcon className="w-3.5 h-3.5" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-violet-600/70 dark:text-violet-400/70">
                      <ChartBarIcon className="w-3.5 h-3.5" />
                      <span>Track scans • Sign up free to view analytics</span>
                    </div>
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
          ) : (
            /* Batch Preview Panel */
            <div className="w-full lg:w-[380px] lg:flex-shrink-0 lg:self-stretch bg-zinc-50 dark:bg-darkOffset rounded-xl border border-zinc-200 dark:border-dark-border overflow-hidden flex flex-col">
              <div className="p-4 border-b border-zinc-200 dark:border-dark-border flex items-center justify-between flex-shrink-0">
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {t("tools.qrCode.batchPreview")}{" "}
                  {batchItems.length > 0 &&
                    `(${batchItems.filter((i) => i.isValid).length})`}
                </h3>
              </div>

              <div className="p-4 sm:p-6 flex-1 overflow-y-auto max-h-[700px] sm:max-h-[1000px] lg:max-h-[1300px]">
                {batchGenerated && batchItems.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {batchItems
                      .filter((item) => item.isValid)
                      .map((item) => (
                        <div
                          key={item.id}
                          className="bg-white dark:bg-dark-card rounded-lg border border-zinc-200 dark:border-dark-border p-2 sm:p-3 group relative"
                        >
                          {/* Delete button */}
                          <button
                            onClick={() => handleRemoveBatchItem(item.id)}
                            className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 opacity-0 group-hover:opacity-100 p-1 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full transition-opacity z-10"
                          >
                            <XIcon className="w-3 h-3" />
                          </button>

                          {/* QR Code with Frame Styling */}
                          <div
                            ref={(el) => {
                              if (el) batchQrRefs.current.set(item.id, el);
                            }}
                            className="flex items-center justify-center mb-2 rounded overflow-hidden"
                            style={{
                              backgroundColor:
                                frameStyle !== "none"
                                  ? "#FFFFFF"
                                  : style.bgColor,
                            }}
                          >
                            <div
                              className={`flex flex-col items-center ${
                                frameStyle === "simple"
                                  ? "border-2 p-1.5"
                                  : frameStyle === "rounded"
                                    ? "border-2 rounded-lg p-2"
                                    : frameStyle === "badge"
                                      ? "border-2 rounded-xl p-2 pb-1"
                                      : frameStyle === "banner"
                                        ? "border-2 rounded-md overflow-hidden"
                                        : ""
                              }`}
                              style={{
                                borderColor:
                                  frameStyle !== "none"
                                    ? style.fgColor
                                    : "transparent",
                                backgroundColor: style.bgColor,
                              }}
                            >
                              {frameStyle === "banner" && (
                                <div
                                  className="w-full py-0.5 px-1.5 text-center font-bold uppercase tracking-wider"
                                  style={{
                                    backgroundColor: style.fgColor,
                                    color: style.bgColor,
                                    fontSize: "6px",
                                  }}
                                >
                                  {frameText}
                                </div>
                              )}
                              <div
                                className={frameStyle === "banner" ? "p-1" : ""}
                              >
                                <QRCodeCanvas
                                  value={item.value}
                                  size={frameStyle !== "none" ? 70 : 90}
                                  fgColor={style.fgColor}
                                  bgColor={style.bgColor}
                                  level={style.errorCorrection}
                                  includeMargin={style.includeMargin}
                                  imageSettings={
                                    logoDataUrl
                                      ? {
                                          src: logoDataUrl,
                                          height: Math.round(
                                            (frameStyle !== "none" ? 70 : 90) *
                                              0.2,
                                          ),
                                          width: Math.round(
                                            (frameStyle !== "none" ? 70 : 90) *
                                              0.2,
                                          ),
                                          excavate: true,
                                        }
                                      : undefined
                                  }
                                  style={{ maxWidth: "100%", height: "auto" }}
                                />
                              </div>
                              {frameStyle !== "none" &&
                                frameStyle !== "banner" && (
                                  <p
                                    className={`text-center font-bold uppercase tracking-wide mt-0.5 ${
                                      frameStyle === "badge"
                                        ? "px-1.5 py-0.5 rounded-full"
                                        : ""
                                    }`}
                                    style={{
                                      color:
                                        frameStyle === "badge"
                                          ? style.bgColor
                                          : style.fgColor,
                                      backgroundColor:
                                        frameStyle === "badge"
                                          ? style.fgColor
                                          : "transparent",
                                      fontSize: "6px",
                                    }}
                                  >
                                    {frameText}
                                  </p>
                                )}
                            </div>
                          </div>

                          {/* Label */}
                          <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 text-center truncate mb-2">
                            {item.label}
                          </p>

                          {/* Download Button */}
                          <button
                            onClick={() => handleBatchDownloadSingle(item)}
                            className="w-full flex items-center justify-center gap-1 px-2 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 rounded text-xs transition-colors"
                          >
                            <DownloadIcon className="w-3 h-3" />
                            PNG
                          </button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center text-zinc-400 dark:text-zinc-500 py-8 sm:py-12">
                    <CollectionIcon className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 opacity-30" />
                    <p className="text-xs sm:text-sm px-4">
                      {t("tools.qrCode.batchPreviewPlaceholder")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Features Section */}
        <section className="w-full max-w-screen-lg mt-8 sm:mt-12">
          <div className="bg-zinc-50 dark:bg-darkOffset rounded-xl p-4 sm:p-6 lg:p-8 border border-zinc-200 dark:border-dark-border">
            <h2
              className={`${spaceGrotesk.className} text-2xl font-bold text-zinc-900 dark:text-white mb-6`}
            >
              {t("tools.qrCode.aboutTitle")}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Feature Cards */}
              <div className="p-4 bg-white dark:bg-dark-card rounded-lg border border-zinc-200 dark:border-dark-border">
                <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center mb-3">
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
        <div className="w-full max-w-screen-lg mt-12 p-6 bg-violet-50 dark:bg-violet-900/20 rounded-lg text-center border border-violet-100 dark:border-violet-800">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
            {t("tools.bottomCtaTitle")}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            {t("tools.bottomCtaDescription")}
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition-colors"
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

        {/* FAQ Section */}
        <section className="w-full max-w-screen-lg mt-12">
          <div className="bg-white dark:bg-dark-card rounded-xl p-6 sm:p-8 border border-zinc-200 dark:border-dark-border">
            <h2
              className={`${spaceGrotesk.className} text-2xl font-bold text-zinc-900 dark:text-white mb-6`}
            >
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <details className="group border-b border-zinc-200 dark:border-dark-border pb-4">
                <summary className="flex justify-between items-center cursor-pointer list-none">
                  <h3 className="font-medium text-zinc-900 dark:text-white">
                    What types of QR codes can I create?
                  </h3>
                  <ChevronDownIcon className="w-5 h-5 text-zinc-500 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-sm">
                  You can create 17+ types of QR codes: Basic (URLs, text, WiFi,
                  vCard, email, phone, SMS, location, calendar), Social Media
                  (Twitter/X, YouTube, Facebook, App Store), and Crypto Payments
                  (Bitcoin, Ethereum, Cardano, Solana).
                </p>
              </details>

              <details className="group border-b border-zinc-200 dark:border-dark-border pb-4">
                <summary className="flex justify-between items-center cursor-pointer list-none">
                  <h3 className="font-medium text-zinc-900 dark:text-white">
                    Is this QR code generator free?
                  </h3>
                  <ChevronDownIcon className="w-5 h-5 text-zinc-500 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-sm">
                  Yes! This QR code generator is completely free with no limits,
                  no signup required, and no watermarks. You can generate
                  unlimited QR codes.
                </p>
              </details>

              <details className="group border-b border-zinc-200 dark:border-dark-border pb-4">
                <summary className="flex justify-between items-center cursor-pointer list-none">
                  <h3 className="font-medium text-zinc-900 dark:text-white">
                    Can I add a logo to my QR code?
                  </h3>
                  <ChevronDownIcon className="w-5 h-5 text-zinc-500 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-sm">
                  Yes! You can upload your own logo (PNG, JPG, SVG up to 2MB)
                  and it will be centered in the QR code. The error correction
                  is automatically increased for reliable scanning.
                </p>
              </details>

              <details className="group border-b border-zinc-200 dark:border-dark-border pb-4">
                <summary className="flex justify-between items-center cursor-pointer list-none">
                  <h3 className="font-medium text-zinc-900 dark:text-white">
                    How do I create a WiFi QR code?
                  </h3>
                  <ChevronDownIcon className="w-5 h-5 text-zinc-500 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-sm">
                  Select &apos;WiFi&apos; from the QR type options, enter your
                  network name (SSID), password, and security type
                  (WPA/WPA2/WEP). Users can scan the QR code to instantly
                  connect to your WiFi without typing the password.
                </p>
              </details>

              <details className="group border-b border-zinc-200 dark:border-dark-border pb-4">
                <summary className="flex justify-between items-center cursor-pointer list-none">
                  <h3 className="font-medium text-zinc-900 dark:text-white">
                    Can I generate multiple QR codes at once?
                  </h3>
                  <ChevronDownIcon className="w-5 h-5 text-zinc-500 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-sm">
                  Yes! Use Batch Mode to generate multiple QR codes at once.
                  Enter multiple URLs (one per line) or upload a CSV file,
                  customize the style for all codes, and download them all as a
                  ZIP file.
                </p>
              </details>

              <details className="group border-b border-zinc-200 dark:border-dark-border pb-4">
                <summary className="flex justify-between items-center cursor-pointer list-none">
                  <h3 className="font-medium text-zinc-900 dark:text-white">
                    What is the best QR code size for printing?
                  </h3>
                  <ChevronDownIcon className="w-5 h-5 text-zinc-500 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-sm">
                  For printing, we recommend at least 300x300 pixels for small
                  prints (business cards) and 512x512 or larger for posters and
                  banners. Download as SVG for infinite scalability without
                  quality loss.
                </p>
              </details>

              <details className="group border-b border-zinc-200 dark:border-dark-border pb-4">
                <summary className="flex justify-between items-center cursor-pointer list-none">
                  <h3 className="font-medium text-zinc-900 dark:text-white">
                    Do QR codes expire?
                  </h3>
                  <ChevronDownIcon className="w-5 h-5 text-zinc-500 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-sm">
                  No! QR codes generated here are static and never expire. They
                  contain the data directly encoded, so they will work forever
                  as long as the destination (like a URL) remains active.
                </p>
              </details>

              <details className="group border-b border-zinc-200 dark:border-dark-border pb-4">
                <summary className="flex justify-between items-center cursor-pointer list-none">
                  <h3 className="font-medium text-zinc-900 dark:text-white">
                    What crypto payments are supported?
                  </h3>
                  <ChevronDownIcon className="w-5 h-5 text-zinc-500 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-sm">
                  We support Bitcoin (BIP21), Ethereum (EIP-681 with multi-chain
                  support), Cardano (CIP-13), and Solana Pay. You can include
                  amount, labels, and messages in payment QR codes.
                </p>
              </details>

              <details className="group border-b border-zinc-200 dark:border-dark-border pb-4">
                <summary className="flex justify-between items-center cursor-pointer list-none">
                  <h3 className="font-medium text-zinc-900 dark:text-white">
                    What download formats are available?
                  </h3>
                  <ChevronDownIcon className="w-5 h-5 text-zinc-500 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-sm">
                  You can download QR codes as PNG (best for web), SVG (best for
                  print, infinite scalability), or JPG (smaller file size). All
                  formats support custom sizes.
                </p>
              </details>

              <details className="group pb-4">
                <summary className="flex justify-between items-center cursor-pointer list-none">
                  <h3 className="font-medium text-zinc-900 dark:text-white">
                    How do I create a vCard QR code for my business card?
                  </h3>
                  <ChevronDownIcon className="w-5 h-5 text-zinc-500 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-sm">
                  Select &apos;vCard&apos; type, fill in your contact details
                  (name, phone, email, company, address, website), and generate.
                  When scanned, recipients can save your contact info directly
                  to their phone.
                </p>
              </details>
            </div>
          </div>
        </section>

        {/* Related Tools */}
        <RelatedTools currentToolId="qr-code-generator" />
      </main>

      <Footer />
    </div>
  );
}

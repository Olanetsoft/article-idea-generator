/**
 * WiFi QR Code Form
 *
 * Form for generating WiFi network QR codes
 */

import { useState } from "react";
import { InputField, SelectField, CheckboxField } from "@/components/qr-code";
import type { FormProps } from "./types";

export function WiFiForm({ data, updateField, t }: FormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-4">
      <InputField
        label={t("tools.qrCode.wifiSSID")}
        value={(data.ssid as string) || ""}
        onChange={(v: string) => updateField("ssid", v)}
        placeholder={t("tools.qrCode.wifiSSIDPlaceholder")}
        name="ssid"
        autoComplete="off"
        spellCheck={false}
        required
      />
      <div>
        <InputField
          label={t("tools.qrCode.wifiPassword")}
          value={(data.password as string) || ""}
          onChange={(v: string) => updateField("password", v)}
          placeholder={t("tools.qrCode.wifiPasswordPlaceholder")}
          type={showPassword ? "text" : "password"}
          name="wifi-password"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-pressed={showPassword}
          className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {showPassword ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
              />
            ) : (
              <>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </>
            )}
          </svg>
          {showPassword ? "Hide password" : "Show password"}
        </button>
      </div>
      <SelectField
        label={t("tools.qrCode.wifiEncryption")}
        value={(data.encryption as string) || "WPA"}
        onChange={(v: string) => updateField("encryption", v)}
        name="encryption"
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
        name="hidden"
      />
    </div>
  );
}

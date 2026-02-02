/**
 * WiFi QR Code Form
 *
 * Form for generating WiFi network QR codes
 */

import { InputField, SelectField, CheckboxField } from "@/components/qr-code";
import type { FormProps } from "./types";

export function WiFiForm({ data, updateField, t }: FormProps) {
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

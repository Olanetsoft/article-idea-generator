/**
 * Basic QR Code Forms
 *
 * Form components for basic QR code types: URL, Text, Email, Phone, SMS
 */

import { InputField } from "@/components/qr-code";
import type { FormProps } from "./types";

export function URLForm({ data, updateField, t }: FormProps) {
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

export function TextForm({ data, updateField, t }: FormProps) {
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

export function EmailForm({ data, updateField, t }: FormProps) {
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

export function PhoneForm({ data, updateField, t }: FormProps) {
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

export function SMSForm({ data, updateField, t }: FormProps) {
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

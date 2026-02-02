/**
 * vCard QR Code Form
 *
 * Form for generating contact card (vCard) QR codes
 */

import { InputField } from "@/components/qr-code";
import type { FormProps } from "./types";

export function VCardForm({ data, updateField, t }: FormProps) {
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

/**
 * Location and Event QR Code Forms
 *
 * Forms for generating location and calendar event QR codes
 */

import { InputField } from "@/components/qr-code";
import type { FormProps } from "./types";

export function LocationForm({ data, updateField, t }: FormProps) {
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

export function EventForm({ data, updateField, t }: FormProps) {
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

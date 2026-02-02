/**
 * Cryptocurrency Payment QR Code Forms
 *
 * Forms for generating crypto payment QR codes: Bitcoin, Ethereum, Cardano, Solana
 */

import { InputField, SelectField } from "@/components/qr-code";
import type { FormProps } from "./types";

export function BitcoinForm({ data, updateField, t }: FormProps) {
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

export function EthereumForm({ data, updateField, t }: FormProps) {
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

export function CardanoForm({ data, updateField, t }: FormProps) {
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

export function SolanaForm({ data, updateField, t }: FormProps) {
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

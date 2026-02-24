/**
 * QR Code Form Types
 *
 * Shared type definitions for QR code form components
 */

export interface FormProps {
  data: Record<string, unknown>;
  updateField: (field: string, value: unknown) => void;
  t: (key: string) => string;
}

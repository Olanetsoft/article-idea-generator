/**
 * Tool-related types
 */

export type ToolIcon =
  | "document"
  | "calculator"
  | "chart"
  | "clock"
  | "qrcode"
  | "text"
  | "code";

export interface Tool {
  id: string;
  nameKey: string;
  descriptionKey: string;
  href: string;
  icon: ToolIcon;
  available: boolean;
}

export interface ToolCardProps {
  nameKey: string;
  descriptionKey: string;
  href: string;
  icon: ToolIcon;
  available?: boolean;
}

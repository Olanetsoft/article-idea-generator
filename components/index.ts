// Central exports for all components
// Import from @/components instead of individual paths

export { default as Header } from "./Header";
export { default as Footer } from "./Footer";
export { default as LanguageSwitcher } from "./LanguageSwitcher";
export { default as ErrorBoundary } from "./ErrorBoundary";
export { default as ToolCard } from "./ToolCard";
export { default as ResizablePanel } from "./ResizablePanel";
export { default as ErrorPageLayout, ErrorActions } from "./ErrorPageLayout";
export { default as AbstractDisplay } from "./AbstractDisplay/AbstractDisplay";
export { DashboardLayout } from "./DashboardLayout";

// Tool components
export { StatsPanel, type TextStats } from "./tools";

// Skeleton components
export {
  Skeleton,
  TitleCardSkeleton,
  TitleListSkeleton,
  AbstractSkeleton,
  SearchSkeleton,
} from "./Skeleton";

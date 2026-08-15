import {
  ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
} from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** Visually hide the title while keeping it for screen readers */
  hideTitle?: boolean;
  children: ReactNode;
  /** Tailwind max-width class for the panel */
  maxWidthClassName?: string;
  /** Extra classes for the panel */
  className?: string;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible modal dialog: role="dialog", aria-modal, labelled title,
 * focus trap, Escape to close, scroll lock, overscroll containment,
 * and focus restoration to the trigger on close.
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  hideTitle = false,
  children,
  maxWidthClassName = "max-w-md",
  className = "",
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const titleId = useId();

  // Focus management: remember trigger, focus panel on open, restore on close
  useEffect(() => {
    if (!isOpen) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    if (panel) {
      const first = panel.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (first ?? panel).focus();
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onKeyDown={handleKeyDown}
    >
      <div
        className="absolute inset-0 bg-black/50"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative w-full ${maxWidthClassName} max-h-[85vh] overflow-y-auto overscroll-contain rounded-xl border border-gray-200 bg-white p-6 shadow-lg outline-none dark:border-dark-border dark:bg-dark-card ${className}`}
      >
        <h2
          id={titleId}
          className={
            hideTitle
              ? "sr-only"
              : "mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100"
          }
        >
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}

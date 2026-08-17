import { RefObject, useEffect } from "react";

interface UseDismissOptions {
  /** Return focus to this element when dismissed via Escape */
  returnFocusRef?: RefObject<HTMLElement>;
}

/**
 * Dismissal behavior for dropdowns/popovers: closes on outside pointer-down
 * and on Escape (restoring focus to the trigger). Listeners are only
 * attached while `isOpen` is true.
 */
export function useDismiss(
  ref: RefObject<HTMLElement>,
  isOpen: boolean,
  onDismiss: () => void,
  options: UseDismissOptions = {}
) {
  const { returnFocusRef } = options;

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (ref.current && target && !ref.current.contains(target)) {
        onDismiss();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onDismiss();
        returnFocusRef?.current?.focus?.();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [ref, isOpen, onDismiss, returnFocusRef]);
}

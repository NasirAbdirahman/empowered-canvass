import { useState, useCallback } from "react";

/**
 * Custom hook for managing boolean toggle state
 * Use for modals, dropdowns, password visibility, and other UI elements that need to be shown/hidden
 *
 * @param initialValue - Initial state value (default: false)
 * @returns Object with isOpen state and toggle functions
 *
 * @example
 * const modal = useToggle();
 * // modal.isOpen, modal.open(), modal.close(), modal.toggle()
 */
export function useToggle(initialValue = false) {
  const [isOpen, setIsOpen] = useState(initialValue);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}

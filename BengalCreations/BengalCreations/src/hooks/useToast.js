import { useState, useRef, useCallback } from "react";

/**
 * Provides a toast notification system.
 * Returns { toast, showToast } where:
 *   - toast: { msg: string, visible: boolean }
 *   - showToast(msg): triggers the toast for 3 s
 */
export function useToast() {
  const [toast, setToast] = useState({ msg: "", visible: false });
  const timerRef = useRef(null);

  const showToast = useCallback((msg) => {
    setToast({ msg, visible: true });
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(
      () => setToast((t) => ({ ...t, visible: false })),
      3000
    );
  }, []);

  return { toast, showToast };
}

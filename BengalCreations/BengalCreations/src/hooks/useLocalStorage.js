import { useState, useCallback } from "react";

/**
 * useState backed by localStorage.
 * Serialises/deserialises JSON automatically.
 *
 * @param {string} key        - localStorage key
 * @param {*}      initial    - fallback when key is absent
 */
export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });

  const set = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next;
        try {
          localStorage.setItem(key, JSON.stringify(resolved));
        } catch (e) {
          console.warn(`useLocalStorage: could not write key "${key}"`, e);
        }
        return resolved;
      });
    },
    [key]
  );

  return [value, set];
}

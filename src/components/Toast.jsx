/**
 * Lightweight toast notification strip.
 * Rendered once at the App level; shown/hidden via CSS class.
 */
export default function Toast({ message, visible }) {
  return <div className={`toast${visible ? " show" : ""}`}>{message}</div>;
}

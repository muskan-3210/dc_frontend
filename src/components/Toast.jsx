import { useEffect } from "react";

// Small notice fixed at the top right; closes itself after `duration` ms.
export default function Toast({ message, onClose, duration = 3000 }) {
  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message]);

  if (!message) return null;

  return (
    <div className="toast" role="status">
      <span>{message}</span>
      <button type="button" aria-label="Close" onClick={onClose}>
        ×
      </button>
    </div>
  );
}

import React from "react";
interface FloatingToastProps {
  message: string;
  onClose: () => void;
}
const FloatingToast: React.FC<FloatingToastProps> = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <div className="fixed bottom-10 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 px-4">
      <div className="flex items-center gap-4 rounded-lg bg-black/80 px-6 py-4 text-white shadow-lg">
        <span className="font-semibold text-2xl">{message}</span>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto text-white transition-colors hover:text-gray-200"
          aria-label="Cerrar notificacion"
        >
          X
        </button>
      </div>
    </div>
  );
};
export default FloatingToast;

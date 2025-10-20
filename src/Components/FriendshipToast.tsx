

import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export interface FriendshipNotification {
  id: string;
  type:
    | "new_request"
    | "request_accepted"
    | "request_declined"
    | "friendship_removed"
    | "user_blocked";
  username: string;
  message?: string;
  userId?: string;
  timestamp: number;
}

interface FriendshipToastProps {
  notification: FriendshipNotification;
  onClose: () => void;
}

const TOAST_DURATION = 5000;

const getNotificationContent = (notification: FriendshipNotification) => {
  switch (notification.type) {
    case "new_request":
      return {
        icon: "👋",
        title: "¡Nueva solicitud de amistad!",
        message: `${notification.username} te ha enviado una solicitud de amistad.`,
        bgColor: "bg-blue-600",
        borderColor: "border-blue-500",
      };
    case "request_accepted":
      return {
        icon: "✅",
        title: "¡Solicitud aceptada!",
        message: `${notification.username} ha aceptado tu solicitud de amistad.`,
        bgColor: "bg-green-600",
        borderColor: "border-green-500",
      };
    case "request_declined":
      return {
        icon: "❌",
        title: "Solicitud rechazada",
        message: `${notification.username} ha rechazado tu solicitud de amistad.`,
        bgColor: "bg-red-600",
        borderColor: "border-red-500",
      };
    case "friendship_removed":
      return {
        icon: "💔",
        title: "Amistad eliminada",
        message: `${notification.username} te ha eliminado de su lista de amigos.`,
        bgColor: "bg-orange-600",
        borderColor: "border-orange-500",
      };
    case "user_blocked":
      return {
        icon: "🚫",
        title: "Usuario bloqueado",
        message: `${notification.username} te ha bloqueado.`,
        bgColor: "bg-red-700",
        borderColor: "border-red-600",
      };
    default:
      return {
        icon: "📢",
        title: "Notificación",
        message: notification.message || "",
        bgColor: "bg-gray-600",
        borderColor: "border-gray-500",
      };
  }
};

const FriendshipToast: React.FC<FriendshipToastProps> = ({ notification, onClose }) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleClose = useCallback(() => {
    setIsRemoving(true);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  const handleNotificationClick = useCallback(() => {
    handleClose();
    if (notification.userId) {
      navigate(`/profile/${notification.userId}`);
    } else {
      navigate("/friends");
    }
  }, [notification.userId, navigate, handleClose]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => {
      handleClose();
    }, TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [isVisible, handleClose]);

  const content = getNotificationContent(notification);

  return (
    <div
      className={`
        relative z-50 w-full max-w-sm
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isRemoving ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
      `}
    >
      <div
        onClick={handleNotificationClick}
        className={`
          ${content.bgColor} ${content.borderColor}
          border-l-4 rounded-lg shadow-lg p-4 text-white
          hover:shadow-xl transition-shadow duration-200 cursor-pointer
        `}
      >
        <div className="flex items-start gap-3">
          <div className="text-3xl flex-shrink-0">{content.icon}</div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-lg mb-2">{content.title}</h4>
            <p className="text-base text-gray-100 leading-relaxed">
              {content.message}
            </p>
            {notification.message && notification.type === "new_request" && (
              <p className="text-sm text-gray-200 mt-2 italic">
                "{notification.message}"
              </p>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="text-white/80 hover:text-white flex-shrink-0 text-xl leading-none p-1"
            aria-label="Cerrar notificación"
          >
            ×
          </button>
        </div>

        <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className={`h-full bg-white/60 rounded-full transition-all duration-[${TOAST_DURATION}ms]`}
            style={{ width: isVisible && !isRemoving ? "100%" : "0%" }}
          />
        </div>
      </div>
    </div>
  );
};

export default FriendshipToast;

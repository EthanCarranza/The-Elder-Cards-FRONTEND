import React from "react";
import { useFriendshipToast } from "../hooks/useFriendshipToast";
import { useAuth } from "../hooks/useAuth";

const FriendshipNotificationTestPanel: React.FC = () => {
  const { showNotification, clearAll } = useFriendshipToast();
  const { user } = useAuth();
  const currentUserId = user?.userId;

  const testNotifications = [
    {
      type: "new_request" as const,
      username: "JackDliskin64",
      message: "¡Hola! Me gustaría ser tu amigo",
      userId: currentUserId,
    },
    {
      type: "request_accepted" as const,
      username: "ElenaGamer",
      userId: currentUserId,
    },
    {
      type: "request_declined" as const,
      username: "CarlosElMago",
      userId: currentUserId,
    },
    {
      type: "friendship_removed" as const,
      username: "OldFriendUser",
      userId: currentUserId,
    },
    {
      type: "user_blocked" as const,
      username: "BlockerUser",
      userId: currentUserId,
    },
  ];

  return (
    <div className="fixed bottom-4 left-4 bg-gray-800 p-4 rounded-lg shadow-lg z-40">
      <h3 className="text-white font-semibold mb-3">
        🔧 Test - Notificaciones Clickeables
      </h3>
      <p className="text-gray-300 text-xs mb-3">
        Haz click en las notificaciones para probar redirección.{" "}
        <span className="text-gray-400">
          {currentUserId
            ? `Irán a /profile/${currentUserId}`
            : "Si no hay sesión, irán a /friends"}
        </span>
      </p>
      <div className="space-y-2">
        {testNotifications.map((notification, index) => (
          <button
            key={index}
            onClick={() => showNotification(notification)}
            className="block w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
          >
            {notification.type === "new_request" && "🔔 Nueva solicitud"}
            {notification.type === "request_accepted" &&
              "✅ Solicitud aceptada"}
            {notification.type === "request_declined" &&
              "❌ Solicitud rechazada"}
            {notification.type === "friendship_removed" &&
              "💔 Amistad eliminada"}
            {notification.type === "user_blocked" && "🚫 Usuario bloqueado"}
            {currentUserId && (
              <span className="text-gray-400 text-xs block">
                → {notification.username} (ID: {currentUserId})
              </span>
            )}
          </button>
        ))}
        <button
          onClick={clearAll}
          className="block w-full text-left px-3 py-2 bg-red-700 hover:bg-red-600 text-white text-sm rounded transition-colors mt-3"
        >
          🗑️ Limpiar todas
        </button>
      </div>
    </div>
  );
};

const FriendshipNotificationTestPanelConditional: React.FC = () => {
  if (import.meta.env.MODE !== "development") {
    return null;
  }

  return <FriendshipNotificationTestPanel />;
};

export default FriendshipNotificationTestPanelConditional;

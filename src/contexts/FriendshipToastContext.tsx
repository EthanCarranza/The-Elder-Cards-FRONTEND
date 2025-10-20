import React, { useCallback, useState } from "react";
import { FriendshipNotification } from "../Components/FriendshipToast";
import { FriendshipToastContext } from "./FriendshipToastContextDefinition";

interface FriendshipToastProviderProps {
  children: React.ReactNode;
}

export const FriendshipToastProvider: React.FC<
  FriendshipToastProviderProps
> = ({ children }) => {
  const [notifications, setNotifications] = useState<FriendshipNotification[]>(
    []
  );

  const showNotification = useCallback(
    (notification: Omit<FriendshipNotification, "id" | "timestamp">) => {
      const newNotification: FriendshipNotification = {
        ...notification,
        id: `${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
      };

      setNotifications((prev) => [...prev, newNotification]);
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    notifications,
    showNotification,
    removeNotification,
    clearAll,
  };

  return (
    <FriendshipToastContext.Provider value={value}>
      {children}
    </FriendshipToastContext.Provider>
  );
};

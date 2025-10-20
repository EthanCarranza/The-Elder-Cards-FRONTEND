import React, { useCallback } from "react";
import { useSocketNotifications } from "../hooks/useSocketNotifications";
import { MessageNotificationsContext } from "./MessageNotificationsContextDefinition";

interface MessageNotificationsProviderProps {
  children: React.ReactNode;
}

export const MessageNotificationsProvider: React.FC<
  MessageNotificationsProviderProps
> = ({ children }) => {
  const {
    unreadCount,
    connected,
    error,
    requestInitialCounts,
    incrementUnreadCount: socketIncrementUnread,
    decrementUnreadCount: socketDecrementUnread,
  } = useSocketNotifications();

  const updateUnreadCount = useCallback(() => {
    requestInitialCounts();
  }, [requestInitialCounts]);

  const incrementUnreadCount = useCallback(() => {
    socketIncrementUnread();
  }, [socketIncrementUnread]);

  const decrementUnreadCount = useCallback(() => {
    socketDecrementUnread();
  }, [socketDecrementUnread]);

  const value = {
    unreadCount,
    updateUnreadCount,
    incrementUnreadCount,
    decrementUnreadCount,
    loading: !connected && !error,
  };

  return (
    <MessageNotificationsContext.Provider value={value}>
      {children}
    </MessageNotificationsContext.Provider>
  );
};

import { createContext } from 'react';
export interface MessageNotificationsContextType {
  unreadCount: number;
  updateUnreadCount: () => void;
  incrementUnreadCount: () => void;
  decrementUnreadCount: () => void;
  loading: boolean;
}
export const MessageNotificationsContext = createContext<MessageNotificationsContextType | undefined>(undefined);

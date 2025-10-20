import { useContext } from 'react';
import { MessageNotificationsContext, MessageNotificationsContextType } from '../contexts/MessageNotificationsContextDefinition';
export const useMessageNotifications = (): MessageNotificationsContextType => {
  const context = useContext(MessageNotificationsContext);
  if (context === undefined) {
    throw new Error('useMessageNotifications must be used within a MessageNotificationsProvider');
  }
  return context;
};

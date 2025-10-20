import { createContext } from 'react';

export interface FriendshipNotificationsContextType {
  pendingRequestsCount: number;
  connected: boolean;
  error: string | null;
  refreshCount: () => void;
  decrementCount: () => void;
  incrementCount: () => void;
  loading: boolean;
}

export const FriendshipNotificationsContext = createContext<FriendshipNotificationsContextType | undefined>(undefined);
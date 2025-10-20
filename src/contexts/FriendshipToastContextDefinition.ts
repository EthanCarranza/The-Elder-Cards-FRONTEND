import { createContext } from "react";
import { FriendshipNotification } from "../Components/FriendshipToast";

interface FriendshipToastContextType {
  notifications: FriendshipNotification[];
  showNotification: (
    notification: Omit<FriendshipNotification, "id" | "timestamp">
  ) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const FriendshipToastContext =
  createContext<FriendshipToastContextType | null>(null);

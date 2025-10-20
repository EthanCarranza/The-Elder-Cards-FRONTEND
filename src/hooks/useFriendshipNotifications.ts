import { useContext } from "react";
import { FriendshipNotificationsContext, FriendshipNotificationsContextType } from "../contexts/FriendshipNotificationsContextDefinition";

export const useFriendshipNotifications = (): FriendshipNotificationsContextType => {
  const context = useContext(FriendshipNotificationsContext);
  
  if (context === undefined) {
    throw new Error("useFriendshipNotifications debe ser usado dentro de un FriendshipNotificationsProvider");
  }
  
  return context;
};
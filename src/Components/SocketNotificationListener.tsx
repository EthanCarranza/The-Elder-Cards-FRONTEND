import React from "react";
import { useSocketFriendshipNotifications } from "../hooks/useSocketFriendshipNotifications";

interface SocketNotificationListenerProps {
  children: React.ReactNode;
}

const SocketNotificationListener: React.FC<SocketNotificationListenerProps> = ({
  children,
}) => {

  useSocketFriendshipNotifications();

  return <>{children}</>;
};

export default SocketNotificationListener;

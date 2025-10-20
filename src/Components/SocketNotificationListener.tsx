import React from "react";
import { useSocketFriendshipNotifications } from "../hooks/useSocketFriendshipNotifications";

interface SocketNotificationListenerProps {
  children: React.ReactNode;
}

const SocketNotificationListener: React.FC<SocketNotificationListenerProps> = ({
  children,
}) => {
  console.log(
    "SocketNotificationListener: Componente montado - iniciando escucha de eventos"
  );

  useSocketFriendshipNotifications();

  return <>{children}</>;
};

export default SocketNotificationListener;

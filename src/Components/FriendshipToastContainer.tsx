import React from "react";
import { useFriendshipToast } from "../hooks/useFriendshipToast";
import FriendshipToast from "./FriendshipToast";

const FriendshipToastContainer: React.FC = () => {
  const { notifications, removeNotification } = useFriendshipToast();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full">
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto w-full">
          <FriendshipToast
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default FriendshipToastContainer;

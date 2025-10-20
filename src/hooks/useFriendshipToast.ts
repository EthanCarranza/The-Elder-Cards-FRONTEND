import { useContext } from "react";
import { FriendshipToastContext } from "../contexts/FriendshipToastContextDefinition";

export const useFriendshipToast = () => {
  const context = useContext(FriendshipToastContext);

  if (!context) {
    throw new Error(
      "useFriendshipToast must be used within a FriendshipToastProvider"
    );
  }

  return context;
};

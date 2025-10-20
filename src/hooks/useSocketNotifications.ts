import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./useAuth";

interface NotificationCounts {
  unreadCount: number;
  pendingCount: number;
}

interface UseSocketNotificationsReturn {
  unreadCount: number;
  pendingCount: number;
  connected: boolean;
  error: string | null;
  requestInitialCounts: () => void;
  incrementUnreadCount: () => void;
  decrementUnreadCount: () => void;
  incrementPendingCount: () => void;
  decrementPendingCount: () => void;
  onNewFriendRequest: (callback: (request: unknown) => void) => void;
  onFriendRequestResponse: (callback: (response: unknown) => void) => void;
  onNewMessage: (callback: (message: unknown) => void) => void;
  onFriendshipRemoved: (callback: (payload: unknown) => void) => void;
  onUserBlocked: (callback: (payload: unknown) => void) => void;
}

export const useSocketNotifications = (): UseSocketNotificationsReturn => {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestInitialCounts = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("request_initial_counts");
    }
  }, []);

  const incrementUnreadCount = useCallback(() => {
    setUnreadCount((prev) => prev + 1);
  }, []);

  const decrementUnreadCount = useCallback(() => {
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const incrementPendingCount = useCallback(() => {
    setPendingCount((prev) => prev + 1);
  }, []);

  const decrementPendingCount = useCallback(() => {
    setPendingCount((prev) => Math.max(0, prev - 1));
  }, []);

  const newFriendRequestCallbackRef = useRef<
    ((request: unknown) => void) | null
  >(null);
  const friendRequestResponseCallbackRef = useRef<
    ((response: unknown) => void) | null
  >(null);
  const newMessageCallbackRef = useRef<((message: unknown) => void) | null>(
    null
  );
  const friendshipRemovedCallbackRef = useRef<
    ((payload: unknown) => void) | null
  >(null);
  const userBlockedCallbackRef = useRef<((payload: unknown) => void) | null>(
    null
  );

  const onNewFriendRequest = useCallback(
    (callback: (request: unknown) => void) => {
      newFriendRequestCallbackRef.current = callback;
    },
    []
  );

  const onFriendRequestResponse = useCallback(
    (callback: (response: unknown) => void) => {
      friendRequestResponseCallbackRef.current = callback;
    },
    []
  );

  const onNewMessage = useCallback((callback: (message: unknown) => void) => {
    newMessageCallbackRef.current = callback;
  }, []);

  const onFriendshipRemoved = useCallback(
    (callback: (payload: unknown) => void) => {
      friendshipRemovedCallbackRef.current = callback;
    },
    []
  );

  const onUserBlocked = useCallback((callback: (payload: unknown) => void) => {
    userBlockedCallbackRef.current = callback;
  }, []);

  useEffect(() => {
    if (!user?.token) {
      setUnreadCount(0);
      setPendingCount(0);
      setConnected(false);
      setError(null);

      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    let serverUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || "http://localhost:3000";
    
    serverUrl = serverUrl.replace(/\/api\/v1\/?$/, "");
    
    console.log("Conectando Socket.IO a:", serverUrl);

    const socket = io(serverUrl, {
      auth: {
        token: user.token,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket.IO conectado exitosamente");
      setConnected(true);
      setError(null);
      socket.emit("request_initial_counts");
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket.IO desconectado:", reason);
      setConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket.IO error de conexión:", err.message);
      setError(`Error de conexión: ${err.message}`);
      setConnected(false);
    });

    socket.on("notification_counts", (data: NotificationCounts) => {
      setUnreadCount(data.unreadCount);
      setPendingCount(data.pendingCount);
    });

    socket.on("unread_count_updated", (data: { unreadCount: number }) => {
      setUnreadCount(data.unreadCount);
    });

    socket.on("pending_requests_updated", (data: { pendingCount: number }) => {
      setPendingCount(data.pendingCount);
    });

    socket.on("new_message", (message) => {
      if (newMessageCallbackRef.current) {
        newMessageCallbackRef.current(message);
      }
    });

    socket.on("new_friend_request", (request) => {
      console.log("📨 Socket: Nueva solicitud de amistad recibida", request);
      if (newFriendRequestCallbackRef.current) {
        newFriendRequestCallbackRef.current(request);
      }
    });

    socket.on("friend_request_response", (response) => {
      console.log("📨 Socket: Respuesta a solicitud recibida", response);
      if (friendRequestResponseCallbackRef.current) {
        friendRequestResponseCallbackRef.current(response);
      }
    });

    socket.on("friendship_removed", (payload) => {
      if (friendshipRemovedCallbackRef.current) {
        friendshipRemovedCallbackRef.current(payload);
      }
    });

    socket.on("user_blocked", (payload) => {
      if (userBlockedCallbackRef.current) {
        userBlockedCallbackRef.current(payload);
      }
    });

    socket.on("notification_error", (error: string) => {
      setError(error);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user?.token]);

  return {
    unreadCount,
    pendingCount,
    connected,
    error,
    requestInitialCounts,
    incrementUnreadCount,
    decrementUnreadCount,
    incrementPendingCount,
    decrementPendingCount,
    onNewFriendRequest,
    onFriendRequestResponse,
    onNewMessage,
    onFriendshipRemoved,
    onUserBlocked,
  };
};

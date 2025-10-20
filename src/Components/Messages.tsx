import { useCallback, useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useMessageNotifications } from "../hooks/useMessageNotifications";
import { apiFetch } from "./api";
import { extractErrorMessage } from "../utils/errors";
import PageLayout from "./PageLayout";
import { DEFAULT_PROFILE_IMAGE } from "../constants/user";
interface User {
  _id: string;
  username?: string;
  email?: string;
  image?: string;
}
interface Message {
  _id: string;
  sender: User;
  recipient: User;
  content: string;
  createdAt: string;
  isRead: boolean;
}
interface Conversation {
  userId: string;
  user: User;
  lastMessage: {
    _id: string;
    content: string;
    createdAt: string;
    sender: string;
    isRead: boolean;
  } | null;
  unreadCount: number;
}
const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { userId: chatUserId } = useParams();
  const [searchParams] = useSearchParams();
  const { updateUnreadCount } = useMessageNotifications();
  const [error, setError] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showConversations, setShowConversations] = useState(true);
  const [relationshipStatus, setRelationshipStatus] = useState<
    | "friends"
    | "sent"
    | "received"
    | "blocked"
    | "blocked_by"
    | "none"
    | "unknown"
  >("unknown");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const getUserDisplayName = (user: User) => {
    return user.username || user.email || "Usuario";
  };
  const getUserAvatar = (user: User) => {
    return user.image || DEFAULT_PROFILE_IMAGE;
  };
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    if (diffInHours < 24) {
      return date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const loadConversations = useCallback(async () => {
    if (!user) return;
    setLoadingConversations(true);
    try {
      const response = await apiFetch<{ conversations: Conversation[] }>(
        "/messages/conversations",
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setConversations(response.data.conversations || []);
      updateUnreadCount();
    } catch (err) {
      console.error("Error al cargar conversaciones:", err);
      setError(extractErrorMessage(err, "Error al cargar conversaciones"));
    } finally {
      setLoadingConversations(false);
    }
  }, [user, updateUnreadCount]);
  const loadMessages = useCallback(
    async (otherUserId: string) => {
      if (!user) {
        return;
      }
      setLoadingMessages(true);
      setMessages([]);
      setError("");
      try {
        const response = await apiFetch<{ messages: Message[] }>(
          `/messages/conversation/${otherUserId}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        setMessages(response.data.messages || []);
        await apiFetch(`/messages/read/${otherUserId}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${user.token}` },
        });
        await Promise.all([loadConversations(), updateUnreadCount()]);
        setTimeout(scrollToBottom, 100);
      } catch (err: unknown) {
        console.error("Error al cargar mensajes:", err);
        const status = (err as { response?: { status?: number } })?.response
          ?.status;
        if (status === 404) {
          setMessages([]);
        } else {
          setError(extractErrorMessage(err, "Error al cargar mensajes"));
        }
      } finally {
        setLoadingMessages(false);
      }
    },
    [user, loadConversations, updateUnreadCount]
  );
  const loadRelationship = useCallback(
    async (otherUserId: string) => {
      if (!user) return;
      try {
        const res = await apiFetch<{ status: string }>(
          `/friendships/status/${otherUserId}`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        const status = (res.data.status || "none") as typeof relationshipStatus;
        setRelationshipStatus(status);
      } catch (err) {
        console.error("Error al obtener estado de relación:", err);
        setRelationshipStatus("none");
      }
    },
    [user]
  );
  const sendMessage = async () => {
    if (!user || !activeChat || !newMessage.trim()) return;
    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage("");
    try {
      const response = await apiFetch<{ data: Message }>("/messages", {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
        body: {
          recipientId: activeChat,
          content: messageContent,
        },
      });
      setMessages((prev) => [...prev, response.data.data]);
      await loadConversations();
      updateUnreadCount();
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
      setError(extractErrorMessage(err, "Error al enviar mensaje"));
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };
  const handleConversationSelect = async (userId: string) => {
    setActiveChat(userId);
    setActiveChat(userId);
    setShowConversations(false);
    navigate(`/messages/${userId}`, { replace: true });
    await Promise.all([loadMessages(userId), loadRelationship(userId)]);
  };
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);
  useEffect(() => {
    const targetUserId = chatUserId || searchParams.get("with");
    if (targetUserId && targetUserId !== activeChat) {
      setActiveChat(targetUserId);
      loadMessages(targetUserId);
      loadRelationship(targetUserId);
      if (window.innerWidth < 768) {
        setShowConversations(false);
      }
    }
  }, [chatUserId, searchParams, activeChat, loadMessages, loadRelationship]);
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowConversations(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  if (!user) {
    return (
      <PageLayout contentClassName="flex items-center justify-center min-h-screen">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Inicia sesión</h2>
          <p>Necesitas iniciar sesión para ver tus mensajes</p>
        </div>
      </PageLayout>
    );
  }
  let activeChatUser = activeChat
    ? conversations.find((c) => c.userId === activeChat)?.user
    : null;
  if (!activeChatUser && user?.role === "admin" && activeChat) {
    const tempUserRaw = window.sessionStorage.getItem("adminTempChatUser");
    if (tempUserRaw) {
      try {
        const tempUser = JSON.parse(tempUserRaw);
        if (tempUser && tempUser._id === activeChat) {
          activeChatUser = tempUser;
          if (!conversations.some((c) => c.userId === activeChat)) {
            conversations.push({
              userId: activeChat,
              user: tempUser,
              lastMessage: null,
              unreadCount: 0,
            });
          }
        }
      } catch (error) {
        console.error("Error al obtener el usuario temporal:", error);
      }
    }
  }
  return (
    <div className="h-screen w-full bg-black flex flex-col">
      <div className="h-full w-full flex overflow-hidden">
        {}
        <div
          className={`${
            showConversations
              ? "w-full md:w-1/3 lg:w-1/4"
              : "hidden md:flex md:w-1/3 lg:w-1/4"
          } bg-gray-800 border-r border-gray-700 flex flex-col transition-all duration-300 ease-in-out`}
        >
          <div className="p-3 md:p-4 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="text-white hover:text-blue-300 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <h1 className="text-lg md:text-xl font-bold text-white">
                Mensajes
              </h1>
            </div>
            {!showConversations && (
              <button
                onClick={() => setShowConversations(true)}
                className="md:hidden text-white hover:text-blue-300 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingConversations ? (
              <div className="p-3 md:p-4 text-center text-gray-400">
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className="text-sm md:text-base">
                    Cargando conversaciones...
                  </span>
                </div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-3 md:p-4 text-center text-gray-400">
                <h3 className="font-medium mb-2 text-sm md:text-base">
                  No tienes conversaciones
                </h3>
                <p className="text-xs md:text-sm mb-3">
                  Ve a tu lista de amigos para enviar un mensaje
                </p>
                <button
                  onClick={() => navigate("/friends")}
                  className="mt-2 px-3 py-2 md:px-4 md:py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded text-xs md:text-sm transition-colors touch-manipulation min-h-[44px]"
                >
                  Ver amigos
                </button>
              </div>
            ) : (
              <div className="space-y-1 p-1 md:p-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.userId}
                    onClick={() =>
                      handleConversationSelect(conversation.userId)
                    }
                    className={`p-3 md:p-3 rounded-lg cursor-pointer transition-colors touch-manipulation ${
                      activeChat === conversation.userId
                        ? "bg-blue-600 text-white"
                        : "hover:bg-gray-700 text-gray-300 active:bg-gray-600"
                    }`}
                  >
                    <div className="flex items-center gap-2 md:gap-3">
                      <img
                        src={getUserAvatar(conversation.user)}
                        alt={getUserDisplayName(conversation.user)}
                        className="w-10 h-10 md:w-10 md:h-10 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="font-medium truncate text-sm md:text-base">
                            {getUserDisplayName(conversation.user)}
                          </div>
                          {conversation.unreadCount > 0 && (
                            <div className="bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 flex-shrink-0">
                              {conversation.unreadCount}
                            </div>
                          )}
                        </div>
                        <div className="text-xs md:text-sm opacity-75 truncate">
                          {conversation.lastMessage
                            ? conversation.lastMessage.content
                            : "Sin mensajes aún"}
                        </div>
                        {conversation.lastMessage && (
                          <div className="text-xs opacity-50">
                            {formatMessageTime(
                              conversation.lastMessage.createdAt
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {}
        <div
          className={`${
            showConversations ? "hidden md:flex" : "flex"
          } flex-1 flex-col bg-gray-900 transition-all duration-300 ease-in-out h-full`}
        >
          {activeChat && activeChatUser ? (
            <>
              {}
              <div className="sticky top-0 z-20 p-3 md:p-4 bg-gray-800 border-b border-gray-700 flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      setShowConversations(true);
                    } else {
                      navigate(-1);
                    }
                  }}
                  className="text-white hover:text-blue-300 transition-colors mr-2"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <div
                  className="flex items-center gap-2 cursor-pointer group"
                  onClick={() => navigate(`/profile/${activeChat}`)}
                >
                  <img
                    src={getUserAvatar(activeChatUser)}
                    alt={getUserDisplayName(activeChatUser)}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover group-hover:ring-2 group-hover:ring-blue-400"
                  />
                  <div className="font-medium text-white text-sm md:text-base truncate group-hover:text-blue-300">
                    {getUserDisplayName(activeChatUser)}
                  </div>
                </div>
              </div>
              {}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-2 md:p-4 space-y-2 md:space-y-4 overscroll-contain"
              >
                {loadingMessages ? (
                  <div className="text-center text-gray-400 py-4">
                    Cargando mensajes...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <p>No hay mensajes aún</p>
                    <p className="text-sm">¡Envía el primer mensaje!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${
                        message.sender._id === user.userId
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[75%] md:max-w-xs lg:max-w-md px-3 py-2 md:px-4 md:py-2 rounded-lg ${
                          message.sender._id === user.userId
                            ? "bg-blue-600 text-white"
                            : "bg-gray-700 text-gray-100"
                        }`}
                      >
                        <div className="break-words text-sm md:text-base">
                          {message.content}
                        </div>
                        <div
                          className={`text-xs mt-1 ${
                            message.sender._id === user.userId
                              ? "text-blue-200"
                              : "text-gray-400"
                          }`}
                        >
                          {formatMessageTime(message.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              {}
              <div className="p-3 md:p-4 bg-gray-800 border-t border-gray-700 pb-safe flex-shrink-0">
                {(() => {
                  const blockedBy = relationshipStatus === "blocked_by";
                  const iBlocked = relationshipStatus === "blocked";
                  const nonFriendStatuses: ReadonlyArray<
                    typeof relationshipStatus
                  > = ["none", "sent", "received"];
                  const notFriends =
                    nonFriendStatuses.includes(relationshipStatus);
                  const isAdmin = user?.role === "admin";
                  const isUnknown = relationshipStatus === "unknown";
                  if (blockedBy) {
                    return (
                      <div className="text-center text-red-300 bg-red-900/20 border border-red-700 rounded-lg px-3 py-2 text-sm md:text-base">
                        Este usuario te ha bloqueado
                      </div>
                    );
                  }
                  if (iBlocked) {
                    return (
                      <div className="text-center text-yellow-200 bg-yellow-900/20 border border-yellow-700 rounded-lg px-3 py-2 text-sm md:text-base">
                        Has bloqueado a este usuario
                      </div>
                    );
                  }
                  if (notFriends) {
                    if (isAdmin) {
                      return (
                        <div className="flex gap-2 md:gap-3 items-end">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                              if (
                                e.key === "Enter" &&
                                !sending &&
                                newMessage.trim()
                              ) {
                                sendMessage();
                              }
                            }}
                            placeholder="Escribe un mensaje..."
                            className="flex-1 px-3 py-2 md:px-4 md:py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                            inputMode="text"
                            autoFocus
                            onFocus={() => {
                              if (window.innerWidth < 768) {
                                setTimeout(() => {
                                  messagesEndRef.current?.scrollIntoView({
                                    behavior: "smooth",
                                  });
                                }, 200);
                              }
                            }}
                            disabled={sending}
                          />
                          <button
                            onClick={sendMessage}
                            disabled={sending || !newMessage.trim()}
                            className="px-4 py-2 md:px-6 md:py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-sm md:text-base min-w-[60px] md:min-w-[80px]"
                          >
                            Enviar
                          </button>
                        </div>
                      );
                    } else {
                      return (
                        <div className="text-center text-gray-200 bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-sm md:text-base">
                          Este usuario no es tu amigo
                        </div>
                      );
                    }
                  }
                  if (isUnknown) {
                    return (
                      <div className="text-center text-gray-300 bg-gray-700/30 border border-gray-600/50 rounded-lg px-3 py-2 text-sm md:text-base">
                        Comprobando relación...
                      </div>
                    );
                  }
                  return (
                    <div className="flex gap-2 md:gap-3 items-end">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 px-3 py-2 md:px-4 md:py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                        inputMode="text"
                        autoFocus
                        onFocus={() => {
                          if (window.innerWidth < 768) {
                            setTimeout(() => {
                              messagesEndRef.current?.scrollIntoView({
                                behavior: "smooth",
                              });
                            }, 200);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        disabled={sending}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={sending || !newMessage.trim()}
                        className="px-4 py-2 md:px-6 md:py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-sm md:text-base min-w-[60px] md:min-w-[80px]"
                      >
                        {sending ? (
                          <span className="block md:hidden">•••</span>
                        ) : (
                          <svg
                            className="w-5 h-5 md:hidden"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                            />
                          </svg>
                        )}
                        <span className="hidden md:inline">
                          {sending ? "Enviando..." : "Enviar"}
                        </span>
                      </button>
                    </div>
                  );
                })()}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 p-4">
              <div className="text-center">
                <svg
                  className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 opacity-50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <h3 className="text-base md:text-lg font-medium mb-2">
                  Selecciona una conversación
                </h3>
                <p className="text-sm md:text-base">
                  Elige una conversación para empezar a chatear
                </p>
                <button
                  onClick={() => setShowConversations(true)}
                  className="mt-4 md:hidden px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Ver conversaciones
                </button>
              </div>
            </div>
          )}
        </div>
        {}
        {error && (
          <div className="fixed bottom-4 right-4 p-4 bg-red-600/20 border border-red-500 rounded-lg text-red-200 max-w-sm">
            {error}
            <button
              onClick={() => setError("")}
              className="ml-2 text-red-400 hover:text-red-300"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default Messages;

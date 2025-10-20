import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useFriendshipNotifications } from "../hooks/useFriendshipNotifications";
import { useSocketNotifications } from "../hooks/useSocketNotifications";
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
interface Friend {
  friendshipId: string;
  user: User | null;
  friendsSince: string;
}
interface FriendRequest {
  friendshipId: string;
  requester?: User | null;
  recipient?: User | null;
  message?: string;
  createdAt: string;
}
interface SearchUser extends User {
  relationshipStatus:
    | "none"
    | "friends"
    | "sent"
    | "received"
    | "blocked"
    | "blocked_by";
}
type TabType = "friends" | "received" | "sent" | "search" | "blocked";
const Friends = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const friendshipNotifications = useFriendshipNotifications();
  const socketNotifications = useSocketNotifications();

  const [activeTab, setActiveTab] = useState<TabType>("friends");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsCount, setFriendsCount] = useState(0);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [receivedCount, setReceivedCount] = useState(0);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [sentCount, setSentCount] = useState(0);
  const [blockedUsers, setBlockedUsers] = useState<User[]>([]);
  const [blockedCount, setBlockedCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchShowAll, setSearchShowAll] = useState(false);

  const searchQueryRef = useRef(searchQuery);
  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);
  const searchShowAllRef = useRef(searchShowAll);
  useEffect(() => {
    searchShowAllRef.current = searchShowAll;
  }, [searchShowAll]);
  const performSearchRef = useRef<
    ((q: string, showAll?: boolean) => void) | null
  >(null);
  const [processing, setProcessing] = useState<Set<string>>(new Set());
  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      let endpoint = "";
      switch (activeTab) {
        case "friends":
          endpoint = "/friendships";
          break;
        case "received":
          endpoint = "/friendships/pending";
          break;
        case "sent":
          endpoint = "/friendships/sent";
          break;
        case "blocked":
          endpoint = "/friendships/blocked";
          break;
        case "search":
          setLoading(false);
          return;
      }
      const response = await apiFetch<{
        friends?: Friend[];
        requests?: FriendRequest[];
        blockedUsers?: User[];
        count?: number;
      }>(endpoint, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      switch (activeTab) {
        case "friends":
          setFriends(response.data.friends || []);
          setFriendsCount(response.data.count || 0);
          break;
        case "received":
          setReceivedRequests(response.data.requests || []);
          setReceivedCount(response.data.count || 0);
          break;
        case "sent":
          setSentRequests(response.data.requests || []);
          setSentCount(response.data.count || 0);
          break;
        case "blocked":
          setBlockedUsers(response.data.blockedUsers || []);
          setBlockedCount(response.data.count || 0);
          break;
      }
    } catch (err) {
      setError(extractErrorMessage(err, "Error al cargar datos"));
    } finally {
      setLoading(false);
    }
  }, [user, activeTab]);

  const updateAllCounts = useCallback(async () => {
    if (!user) return;
    try {
      const [friendsRes, receivedRes, sentRes, blockedRes] = await Promise.all([
        apiFetch<{ count: number }>("/friendships", {
          headers: { Authorization: `Bearer ${user.token}` },
        }),
        apiFetch<{ count: number }>("/friendships/pending", {
          headers: { Authorization: `Bearer ${user.token}` },
        }),
        apiFetch<{ count: number }>("/friendships/sent", {
          headers: { Authorization: `Bearer ${user.token}` },
        }),
        apiFetch<{ count: number }>("/friendships/blocked", {
          headers: { Authorization: `Bearer ${user.token}` },
        }),
      ]);

      setFriendsCount(friendsRes.data.count || 0);
      setReceivedCount(receivedRes.data.count || 0);
      setSentCount(sentRes.data.count || 0);
      setBlockedCount(blockedRes.data.count || 0);
    } catch (err) {
      console.error("Error updating counts:", err);
    }
  }, [user]);

  const reloadAllData = useCallback(async () => {
    if (!user) return;

    console.log("Recargando TODOS los datos de amistad");

    try {
      const [friendsResponse, receivedResponse, sentResponse, blockedResponse] =
        await Promise.all([
          apiFetch<{ friends: Friend[]; count: number }>("/friendships", {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
          apiFetch<{ requests: FriendRequest[]; count: number }>(
            "/friendships/pending",
            {
              headers: { Authorization: `Bearer ${user.token}` },
            }
          ),
          apiFetch<{ requests: FriendRequest[]; count: number }>(
            "/friendships/sent",
            {
              headers: { Authorization: `Bearer ${user.token}` },
            }
          ),
          apiFetch<{ blockedUsers: User[]; count: number }>(
            "/friendships/blocked",
            {
              headers: { Authorization: `Bearer ${user.token}` },
            }
          ),
        ]);

      setFriends(friendsResponse.data.friends || []);
      setFriendsCount(friendsResponse.data.count || 0);
      setReceivedRequests(receivedResponse.data.requests || []);
      setReceivedCount(receivedResponse.data.count || 0);
      setSentRequests(sentResponse.data.requests || []);
      setSentCount(sentResponse.data.count || 0);
      setBlockedUsers(blockedResponse.data.blockedUsers || []);
      setBlockedCount(blockedResponse.data.count || 0);

      if (activeTab === "search") {
        const fn = performSearchRef.current;
        if (fn) {
          fn(searchQueryRef.current, searchShowAllRef.current);
        }
      }
    } catch (err) {
      console.error("Error recargando todos los datos:", err);
    }
  }, [user, activeTab]);

  const performSearch = useCallback(
    async (query: string, showAll = false) => {
      setSearchShowAll(showAll);
      if (!user) return;

      setSearching(true);
      setError("");

      try {
        let url = `/friendships/users/search`;

        if (showAll) {
          url += `?q=*&all=true`;
        } else {
          if (!query.trim() || query.trim().length < 2) {
            setSearchResults([]);
            setSearching(false);
            return;
          }
          url += `?q=${encodeURIComponent(query.trim())}`;
        }

        const response = await apiFetch<{ users: SearchUser[] }>(url, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setSearchResults(response.data.users || []);
      } catch (err) {
        setError(extractErrorMessage(err, "Error al buscar usuarios"));
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    },
    [user]
  );

  useEffect(() => {
    performSearchRef.current = (q: string, showAll?: boolean) => {
      void (async () => {
        await performSearch(q, showAll);
      })();
    };
  }, [performSearch]);

  const handleSearchAll = () => {
    setSearchShowAll(true);
    setSearchQuery("");
    void performSearch("", true);
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    updateAllCounts();
  }, [updateAllCounts]);

  useEffect(() => {
    if (activeTab !== "search") return;

    if (searchQuery.trim() && searchQuery.trim().length >= 2) {
      performSearch(searchQuery);
    } else if (searchQuery.trim().length === 0) {
      setSearchResults([]);
    }
  }, [searchQuery, activeTab, performSearch]);

  useEffect(() => {
    socketNotifications.onNewFriendRequest(() => {
      console.log("Nueva solicitud recibida - recargando TODO");
      reloadAllData();
    });

    socketNotifications.onFriendRequestResponse(() => {
      console.log("Respuesta a solicitud recibida - recargando TODO");
      reloadAllData();
    });

    socketNotifications.onNewMessage(() => {
      console.log("Nuevo mensaje recibido");
    });

    socketNotifications.onFriendshipRemoved(() => {
      console.log("Amistad eliminada - recargando TODO");
      reloadAllData();
    });
  }, [socketNotifications, reloadAllData]);

  const sendFriendRequest = async (
    recipientId: string,
    message: string = ""
  ) => {
    if (!user || processing.has(recipientId)) return;
    setProcessing((prev) => new Set(prev).add(recipientId));
    setError("");
    try {
      await apiFetch("/friendships", {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
        body: { recipientId, message },
      });
      setSearchResults((prev) =>
        prev.map((u) =>
          u._id === recipientId ? { ...u, relationshipStatus: "sent" } : u
        )
      );
      await reloadAllData();
    } catch (err) {
      setError(extractErrorMessage(err, "Error al enviar solicitud"));
    } finally {
      setProcessing((prev) => {
        const newSet = new Set(prev);
        newSet.delete(recipientId);
        return newSet;
      });
    }
  };
  const respondToRequest = async (
    friendshipId: string,
    action: "accept" | "decline"
  ) => {
    if (!user || processing.has(friendshipId)) return;
    setProcessing((prev) => new Set(prev).add(friendshipId));
    setError("");
    try {
      await apiFetch(`/friendships/${friendshipId}/respond`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${user.token}` },
        body: { action },
      });
      await reloadAllData();
      friendshipNotifications.decrementCount();
      if (action === "accept" && activeTab !== "friends") {
        setActiveTab("friends");
      }
    } catch (err) {
      setError(extractErrorMessage(err, "Error al responder solicitud"));
    } finally {
      setProcessing((prev) => {
        const newSet = new Set(prev);
        newSet.delete(friendshipId);
        return newSet;
      });
    }
  };
  const removeFriendship = async (friendshipId: string) => {
    if (!user || processing.has(friendshipId)) return;
    setProcessing((prev) => new Set(prev).add(friendshipId));
    setError("");
    try {
      await apiFetch(`/friendships/${friendshipId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      await reloadAllData();
    } catch (err) {
      setError(extractErrorMessage(err, "Error al eliminar relación"));
    } finally {
      setProcessing((prev) => {
        const newSet = new Set(prev);
        newSet.delete(friendshipId);
        return newSet;
      });
    }
  };

  const blockUser = async (userId: string) => {
    if (!user || processing.has(userId)) return;
    setProcessing((prev) => new Set(prev).add(userId));
    setError("");
    try {
      await apiFetch(`/friendships/block/${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (activeTab === "search") {
        setSearchResults((prev) =>
          prev.map((u) =>
            u._id === userId ? { ...u, relationshipStatus: "blocked" } : u
          )
        );
      } else {
        await reloadAllData();
      }
    } catch (err) {
      setError(extractErrorMessage(err, "Error al bloquear usuario"));
    } finally {
      setProcessing((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const unblockUser = async (userId: string) => {
    if (!user || processing.has(userId)) return;
    setProcessing((prev) => new Set(prev).add(userId));
    setError("");
    try {
      await apiFetch(`/friendships/block/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (activeTab === "search") {
        setSearchResults((prev) =>
          prev.map((u) =>
            u._id === userId ? { ...u, relationshipStatus: "none" } : u
          )
        );
      } else {
        await reloadAllData();
      }
    } catch (err) {
      setError(extractErrorMessage(err, "Error al desbloquear usuario"));
    } finally {
      setProcessing((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const getUserDisplayName = (user: User | null | undefined) => {
    if (!user) return "Usuario eliminado";
    return user.username || user.email || "Usuario";
  };
  const getUserAvatar = (user: User | null | undefined) => {
    if (!user) return DEFAULT_PROFILE_IMAGE;
    return user.image || DEFAULT_PROFILE_IMAGE;
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };
  if (!user) {
    return (
      <PageLayout contentClassName="flex items-center justify-center min-h-screen">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Inicia sesión</h2>
          <p>Necesitas iniciar sesión para ver tus amigos</p>
        </div>
      </PageLayout>
    );
  }
  return (
    <PageLayout contentClassName="flex-1 overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl lg:text-4xl font-bold text-white text-center mb-8">
          Amigos
        </h1>
        {}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveTab("friends")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "friends"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Amigos ({friendsCount})
          </button>
          <button
            onClick={() => setActiveTab("received")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "received"
                ? "bg-green-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Recibidas ({receivedCount})
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "sent"
                ? "bg-yellow-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Enviadas ({sentCount})
          </button>
          <button
            onClick={() => setActiveTab("blocked")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "blocked"
                ? "bg-red-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Bloqueados ({blockedCount})
          </button>
          <button
            onClick={() => setActiveTab("search")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "search"
                ? "bg-purple-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Buscar usuarios
          </button>
        </div>
        {error && (
          <div className="mb-6 p-4 bg-red-600/20 border border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}
        {activeTab === "search" && (
          <div className="mb-8 space-y-4">
            <div className="text-center text-gray-300 text-sm mb-4">
              💡 La búsqueda es instantánea con coincidencias parciales. Por
              ejemplo, "jack" encontrará "JackDliskin64"
            </div>
            <div className="max-w-md mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre o email... (mínimo 2 caracteres)"
                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              {searching && (
                <div className="text-center text-purple-300 text-sm mt-2">
                  Buscando...
                </div>
              )}
            </div>
            <div className="flex justify-center">
              <button
                onClick={handleSearchAll}
                disabled={searching}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {searching ? "Cargando..." : "Mostrar todos los usuarios"}
              </button>
            </div>
          </div>
        )}
        {(loading ||
          activeTab === "friends" ||
          activeTab === "received" ||
          activeTab === "sent" ||
          activeTab === "blocked" ||
          (activeTab === "search" &&
            (searchResults.length > 0 ||
              (searchQuery.trim() && searchResults.length === 0) ||
              searchShowAll))) && (
          <div className="bg-gray-800 rounded-lg p-6">
            {loading ? (
              <div className="text-center text-gray-300 py-8">
                <div>Cargando...</div>
              </div>
            ) : activeTab === "friends" ? (
              friends.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <h3 className="text-lg font-medium mb-2">
                    No tienes amigos aún
                  </h3>
                  <p>Busca usuarios y envíales solicitudes de amistad</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {friends.map((friend) => (
                    <div
                      key={friend.friendshipId}
                      className="bg-gray-700 rounded-lg p-4"
                    >
                      <div
                        className="flex items-center gap-3 mb-3 cursor-pointer hover:bg-gray-600/50 rounded-lg p-2 transition-colors"
                        onClick={() =>
                          friend.user && handleUserClick(friend.user._id)
                        }
                        title={friend.user ? "Ver perfil" : "Usuario eliminado"}
                      >
                        <img
                          src={getUserAvatar(friend.user)}
                          alt={getUserDisplayName(friend.user)}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-white">
                            {getUserDisplayName(friend.user)}
                          </div>
                          <div className="text-sm text-gray-400">
                            Amigos desde {formatDate(friend.friendsSince)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {friend.user
                              ? "Clic para ver perfil"
                              : "Este usuario ya no existe"}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              friend.user &&
                              navigate(`/messages/${friend.user._id}`)
                            }
                            disabled={!friend.user}
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-colors"
                          >
                            {friend.user
                              ? "Enviar mensaje"
                              : "Usuario eliminado"}
                          </button>
                          <button
                            onClick={() =>
                              removeFriendship(friend.friendshipId)
                            }
                            disabled={processing.has(friend.friendshipId)}
                            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-colors"
                          >
                            {processing.has(friend.friendshipId)
                              ? "Eliminando..."
                              : "Eliminar amistad"}
                          </button>
                        </div>
                        {friend.user && (
                          <button
                            onClick={() => blockUser(friend.user!._id)}
                            disabled={processing.has(friend.user._id)}
                            className="w-full px-4 py-1 bg-gray-700 hover:bg-gray-800 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs font-medium rounded transition-colors border border-gray-600"
                          >
                            {processing.has(friend.user._id)
                              ? "Bloqueando..."
                              : "🚫 Bloquear usuario"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : activeTab === "received" ? (
              receivedRequests.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <h3 className="text-lg font-medium mb-2">
                    No tienes solicitudes pendientes
                  </h3>
                  <p>Cuando alguien te envíe una solicitud aparecerá aquí</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {receivedRequests.map((request) => (
                    <div
                      key={request.friendshipId}
                      className="bg-gray-700 rounded-lg p-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div
                          className="flex items-center gap-3 cursor-pointer hover:bg-gray-600/50 rounded-lg p-2 transition-colors flex-1"
                          onClick={() =>
                            request.requester &&
                            handleUserClick(request.requester._id)
                          }
                          title={
                            request.requester
                              ? "Ver perfil"
                              : "Usuario eliminado"
                          }
                        >
                          <img
                            src={getUserAvatar(request.requester)}
                            alt={getUserDisplayName(request.requester)}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-white">
                              {getUserDisplayName(request.requester)}
                            </div>
                            <div className="text-sm text-gray-400">
                              {formatDate(request.createdAt)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {request.requester
                                ? "Clic para ver perfil"
                                : "Este usuario ya no existe"}
                            </div>
                            {request.message && (
                              <div className="text-sm text-gray-300 mt-1">
                                "{request.message}"
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:flex-shrink-0">
                          <button
                            onClick={() =>
                              respondToRequest(request.friendshipId, "accept")
                            }
                            disabled={
                              processing.has(request.friendshipId) ||
                              !request.requester
                            }
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-colors"
                          >
                            {!request.requester
                              ? "Usuario eliminado"
                              : "Aceptar"}
                          </button>
                          <button
                            onClick={() =>
                              respondToRequest(request.friendshipId, "decline")
                            }
                            disabled={processing.has(request.friendshipId)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-colors"
                          >
                            Rechazar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : activeTab === "sent" ? (
              sentRequests.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <h3 className="text-lg font-medium mb-2">
                    No has enviado solicitudes
                  </h3>
                  <p>Busca usuarios y envíales solicitudes de amistad</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sentRequests.map((request) => (
                    <div
                      key={request.friendshipId}
                      className="bg-gray-700 rounded-lg p-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div
                          className="flex items-center gap-3 cursor-pointer hover:bg-gray-600/50 rounded-lg p-2 transition-colors flex-1"
                          onClick={() =>
                            request.recipient &&
                            handleUserClick(request.recipient._id)
                          }
                          title={
                            request.recipient
                              ? "Ver perfil"
                              : "Usuario eliminado"
                          }
                        >
                          <img
                            src={getUserAvatar(request.recipient)}
                            alt={getUserDisplayName(request.recipient)}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-white">
                              {getUserDisplayName(request.recipient)}
                            </div>
                            <div className="text-sm text-gray-400">
                              Enviada el {formatDate(request.createdAt)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {request.recipient
                                ? "Clic para ver perfil"
                                : "Este usuario ya no existe"}
                            </div>
                            {request.message && (
                              <div className="text-sm text-gray-300 mt-1">
                                "{request.message}"
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex sm:flex-shrink-0">
                          <button
                            onClick={() =>
                              removeFriendship(request.friendshipId)
                            }
                            disabled={processing.has(request.friendshipId)}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-colors"
                          >
                            {processing.has(request.friendshipId)
                              ? "Cancelando..."
                              : "Cancelar"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : activeTab === "blocked" ? (
              blockedUsers.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <h3 className="text-lg font-medium mb-2">
                    No tienes usuarios bloqueados
                  </h3>
                  <p>Los usuarios que bloquees aparecerán aquí</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {blockedUsers.map((blockedUser) => (
                    <div
                      key={blockedUser._id}
                      className="bg-gray-700 rounded-lg p-4"
                    >
                      <div
                        className="flex items-center gap-3 mb-3 cursor-pointer hover:bg-gray-600/50 rounded-lg p-2 transition-colors"
                        onClick={() => handleUserClick(blockedUser._id)}
                        title="Ver perfil"
                      >
                        <img
                          src={blockedUser.image || DEFAULT_PROFILE_IMAGE}
                          alt={
                            blockedUser.username ||
                            blockedUser.email ||
                            "Usuario"
                          }
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-white">
                            {blockedUser.username ||
                              blockedUser.email ||
                              "Usuario"}
                          </div>
                          <div className="text-sm text-red-400">
                            Usuario bloqueado
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Clic para ver perfil
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => unblockUser(blockedUser._id)}
                          disabled={processing.has(blockedUser._id)}
                          className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-colors"
                        >
                          {processing.has(blockedUser._id)
                            ? "Desbloqueando..."
                            : "Desbloquear usuario"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : activeTab === "search" ? (
              searchResults.length === 0 && searchQuery.trim() ? (
                <div className="text-center text-gray-400 py-8">
                  <h3 className="text-lg font-medium mb-2">
                    No se encontraron usuarios
                  </h3>
                  <p>Intenta con otro término de búsqueda</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {searchResults.map((searchUser) => (
                    <div
                      key={searchUser._id}
                      className="bg-gray-700 rounded-lg p-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
                        <div
                          className="flex items-center gap-3 cursor-pointer hover:bg-gray-600/50 rounded-lg p-2 transition-colors flex-1"
                          onClick={() => handleUserClick(searchUser._id)}
                          title="Ver perfil"
                        >
                          <img
                            src={getUserAvatar(searchUser)}
                            alt={getUserDisplayName(searchUser)}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-white">
                              {getUserDisplayName(searchUser)}
                            </div>
                            <div className="text-sm text-gray-400">
                              {searchUser.email}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Clic para ver perfil
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0 sm:ml-4">
                          <div className="flex flex-col gap-2">
                            {searchUser.relationshipStatus === "none" && (
                              <>
                                <button
                                  onClick={() =>
                                    sendFriendRequest(searchUser._id)
                                  }
                                  disabled={processing.has(searchUser._id)}
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-colors"
                                >
                                  {processing.has(searchUser._id)
                                    ? "Enviando..."
                                    : "Enviar solicitud"}
                                </button>
                                <button
                                  onClick={() => blockUser(searchUser._id)}
                                  disabled={processing.has(searchUser._id)}
                                  className="px-4 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs font-medium rounded transition-colors"
                                >
                                  {processing.has(searchUser._id)
                                    ? "Bloqueando..."
                                    : "Bloquear"}
                                </button>
                              </>
                            )}
                            {searchUser.relationshipStatus === "friends" && (
                              <>
                                <span className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded text-center">
                                  Ya sois amigos
                                </span>
                                <button
                                  onClick={() => blockUser(searchUser._id)}
                                  disabled={processing.has(searchUser._id)}
                                  className="px-4 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs font-medium rounded transition-colors"
                                >
                                  {processing.has(searchUser._id)
                                    ? "Bloqueando..."
                                    : "Bloquear"}
                                </button>
                              </>
                            )}
                            {searchUser.relationshipStatus === "sent" && (
                              <>
                                <span className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded text-center">
                                  Solicitud enviada
                                </span>
                                <button
                                  onClick={() => blockUser(searchUser._id)}
                                  disabled={processing.has(searchUser._id)}
                                  className="px-4 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs font-medium rounded transition-colors"
                                >
                                  {processing.has(searchUser._id)
                                    ? "Bloqueando..."
                                    : "Bloquear"}
                                </button>
                              </>
                            )}
                            {searchUser.relationshipStatus === "received" && (
                              <>
                                <span className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded text-center">
                                  Te envió solicitud
                                </span>
                                <button
                                  onClick={() => blockUser(searchUser._id)}
                                  disabled={processing.has(searchUser._id)}
                                  className="px-4 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs font-medium rounded transition-colors"
                                >
                                  {processing.has(searchUser._id)
                                    ? "Bloqueando..."
                                    : "Bloquear"}
                                </button>
                              </>
                            )}
                            {searchUser.relationshipStatus === "blocked" && (
                              <button
                                onClick={() => unblockUser(searchUser._id)}
                                disabled={processing.has(searchUser._id)}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-colors"
                              >
                                {processing.has(searchUser._id)
                                  ? "Desbloqueando..."
                                  : "Desbloquear"}
                              </button>
                            )}
                            {searchUser.relationshipStatus === "blocked_by" && (
                              <div className="px-4 py-2 bg-red-700/20 border border-red-600/40 text-red-300 text-sm font-medium rounded text-center">
                                Este usuario te ha bloqueado
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : null}
          </div>
        )}
      </div>
    </PageLayout>
  );
};
export default Friends;

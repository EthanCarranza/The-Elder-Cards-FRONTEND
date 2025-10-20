import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import PageLayout from "./PageLayout";
import { apiFetch } from "./api";
import { extractErrorMessage } from "../utils/errors";
import { useAuth } from "../hooks/useAuth";
import { DEFAULT_PROFILE_IMAGE } from "../constants/user";
import {
  handleCardBlur,
  handleCardFocus,
  handleCardPointerLeave,
  handleCardPointerMove,
} from "../utils/card3d";
interface Faction {
  _id: string;
  title: string;
  description: string;
  territory: string;
  color: string;
}
interface CardDetailData {
  _id: string;
  title: string;
  description: string;
  type: string;
  faction: string | Faction;
  creator: string;
  cost: number;
  img?: string;
  attack?: number;
  defense?: number;
  date?: string;
}
interface CreatorSummary {
  _id?: string;
  id?: string;
  username?: string;
  email?: string;
  image?: string;
}
interface CardStats {
  likes: number;
  favorites: number;
}
interface CardInteraction {
  liked: boolean;
  favorited: boolean;
}
interface InteractionResponse {
  liked?: boolean;
  favorited?: boolean;
  stats: CardStats;
}
interface CardDetailLocationState {
  card?: Partial<CardDetailData> & { _id: string };
  faction?: Faction;
}
const buildCardFromState = (
  stateCard?: Partial<CardDetailData> & { _id: string }
): CardDetailData | null => {
  if (!stateCard) return null;
  return {
    _id: stateCard._id,
    title: stateCard.title ?? "",
    description: stateCard.description ?? "",
    type: stateCard.type ?? "",
    faction: stateCard.faction ?? "",
    creator: stateCard.creator ?? "",
    cost: stateCard.cost ?? 0,
    img: stateCard.img,
    attack: stateCard.attack,
    defense: stateCard.defense,
    date: stateCard.date,
  };
};
const CardDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const locationState =
    (location.state as CardDetailLocationState | undefined) ?? {};
  const stateCard = locationState.card;
  const initialCard = buildCardFromState(stateCard);
  const initialFaction: Faction | null =
    locationState.faction ??
    (initialCard && typeof initialCard.faction === "object"
      ? (initialCard.faction as Faction)
      : null);
  const hasPrefetchedCard = Boolean(initialCard);
  const [card, setCard] = useState<CardDetailData | null>(initialCard);
  const [faction, setFaction] = useState<Faction | null>(initialFaction);
  const [loading, setLoading] = useState(!hasPrefetchedCard);
  const [error, setError] = useState("");
  interface MyCollectionOption {
    _id: string;
    title: string;
    cards?: Array<string | { _id: string }>;
  }
  const [myCollections, setMyCollections] = useState<MyCollectionOption[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [pendingRemovalId, setPendingRemovalId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState("");
  const [actionErr, setActionErr] = useState("");
  const [downloadingCard, setDownloadingCard] = useState(false);
  const [creatorInfo, setCreatorInfo] = useState<CreatorSummary | null>(null);
  const [creatorLoading, setCreatorLoading] = useState(false);
  const [deletingCard, setDeletingCard] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [cardStats, setCardStats] = useState<CardStats>({
    likes: 0,
    favorites: 0,
  });
  const [userInteraction, setUserInteraction] = useState<CardInteraction>({
    liked: false,
    favorited: false,
  });
  const [loadingInteraction, setLoadingInteraction] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError("Identificador de carta no válido");
        setLoading(false);
        return;
      }
      if (!hasPrefetchedCard) {
        setLoading(true);
      }
      try {
        const response = await apiFetch<CardDetailData>(`/cards/${id}`);
        const cardData = response.data;
        setCard(cardData);
        if (cardData?.faction && typeof cardData.faction === "object") {
          setFaction(cardData.faction as Faction);
        } else if (cardData?.faction) {
          try {
            const factionResponse = await apiFetch<Faction>(
              `/factions/${cardData.faction}`
            );
            setFaction(factionResponse.data ?? null);
          } catch (fetchFactionError: unknown) {
            console.error("Error al cargar la faccion", fetchFactionError);
            setFaction(null);
          }
        } else {
          setFaction(null);
        }
        setError("");
      } catch (fetchError: unknown) {
        console.error("Error al cargar la carta", fetchError);
        setError(extractErrorMessage(fetchError, "Error al cargar la carta"));
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, [id, hasPrefetchedCard]);
  useEffect(() => {
    const loadMyCollections = async () => {
      if (!user) {
        setMyCollections([]);
        return;
      }
      try {
        const resp = await apiFetch<MyCollectionOption[]>("/collections/mine", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setMyCollections(resp.data || []);
      } catch (fetchError) {
        console.error(
          "Error al cargar las colecciones del usuario",
          fetchError
        );
        setMyCollections([]);
      }
    };
    void loadMyCollections();
  }, [user]);
  useEffect(() => {
    let isActive = true;
    const loadCreatorInfo = async () => {
      if (!card?.creator) {
        if (isActive) {
          setCreatorInfo(null);
          setCreatorLoading(false);
        }
        return;
      }
      setCreatorLoading(true);
      try {
        const response = await apiFetch<CreatorSummary[]>("/users");
        const users = response.data ?? [];
        const normalizedCreator = card.creator.toLowerCase();
        const found = users.find((candidate) => {
          const candidateUsername = candidate.username?.toLowerCase();
          const candidateEmail = candidate.email?.toLowerCase();
          return (
            candidateUsername === normalizedCreator ||
            candidateEmail === normalizedCreator
          );
        });
        if (isActive) {
          setCreatorInfo(found ?? null);
        }
      } catch (creatorError) {
        console.error(
          "Error al cargar la información del creador",
          creatorError
        );
        if (isActive) {
          setCreatorInfo(null);
        }
      } finally {
        if (isActive) {
          setCreatorLoading(false);
        }
      }
    };
    void loadCreatorInfo();
    return () => {
      isActive = false;
    };
  }, [card?.creator]);
  useEffect(() => {
    const loadCardStats = async () => {
      if (!id) return;
      try {
        const response = await apiFetch<CardStats>(
          `/card-interactions/${id}/stats`
        );
        setCardStats(response.data);
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
      }
    };
    void loadCardStats();
  }, [id]);
  useEffect(() => {
    const loadUserInteraction = async () => {
      if (!id || !user) {
        setUserInteraction({ liked: false, favorited: false });
        return;
      }
      try {
        const response = await apiFetch<CardInteraction>(
          `/card-interactions/${id}/interaction`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        setUserInteraction(response.data);
      } catch (error) {
        console.error("Error al cargar interacciones del usuario:", error);
      }
    };
    void loadUserInteraction();
  }, [id, user]);
  const handleToggleLike = async () => {
    if (!user || !id || loadingInteraction) return;
    setLoadingInteraction(true);
    try {
      const response = await apiFetch<InteractionResponse>(
        `/card-interactions/${id}/like`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setUserInteraction((prev) => ({
        ...prev,
        liked: response.data.liked || false,
      }));
      setCardStats(response.data.stats);
    } catch (error) {
      console.error("Error al actualizar like:", error);
    } finally {
      setLoadingInteraction(false);
    }
  };
  const handleToggleFavorite = async () => {
    if (!user || !id || loadingInteraction) return;
    setLoadingInteraction(true);
    try {
      const response = await apiFetch<InteractionResponse>(
        `/card-interactions/${id}/favorite`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setUserInteraction((prev) => ({
        ...prev,
        favorited: response.data.favorited || false,
      }));
      setCardStats(response.data.stats);
    } catch (error) {
      console.error("Error al actualizar favorito:", error);
    } finally {
      setLoadingInteraction(false);
    }
  };
  const alreadyInSelected = useMemo(() => {
    if (!id || !selectedCollection) return false;
    const coll = myCollections.find((c) => c._id === selectedCollection);
    if (!coll || !Array.isArray(coll.cards)) return false;
    const ids = coll.cards.map((c: string | { _id: string }) =>
      typeof c === "string" ? c : (c as { _id: string })?._id
    );
    return ids.includes(id);
  }, [id, selectedCollection, myCollections]);
  const collectionsWithCard = useMemo(
    () =>
      myCollections.filter((collection) => {
        if (!id || !Array.isArray(collection.cards)) return false;
        return collection.cards.some((item) =>
          typeof item === "string" ? item === id : item?._id === id
        );
      }),
    [myCollections, id]
  );
  const handleAddToCollection = async () => {
    if (!user || !id || !selectedCollection) return;
    const targetCollection = myCollections.find(
      (collection) => collection._id === selectedCollection
    );
    const collectionTitle =
      targetCollection?.title ?? "la colección seleccionada";
    if (alreadyInSelected) {
      setActionMsg(`Esta carta ya está en ${collectionTitle}`);
      setActionErr("");
      return;
    }
    setAdding(true);
    setActionErr("");
    setActionMsg("");
    try {
      await apiFetch(`/collections/${selectedCollection}/addCard`, {
        method: "PUT",
        body: { cardId: id },
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setMyCollections((prev) =>
        prev.map((collection) => {
          if (collection._id !== selectedCollection) return collection;
          const existingCards: Array<string | { _id: string }> = Array.isArray(
            collection.cards
          )
            ? collection.cards
            : [];
          if (
            existingCards.some(
              (item) => (typeof item === "string" ? item : item?._id) === id
            )
          ) {
            return collection;
          }
          return {
            ...collection,
            cards: [...existingCards, id],
          };
        })
      );
      setActionMsg(`Carta añadida a ${collectionTitle}`);
    } catch (e: unknown) {
      setActionErr(extractErrorMessage(e, "No se pudo añadir"));
    } finally {
      setAdding(false);
    }
  };
  const handleRemoveFromCollection = async (collectionId: string) => {
    if (!user || !id) return;
    const targetCollection = myCollections.find(
      (collection) => collection._id === collectionId
    );
    const collectionTitle = targetCollection?.title ?? "la colección";
    let hasCard = false;
    if (targetCollection && Array.isArray(targetCollection.cards)) {
      hasCard = targetCollection.cards.some(
        (item) => (typeof item === "string" ? item : item?._id) === id
      );
    }
    if (!hasCard) {
      setActionErr(`Esta carta no está en ${collectionTitle}`);
      setActionMsg("");
      setPendingRemovalId(null);
      return;
    }
    setRemovingId(collectionId);
    setActionErr("");
    setActionMsg("");
    try {
      await apiFetch(`/collections/${collectionId}/removeCard`, {
        method: "PUT",
        body: { cardId: id },
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setMyCollections((prev) =>
        prev.map((collection) => {
          if (collection._id !== collectionId) return collection;
          if (!Array.isArray(collection.cards)) {
            return { ...collection, cards: [] };
          }
          const updatedCards = collection.cards.filter(
            (item) => (typeof item === "string" ? item : item?._id) !== id
          );
          return {
            ...collection,
            cards: updatedCards,
          };
        })
      );
      setActionMsg(`Carta eliminada de ${collectionTitle}`);
    } catch (e: unknown) {
      setActionErr(extractErrorMessage(e, "No se pudo eliminar"));
    } finally {
      setRemovingId(null);
      setPendingRemovalId(null);
    }
  };
  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/cards");
    }
  };
  const creatorProfileId = creatorInfo?._id ?? creatorInfo?.id ?? null;
  const handleCreatorClick = () => {
    if (!creatorProfileId) return;
    navigate(`/users/${creatorProfileId}`);
  };
  const creatorDisplayName =
    creatorInfo?.username ?? creatorInfo?.email ?? card?.creator ?? "Anónimo";
  const creatorAvatar = creatorInfo?.image || DEFAULT_PROFILE_IMAGE;
  const handleDownloadCard = async () => {
    if (!card?.img) return;
    setDownloadingCard(true);
    try {
      const response = await fetch(card.img, { mode: "cors" });
      if (!response.ok) {
        throw new Error(`Respuesta inesperada: ${response.status}`);
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const urlInfo = (() => {
        try {
          return new URL(card.img, window.location.href);
        } catch {
          return null;
        }
      })();
      const fileNameFromUrl =
        urlInfo?.pathname.split("/").pop()?.split("?").shift() ?? "";
      const extension = (() => {
        if (fileNameFromUrl.includes(".")) {
          const ext = fileNameFromUrl.split(".").pop();
          if (ext && ext.length <= 5) return ext;
        }
        return "png";
      })();
      const sanitizedTitle = (card.title ?? "carta")
        .normalize("NFD")
        .replace(/[^\w\s-]/g, "")
        .replace(/[`\-?]/g, "")
        .trim();
      const safeBase = sanitizedTitle
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      const fileName = `${safeBase || "carta"}.${extension}`;
      anchor.href = blobUrl;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (downloadError) {
      console.error("Error al descargar la carta", downloadError);
      setError(
        extractErrorMessage(downloadError, "No se pudo descargar la carta")
      );
    } finally {
      setDownloadingCard(false);
    }
  };
  const handleDeleteCard = async () => {
    if (!user || !id || !card) return;
    setDeletingCard(true);
    setActionErr("");
    setActionMsg("");
    try {
      await apiFetch(`/cards/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setActionMsg("Carta eliminada correctamente");
      setTimeout(() => {
        navigate("/cards");
      }, 1500);
    } catch (deleteError: unknown) {
      setActionErr(
        extractErrorMessage(deleteError, "No se pudo eliminar la carta")
      );
      setDeletingCard(false);
      setShowDeleteConfirm(false);
    }
  };
  const canDeleteCard = useMemo(() => {
    if (!user || !card) return false;
    const isAdmin = user.role === "admin";
    const userCreator = user.username || user.email || "Anonimo";
    const isOwner = card.creator.toLowerCase() === userCreator.toLowerCase();
    return isAdmin || isOwner;
  }, [user, card]);
  const formattedDate = useMemo(() => {
    if (!card?.date) return "-";
    const parsed = new Date(card.date);
    if (Number.isNaN(parsed.getTime())) return "-";
    return parsed.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [card?.date]);
  return (
    <PageLayout contentClassName="p-4 lg:p-6 flex flex-col justify-center min-h-screen">
      <div className="mx-auto max-w-7xl w-full pb-8">
        <button
          onClick={handleGoBack}
          className="mb-6 rounded bg-gray-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-600"
        >
          Volver
        </button>
        {loading && !card ? (
          <div className="text-white">Cargando carta...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : card ? (
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-center justify-center lg:justify-start">
            <div className="w-full lg:w-auto lg:flex-shrink-0 flex justify-center">
              <div className="card-3d-wrapper">
                <div
                  className="card-3d relative block rounded-lg border border-black/30 shadow-2xl w-72 h-[432px] sm:w-80 sm:h-[480px] lg:w-96 lg:h-[576px]"
                  onPointerMove={handleCardPointerMove}
                  onPointerLeave={handleCardPointerLeave}
                  onPointerCancel={handleCardPointerLeave}
                  onFocus={handleCardFocus}
                  onBlur={handleCardBlur}
                  tabIndex={0}
                >
                  {card.img ? (
                    <img
                      src={card.img}
                      alt={`Carta ${card.title}`}
                      className="card-3d-element h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="card-3d-element flex h-full w-full items-center justify-center border border-dashed border-gray-500 bg-gray-800 text-center text-white p-4">
                      <div className="text-sm sm:text-base">
                        Esta carta no tiene imagen asociada.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="w-full lg:flex-1 lg:max-w-2xl rounded-lg bg-white/90 p-4 lg:p-6 shadow-lg backdrop-blur space-y-4 sm:space-y-6 overflow-hidden">
              {}
              <div className="border-b border-gray-200 pb-4">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words hyphens-auto">
                  {card.title}
                </h1>
                <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                  <span className="font-medium">{card.type}</span>
                  <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-800 self-start sm:self-auto">
                    Coste: {card.cost}
                  </span>
                  <span className="text-xs sm:text-sm">
                    Fecha de creación: {formattedDate}
                  </span>
                </div>
              </div>
              {}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Creador
                </h3>
                {creatorLoading ? (
                  <p className="text-sm text-gray-600">
                    Cargando información del creador...
                  </p>
                ) : creatorInfo ? (
                  <button
                    type="button"
                    disabled={!creatorProfileId}
                    onClick={handleCreatorClick}
                    className={`flex w-full max-w-sm items-center gap-3 rounded-lg border border-gray-200 bg-white/60 p-3 text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-emerald-500/60 hover:border-gray-300 hover:bg-white ${
                      !creatorProfileId ? "cursor-not-allowed opacity-70" : ""
                    }`}
                  >
                    <img
                      src={creatorAvatar}
                      alt={`Perfil de ${creatorDisplayName}`}
                      className="h-12 w-12 rounded-full object-cover"
                      loading="lazy"
                    />
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {creatorDisplayName}
                      </div>
                      <div className="text-xs text-gray-500">Ver perfil</div>
                    </div>
                  </button>
                ) : (
                  <p className="text-sm text-gray-600">
                    Creada por {card.creator}
                  </p>
                )}
              </div>
              {}
              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3">
                {card.img && (
                  <button
                    type="button"
                    onClick={() => void handleDownloadCard()}
                    disabled={downloadingCard}
                    className="inline-flex items-center gap-2 rounded bg-gray-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-70 w-full sm:w-auto"
                  >
                    {downloadingCard ? "Descargando..." : "Descargar carta"}
                  </button>
                )}
                {canDeleteCard && (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {deletingCard ? (
                      <div className="inline-flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white w-full sm:w-auto">
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Eliminando...
                      </div>
                    ) : !showDeleteConfirm ? (
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="inline-flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-70 w-full sm:w-auto"
                      >
                        Eliminar carta
                      </button>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                        <span className="text-sm text-gray-700 font-medium">
                          ¿Estás seguro?
                        </span>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={handleDeleteCard}
                            className="inline-flex items-center gap-1 rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-red-700 flex-1 sm:flex-none"
                          >
                            Sí, eliminar
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(false)}
                            className="inline-flex items-center gap-1 rounded bg-gray-300 px-3 py-1 text-xs font-semibold text-gray-800 transition-colors hover:bg-gray-400 flex-1 sm:flex-none"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {}
              {user && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={handleToggleLike}
                    disabled={loadingInteraction}
                    className={`inline-flex items-center gap-2 rounded px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70 w-full sm:w-auto ${
                      userInteraction.liked
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    <span>{userInteraction.liked ? "❤️" : "🤍"}</span>
                    {userInteraction.liked ? "Te gusta" : "Me gusta"} (
                    {cardStats.likes})
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleFavorite}
                    disabled={loadingInteraction}
                    className={`inline-flex items-center gap-2 rounded px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70 w-full sm:w-auto ${
                      userInteraction.favorited
                        ? "bg-yellow-500 text-white hover:bg-yellow-600"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    <span>{userInteraction.favorited ? "⭐" : "☆"}</span>
                    {userInteraction.favorited
                      ? "En favoritos"
                      : "Agregar a favoritos"}{" "}
                    ({cardStats.favorites})
                  </button>
                </div>
              )}
              {}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Estadísticas de la carta
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-800">
                  <div className="text-center">
                    <div className="text-xs uppercase text-gray-600 font-medium">
                      Me gusta
                    </div>
                    <div className="text-xl font-bold text-red-600">
                      {cardStats.likes}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs uppercase text-gray-600 font-medium">
                      Favoritos
                    </div>
                    <div className="text-xl font-bold text-yellow-600">
                      {cardStats.favorites}
                    </div>
                  </div>
                </div>
              </div>
              {}
              {faction && (
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Facción
                  </h3>
                  <button
                    type="button"
                    onClick={() => navigate(`/factions/${faction._id}`)}
                    className="flex items-center gap-3 w-full text-left p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                  >
                    <div className="flex-shrink-0">
                      <span
                        className="inline-block h-8 w-8 rounded-full border-2 border-gray-400 shadow-sm"
                        style={{ backgroundColor: faction.color }}
                      ></span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                        {faction.title}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 truncate">
                        {faction.territory}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </button>
                </div>
              )}
              {}
              {card.type === "Creature" && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Estadísticas
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-800">
                    <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-center">
                      <div className="text-xs uppercase text-red-600 font-medium">
                        Ataque
                      </div>
                      <div className="text-2xl font-bold text-red-800">
                        {card.attack}
                      </div>
                    </div>
                    <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-center">
                      <div className="text-xs uppercase text-blue-600 font-medium">
                        Defensa
                      </div>
                      <div className="text-2xl font-bold text-blue-800">
                        {card.defense}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {}
              {user && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Gestiona tus colecciones
                  </h3>
                  {myCollections.length === 0 ? (
                    <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                      <p className="text-sm text-amber-800">
                        No tienes colecciones aún. Crea una desde la pestaña
                        Colecciones.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {}
                      <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                        <h4 className="text-sm font-semibold text-green-800 mb-3">
                          Añadir a colección
                        </h4>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <select
                            className="flex-1 p-3 rounded-lg border border-gray-300 text-sm text-black focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            value={selectedCollection}
                            onChange={(e) =>
                              setSelectedCollection(e.target.value)
                            }
                          >
                            <option value="">Selecciona una colección</option>
                            {myCollections.map((c) => (
                              <option key={c._id} value={c._id}>
                                {c.title}
                              </option>
                            ))}
                          </select>
                          <button
                            className="rounded-lg bg-gray-800 px-6 py-3 text-white text-sm font-semibold disabled:opacity-60 hover:bg-gray-700 transition-colors"
                            disabled={
                              !selectedCollection ||
                              adding ||
                              Boolean(removingId)
                            }
                            onClick={() => void handleAddToCollection()}
                          >
                            {adding ? "Añadiendo..." : "Añadir"}
                          </button>
                        </div>
                        {(actionMsg || actionErr) && (
                          <div className="mt-3 text-sm">
                            {actionMsg && (
                              <div className="text-green-700 bg-green-100 rounded p-2">
                                {actionMsg}
                              </div>
                            )}
                            {actionErr && (
                              <div className="text-red-700 bg-red-100 rounded p-2">
                                {actionErr}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {}
                      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                        <h4 className="text-sm font-semibold text-blue-800 mb-3">
                          En Tus Colecciones
                        </h4>
                        {collectionsWithCard.length === 0 ? (
                          <p className="text-sm text-blue-700">
                            Esta carta no está en ninguna de tus colecciones.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                            {collectionsWithCard.map((collection) => {
                              const isPending =
                                pendingRemovalId === collection._id;
                              const isRemoving = removingId === collection._id;
                              return (
                                <div
                                  key={collection._id}
                                  className="flex flex-col gap-3 rounded-lg border border-gray-300 bg-white p-4 shadow-sm"
                                >
                                  <span className="text-sm font-medium text-gray-900 text-center break-words">
                                    {collection.title}
                                  </span>

                                  {isRemoving ? (
                                    <div className="text-xs font-semibold text-gray-600 text-center">
                                      Eliminando...
                                    </div>
                                  ) : isPending ? (
                                    <div className="flex flex-col items-center gap-2">
                                      <span className="text-xs font-semibold text-gray-900 text-center">
                                        ¿Estás seguro de que deseas eliminar la
                                        carta de esta colección?
                                      </span>
                                      <div className="flex gap-2 w-full">
                                        <button
                                          className="flex-1 rounded bg-red-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60 hover:bg-red-700 transition-colors"
                                          onClick={() =>
                                            void handleRemoveFromCollection(
                                              collection._id
                                            )
                                          }
                                          disabled={isRemoving}
                                        >
                                          Sí, eliminar
                                        </button>
                                        <button
                                          className="flex-1 rounded bg-gray-300 px-3 py-2 text-xs font-semibold text-gray-800 disabled:opacity-60 hover:bg-gray-400 transition-colors"
                                          onClick={() =>
                                            setPendingRemovalId(null)
                                          }
                                          disabled={isRemoving}
                                        >
                                          Cancelar
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col gap-2">
                                      <button
                                        className="w-full rounded bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-60"
                                        onClick={() =>
                                          navigate(
                                            `/collections/${collection._id}`
                                          )
                                        }
                                        disabled={Boolean(removingId)}
                                      >
                                        Ver Colección
                                      </button>
                                      <button
                                        className="w-full rounded bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-60"
                                        onClick={() => {
                                          setPendingRemovalId(collection._id);
                                          setActionMsg("");
                                          setActionErr("");
                                        }}
                                        disabled={Boolean(removingId)}
                                      >
                                        Eliminar de Colección
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-white">No se encontro la carta solicitada.</div>
        )}
      </div>
    </PageLayout>
  );
};
export default CardDetail;

import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import CreateCard from "./CreateCard";
import { CARD_TYPES } from "../constants/cardTypes";
import { apiFetch } from "./api";
import PageLayout from "./PageLayout";
import CardTile from "./CardTile";
import { extractErrorMessage } from "../utils/errors";
interface Faction {
  _id: string;
  title: string;
  description: string;
  territory: string;
  color: string;
}
interface Card {
  _id: string;
  title: string;
  type: string;
  faction: string | Faction;
  creator: string;
  cost: number;
  img?: string;
  attack?: number;
  defense?: number;
}
interface CardsResponse {
  cards?: Card[];
  totalPages?: number;
}
interface Filters {
  type?: string;
  faction?: string;
  title?: string;
  creator?: string;
  cost?: string;
  attack?: string;
  defense?: string;
  sort?: string;
  favorites?: string;
  liked?: string;
  myCards?: string;
}
const Cards = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [cards, setCards] = useState<Card[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<Filters>(() => {
    const urlFilters: Filters = { sort: "date_desc" };
    const faction = searchParams.get("faction");
    const type = searchParams.get("type");
    const title = searchParams.get("title");
    const creator = searchParams.get("creator");
    const cost = searchParams.get("cost");
    const attack = searchParams.get("attack");
    const defense = searchParams.get("defense");
    const sort = searchParams.get("sort");
    const favorites = searchParams.get("favorites");
    const liked = searchParams.get("liked");
    const myCards = searchParams.get("myCards");
    if (faction) urlFilters.faction = faction;
    if (type) urlFilters.type = type;
    if (title) urlFilters.title = title;
    if (creator) urlFilters.creator = creator;
    if (cost) urlFilters.cost = cost;
    if (attack) urlFilters.attack = attack;
    if (defense) urlFilters.defense = defense;
    if (sort) urlFilters.sort = sort;
    if (favorites) urlFilters.favorites = favorites;
    if (liked) urlFilters.liked = liked;
    if (myCards) urlFilters.myCards = myCards;
    return urlFilters;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [factions, setFactions] = useState<Faction[]>([]);
  const [deletingCards, setDeletingCards] = useState<Set<string>>(new Set());
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const fetchCards = useCallback(async () => {
    setLoading(true);
    setError("");
    let query = `?page=${page}&limit=20`;
    if (
      user?.userId &&
      (filters.favorites || filters.liked || filters.myCards)
    ) {
      query += `&user=${encodeURIComponent(user.userId)}`;
    }
    Object.entries(filters).forEach(([key, value]) => {
      if (value) query += `&${key}=${encodeURIComponent(value)}`;
    });
    try {
      const headers: Record<string, string> = user
        ? { Authorization: `Bearer ${user.token}` }
        : {};
      const response = await apiFetch<CardsResponse>(`/cards${query}`, {
        headers,
      });
      const { cards: fetchedCards = [], totalPages: fetchedTotalPages = 1 } =
        response.data;
      setCards(fetchedCards);
      setTotalPages(fetchedTotalPages);
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data
      ) {
        setError(
          (err.response as { data: { message?: string } }).data.message ||
            "Error al cargar cartas"
        );
      } else {
        setError("Error al cargar cartas");
      }
    } finally {
      setLoading(false);
    }
  }, [filters, page, user]);
  const fetchFactions = useCallback(async () => {
    try {
      const response = await apiFetch<Faction[]>("/factions");
      setFactions(response.data ?? []);
    } catch {
      setFactions([]);
    }
  }, []);
  useEffect(() => {
    fetchCards();
  }, [fetchCards]);
  useEffect(() => {
    fetchFactions();
  }, [fetchFactions]);
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const nextValue =
      name === "type" && typeof value === "string" && value
        ? `${value.charAt(0).toUpperCase()}${value.slice(1)}`
        : value;
    setFilters((prev) => ({ ...prev, [name]: nextValue }));
    setPage(1);
  };
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFilters((prev) => {
      const next = { ...prev };
      if (value) {
        next.sort = value;
      } else {
        delete next.sort;
      }
      return next;
    });
    setPage(1);
  };
  const canDeleteCard = (card: Card): boolean => {
    if (!user) return false;
    const isAdmin = user.role === "admin";
    const userCreator = user.username || user.email || "Anonimo";
    const isOwner = card.creator.toLowerCase() === userCreator.toLowerCase();
    return isAdmin || isOwner;
  };
  const handleDeleteCard = async (cardId: string) => {
    if (!user) return;
    setDeletingCards((prev) => new Set(prev).add(cardId));
    try {
      await apiFetch(`/cards/${cardId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setCards((prev) => prev.filter((card) => card._id !== cardId));
      setConfirmingDelete(null);
    } catch (deleteError: unknown) {
      console.error("Error al eliminar carta:", deleteError);
      setError(
        extractErrorMessage(deleteError, "No se pudo eliminar la carta")
      );
    } finally {
      setDeletingCards((prev) => {
        const next = new Set(prev);
        next.delete(cardId);
        return next;
      });
    }
  };
  return (
    <PageLayout contentClassName="overflow-y-auto p-3 sm:p-6">
      <h2 className="text-5xl text-center font-light pb-10 text-white">
        Cartas
      </h2>
      {showCreate && user ? (
        <>
          <button
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mb-4"
            onClick={() => setShowCreate(false)}
          >
            &lt; Volver al listado
          </button>
          <CreateCard
            onCreated={(createdCardId) => {
              if (createdCardId) {
                navigate(`/cards/${createdCardId}`);
              } else {
                setShowCreate(false);
                fetchCards();
              }
            }}
            factions={factions.map((f) => ({
              _id: f._id,
              title: f.title,
              color: f.color,
            }))}
          />
        </>
      ) : (
        <>
          <div className="mb-4 max-w-4xl mx-auto">
            <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 text-black">
              <input
                name="title"
                value={filters.title || ""}
                onChange={handleFilterChange}
                placeholder="Título"
                className="p-2 sm:p-2.5 md:p-3 lg:p-3.5 xl:p-4 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl rounded w-full"
              />
              <input
                name="creator"
                value={filters.creator || ""}
                onChange={handleFilterChange}
                placeholder="Creador"
                className="p-2 sm:p-2.5 md:p-3 lg:p-3.5 xl:p-4 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl rounded w-full"
              />
              <input
                name="cost"
                type="number"
                min={0}
                max={10}
                value={filters.cost || ""}
                onChange={handleFilterChange}
                placeholder="Coste"
                className="p-2 sm:p-2.5 md:p-3 lg:p-3.5 xl:p-4 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl rounded w-full"
              />
              <select
                name="type"
                value={filters.type ? filters.type.toLowerCase() : ""}
                onChange={handleFilterChange}
                className="p-2 sm:p-2.5 md:p-3 lg:p-3.5 xl:p-4 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl rounded w-full"
              >
                <option value="">Tipo</option>
                {CARD_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <select
                name="faction"
                value={filters.faction || ""}
                onChange={handleFilterChange}
                className="p-2 sm:p-2.5 md:p-3 lg:p-3.5 xl:p-4 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl rounded w-full"
                disabled={factions.length === 0}
              >
                <option value="">
                  {factions.length === 0 ? "Sin facciones" : "Facción"}
                </option>
                {factions.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.title}
                  </option>
                ))}
              </select>
              <select
                name="sort"
                value={filters.sort ?? ""}
                onChange={handleSortChange}
                className="p-2 sm:p-2.5 md:p-3 lg:p-3.5 xl:p-4 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl rounded w-full"
              >
                <option value="date_desc">Fecha (nuevas primero)</option>
                <option value="date_asc">Fecha (antiguas primero)</option>
                <option value="title_asc">Título A-Z</option>
                <option value="title_desc">Título Z-A</option>
                <option value="creator_asc">Creador A-Z</option>
                <option value="creator_desc">Creador Z-A</option>
                <option value="faction_asc">Facción A-Z</option>
                <option value="faction_desc">Facción Z-A</option>
                <option value="type_asc">Tipo A-Z</option>
                <option value="type_desc">Tipo Z-A</option>
                <option value="cost_asc">Coste asc</option>
                <option value="cost_desc">Coste desc</option>
                <option value="attack_asc">Ataque asc</option>
                <option value="attack_desc">Ataque desc</option>
                <option value="defense_asc">Defensa asc</option>
                <option value="defense_desc">Defensa desc</option>
                <option value="most_liked">Más valoradas</option>
              </select>
            </div>
            {filters.type === "Creature" && (
              <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 text-black mt-2 sm:mt-3 md:mt-4">
                <input
                  name="attack"
                  type="number"
                  min={0}
                  max={10}
                  value={filters.attack || ""}
                  onChange={handleFilterChange}
                  placeholder="Ataque"
                  className="p-2 sm:p-2.5 md:p-3 lg:p-3.5 xl:p-4 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl rounded w-full"
                />
                <input
                  name="defense"
                  type="number"
                  min={1}
                  max={10}
                  value={filters.defense || ""}
                  onChange={handleFilterChange}
                  placeholder="Defensa"
                  className="p-2 sm:p-2.5 md:p-3 lg:p-3.5 xl:p-4 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl rounded w-full"
                />
                <div></div>
              </div>
            )}
          </div>
          {user && (
            <div className="mb-4 max-w-4xl mx-auto">
              <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6">
                <button
                  onClick={() => {
                    const newValue = filters.favorites === "true" ? "" : "true";
                    setFilters((prev) => ({ ...prev, favorites: newValue }));
                    setPage(1);
                  }}
                  className={`p-2 sm:p-2.5 md:p-3 lg:p-3.5 xl:p-4 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl rounded w-full font-medium transition-colors ${
                    filters.favorites === "true"
                      ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                      : "bg-white hover:bg-gray-50 text-black border border-gray-300"
                  }`}
                >
                  ⭐ Favoritas
                </button>
                <button
                  onClick={() => {
                    const newValue = filters.liked === "true" ? "" : "true";
                    setFilters((prev) => ({ ...prev, liked: newValue }));
                    setPage(1);
                  }}
                  className={`p-2 sm:p-2.5 md:p-3 lg:p-3.5 xl:p-4 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl rounded w-full font-medium transition-colors ${
                    filters.liked === "true"
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-white hover:bg-gray-50 text-black border border-gray-300"
                  }`}
                >
                  ❤️ Me Gustan
                </button>
                <button
                  onClick={() => {
                    const newValue = filters.myCards === "true" ? "" : "true";
                    setFilters((prev) => ({ ...prev, myCards: newValue }));
                    setPage(1);
                  }}
                  className={`p-2 sm:p-2.5 md:p-3 lg:p-3.5 xl:p-4 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl rounded w-full font-medium transition-colors ${
                    filters.myCards === "true"
                      ? "bg-blue-500 hover:bg-blue-600 text-white"
                      : "bg-white hover:bg-gray-50 text-black border border-gray-300"
                  }`}
                >
                  👤 Mis Cartas
                </button>
              </div>
            </div>
          )}
          {user && (
            <div className="mb-4 flex justify-center">
              <button
                className="bg-gray-600 hover:bg-gray-700 text-white text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-light py-2 sm:py-2.5 md:py-3 lg:py-3.5 xl:py-4 px-6 sm:px-7 md:px-8 lg:px-10 xl:px-12 rounded-lg transition-colors"
                onClick={() => setShowCreate(true)}
              >
                Crear carta
              </button>
            </div>
          )}
        </>
      )}
      {!showCreate &&
        (loading ? (
          <div className="text-white text-center py-8">Cargando...</div>
        ) : error ? (
          <div className="text-red-500 text-center py-4 px-4 bg-red-100 rounded-lg">
            {error}
          </div>
        ) : (
          <>
            {cards.length === 0 ? (
              <div className="flex flex-col items-center justify-center w-full py-12 px-4">
                <span className="text-lg md:text-xl text-gray-300 font-semibold text-center">
                  No se han encontrado cartas
                </span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-4 md:gap-6 pt-4 sm:pt-8 md:pt-12 lg:pt-16 px-2 sm:px-0">
                  {cards.map((card) => {
                    let factionObj: Faction | undefined = undefined;
                    if (
                      typeof card.faction === "object" &&
                      card.faction !== null
                    ) {
                      factionObj = card.faction as Faction;
                    } else if (typeof card.faction === "string") {
                      factionObj = factions.find((f) => f._id === card.faction);
                    }
                    const canDelete = canDeleteCard(card);
                    const isDeleting = deletingCards.has(card._id);
                    const showConfirm = confirmingDelete === card._id;
                    return (
                      <div key={card._id} className="relative group">
                        <CardTile
                          card={card}
                          to={`/cards/${card._id}`}
                          state={{ card, faction: factionObj }}
                        />
                        {canDelete && (
                          <div className="absolute top-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            {!showConfirm ? (
                              <button
                                onClick={() => setConfirmingDelete(card._id)}
                                disabled={isDeleting}
                                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-2 py-1 rounded shadow-lg transition-colors disabled:opacity-50"
                                title="Eliminar carta"
                              >
                                ×
                              </button>
                            ) : (
                              <div className="bg-white rounded shadow-lg p-2 min-w-[120px]">
                                <div className="text-xs text-gray-800 font-medium mb-2 text-center">
                                  ¿Eliminar?
                                </div>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleDeleteCard(card._id)}
                                    disabled={isDeleting}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-1 rounded transition-colors disabled:opacity-50"
                                  >
                                    {isDeleting ? "..." : "Sí"}
                                  </button>
                                  <button
                                    onClick={() => setConfirmingDelete(null)}
                                    disabled={isDeleting}
                                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 text-xs font-semibold py-1 rounded transition-colors disabled:opacity-50"
                                  >
                                    No
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-2 mt-6 px-4">
                  {page > 1 && (
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-sm md:text-base font-semibold text-gray-800 w-full sm:w-auto"
                    >
                      Anterior
                    </button>
                  )}
                  <span className="text-white text-lg md:text-xl xl:text-2xl font-medium text-center">
                    Página {page} de {totalPages}
                  </span>
                  {page < totalPages && totalPages > 1 && (
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-sm md:text-base font-semibold text-gray-800 w-full sm:w-auto"
                    >
                      Siguiente
                    </button>
                  )}
                </div>
              </>
            )}
          </>
        ))}
    </PageLayout>
  );
};
export default Cards;

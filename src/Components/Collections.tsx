import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import PageLayout from "./PageLayout";
import { apiFetch } from "./api";
import { useAuth } from "../hooks/useAuth";
import { extractErrorMessage } from "../utils/errors";

interface CollectionItem {
  _id: string;
  title: string;
  description?: string;
  img?: string;
  creator: string | { _id: string; username?: string; email?: string };
  isPrivate?: boolean;
  cards: Array<{ _id: string; title: string; img?: string }>;
}

interface CollectionStats {
  likes: number;
  favorites: number;
}

interface CollectionInteraction {
  liked: boolean;
  favorited: boolean;
}

interface CollectionsResponse {
  collections?: CollectionItem[];
  totalPages?: number;
}

interface Filters {
  title?: string;
  creator?: string;
  sort?: string;
  favorites?: string;
  liked?: string;
  myCollections?: string;
}

const Collections: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [collectionStats, setCollectionStats] = useState<
    Record<string, CollectionStats>
  >({});
  const [collectionInteractions, setCollectionInteractions] = useState<
    Record<string, CollectionInteraction>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<Filters>(() => {
    const urlFilters: Filters = { sort: "date_desc" };
    const title = searchParams.get("title");
    const creator = searchParams.get("creator");
    const sort = searchParams.get("sort");
    const favorites = searchParams.get("favorites");
    const liked = searchParams.get("liked");
    if (title) urlFilters.title = title;
    if (creator) urlFilters.creator = creator;
    if (sort) urlFilters.sort = sort;
    if (favorites) urlFilters.favorites = favorites;
    if (liked) urlFilters.liked = liked;
    return urlFilters;
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    isPrivate: false,
  });
  const [descError, setDescError] = useState("");
  const countCharacters = (text: string): number => {
    return text.split("").reduce((count, char) => {
      return count + (/[A-Z]/.test(char) ? 2 : 1);
    }, 0);
  };
  const [image, setImage] = useState<File | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCollection, setEditingCollection] = useState<string | null>(
    null
  );
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    isPrivate: false,
  });
  const [editImage, setEditImage] = useState<File | null>(null);

  const getCreatorName = (
    creator: string | { _id: string; username?: string; email?: string }
  ) => {
    if (typeof creator === "string") {
      return "Creador desconocido";
    }

    if (creator && typeof creator === "object") {
      return creator.username || creator.email || "Creador desconocido";
    }

    return "Creador desconocido";
  };

  const loadCollectionStats = useCallback(async (collectionId: string) => {
    try {
      const response = await apiFetch<CollectionStats>(
        `/collections/${collectionId}/stats`
      );
      setCollectionStats((prev) => ({
        ...prev,
        [collectionId]: response.data,
      }));
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  }, []);

  const loadCollectionInteraction = useCallback(
    async (collectionId: string) => {
      if (!user) return;
      try {
        const response = await apiFetch<CollectionInteraction>(
          `/collections/${collectionId}/interaction`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        setCollectionInteractions((prev) => ({
          ...prev,
          [collectionId]: response.data,
        }));
      } catch (err) {
        console.error("Error loading interaction:", err);
      }
    },
    [user]
  );

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    setError("");
    let query = `?page=${page}&limit=20`;
    if (
      user?.userId &&
      (filters.favorites || filters.liked || filters.myCollections)
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

      const response = await apiFetch<CollectionsResponse>(
        `/collections${query}`,
        {
          headers,
        }
      );
      const {
        collections: fetchedCollections = [],
        totalPages: fetchedTotalPages = 1,
      } = response.data;
      setCollections(fetchedCollections);
      setTotalPages(fetchedTotalPages);

      fetchedCollections.forEach((col) => {
        void loadCollectionStats(col._id);
        if (user) {
          void loadCollectionInteraction(col._id);
        }
      });
    } catch (e: unknown) {
      setCollections([]);
      const msg = extractErrorMessage(e, "Error al cargar colecciones");
      if (msg && msg !== "No hay colecciones") setError(msg);
    } finally {
      setLoading(false);
    }
  }, [filters, page, user, loadCollectionStats, loadCollectionInteraction]);

  useEffect(() => {
    void fetchCollections();
  }, [fetchCollections]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
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

  const handleEdit = (collection: CollectionItem) => {
    setEditingCollection(collection._id);
    setEditForm({
      title: collection.title,
      description: collection.description || "",
      isPrivate: collection.isPrivate || false,
    });
    setEditImage(null);
  };

  const handleDelete = async (collectionId: string) => {
    if (
      !user ||
      !confirm("¿Estás seguro de que quieres eliminar esta colección?")
    )
      return;

    try {
      await apiFetch(`/collections/${collectionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setCollections((prev) => prev.filter((col) => col._id !== collectionId));
    } catch (error) {
      console.error("Error al eliminar colección:", error);
      alert("Error al eliminar la colección");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingCollection) return;

    try {
      const formData = new FormData();
      formData.append("title", editForm.title.trim());
      formData.append("description", editForm.description.trim());
      formData.append("isPrivate", editForm.isPrivate.toString());

      if (editImage) {
        formData.append("img", editImage);
      }

      const response = await apiFetch<CollectionItem>(
        `/collections/${editingCollection}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${user.token}` },
          body: formData,
        }
      );

      if (response.data) {
        setCollections((prev) =>
          prev.map((col) =>
            col._id === editingCollection ? response.data! : col
          )
        );
        setEditingCollection(null);
        setEditForm({ title: "", description: "", isPrivate: false });
        setEditImage(null);
      }
    } catch (error) {
      console.error("Error al actualizar colección:", error);
      alert("Error al actualizar la colección");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    setCreateSuccess("");
    setCreating(true);
    try {
      if (!user) throw new Error("Debes iniciar sesión");
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("isPrivate", form.isPrivate.toString());
      if (image) fd.append("img", image);
      const resp = await apiFetch<CollectionItem>("/collections", {
        method: "POST",
        body: fd,
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setCollections((prev) => [resp.data, ...prev]);
      setForm({ title: "", description: "", isPrivate: false });
      setImage(null);
      setCreateSuccess("Colección creada, redirigiendo...");

      setTimeout(() => {
        navigate(`/collections/${resp.data._id}`);
      }, 1000);
    } catch (e: unknown) {
      setCreateError(extractErrorMessage(e, "Error al crear colección"));
    } finally {
      setCreating(false);
    }
  };

  const toggleFavorite = async (collectionId: string) => {
    if (!user) return;
    try {
      const response = await apiFetch<{
        favorited: boolean;
        stats: CollectionStats;
      }>(`/collections/${collectionId}/favorite`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setCollectionStats((prev) => ({
        ...prev,
        [collectionId]: response.data.stats,
      }));

      setCollectionInteractions((prev) => ({
        ...prev,
        [collectionId]: {
          ...prev[collectionId],
          favorited: response.data.favorited,
        },
      }));
    } catch (err) {
      console.error("Error al gestionar favoritos:", err);
      setError("Error al gestionar favoritos");
    }
  };

  const toggleLike = async (collectionId: string) => {
    if (!user) return;
    try {
      const response = await apiFetch<{
        liked: boolean;
        stats: CollectionStats;
      }>(`/collections/${collectionId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setCollectionInteractions((prev) => ({
        ...prev,
        [collectionId]: {
          ...prev[collectionId],
          liked: response.data.liked,
        },
      }));

      setCollectionStats((prev) => ({
        ...prev,
        [collectionId]: response.data.stats,
      }));
    } catch (err) {
      console.error("Error al dar me gusta:", err);
      setError("Error al dar me gusta");
    }
  };

  return (
    <PageLayout contentClassName="overflow-y-auto p-3 sm:p-6">
      {showCreateForm ? (
        <>
          <h2 className="text-5xl text-center font-light pb-10 text-white">
            Crear Colección
          </h2>
          <div className="flex justify-center">
            <form
              onSubmit={handleCreate}
              className="bg-gray-700 p-6 sm:p-8 rounded-lg text-white flex flex-col gap-4 sm:gap-6 w-full max-w-lg mx-auto"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-2xl sm:text-3xl font-semibold">
                  Nueva Colección
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setForm({ title: "", description: "", isPrivate: false });
                    setImage(null);
                    setCreateError("");
                    setCreateSuccess("");
                  }}
                  className="text-gray-300 hover:text-white text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              <input
                className="p-3 sm:p-4 rounded text-black text-base sm:text-lg"
                placeholder="Nombre de la colección"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                required
                maxLength={40}
              />
              <textarea
                className="p-3 sm:p-4 rounded text-black text-base sm:text-lg"
                placeholder="Descripción"
                value={form.description}
                onChange={(e) => {
                  const value = e.target.value;
                  if (countCharacters(value) <= 1000) {
                    setForm((f) => ({ ...f, description: value }));
                    setDescError("");
                  } else {
                    setDescError(
                      "La descripción no puede superar los 1000 caracteres."
                    );
                  }
                }}
                rows={4}
              />
              <div className="text-sm text-gray-300 mt-1">
                {countCharacters(form.description)} / 1000
              </div>
              {descError && (
                <div className="text-sm text-red-400 mt-1">{descError}</div>
              )}
              <div className="flex items-center gap-3">
                <input
                  id="isPrivate"
                  type="checkbox"
                  checked={form.isPrivate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isPrivate: e.target.checked }))
                  }
                  className="rounded w-4 h-4"
                />
                <label
                  htmlFor="isPrivate"
                  className="text-base sm:text-lg text-white"
                >
                  Colección privada (solo tú puedes verla)
                </label>
              </div>
              <input
                type="file"
                accept="image/*"
                className="text-sm sm:text-base"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />
              <div className="flex flex-col items-center gap-3">
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded bg-gray-500 px-6 py-3 font-semibold text-white hover:bg-gray-400 disabled:opacity-60 text-base sm:text-lg w-full"
                >
                  {creating ? "Creando..." : "Crear colección"}
                </button>
                {createSuccess && (
                  <span className="text-green-400 text-base text-center">
                    {createSuccess}
                  </span>
                )}
                {createError && (
                  <span className="text-red-400 text-base text-center break-words">
                    {createError}
                  </span>
                )}
              </div>
            </form>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-5xl text-center font-light pb-10 text-white">
            Colecciones
          </h2>

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
                <option value="most_liked">Más valoradas</option>
              </select>
            </div>
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
                    const newValue =
                      filters.myCollections === "true" ? "" : "true";
                    setFilters((prev) => ({
                      ...prev,
                      myCollections: newValue,
                    }));
                    setPage(1);
                  }}
                  className={`p-2 sm:p-2.5 md:p-3 lg:p-3.5 xl:p-4 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl rounded w-full font-medium transition-colors ${
                    filters.myCollections === "true"
                      ? "bg-blue-500 hover:bg-blue-600 text-white"
                      : "bg-white hover:bg-gray-50 text-black border border-gray-300"
                  }`}
                >
                  👤 Mis Colecciones
                </button>
              </div>
            </div>
          )}
          {user && (
            <div className="mb-4 flex justify-center">
              <button
                className="bg-gray-600 hover:bg-gray-700 text-white text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-light py-2 sm:py-2.5 md:py-3 lg:py-3.5 xl:py-4 px-6 sm:px-7 md:px-8 lg:px-10 xl:px-12 rounded-lg transition-colors"
                onClick={() => setShowCreateForm(true)}
              >
                Crear colección
              </button>
            </div>
          )}

          {error && <div className="mb-4 text-red-400 text-sm">{error}</div>}

          {loading ? (
            <div className="text-white text-center py-8">Cargando...</div>
          ) : collections.length === 0 ? (
            <div className="flex flex-col items-center justify-center w-full py-12 px-4">
              <span className="text-lg md:text-xl text-gray-300 font-semibold text-center">
                No se han encontrado colecciones
              </span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 xl:gap-6 pt-4 sm:pt-8 md:pt-12 lg:pt-16 px-2 sm:px-0">
                {collections.map((col) => {
                  const creatorId =
                    typeof col.creator === "string"
                      ? col.creator
                      : col.creator._id;
                  const isOwner = user?.userId && creatorId === user.userId;
                  const isAdmin = user?.role === "admin";
                  const canDeleteCollection = () => {
                    if (!col || !user) return false;
                    if (col.isPrivate) {
                      return isOwner;
                    }
                    return isOwner || isAdmin;
                  };
                  return (
                    <Link
                      key={col._id}
                      to={`/collections/${col._id}`}
                      className="group block rounded bg-white/90 text-black shadow p-3 relative hover:shadow-lg transition"
                      aria-label={`Abrir colección ${col.title}`}
                    >
                      <div className="relative">
                        {col.img ? (
                          <img
                            src={col.img}
                            alt={col.title}
                            className="w-full h-32 sm:h-36 lg:h-40 xl:h-48 object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-32 sm:h-36 lg:h-40 xl:h-48 bg-gray-200 rounded flex items-center justify-center text-gray-600 text-sm">
                            Sin imagen
                          </div>
                        )}
                        {user && (
                          <div className="absolute top-2 right-2 flex gap-1">
                            {!isOwner && (
                              <button
                                title={
                                  collectionInteractions[col._id]?.liked
                                    ? "Quitar me gusta"
                                    : "Me gusta"
                                }
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  void toggleLike(col._id);
                                }}
                                className={`rounded-full p-1.5 sm:p-2 text-sm ${
                                  collectionInteractions[col._id]?.liked
                                    ? "bg-red-400 text-white"
                                    : "bg-black/60 text-white"
                                }`}
                              >
                                ❤️
                              </button>
                            )}

                            {!isOwner && (
                              <button
                                title={
                                  collectionInteractions[col._id]?.favorited
                                    ? "Quitar de favoritos"
                                    : "Marcar como favorito"
                                }
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  void toggleFavorite(col._id);
                                }}
                                className={`rounded-full p-1.5 sm:p-2 text-sm ${
                                  collectionInteractions[col._id]?.favorited
                                    ? "bg-yellow-400 text-black"
                                    : "bg-black/60 text-white"
                                }`}
                              >
                                ⭐
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="mt-2">
                        <div className="font-semibold group-hover:underline text-sm sm:text-base lg:text-lg break-words">
                          {col.title}
                        </div>
                        {col.description && (
                          <div className="text-xs sm:text-sm lg:text-base text-gray-700 line-clamp-2 break-words">
                            {col.description}
                          </div>
                        )}
                        <div className="mt-2 text-xs sm:text-sm text-gray-600 space-y-1">
                          <div>{col.cards?.length || 0} cartas</div>
                          {!col.isPrivate && (
                            <div className="text-gray-500">
                              Por: {getCreatorName(col.creator)}
                            </div>
                          )}
                          {col.isPrivate && (
                            <div className="flex items-center gap-1 text-amber-600">
                              <span>🔒</span>
                              <span>Privada</span>
                            </div>
                          )}
                          {collectionStats[col._id] && (
                            <div className="flex gap-3 text-gray-500 text-xs">
                              <span className="flex items-center gap-1">
                                ❤️ {collectionStats[col._id].likes}
                              </span>
                              <span className="flex items-center gap-1">
                                ⭐ {collectionStats[col._id].favorites}
                              </span>
                            </div>
                          )}
                        </div>
                        {user && canDeleteCollection() ? (
                          <div className="absolute top-2 right-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                            <div className="flex gap-1">
                              {isOwner && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleEdit(col);
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-2 py-1 rounded shadow-lg transition-colors"
                                  title="Editar colección"
                                >
                                  ✏️
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  void handleDelete(col._id);
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-2 py-1 rounded shadow-lg transition-colors"
                                title="Eliminar colección"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </Link>
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
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-sm md:text-base font-semibold text-gray-800 w-full sm:w-auto"
                  >
                    Siguiente
                  </button>
                )}
              </div>
            </>
          )}
        </>
      )}

      {editingCollection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-black">
              Editar Colección
            </h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label
                  htmlFor="edit-title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Título
                </label>
                <input
                  id="edit-title"
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, title: e.target.value }))
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black"
                  required
                  maxLength={40}
                />
              </div>

              <div>
                <label
                  htmlFor="edit-description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Descripción
                </label>
                <textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (countCharacters(value) <= 1000) {
                      setEditForm((f) => ({ ...f, description: value }));
                      setDescError("");
                    } else {
                      setDescError(
                        "La descripción no puede superar los 1000 caracteres."
                      );
                    }
                  }}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black"
                  rows={3}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {countCharacters(editForm.description)} / 1000
                </div>
                {descError && (
                  <div className="text-xs text-red-600 mt-1">{descError}</div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="edit-isPrivate"
                  type="checkbox"
                  checked={editForm.isPrivate}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, isPrivate: e.target.checked }))
                  }
                  className="rounded"
                />
                <label
                  htmlFor="edit-isPrivate"
                  className="text-sm text-gray-700"
                >
                  Colección privada
                </label>
              </div>

              <div>
                <label
                  htmlFor="edit-image"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nueva imagen (opcional)
                </label>
                <input
                  id="edit-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditImage(e.target.files?.[0] || null)}
                  className="mt-1 block w-full text-sm"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditingCollection(null);
                    setEditForm({
                      title: "",
                      description: "",
                      isPrivate: false,
                    });
                    setEditImage(null);
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  );
};
export default Collections;

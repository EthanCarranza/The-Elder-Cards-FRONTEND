import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "./PageLayout";
import { apiFetch } from "./api";
import { extractErrorMessage } from "../utils/errors";
import { useAuth } from "../hooks/useAuth";
import EditFactionForm from "./EditFactionForm";
interface Faction {
  _id: string;
  title: string;
  description: string;
  territory: string;
  color: string;
  img?: string;
}
const FactionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [faction, setFaction] = useState<Faction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingFaction, setEditingFaction] = useState<Faction | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const fetchFaction = async () => {
      if (!id) {
        setError("Identificador de facción no válido");
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await apiFetch<Faction>(`/factions/${id}`);
        setFaction(response.data);
        setError("");
      } catch (fetchError: unknown) {
        console.error("Error al cargar la facción", fetchError);
        setError(extractErrorMessage(fetchError, "Error al cargar la facción"));
      } finally {
        setLoading(false);
      }
    };
    void fetchFaction();
  }, [id]);

  const handleUpdateFaction = async (factionData: FormData) => {
    if (!user || !isAdmin || !faction) return;

    try {
      const response = await apiFetch<Faction>(`/factions/${faction._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${user.token}` },
        body: factionData,
      });

      if (response.data) {
        setFaction(response.data);
        setEditingFaction(null);
      }
    } catch (updateError: unknown) {
      console.error("Error al actualizar facción:", updateError);
      setError(
        extractErrorMessage(updateError, "No se pudo actualizar la facción")
      );
    }
  };

  const handleDeleteFaction = async () => {
    if (!user || !isAdmin || !faction) return;

    setDeleting(true);
    try {
      await apiFetch(`/factions/${faction._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });

      navigate("/factions");
    } catch (deleteError: unknown) {
      console.error("Error al eliminar facción:", deleteError);
      setError(
        extractErrorMessage(deleteError, "No se pudo eliminar la facción")
      );
      setDeleting(false);
      setConfirmingDelete(false);
    }
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/factions");
    }
  };
  return (
    <PageLayout contentClassName="p-4 lg:p-6 flex flex-col justify-center min-h-screen">
      <div className="mx-auto max-w-4xl w-full pb-8">
        <button
          onClick={handleGoBack}
          className="mb-6 rounded bg-gray-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-600"
        >
          Volver
        </button>
        {loading ? (
          <div className="text-white text-center">Cargando facción...</div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : faction ? (
          <div className="rounded-lg bg-white/90 shadow-lg backdrop-blur overflow-hidden">
            {}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 lg:p-8 relative">
              <div className="flex items-center gap-4">
                <span
                  className="inline-block h-12 w-12 lg:h-16 lg:w-16 rounded-full border-4 border-white shadow-lg flex-shrink-0"
                  style={{ backgroundColor: faction.color }}
                ></span>
                <div className="flex-1">
                  <h1 className="text-2xl lg:text-4xl font-bold text-white break-words">
                    {faction.title}
                  </h1>
                  <p className="text-lg lg:text-xl text-gray-300 mt-1">
                    {faction.territory}
                  </p>
                </div>
              </div>
              {isAdmin && (
                <div className="flex gap-2 mt-4 justify-end">
                  <button
                    onClick={() => setEditingFaction(faction)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-3 py-2 rounded shadow-lg transition-colors"
                    title="Editar facción"
                  >
                    ✏️ Editar
                  </button>
                  {!confirmingDelete ? (
                    <button
                      onClick={() => setConfirmingDelete(true)}
                      disabled={deleting}
                      className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-3 py-2 rounded shadow-lg transition-colors disabled:opacity-50"
                      title="Eliminar facción"
                    >
                      🗑️ Eliminar
                    </button>
                  ) : (
                    <div className="flex gap-1">
                      <button
                        onClick={handleDeleteFaction}
                        disabled={deleting}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-2 py-1 rounded transition-colors disabled:opacity-50"
                      >
                        {deleting ? "..." : "Confirmar"}
                      </button>
                      <button
                        onClick={() => setConfirmingDelete(false)}
                        disabled={deleting}
                        className="bg-gray-500 hover:bg-gray-600 text-white text-xs font-semibold px-2 py-1 rounded transition-colors disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            {}
            {faction.img && (
              <div className="relative">
                <img
                  src={faction.img}
                  alt={`Imagen de ${faction.title}`}
                  className="w-full h-64 sm:h-80 lg:h-96 object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            )}
            {}
            <div className="p-6 lg:p-8">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">
                Descripción
              </h2>
              <div className="prose prose-gray max-w-none">
                <p
                  className="text-gray-700 leading-relaxed text-base lg:text-lg whitespace-pre-line break-words"
                  style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
                >
                  {faction.description}
                </p>
              </div>
              {}
              <div className="mt-8 p-4 lg:p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Información de la facción
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                      Territorio
                    </div>
                    <div className="mt-1 text-lg font-semibold text-gray-900">
                      {faction.territory}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                      Color representativo
                    </div>
                    <div className="mt-1 flex items-center gap-3">
                      <span
                        className="inline-block h-8 w-8 rounded-full border-2 border-gray-400 shadow-sm flex-shrink-0"
                        style={{ backgroundColor: faction.color }}
                      ></span>
                      <span className="font-mono text-sm text-gray-700 bg-gray-200 px-2 py-1 rounded">
                        {faction.color}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {}
              <div className="mt-8 text-center">
                <button
                  onClick={() => navigate(`/cards?faction=${faction._id}`)}
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-semibold px-6 py-3 transition-colors shadow-lg"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  Ver cartas de {faction.title}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-white text-center">
            No se encontró la facción solicitada.
          </div>
        )}

        {isAdmin && editingFaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4 text-black">
                Editar Facción
              </h3>
              <EditFactionForm
                faction={editingFaction}
                onUpdated={handleUpdateFaction}
                onCancel={() => setEditingFaction(null)}
              />
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};
export default FactionDetail;

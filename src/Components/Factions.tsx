import {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "./api";
import { extractErrorMessage } from "../utils/errors";
import { useAuth } from "../hooks/useAuth";
import PageLayout from "./PageLayout";
import EditFactionForm from "./EditFactionForm";
interface Faction {
  _id: string;
  title: string;
  description: string;
  territory: string;
  color: string;
  img?: string;
}
const Factions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";
  const [factions, setFactions] = useState<Faction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editingFaction, setEditingFaction] = useState<Faction | null>(null);
  const [deletingFactions, setDeletingFactions] = useState<Set<string>>(
    new Set()
  );
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const fetchFactions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiFetch<Faction[]>("/factions");
      setFactions(response.data ?? []);
    } catch (fetchError: unknown) {
      setError(extractErrorMessage(fetchError, "Error al cargar facciones"));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void fetchFactions();
  }, [fetchFactions]);
  const handleDeleteFaction = async (factionId: string) => {
    if (!user || !isAdmin) return;
    setDeletingFactions((prev) => new Set(prev).add(factionId));
    setError("");
    try {
      await apiFetch(`/factions/${factionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setFactions((prev) =>
        prev.filter((faction) => faction._id !== factionId)
      );
      setConfirmingDelete(null);
    } catch (deleteError: unknown) {
      console.error("Error al eliminar facción:", deleteError);
      setError(
        extractErrorMessage(deleteError, "No se pudo eliminar la facción")
      );
    } finally {
      setDeletingFactions((prev) => {
        const next = new Set(prev);
        next.delete(factionId);
        return next;
      });
    }
  };

  const [editErrorMsg, setEditErrorMsg] = useState<string | undefined>(
    undefined
  );
  const handleUpdateFaction = async (factionData: FormData) => {
    if (!user || !isAdmin || !editingFaction) return;
    try {
      const response = await apiFetch<Faction>(
        `/factions/${editingFaction._id}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${user.token}` },
          body: factionData,
        }
      );
      if (response.data) {
        setFactions((prev) =>
          prev.map((faction) =>
            faction._id === editingFaction._id ? response.data! : faction
          )
        );
        setEditingFaction(null);
      }
    } catch (updateError) {
      const msg = extractErrorMessage(
        updateError,
        "No se pudo actualizar la facción"
      );
      if (
        msg.includes("Ya existe una facción con ese nombre") ||
        msg.includes("facción con ese nombre")
      ) {
        setEditErrorMsg(msg);
      } else {
        setError(msg);
      }
    }
  };

  return (
    <PageLayout contentClassName="flex-1 overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto">
        <h3 className="mb-6 text-3xl lg:text-4xl font-bold text-white text-center">
          Facciones
        </h3>
        {showCreate ? null : loading ? (
          <div className="text-white text-center">Cargando...</div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : factions.length === 0 ? (
          <div className="text-gray-400 text-center">
            No hay facciones disponibles
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3 justify-items-center">
            {factions.map((factionItem) => {
              const isDeleting = deletingFactions.has(factionItem._id);
              const showConfirm = confirmingDelete === factionItem._id;
              return (
                <div
                  key={factionItem._id}
                  className="relative flex flex-col items-start rounded-lg border-2 border-gray-700 bg-gray-800 p-6 shadow-lg transition-all hover:border-green-500 w-full max-w-md group"
                >
                  {factionItem.img && (
                    <img
                      src={factionItem.img}
                      alt={`Imagen de ${factionItem.title}`}
                      className="mb-4 h-48 w-full rounded-lg object-cover shadow-md"
                      loading="lazy"
                    />
                  )}
                  <div className="mb-4 flex w-full items-center gap-3">
                    <span
                      className="inline-block h-6 w-6 rounded-full border-2 border-gray-400 shadow-sm"
                      style={{ backgroundColor: factionItem.color }}
                      title={factionItem.color}
                    ></span>
                    <div className="flex-1">
                      <div className="text-xl xl:text-2xl font-bold text-white">
                        {factionItem.title}
                      </div>
                      <div className="text-sm xl:text-base text-gray-300">
                        {factionItem.territory}
                      </div>
                    </div>
                  </div>
                  <button
                    className="self-center mb-2 rounded-lg bg-green-600/20 px-4 py-2 text-sm xl:text-base font-medium text-green-400 transition-colors hover:bg-green-600/30 hover:text-green-300"
                    onClick={() => navigate(`/factions/${factionItem._id}`)}
                    type="button"
                  >
                    Ver Facción
                  </button>
                  {}
                  {isAdmin && (
                    <div className="absolute top-2 right-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      {!showConfirm ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditingFaction(factionItem)}
                            disabled={isDeleting}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-2 py-1 rounded shadow-lg transition-colors disabled:opacity-50"
                            title="Editar facción"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => setConfirmingDelete(factionItem._id)}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-2 py-1 rounded shadow-lg transition-colors disabled:opacity-50"
                            title="Eliminar facción"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="bg-white rounded shadow-lg p-2 min-w-[120px]">
                          <div className="text-xs text-gray-800 font-medium mb-2 text-center">
                            ¿Eliminar facción?
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() =>
                                handleDeleteFaction(factionItem._id)
                              }
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
        )}
        {isAdmin && !showCreate && (
          <div className="mt-8 text-center">
            <button
              className="rounded-lg bg-gray-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-700 disabled:opacity-50 shadow-lg"
              onClick={() => setShowCreate(true)}
              type="button"
            >
              Crear facción
            </button>
          </div>
        )}
        {isAdmin && showCreate && (
          <div className="mt-8 space-y-6">
            <div className="text-center">
              <button
                className="rounded-lg bg-gray-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
                onClick={() => setShowCreate(false)}
                type="button"
              >
                ← Volver al listado
              </button>
            </div>
            <CreateFactionForm
              onCreated={async () => {
                await fetchFactions();
                setShowCreate(false);
              }}
            />
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
                onCancel={() => {
                  setEditingFaction(null);
                  setError("");
                  setEditErrorMsg(undefined);
                }}
                errorMsg={editErrorMsg}
                clearErrorMsg={() => setEditErrorMsg(undefined)}
              />
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};
interface CreateFactionFormProps {
  onCreated: () => Promise<void> | void;
}
const CreateFactionForm = ({ onCreated }: CreateFactionFormProps) => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: "",
    description: "",
    territory: "",
    color: "#000000",
  });
  const [descError, setDescError] = useState("");
  const countCharacters = (text: string): number => {
    return text.split("").reduce((count, char) => {
      return count + (/[A-Z]/.test(char) ? 2 : 1);
    }, 0);
  };
  const [img, setImg] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, files, type } = event.target as HTMLInputElement;
    if (type === "file") {
      setImg(files && files[0] ? files[0] : null);
      return;
    }
    if (name === "description") {
      if (countCharacters(value) <= 1000) {
        setForm((prev) => ({ ...prev, description: value }));
        setDescError("");
      } else {
        setDescError("La descripción no puede superar los 1000 caracteres.");
      }
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const trimmedTitle = form.title.trim();
    const trimmedDescription = form.description.trim();
    const trimmedTerritory = form.territory.trim();

    if (!trimmedTitle || !trimmedDescription || !trimmedTerritory) {
      setError(
        "Todos los campos son obligatorios y no pueden contener solo espacios vacíos"
      );
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", trimmedTitle);
      formData.append("description", trimmedDescription);
      formData.append("territory", trimmedTerritory);
      formData.append("color", form.color);
      if (img) {
        formData.append("img", img);
      }
      const headers = user?.token
        ? { Authorization: `Bearer ${user.token}` }
        : undefined;
      await apiFetch("/factions", {
        method: "POST",
        body: formData,
        headers,
      });
      setSuccess("Faccion creada correctamente");
      setForm({ title: "", description: "", territory: "", color: "#000000" });
      setImg(null);
      await onCreated();
    } catch (submitError: unknown) {
      setError(extractErrorMessage(submitError, "Error al crear faccion"));
    } finally {
      setLoading(false);
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-lg flex-col gap-6 rounded-lg bg-gray-800 p-6 shadow-lg border border-gray-700"
    >
      <h4 className="text-xl font-semibold text-white text-center">
        Nueva Facción
      </h4>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Nombre de la facción
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Ej: Imperio de Cyrodiil"
            className="w-full rounded-lg p-3 border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
            required
            maxLength={40}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Territorio
          </label>
          <input
            name="territory"
            value={form.territory}
            onChange={handleChange}
            placeholder="Ej: Cyrodiil"
            className="w-full rounded-lg p-3 border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
            required
            maxLength={40}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Descripción
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe la facción, su historia y características..."
            className="w-full h-32 resize-none rounded-lg p-3 border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
            required
          />
          <div className="text-xs text-gray-400 mt-1">
            {countCharacters(form.description)} / 1000
          </div>
          {descError && (
            <div className="text-xs text-red-400 mt-1">{descError}</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Color principal
          </label>
          <div className="flex items-center gap-3">
            <input
              name="color"
              type="color"
              value={form.color}
              onChange={handleChange}
              className="h-12 w-16 cursor-pointer rounded-lg border border-gray-600 bg-transparent"
              required
            />
            <span className="text-gray-300 font-mono text-sm bg-gray-700 px-3 py-2 rounded">
              {form.color}
            </span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Imagen (opcional)
          </label>
          <input
            name="img"
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="w-full rounded-lg bg-gray-700 p-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-600 file:text-white hover:file:bg-green-700"
          />
          {img && (
            <span className="text-sm text-green-400 mt-2 block">
              📁 {img.name}
            </span>
          )}
        </div>
      </div>
      {error && (
        <div className="text-sm text-red-400 bg-red-900/20 border border-red-600 rounded p-3">
          {error}
        </div>
      )}
      {success && (
        <div className="text-sm text-green-400 bg-green-900/20 border border-green-600 rounded p-3">
          {success}
        </div>
      )}
      <button
        type="submit"
        className="w-full rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? "Creando..." : "Crear facción"}
      </button>
    </form>
  );
};

export default Factions;

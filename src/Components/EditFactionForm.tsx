import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { extractErrorMessage } from "../utils/errors";

interface Faction {
  _id: string;
  title: string;
  description: string;
  territory: string;
  color: string;
  img?: string;
}

interface EditFactionFormProps {
  faction: Faction;
  onUpdated: (factionData: FormData) => Promise<void>;
  onCancel: () => void;
  errorMsg?: string;
  clearErrorMsg?: () => void;
}

const EditFactionForm = ({
  faction,
  onUpdated,
  onCancel,
  errorMsg,
  clearErrorMsg,
}: EditFactionFormProps) => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: faction.title,
    description: faction.description,
    territory: faction.territory,
    color: faction.color,
  });
  const [descError, setDescError] = useState("");
  const countCharacters = (text: string): number => {
    return text.split("").reduce((count, char) => {
      return count + (/[A-Z]/.test(char) ? 2 : 1);
    }, 0);
  };
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "file") {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      setImg(file);
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
  const [img, setImg] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (errorMsg) setError(errorMsg);
  }, [errorMsg]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const trimmedTitle = form.title.trim();
    const trimmedDescription = form.description.trim();
    const trimmedTerritory = form.territory.trim();
    
    if (!trimmedTitle || !trimmedDescription || !trimmedTerritory) {
      setError("Todos los campos son obligatorios y no pueden contener solo espacios vacíos");
      return;
    }

    setLoading(true);
    setError("");
    if (clearErrorMsg) clearErrorMsg();

    try {
      const formData = new FormData();
      formData.append("title", trimmedTitle);
      formData.append("description", trimmedDescription);
      formData.append("territory", trimmedTerritory);
      formData.append("color", form.color);

      if (img) {
        formData.append("img", img);
      }

      await onUpdated(formData);
    } catch (updateError: unknown) {
      setError(extractErrorMessage(updateError, "Error al actualizar facción"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Territorio
          </label>
          <input
            name="territory"
            type="text"
            value={form.territory}
            onChange={handleChange}
            placeholder="Ej: Skyrim, Cyrodiil, Morrowind..."
            className="w-full rounded-lg p-3 border border-gray-300 text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            maxLength={40}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título
          </label>
          <input
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            placeholder="Ej: Imperio, Hermandad Oscura..."
            className="w-full rounded-lg p-3 border border-gray-300 text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            maxLength={40}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe la facción, su historia y características..."
            className="w-full h-24 resize-none rounded-lg p-3 border border-gray-300 text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <div className="text-xs text-gray-500 mt-1">
            {countCharacters(form.description)} / 1000
          </div>
          {descError && (
            <div className="text-xs text-red-600 mt-1">{descError}</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color principal
          </label>
          <div className="flex items-center gap-3">
            <input
              name="color"
              type="color"
              value={form.color}
              onChange={handleChange}
              className="h-12 w-16 cursor-pointer rounded-lg border border-gray-300"
              required
            />
            <span className="text-gray-700 font-mono text-sm bg-gray-100 px-3 py-2 rounded">
              {form.color}
            </span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nueva imagen (opcional)
          </label>
          <input
            name="img"
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="w-full rounded-lg bg-gray-50 p-3 text-black file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
          />
          {img && (
            <span className="text-sm text-blue-600 mt-2 block">
              📁 {img.name}
            </span>
          )}
          {faction.img && !img && (
            <div className="mt-2">
              <span className="text-sm text-gray-600">Imagen actual:</span>
              <img
                src={faction.img}
                alt="Imagen actual"
                className="mt-1 h-20 w-20 object-cover rounded border"
              />
            </div>
          )}
        </div>
      </div>
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
          {error}
        </div>
      )}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={() => {
            setError("");
            if (clearErrorMsg) clearErrorMsg();
            onCancel();
          }}
          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
};

export default EditFactionForm;

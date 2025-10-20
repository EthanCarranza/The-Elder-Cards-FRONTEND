import { useState, useEffect, useRef } from "react";
import { apiFetch } from "./api";
import { CARD_TYPES } from "../constants/cardTypes";
import { extractErrorMessage } from "../utils/errors";
import { drawCard, CARD_DIMENSIONS_EXPORT } from "../utils/cardCanvas";
import {
  handleCardBlur,
  handleCardFocus,
  handleCardPointerLeave,
  handleCardPointerMove,
} from "../utils/card3d";
interface FactionOption {
  _id: string;
  title: string;
  color: string;
}

interface CreatedCard {
  _id: string;
  title: string;
  description: string;
  type: string;
  faction: string;
  creator: string;
  cost: number;
  img?: string;
  attack?: number;
  defense?: number;
}

interface Props {
  onCreated?: (createdCardId?: string) => void;
  factions: FactionOption[];
}
const CreateCard: React.FC<Props> = ({ onCreated, factions }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewImage, setPreviewImage] = useState<HTMLImageElement | null>(
    null
  );
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "Creature",
    faction: "",
    cost: "",
    attack: "",
    defense: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tooltip, setTooltip] = useState<{ field: string; visible: boolean }>({
    field: "",
    visible: false,
  });
  const fieldHelp: Record<string, string> = {
    title:
      "El nombre de la carta. Máximo 20 caracteres. Debe ser único y descriptivo.",
    description: "Descripción de la carta. Máximo 322 caracteres.",
    type: "El tipo de carta: Criatura, Artefacto o Hechizo.",
    faction: "La facción a la que pertenece la carta.",
    cost: "Coste de jugar la carta (0-10).",
    attack: "Poder de ataque de la criatura (0-10). Solo para criaturas.",
    defense: "Defensa de la criatura (1-10). Solo para criaturas.",
    image: "Imagen de la carta. Formatos permitidos: JPG, PNG, GIF.",
  };
  useEffect(() => {
    const updateCanvas = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const faction = factions.find((f) => f._id === form.faction);
      const frameColor = faction ? faction.color : "#999999";
      await drawCard(ctx, {
        title: form.title || "Título",
        type: form.type,
        cost: parseInt(form.cost) || 0,
        description: form.description || "Descripción",
        frameColor,
        creator: localStorage.getItem("username") || "Anónimo",
        imageElement: previewImage || undefined,
        ...(form.type === "Creature"
          ? {
              attack: parseInt(form.attack) || 0,
              defense: parseInt(form.defense) || 1,
            }
          : {}),
      });
    };
    void updateCanvas();
  }, [form, previewImage, factions]);
  const countCharacters = (text: string): number => {
    return text.split("").reduce((count, char) => {
      return count + (/[A-Z]/.test(char) ? 2 : 1);
    }, 0);
  };
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const {
      name,
      value,
      type: inputType,
      files,
    } = e.target as HTMLInputElement;
    if (name === "description") {
      if (countCharacters(value) <= 322) {
        setForm((prev) => ({ ...prev, description: value }));
      }
      return;
    }
    if (inputType === "file" && files) {
      setImage(files[0] || null);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const img = new Image();
          img.onload = () => {
            setPreviewImage(img);
          };
          img.src = event.target.result as string;
        }
      };
      reader.readAsDataURL(files[0]);
      return;
    }
    if (name === "type") {
      const normalizedType = value
        ? value.charAt(0).toUpperCase() + value.slice(1)
        : value;
      setForm((prev) => ({
        ...prev,
        type: normalizedType,
        attack: "",
        defense: "",
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("type", form.type);
      formData.append("faction", form.faction);
      formData.append("cost", form.cost);
      if (form.type === "Creature") {
        formData.append("attack", form.attack);
        formData.append("defense", form.defense);
      }
      if (image) {
        formData.append("img", image);
      }
      const token = localStorage.getItem("token");
      const response = await apiFetch<CreatedCard>("/cards", {
        method: "POST",
        body: formData,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      setSuccess("Carta creada correctamente");
      setForm({
        title: "",
        description: "",
        type: "Creature",
        faction: "",
        cost: "",
        attack: "",
        defense: "",
      });
      setImage(null);
      if (onCreated) onCreated(response.data?._id);
    } catch (error: unknown) {
      setError(extractErrorMessage(error, "Error al crear carta"));
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col lg:flex-row gap-8 justify-center items-start max-w-7xl mx-auto px-4">
      <div
        className="card-3d-wrapper mx-auto lg:mx-0 flex-shrink-0"
        style={{
          width: `${Math.min(CARD_DIMENSIONS_EXPORT.canvasWidth + 32, 320)}px`,
        }}
      >
        <div
          className="card-3d relative block h-full w-full overflow-hidden rounded-lg border border-black/30 shadow-2xl bg-gray-800 p-4"
          onPointerMove={handleCardPointerMove}
          onPointerLeave={handleCardPointerLeave}
          onPointerCancel={handleCardPointerLeave}
          onFocus={handleCardFocus}
          onBlur={handleCardBlur}
          tabIndex={0}
        >
          <canvas
            ref={canvasRef}
            width={CARD_DIMENSIONS_EXPORT.canvasWidth}
            height={CARD_DIMENSIONS_EXPORT.canvasHeight}
            className="card-3d-element w-full h-auto"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </div>
      </div>
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 text-xl rounded p-4 lg:p-8 w-full max-w-lg flex flex-col gap-4"
      >
        <h3 className="text-3xl font-bold text-white mb-2">
          Crear nueva carta
        </h3>
        <div className="relative text-black  flex items-center">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Titulo"
            className="p-2 rounded flex-1"
            required
            maxLength={20}
          />
          <span
            className="ml-2 text-blue-400 text-lg select-none cursor-pointer"
            onMouseEnter={() => setTooltip({ field: "title", visible: true })}
            onMouseLeave={() => setTooltip({ field: "", visible: false })}
          >
            &#x2753;
          </span>
          {tooltip.visible && tooltip.field === "title" && (
            <div className="absolute right-0 lg:left-full top-full lg:top-1/2 lg:-translate-y-1/2 mt-1 lg:mt-0 lg:ml-2 bg-gray-900 text-white text-xs rounded p-2 shadow-lg z-10 w-64 max-w-[calc(100vw-2rem)]">
              {fieldHelp.title}
            </div>
          )}
        </div>
        <div className="relative text-black flex items-center">
          <select
            name="type"
            value={form.type.toLowerCase()}
            onChange={handleChange}
            className="p-2 rounded flex-1"
            required
          >
            {CARD_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <span
            className="ml-2 text-blue-400 text-lg select-none cursor-pointer"
            onMouseEnter={() => setTooltip({ field: "type", visible: true })}
            onMouseLeave={() => setTooltip({ field: "", visible: false })}
          >
            &#x2753;
          </span>
          {tooltip.visible && tooltip.field === "type" && (
            <div className="absolute right-0 lg:left-full top-full lg:top-1/2 lg:-translate-y-1/2 mt-1 lg:mt-0 lg:ml-2 bg-gray-900 text-white text-xs rounded p-2 shadow-lg z-10 w-64 max-w-[calc(100vw-2rem)]">
              {fieldHelp.type}
            </div>
          )}
        </div>
        <div className="relative text-black flex flex-col gap-1">
          <div className="flex items-center">
            <div className="relative flex-1">
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Descripción"
                className="p-2 rounded w-full resize-none"
                required
                rows={4}
              />
              <div className="absolute right-0 bottom-[-20px] text-xs text-gray-400">
                {322 - countCharacters(form.description)} caracteres restantes
              </div>
            </div>
            <span
              className="ml-2 text-blue-400 text-lg select-none cursor-pointer"
              onMouseEnter={() =>
                setTooltip({ field: "description", visible: true })
              }
              onMouseLeave={() => setTooltip({ field: "", visible: false })}
            >
              &#x2753;
            </span>
            {tooltip.visible && tooltip.field === "description" && (
              <div className="absolute right-0 lg:left-full top-full lg:top-1/2 lg:-translate-y-1/2 mt-1 lg:mt-0 lg:ml-2 bg-gray-900 text-white text-xs rounded p-2 shadow-lg z-10 w-64 max-w-[calc(100vw-2rem)]">
                {fieldHelp.description}
              </div>
            )}
          </div>
        </div>
        <div className="relative text-black flex items-center">
          <select
            name="faction"
            value={form.faction}
            onChange={handleChange}
            className="p-2 rounded flex-1"
            required
            disabled={factions.length === 0}
          >
            <option value="">
              {factions.length === 0
                ? "No hay facciones disponibles"
                : "Facción"}
            </option>
            {factions.map((f) => (
              <option key={f._id} value={f._id}>
                {f.title}
              </option>
            ))}
          </select>
          <span
            className="ml-2 text-blue-400 text-lg select-none cursor-pointer"
            onMouseEnter={() => setTooltip({ field: "faction", visible: true })}
            onMouseLeave={() => setTooltip({ field: "", visible: false })}
          >
            &#x2753;
          </span>
          {tooltip.visible && tooltip.field === "faction" && (
            <div className="absolute right-0 lg:left-full top-full lg:top-1/2 lg:-translate-y-1/2 mt-1 lg:mt-0 lg:ml-2 bg-gray-900 text-white text-xs rounded p-2 shadow-lg z-10 w-64 max-w-[calc(100vw-2rem)]">
              {fieldHelp.faction}
            </div>
          )}
        </div>
        <div className="relative text-black flex items-center">
          <input
            name="cost"
            type="number"
            min={0}
            max={10}
            value={form.cost}
            onChange={handleChange}
            placeholder="Coste"
            className="p-2 rounded flex-1"
            required
          />
          <span
            className="ml-2 text-blue-400 text-lg select-none cursor-pointer"
            onMouseEnter={() => setTooltip({ field: "cost", visible: true })}
            onMouseLeave={() => setTooltip({ field: "", visible: false })}
          >
            &#x2753;
          </span>
          {tooltip.visible && tooltip.field === "cost" && (
            <div className="absolute right-0 lg:left-full top-full lg:top-1/2 lg:-translate-y-1/2 mt-1 lg:mt-0 lg:ml-2 bg-gray-900 text-white text-xs rounded p-2 shadow-lg z-10 w-64 max-w-[calc(100vw-2rem)]">
              {fieldHelp.cost}
            </div>
          )}
        </div>
        {form.type === "Creature" && (
          <div className="flex gap-4">
            <div className="relative flex-1 flex items-center">
              <input
                name="attack"
                type="number"
                min={0}
                max={10}
                value={form.attack}
                onChange={handleChange}
                placeholder="Ataque"
                className="p-2 text-black rounded w-full"
                required
              />
              <span
                className="ml-2 text-blue-400 text-lg select-none cursor-pointer"
                onMouseEnter={() =>
                  setTooltip({ field: "attack", visible: true })
                }
                onMouseLeave={() => setTooltip({ field: "", visible: false })}
              >
                &#x2753;
              </span>
              {tooltip.visible && tooltip.field === "attack" && (
                <div className="absolute right-0 lg:left-full top-full lg:top-1/2 lg:-translate-y-1/2 mt-1 lg:mt-0 lg:ml-2 bg-gray-900 text-white text-xs rounded p-2 shadow-lg z-10 w-64 max-w-[calc(100vw-2rem)]">
                  {fieldHelp.attack}
                </div>
              )}
            </div>
            <div className="relative flex-1 flex items-center">
              <input
                name="defense"
                type="number"
                min={1}
                max={10}
                value={form.defense}
                onChange={handleChange}
                placeholder="Defensa"
                className="p-2 text-black rounded w-full"
                required
              />
              <span
                className="ml-2 text-blue-400 text-lg select-none cursor-pointer"
                onMouseEnter={() =>
                  setTooltip({ field: "defense", visible: true })
                }
                onMouseLeave={() => setTooltip({ field: "", visible: false })}
              >
                &#x2753;
              </span>
              {tooltip.visible && tooltip.field === "defense" && (
                <div className="absolute right-0 lg:left-full top-full lg:top-1/2 lg:-translate-y-1/2 mt-1 lg:mt-0 lg:ml-2 bg-gray-900 text-white text-xs rounded p-2 shadow-lg z-10 w-64 max-w-[calc(100vw-2rem)]">
                  {fieldHelp.defense}
                </div>
              )}
            </div>
          </div>
        )}
        <div className="relative flex items-center">
          <input
            name="image"
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="p-2 rounded flex-1 bg-gray-700 text-white text-sm lg:text-base w-0 min-w-0"
            required
          />
          <span
            className="ml-2 text-blue-400 text-lg select-none cursor-pointer flex-shrink-0"
            onMouseEnter={() => setTooltip({ field: "image", visible: true })}
            onMouseLeave={() => setTooltip({ field: "", visible: false })}
          >
            &#x2753;
          </span>
          {tooltip.visible && tooltip.field === "image" && (
            <div className="absolute right-0 lg:left-full top-full lg:top-1/2 lg:-translate-y-1/2 mt-1 lg:mt-0 lg:ml-2 bg-gray-900 text-white text-xs rounded p-2 shadow-lg z-10 w-64 max-w-[calc(100vw-2rem)]">
              {fieldHelp.image}
            </div>
          )}
        </div>
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Creando..." : "Crear carta"}
        </button>
        {error && <div className="text-red-500">{error}</div>}
        {success && <div className="text-green-500">{success}</div>}
      </form>
    </div>
  );
};
export default CreateCard;

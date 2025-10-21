import { useState, useEffect, useRef } from "react";
import { apiFetch } from "./api";
import PageLayout from "./PageLayout";
import { useAuth } from "../hooks/useAuth";
interface BestiaryEntry {
  _id: string;
  name: string;
  description: string;
  type: string;
  img?: string;
  discipline?: string;
  element?: string;
  species?: string;
  creatureType?: string;
  creatureCategory?: string;
  category?: string;
  spellType?: string;
  effect?: string;
  territory?: string;
  defense?: number;
  cost?: number;
  health?: number;
  magic?: number;
  stamina?: number;
  hunger?: number;
}

const Bestiary = () => {
  const [entries, setEntries] = useState<BestiaryEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<BestiaryEntry | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [filterType, setFilterType] = useState<"creatures" | "artifacts">(
    "creatures"
  );
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  type Spell = {
    _id: string;
    name: string;
    description?: string;
    effect?: string;
    element?: string;
    discipline?: string;
    type?: string;
  };
  const [spells, setSpells] = useState<Spell[]>([]);
  const [spellsLoading, setSpellsLoading] = useState(false);
  const [spellsError, setSpellsError] = useState("");

  useEffect(() => {
    if (!selectedEntry) return;
    setSpellsLoading(true);
    setSpellsError("");
    const params = new URLSearchParams();
    if (filterType === "creatures") {
      if (selectedEntry.type) params.append("type", selectedEntry.type);
      if (selectedEntry.element)
        params.append("element", selectedEntry.element);
      if (selectedEntry.category)
        params.append("category", selectedEntry.category);
      apiFetch<Spell[]>(`/bestiary/spells/for-creature?${params.toString()}`)
        .then((response) => {
          setSpells(Array.isArray(response.data) ? response.data : []);
        })
        .catch(() => {
          setSpellsError("Error al cargar hechizos");
        })
        .finally(() => setSpellsLoading(false));
    } else {
      if (selectedEntry.element)
        params.append("element", selectedEntry.element);
      console.log("selectedEntry.type:", selectedEntry);
      if (selectedEntry.creatureType)
        params.append("creatureType", selectedEntry.creatureType);
      if (selectedEntry.spellType)
        params.append("spellType", selectedEntry.spellType);
      apiFetch<Spell[]>(`/bestiary/spells/for-artifact?${params.toString()}`)
        .then((response) => {
          setSpells(Array.isArray(response.data) ? response.data : []);
        })
        .catch(() => {
          setSpellsError("Error al cargar hechizos");
        })
        .finally(() => setSpellsLoading(false));
    }
  }, [selectedEntry, filterType]);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIndexMinimized(false);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const [indexMinimized, setIndexMinimized] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [showUploadPanel, setShowUploadPanel] = useState<boolean>(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      setError("");
      try {
        let response;
        if (filterType === "creatures") {
          response = await apiFetch("/bestiary/creatures?page=1&limit=1000");
          if (response.status === 200) {
            const data = response.data as { creatures: BestiaryEntry[] };
            setEntries(data.creatures || []);
            setSelectedEntry((data.creatures && data.creatures[0]) || null);
          } else {
            setError(
              "Error al cargar criaturas: " + (response.statusText || "")
            );
          }
        } else {
          response = await apiFetch("/bestiary/artifacts?page=1&limit=1000");
          if (response.status === 200) {
            const data = response.data as { artifacts: BestiaryEntry[] };
            setEntries(data.artifacts || []);
            setSelectedEntry((data.artifacts && data.artifacts[0]) || null);
          } else {
            setError(
              "Error al cargar artefactos: " + (response.statusText || "")
            );
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError("Error de red: " + err.message);
        } else {
          setError("Error de red: desconocido");
        }
      }
      setLoading(false);
    };
    fetchEntries();
  }, [filterType]);

  const handleSelectEntry = (entry: BestiaryEntry) => {
    setSelectedEntry(entry);
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        descriptionRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <PageLayout contentClassName="max-h-[125dvh] flex flex-col font-serif bg-gray-900">
      {/* Only show upload panel if admin */}
      {showUploadPanel && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 border-2 border-green-700 rounded-lg p-8 shadow-2xl max-w-md w-full relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-green-400 text-2xl font-bold"
              onClick={() => setShowUploadPanel(false)}
              title="Volver al Bestiario"
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold text-white mb-6 border-b-2 border-green-700 pb-2 font-serif text-center">
              Cargar datos del Bestiario
            </h3>
            <div className="mb-4 w-full">
              <label className="block text-sm font-semibold mb-1 text-white">
                Cargar Excel:
              </label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-700 file:text-white hover:file:bg-blue-800"
              />
            </div>
            <div className="mb-4 w-full">
              <label className="block text-sm font-semibold mb-1 text-white">
                Cargar ZIP de imágenes:
              </label>
              <input
                type="file"
                accept=".zip"
                onChange={(e) => setZipFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-700 file:text-white hover:file:bg-green-800"
              />
            </div>
            <button
              disabled={!excelFile || !zipFile || !user || uploading}
              className="w-full px-4 py-2 rounded font-semibold bg-purple-700 text-white hover:bg-purple-800 disabled:opacity-50 mt-2"
              onClick={async () => {
                if (!excelFile || !zipFile) return;
                setUploading(true);
                setUploadMessage(null);
                setUploadError(null);
                const formData = new FormData();
                formData.append("excel", excelFile);
                formData.append("zip", zipFile);
                try {
                  const headers: Record<string, string> = {};
                  if (user && user.token)
                    headers.Authorization = `Bearer ${user.token}`;
                  await apiFetch("/bestiary/upload-bestiary", {
                    method: "POST",
                    headers,
                    body: formData,
                  });
                  setUploadMessage(
                    "Archivos enviados correctamente. Redirigiendo..."
                  );
                  setExcelFile(null);
                  setZipFile(null);
                  setTimeout(() => {
                    setShowUploadPanel(false);
                    setUploadMessage(null);
                    setUploadError(null);
                    window.location.reload();
                  }, 2000);
                } catch (error) {
                  console.error("Error al enviar archivos:", error);
                  setUploadError("Error al enviar archivos. Intenta de nuevo.");
                  setUploading(false);
                }
              }}
            >
              {uploading ? "Subiendo..." : "Subir archivos"}
            </button>
            {uploading && (
              <div className="text-center text-blue-400 mt-4">
                Cargando archivos, por favor espera...
              </div>
            )}
            {uploadMessage && (
              <div className="text-center text-green-400 mt-4">
                {uploadMessage}
              </div>
            )}
            {uploadError && (
              <div className="text-center text-red-400 mt-4">{uploadError}</div>
            )}
          </div>
        </div>
      )}
      {!showUploadPanel && (
        <div className="flex flex-col lg:flex-row max-w-[2800px] mx-auto h-full w-full">
          <div
            className={`lg:w-1/3 xl:w-1/4 h-full border-b lg:border-b-0 lg:border-r border-gray-700 bg-gray-900 flex flex-col rounded-tl-lg rounded-bl-lg shadow-lg shadow-black/30 ${
              indexMinimized ? "max-h-16 overflow-hidden" : ""
            }`}
          >
            <div className="lg:hidden flex justify-end items-center p-2 bg-gray-900">
              <button
                className="text-green-400 bg-gray-800 px-3 py-1 rounded-full shadow hover:bg-green-700 hover:text-white text-xs font-bold"
                onClick={() => setIndexMinimized((v) => !v)}
              >
                {indexMinimized ? "Mostrar índice" : "Minimizar índice"}
              </button>
            </div>
            <div className="p-4 lg:p-6 border-b border-gray-700 bg-gray-800 rounded-tl-lg">
              <h2 className="text-2xl lg:text-3xl font-bold text-white text-center tracking-wide drop-shadow-lg mb-2 font-serif relative">
                <span className="inline-block border-b-4 border-green-700 pb-1 px-2">
                  BESTIARIO
                </span>
              </h2>
              <div className="w-full flex justify-center items-center mt-2 mb-2">
                <div className="flex gap-4 items-center">
                  <button
                    className={`px-4 py-2 rounded font-bold border transition-colors duration-200 ${
                      filterType === "creatures"
                        ? "bg-blue-700 text-white border-blue-700 shadow"
                        : "bg-gray-200 text-gray-700 border-gray-400 hover:bg-blue-100"
                    }`}
                    onClick={() => setFilterType("creatures")}
                  >
                    Criaturas
                  </button>
                  <button
                    className={`px-4 py-2 rounded font-bold border transition-colors duration-200 ${
                      filterType === "artifacts"
                        ? "bg-blue-700 text-white border-blue-700 shadow"
                        : "bg-gray-200 text-gray-700 border-gray-400 hover:bg-blue-100"
                    }`}
                    onClick={() => setFilterType("artifacts")}
                  >
                    Artefactos
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-300 text-center mt-2 italic">
                {loading
                  ? "Cargando..."
                  : `${entries.length} entradas descubiertas`}
              </p>
            </div>
            {!indexMinimized && (
              <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-2 bg-gray-900">
                {loading && (
                  <div className="text-center text-gray-400 py-8">
                    {filterType === "creatures"
                      ? "Cargando criaturas..."
                      : "Cargando artefactos..."}
                  </div>
                )}
                {error && (
                  <div className="text-center text-red-400 py-8">{error}</div>
                )}
                {!loading && !error && entries.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    {filterType === "creatures"
                      ? "No se encontraron criaturas."
                      : "No se encontraron artefactos."}
                  </div>
                )}
                {!loading &&
                  !error &&
                  entries.map((entry) => (
                    <button
                      key={entry._id}
                      onClick={() => handleSelectEntry(entry)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 border-2 font-serif shadow-sm ${
                        selectedEntry?._id === entry._id
                          ? "bg-green-700/30 border-green-500 shadow-lg shadow-green-700/10"
                          : "bg-gray-800 border-gray-700 hover:bg-green-900/20 hover:border-green-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {entry.img && (
                          <img
                            src={entry.img}
                            alt={entry.name}
                            className="w-12 h-12 rounded object-cover border-2 border-gray-700 flex-shrink-0 shadow-sm"
                            loading="lazy"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-bold text-base lg:text-lg truncate font-serif ${
                              selectedEntry?._id === entry._id
                                ? "text-green-300 drop-shadow"
                                : "text-white"
                            }`}
                          >
                            {entry.name}
                          </h3>
                          <p className="text-xs text-gray-400 truncate capitalize italic">
                            {entry.type}
                            {entry.species && ` • ${entry.species}`}
                            {filterType === "artifacts" &&
                              entry.creatureCategory &&
                              ` • ${entry.creatureCategory}`}
                          </p>
                        </div>
                        {selectedEntry?._id === entry._id && (
                          <div className="text-green-400 text-lg flex-shrink-0">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                              className="inline-block"
                            >
                              <path d="M6 4l8 6-8 6V4z" fill="currentColor" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </div>
          <div className="flex-1 h-full p-4 lg:p-8 bg-gray-900 flex items-center justify-center overflow-hidden rounded-tr-lg rounded-br-lg shadow-lg shadow-black/30">
            {selectedEntry ? (
              <div
                ref={descriptionRef}
                className="max-w-4xl mx-auto w-full h-full max-h-full overflow-hidden flex flex-col font-serif"
              >
                {selectedEntry.img && (
                  <div className="mb-4 lg:mb-6 flex-shrink-0">
                    <img
                      src={selectedEntry.img}
                      alt={selectedEntry.name}
                      className="w-full max-w-xl mx-auto h-100 object-cover rounded-lg border-4 border-gray-700 shadow-2xl shadow-black/50"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="mb-4 lg:mb-6 flex-shrink-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h1 className="text-2xl lg:text-4xl font-bold text-white mb-2 truncate font-serif drop-shadow-lg">
                        {selectedEntry.name}
                      </h1>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-gray-700 text-white text-sm rounded-full border-2 border-green-700 capitalize font-serif">
                          {selectedEntry.type}
                        </span>
                        {filterType === "creatures" && (
                          <span className="px-3 py-1 bg-gray-700 text-white text-sm rounded-full border-2 border-green-700 capitalize font-serif">
                            {selectedEntry.category}
                          </span>
                        )}
                        {selectedEntry.discipline && (
                          <span className="px-3 py-1 bg-gray-700 text-green-300 text-sm rounded-full border-2 border-green-700 capitalize font-serif">
                            {selectedEntry.discipline}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-800 border-2 border-gray-700 rounded-lg p-4 shadow-sm">
                    <p className="text-gray-300 text-base lg:text-lg leading-relaxed font-serif italic">
                      {selectedEntry.description}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-shrink-0 lg:grid-cols-2 lg:grid-areas-bestiary">
                  <div className="bg-gray-800 border-2 border-gray-700 rounded-lg p-4 shadow-sm">
                    <h3 className="text-lg font-bold text-white mb-3 border-b-2 border-green-700 pb-2 font-serif">
                      Clasificación
                    </h3>
                    <div className="space-y-2">
                      {selectedEntry.element && (
                        <InfoRow
                          label="Elemento"
                          value={selectedEntry.element}
                        />
                      )}
                      {selectedEntry.species && (
                        <InfoRow
                          label="Especie"
                          value={selectedEntry.species}
                        />
                      )}
                      {selectedEntry.creatureCategory && (
                        <InfoRow
                          label="Categoría"
                          value={selectedEntry.creatureCategory}
                        />
                      )}
                      {selectedEntry.territory && (
                        <InfoRow
                          label="Territorio"
                          value={
                            Array.isArray(selectedEntry.territory)
                              ? selectedEntry.territory.join(", ")
                              : typeof selectedEntry.territory === "string" &&
                                selectedEntry.territory.includes(" ")
                              ? selectedEntry.territory.split(/\s+/).join(", ")
                              : selectedEntry.territory
                          }
                        />
                      )}
                      {filterType === "artifacts" &&
                        selectedEntry.spellType && (
                          <InfoRow
                            label="Tipo de Hechizo"
                            value={selectedEntry.spellType}
                          />
                        )}
                      {filterType === "artifacts" && selectedEntry.effect && (
                        <div className="flex flex-col mt-2">
                          <span className="text-gray-400 text-sm font-medium">
                            Efecto:
                          </span>
                          <span
                            className="text-white text-sm break-words whitespace-pre-line font-semibold"
                            style={{
                              wordBreak: "break-word",
                              overflowWrap: "anywhere",
                            }}
                          >
                            {selectedEntry.effect}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  {(selectedEntry.cost !== undefined ||
                    selectedEntry.defense !== undefined ||
                    selectedEntry.health !== undefined ||
                    selectedEntry.magic !== undefined ||
                    selectedEntry.stamina !== undefined ||
                    selectedEntry.hunger !== undefined) && (
                    <div className="bg-gray-800 border-2 border-gray-700 rounded-lg p-4 shadow-sm">
                      <h3 className="text-lg font-bold text-white mb-3 border-b-2 border-green-700 pb-2 font-serif">
                        Estadísticas
                      </h3>
                      <div className="space-y-2">
                        {selectedEntry.cost !== undefined && (
                          <StatBar
                            label="Coste"
                            value={selectedEntry.cost!}
                            max={10}
                            color="green"
                          />
                        )}
                        {selectedEntry.defense !== undefined && (
                          <StatBar
                            label="Defensa"
                            value={selectedEntry.defense!}
                            max={10}
                            color="green"
                          />
                        )}
                        {selectedEntry.health !== undefined && (
                          <StatBar
                            label="Salud"
                            value={selectedEntry.health!}
                            max={10}
                            color="green"
                          />
                        )}
                        {selectedEntry.magic !== undefined && (
                          <StatBar
                            label="Magia"
                            value={selectedEntry.magic!}
                            max={150}
                            color="green"
                          />
                        )}
                        {selectedEntry.stamina !== undefined && (
                          <StatBar
                            label="Vigor"
                            value={selectedEntry.stamina!}
                            max={150}
                            color="green"
                          />
                        )}
                        {selectedEntry.hunger !== undefined && (
                          <StatBar
                            label="Hambre"
                            value={selectedEntry.hunger!}
                            max={150}
                            color="green"
                          />
                        )}
                      </div>
                    </div>
                  )}
                  <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-gray-800 border-2 border-blue-700 rounded-lg p-4 shadow-sm mt-4">
                    <h3 className="text-lg font-bold text-white mb-3 border-b-2 border-blue-700 pb-2 font-serif">
                      Hechizos disponibles
                    </h3>
                    {spellsLoading ? (
                      <div className="text-blue-300 italic">
                        Cargando hechizos...
                      </div>
                    ) : spellsError ? (
                      <div className="text-red-400 italic">{spellsError}</div>
                    ) : spells.length === 0 ? (
                      <div className="text-gray-400 italic">
                        No hay hechizos para esta criatura.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {spells.map((spell) => (
                          <div
                            key={spell._id}
                            className="bg-blue-900/40 border border-blue-700 rounded-lg p-3 text-white font-serif shadow"
                          >
                            <div className="font-bold text-blue-300 text-base pb-1">
                              {spell.name}
                            </div>
                            <div className="text-sm text-gray-200 italic pb-1">
                              {spell.description}
                            </div>
                            {spell.effect && (
                              <div className="text-xs text-blue-200 pb-1">
                                <span className="font-semibold">Efecto:</span>{" "}
                                {spell.effect}
                              </div>
                            )}
                            <div className="flex flex-wrap gap-2 mt-1">
                              {spell.element && (
                                <span className="px-2 py-1 bg-blue-800 text-blue-200 rounded-full text-xs border border-blue-400">
                                  {spell.element}
                                </span>
                              )}
                              {spell.discipline && (
                                <span className="px-2 py-1 bg-blue-800 text-blue-200 rounded-full text-xs border border-blue-400">
                                  {spell.discipline}
                                </span>
                              )}
                              {spell.type && (
                                <span className="px-2 py-1 bg-blue-800 text-blue-200 rounded-full text-xs border border-blue-400">
                                  {spell.type}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {/* Upload button below creature info, above footer */}
                {isAdmin && (
                  <div className="w-full flex justify-center mt-10 mb-2">
                    <button
                      className="bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-black/30 transition-all duration-200"
                      onClick={() => setShowUploadPanel(true)}
                    >
                      Cargar datos del Bestiario
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-400 text-xl italic font-serif">
                  Selecciona una entrada del índice
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </PageLayout>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-400 text-sm font-medium">{label}:</span>
    <span className="text-white text-sm capitalize">{value}</span>
  </div>
);

const StatBar = ({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: "amber" | "blue" | "red" | "purple" | "green" | "orange";
}) => {
  const percentage = (value / max) * 100;
  const colorClasses = {
    amber: "bg-amber-500",
    blue: "bg-blue-500",
    red: "bg-red-500",
    purple: "bg-purple-500",
    green: "bg-green-500",
    orange: "bg-orange-500",
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-gray-400 text-sm font-medium">{label}</span>
        <span className="text-white text-sm font-bold">{value}</span>
      </div>
      <div className="w-full bg-gray-700/50 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} transition-all duration-300 rounded-full`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};

export default Bestiary;

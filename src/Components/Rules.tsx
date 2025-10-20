import { useNavigate } from "react-router-dom";
import PageLayout from "./PageLayout";

function Rules() {
  const navigate = useNavigate();

  return (
    <PageLayout contentClassName="overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 py-8 text-white">
        <button
          onClick={() => navigate("/")}
          className="mb-6 text-gray-300 hover:text-white flex items-center gap-2"
        >
          ← Volver al inicio
        </button>

        <h1 className="text-5xl md:text-6xl font-bold mb-8">
          📖 Reglas de la Plataforma
        </h1>

        <div className="space-y-8">
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
            <p className="text-base md:text-lg text-gray-300 leading-relaxed">
              Bienvenido a las reglas de The Elder Cards. Estas normas están
              diseñadas para mantener una comunidad respetuosa, creativa y
              segura para todos los usuarios.
            </p>
          </div>

          <section className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-white">
              1. Comportamiento de la Comunidad
            </h2>
            <ul className="space-y-3 text-base md:text-lg text-gray-300">
              <li className="flex items-start">
                <span className="text-gray-400 mr-2">•</span>
                <span>Trata a todos los usuarios con respeto y cortesía</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-300 mr-2">•</span>
                <span>
                  No se tolera el acoso, insultos o comportamiento ofensivo
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-300 mr-2">•</span>
                <span>Mantén las conversaciones constructivas y amigables</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-300 mr-2">•</span>
                <span>
                  Respeta las opiniones y creaciones de otros usuarios
                </span>
              </li>
            </ul>
          </section>

          <section className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-gray-300">
              2. Contenido Permitido
            </h2>
            <ul className="space-y-3 text-base md:text-lg text-gray-300">
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Contenido original y creativo</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>
                  Fan art y tributos a obras existentes (con atribución)
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Cartas con temáticas variadas apropiadas para todos</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Contenido educativo o informativo</span>
              </li>
            </ul>
          </section>

          <section className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-red-400">
              3. Contenido Prohibido
            </h2>
            <ul className="space-y-3 text-base md:text-lg text-gray-300">
              <li className="flex items-start">
                <span className="text-red-400 mr-2">✗</span>
                <span>Contenido violento, explícito o para adultos</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-400 mr-2">✗</span>
                <span>Lenguaje ofensivo, discriminatorio o de odio</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-400 mr-2">✗</span>
                <span>Acoso, intimidación o amenazas</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-400 mr-2">✗</span>
                <span>
                  Spam, publicidad no autorizada o contenido irrelevante
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-red-400 mr-2">✗</span>
                <span>Información personal de terceros sin consentimiento</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-400 mr-2">✗</span>
                <span>Plagio o violación de derechos de autor</span>
              </li>
            </ul>
          </section>

          <section className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-gray-300">
              4. Propiedad Intelectual
            </h2>
            <ul className="space-y-3 text-base md:text-lg text-gray-300">
              <li className="flex items-start">
                <span className="text-gray-300 mr-2">•</span>
                <span>
                  Eres responsable del contenido que subes a la plataforma
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-300 mr-2">•</span>
                <span>Solo sube imágenes que tengas derecho a usar</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-300 mr-2">•</span>
                <span>Respeta los derechos de autor de otros creadores</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-300 mr-2">•</span>
                <span>
                  Atribuye el contenido de terceros cuando sea necesario
                </span>
              </li>
            </ul>
          </section>

          <section className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-gray-300">
              5. Uso Responsable
            </h2>
            <ul className="space-y-3 text-base md:text-lg text-gray-300">
              <li className="flex items-start">
                <span className="text-gray-300 mr-2">•</span>
                <span>
                  No intentes acceder a cuentas o datos de otros usuarios
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-300 mr-2">•</span>
                <span>
                  No realices actividades que puedan dañar la plataforma
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-300 mr-2">•</span>
                <span>
                  Reporta comportamientos inapropiados o contenido prohibido
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-300 mr-2">•</span>
                <span>
                  Mantén segura tu cuenta y no compartas tus credenciales
                </span>
              </li>
            </ul>
          </section>

          <section className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-yellow-400">
              6. Consecuencias por Incumplimiento
            </h2>
            <p className="text-base md:text-lg text-gray-300 mb-4">
              El incumplimiento de estas reglas puede resultar en:
            </p>
            <ul className="space-y-3 text-base md:text-lg text-gray-300">
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">⚠</span>
                <span>Advertencia formal</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">⚠</span>
                <span>Eliminación de contenido inapropiado</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">⚠</span>
                <span>Suspensión temporal de la cuenta</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">⚠</span>
                <span>Prohibición permanente de la plataforma</span>
              </li>
            </ul>
          </section>

          <section className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-gray-300">
              7. Modificaciones a las Reglas
            </h2>
            <p className="text-base md:text-lg text-gray-300">
              Nos reservamos el derecho de actualizar estas reglas en cualquier
              momento. Los usuarios serán notificados de cambios significativos.
              El uso continuado de la plataforma implica la aceptación de las
              reglas actualizadas.
            </p>
          </section>

          <section className="bg-gray-700 bg-opacity-50 rounded-lg p-6 border border-gray-600">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              ¿Preguntas o Reportes?
            </h2>
            <p className="text-base md:text-lg text-gray-300 mb-4">
              Si tienes preguntas sobre estas reglas o necesitas reportar
              contenido inapropiado, no dudes en contactarnos.
            </p>
            <p className="text-base md:text-lg text-gray-300 font-semibold">
              Última actualización: Octubre 2025
            </p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/")}
            className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    </PageLayout>
  );
}

export default Rules;

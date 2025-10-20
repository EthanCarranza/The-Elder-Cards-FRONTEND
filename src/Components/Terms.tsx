import { useNavigate } from "react-router-dom";
import PageLayout from "./PageLayout";

function Terms() {
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
          📜 Términos y Condiciones
        </h1>

        <div className="space-y-8">
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
            <p className="text-base md:text-lg text-gray-300 leading-relaxed mb-4">
              Bienvenido a The Elder Cards. Al usar esta plataforma, aceptas los
              siguientes términos y condiciones. Por favor, léelos
              cuidadosamente antes de utilizar nuestros servicios.
            </p>
            <div className="bg-blue-900 bg-opacity-30 border border-blue-500 rounded p-4 mt-4">
              <p className="text-blue-200 text-base md:text-lg leading-relaxed">
                <strong>Nota Importante:</strong> The Elder Cards es un proyecto
                sin ánimo de lucro creado por fans y para fans. No está
                afiliado, respaldado ni patrocinado por Bethesda Softworks,
                ZeniMax Media o cualquier otra empresa titular de marcas
                registradas mencionadas en esta plataforma.
              </p>
            </div>
            <p className="text-gray-400 text-sm mt-4">
              Fecha de vigencia: Octubre 2025
            </p>
          </div>

          <section className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-gray-300">
              1. Aceptación de los Términos
            </h2>
            <p className="text-base md:text-lg text-gray-300 leading-relaxed mb-3">
              Al acceder y utilizar The Elder Cards, aceptas estar legalmente
              vinculado por estos términos y condiciones. Si no estás de acuerdo
              con alguna parte de estos términos, no debes utilizar la
              plataforma.
            </p>
            <p className="text-base md:text-lg text-gray-300 leading-relaxed">
              Debes tener al menos 13 años de edad para utilizar este servicio.
              Si eres menor de 18 años, debes contar con el consentimiento de
              tus padres o tutores.
            </p>
          </section>

          <section className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-gray-300">
              2. Naturaleza del Proyecto - Sin Ánimo de Lucro
            </h2>
            <p className="text-base md:text-lg text-gray-300 leading-relaxed mb-3">
              The Elder Cards es un proyecto{" "}
              <strong className="text-white">
                completamente gratuito y sin ánimo de lucro
              </strong>
              , creado con fines recreativos y creativos para la comunidad de
              fans. Este servicio:
            </p>
            <ul className="space-y-2 text-base md:text-lg text-gray-300">
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>No genera ningún tipo de beneficio económico</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>
                  No realiza ventas de contenido, productos o servicios
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>No muestra publicidad comercial ni monetización</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Es mantenido voluntariamente por la comunidad</span>
              </li>
            </ul>
          </section>

          <section className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-gray-300">
              3. Descripción del Servicio
            </h2>
            <p className="text-base md:text-lg text-gray-300 leading-relaxed mb-3">
              The Elder Cards es una plataforma que permite a los usuarios:
            </p>
            <ul className="space-y-2 text-base md:text-lg text-gray-300">
              <li className="flex items-start">
                <span className="text-gray-300 mr-2">•</span>
                <span>
                  Crear cartas personalizadas con diferentes características
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-300 mr-2">•</span>
                <span>Organizar cartas en colecciones temáticas</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-300 mr-2">•</span>
                <span>Conectar con otros usuarios y compartir creaciones</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-300 mr-2">•</span>
                <span>
                  Explorar y descubrir contenido creado por la comunidad
                </span>
              </li>
            </ul>
          </section>

          <section className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-gray-300">
              4. Cuentas de Usuario
            </h2>
            <ul className="space-y-3 text-base md:text-lg text-gray-300">
              <li className="flex items-start">
                <span className="text-gray-300 mr-2">•</span>
                <span>
                  Eres responsable de mantener la confidencialidad de tu cuenta
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-300 mr-2">•</span>
                <span>
                  Debes proporcionar información precisa y actualizada
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-300 mr-2">•</span>
                <span>No puedes compartir tu cuenta con otras personas</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-300 mr-2">•</span>
                <span>
                  Eres responsable de todas las actividades en tu cuenta
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-300 mr-2">•</span>
                <span>
                  Notifícanos inmediatamente de cualquier uso no autorizado
                </span>
              </li>
            </ul>
          </section>

          <section className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-gray-300">
              5. Contenido y Propiedad Intelectual
            </h2>
            <div className="space-y-4 text-base md:text-lg text-gray-300">
              <div>
                <h3 className="font-semibold text-white mb-2">Tu Contenido</h3>
                <p className="leading-relaxed">
                  Conservas todos los derechos sobre el contenido original que
                  creas y subes a la plataforma. Al publicar contenido, nos
                  otorgas una licencia no exclusiva, mundial y libre de regalías
                  para mostrar, almacenar y distribuir dicho contenido en la
                  plataforma exclusivamente con fines no comerciales.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">
                  Nuestro Contenido
                </h3>
                <p className="leading-relaxed">
                  La plataforma, su diseño, funcionalidades y código son
                  propiedad de The Elder Cards. No puedes copiar, modificar o
                  distribuir ninguna parte de la plataforma sin autorización
                  previa por escrito.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">
                  Contenido de Terceros en Cartas
                </h3>
                <p className="leading-relaxed mb-3">
                  Los usuarios tienen <strong>libertad creativa</strong> para
                  diseñar sus cartas utilizando referencias, imágenes o
                  elementos de marcas registradas, siempre que:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">→</span>
                    <span>
                      El uso sea con fines creativos, educativos o de homenaje
                      (fan art)
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">→</span>
                    <span>
                      No se realice con fines comerciales o lucrativos
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">→</span>
                    <span>
                      Se respeten las políticas de uso de las marcas originales
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">→</span>
                    <span>
                      No se sugiera afiliación oficial con las marcas
                      mencionadas
                    </span>
                  </li>
                </ul>
                <p className="leading-relaxed mt-3 text-yellow-200 bg-yellow-900 bg-opacity-20 p-3 rounded">
                  <strong>Importante:</strong> Los derechos de las marcas,
                  logotipos, personajes y contenidos de terceros utilizados en
                  las cartas pertenecen exclusivamente a sus propietarios
                  legítimos. The Elder Cards no reclama ningún derecho sobre
                  estos elementos.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-gray-800 bg-opacity-50 rounded-lg p-6 border-l-4 border-blue-500">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-gray-300">
              6. Marcas Registradas y Reconocimientos
            </h2>
            <div className="space-y-4 text-base md:text-lg text-gray-300">
              <p className="leading-relaxed">
                <strong className="text-white">The Elder Cards</strong> es un
                proyecto de fans inspirado en el universo de{" "}
                <strong className="text-white">The Elder Scrolls</strong>.
                Reconocemos y respetamos las siguientes marcas registradas:
              </p>

              <div className="bg-gray-700 bg-opacity-50 p-4 rounded">
                <h3 className="font-semibold text-white mb-3">
                  ⚔️ Bethesda Softworks y ZeniMax Media
                </h3>
                <p className="text-sm leading-relaxed mb-2">
                  The Elder Scrolls®, Skyrim®, Oblivion®, Morrowind®, y todos
                  los nombres, logotipos, imágenes y contenido relacionado son
                  marcas registradas o propiedad de{" "}
                  <strong>Bethesda Softworks LLC</strong>, una compañía de
                  <strong> ZeniMax Media Inc.</strong>
                </p>
                <p className="text-sm leading-relaxed text-blue-200">
                  Este proyecto utiliza elementos visuales y tipografías
                  inspiradas en el universo de The Elder Scrolls (incluyendo el
                  logotipo inspirado en Skyrim y la fuente Cyrodiil) como
                  homenaje y tributo, sin intención de infringir derechos de
                  autor.
                </p>
              </div>

              <div className="bg-gray-700 bg-opacity-50 p-4 rounded">
                <h3 className="font-semibold text-white mb-2">
                  🎮 Otras Marcas
                </h3>
                <p className="text-sm leading-relaxed">
                  Cualquier otra marca, logotipo, nombre de producto o empresa
                  mencionada en las cartas creadas por usuarios pertenece a sus
                  respectivos propietarios. Su uso en esta plataforma se realiza
                  bajo el principio de <strong>uso legítimo (fair use)</strong>
                  para fines creativos y no comerciales.
                </p>
              </div>

              <div className="bg-green-900 bg-opacity-20 border border-green-600 p-4 rounded">
                <p className="text-sm leading-relaxed text-green-200">
                  <strong>💚 Agradecimientos Especiales:</strong> Extendemos
                  nuestro más sincero agradecimiento a Bethesda Softworks y
                  ZeniMax Media por crear universos tan increíbles que inspiran
                  la creatividad de millones de fans alrededor del mundo. Este
                  proyecto es un testimonio del impacto positivo de su trabajo.
                </p>
              </div>

              <p className="text-sm leading-relaxed mt-4 text-gray-400 italic">
                Si eres titular de derechos y tienes alguna preocupación sobre
                el contenido de esta plataforma, por favor contáctanos y
                resolveremos cualquier problema de inmediato.
              </p>
            </div>
          </section>

          <section className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-gray-300">
              7. Política de Uso Aceptable
            </h2>
            <p className="text-base md:text-lg text-gray-300 mb-3">
              Te comprometes a NO:
            </p>
            <ul className="space-y-2 text-base md:text-lg text-gray-300">
              <li className="flex items-start">
                <span className="text-red-400 mr-2">✗</span>
                <span>Violar ninguna ley o regulación aplicable</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-400 mr-2">✗</span>
                <span>
                  Usar el contenido de la plataforma con fines comerciales o
                  lucrativos
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-red-400 mr-2">✗</span>
                <span>
                  Vender, licenciar o monetizar cartas o contenido creado en la
                  plataforma
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-red-400 mr-2">✗</span>
                <span>
                  Infringir derechos de propiedad intelectual de terceros con
                  fines no permitidos
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-red-400 mr-2">✗</span>
                <span>Subir contenido malicioso, virus o código dañino</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-400 mr-2">✗</span>
                <span>
                  Intentar acceder a áreas no autorizadas de la plataforma
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-red-400 mr-2">✗</span>
                <span>
                  Realizar ingeniería inversa o decompilar el software
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-red-400 mr-2">✗</span>
                <span>Recopilar datos de usuarios sin su consentimiento</span>
              </li>
            </ul>
            <div className="mt-4 bg-red-900 bg-opacity-20 border border-red-600 p-3 rounded">
              <p className="text-sm text-red-200 leading-relaxed">
                <strong>⚠️ Prohibido el Uso Comercial:</strong> Queda
                estrictamente prohibido utilizar cualquier contenido de esta
                plataforma (cartas, diseños, colecciones) para fines
                comerciales, incluyendo pero no limitado a: venta de productos,
                publicidad, promociones comerciales o cualquier actividad que
                genere beneficio económico.
              </p>
            </div>
          </section>

          <section className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-gray-300">
              8. Privacidad y Protección de Datos
            </h2>
            <p className="text-base md:text-lg text-gray-300 leading-relaxed mb-3">
              Nos tomamos muy en serio la privacidad de tus datos. Recopilamos y
              procesamos información personal de acuerdo con nuestra Política de
              Privacidad.
            </p>
            <ul className="space-y-2 text-base md:text-lg text-gray-300">
              <li className="flex items-start">
                <span className="text-gray-300 mr-2">•</span>
                <span>
                  Solo recopilamos datos necesarios para el funcionamiento del
                  servicio
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-300 mr-2">•</span>
                <span>No vendemos tu información personal a terceros</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-300 mr-2">•</span>
                <span>
                  Utilizamos medidas de seguridad para proteger tus datos
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-300 mr-2">•</span>
                <span>
                  Puedes solicitar la eliminación de tus datos en cualquier
                  momento
                </span>
              </li>
            </ul>
          </section>

          <section className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-gray-300">
              9. Limitación de Responsabilidad
            </h2>
            <p className="text-base md:text-lg text-gray-300 leading-relaxed mb-3">
              El servicio se proporciona "tal cual" sin garantías de ningún
              tipo. No garantizamos que:
            </p>
            <ul className="space-y-2 text-base md:text-lg text-gray-300">
              <li className="flex items-start">
                <span className="text-gray-300 mr-2">•</span>
                <span>El servicio esté libre de errores o interrupciones</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-300 mr-2">•</span>
                <span>
                  Los defectos serán corregidos en un plazo específico
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-300 mr-2">•</span>
                <span>El servicio cumpla con todos tus requisitos</span>
              </li>
            </ul>
            <p className="text-base md:text-lg text-gray-300 leading-relaxed mt-3">
              No seremos responsables por daños indirectos, incidentales o
              consecuentes derivados del uso de la plataforma.
            </p>
          </section>

          <section className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-gray-300">
              10. Terminación del Servicio
            </h2>
            <p className="text-base md:text-lg text-gray-300 leading-relaxed mb-3">
              Nos reservamos el derecho de:
            </p>
            <ul className="space-y-2 text-base md:text-lg text-gray-300">
              <li className="flex items-start">
                <span className="text-gray-300 mr-2">•</span>
                <span>
                  Suspender o terminar tu acceso por violación de estos términos
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-300 mr-2">•</span>
                <span>
                  Modificar o discontinuar el servicio en cualquier momento
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-300 mr-2">•</span>
                <span>Eliminar contenido que viole nuestras políticas</span>
              </li>
            </ul>
            <p className="text-base md:text-lg text-gray-300 leading-relaxed mt-3">
              Puedes cancelar tu cuenta en cualquier momento desde la
              configuración de tu perfil.
            </p>
          </section>

          <section className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-gray-300">
              11. Modificaciones a los Términos
            </h2>
            <p className="text-base md:text-lg text-gray-300 leading-relaxed">
              Podemos actualizar estos términos periódicamente. Te notificaremos
              de cambios significativos a través de la plataforma o por correo
              electrónico. El uso continuado del servicio después de dichos
              cambios constituye tu aceptación de los nuevos términos.
            </p>
          </section>

          <section className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-gray-300">
              12. Ley Aplicable y Jurisdicción
            </h2>
            <p className="text-base md:text-lg text-gray-300 leading-relaxed">
              Estos términos se rigen por las leyes aplicables en tu
              jurisdicción. Cualquier disputa relacionada con estos términos
              será resuelta en los tribunales competentes.
            </p>
          </section>

          <section className="bg-gray-700 bg-opacity-50 rounded-lg p-6 border border-gray-600">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              13. Información de Contacto
            </h2>
            <p className="text-base md:text-lg text-gray-300 leading-relaxed mb-3">
              Si tienes preguntas sobre estos términos y condiciones, por favor
              contáctanos:
            </p>
            <div className="text-base md:text-lg text-gray-300 space-y-1">
              <p className="font-semibold text-white">The Elder Cards</p>
              <p>Email: support@theeldercards.com</p>
            </div>
            <p className="text-base md:text-lg text-gray-300 font-semibold mt-6">
              Última actualización: Octubre 2025
            </p>
          </section>

          <div className="bg-green-900 bg-opacity-30 border border-green-500 rounded-lg p-6">
            <p className="text-base md:text-lg text-gray-300 leading-relaxed">
              Al utilizar The Elder Cards, confirmas que has leído, entendido y
              aceptado estos términos y condiciones en su totalidad.
            </p>
          </div>
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

export default Terms;

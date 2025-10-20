import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "./api";
import { extractErrorMessage } from "../utils/errors";
import { useAuth } from "../hooks/useAuth";
import HeroSection from "./HeroSection";
import FloatingToast from "./FloatingToast";
import PageLayout from "./PageLayout";
import { DEFAULT_PROFILE_IMAGE } from "../constants/user";
function Landing() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [toastMessage, setToastMessage] = useState("");
  useEffect(() => {
    const state = location.state as
      | {
          registrationSuccess?: boolean;
          credentials?: { email: string; password: string };
        }
      | undefined;
    if (!state?.registrationSuccess) return;
    setToastMessage("Registro exitoso. Iniciando sesión...");
    const credentials = state.credentials;
    const cleanupNavigation = () => {
      navigate(location.pathname, { replace: true, state: {} });
    };
    const autoLogin = async () => {
      if (!credentials) {
        setToastMessage(
          "Registro exitoso, pero introduce tus credenciales manualmente."
        );
        cleanupNavigation();
        return;
      }
      try {
        const response = await apiFetch("/users/login", {
          method: "post",
          body: credentials,
        });
        if (response.status !== 200) {
          setToastMessage(
            "Registro exitoso, pero no pudimos iniciar sesión automáticamente."
          );
          return;
        }
        const data = response.data as {
          token: string;
          user: {
            email: string;
            id: string;
            role: string;
            username?: string;
            image?: string;
          };
        };
        login({
          email: data.user.email,
          userId: data.user.id,
          token: data.token,
          role: data.user.role,
          username: data.user.username ?? "",
          image: data.user.image ?? DEFAULT_PROFILE_IMAGE,
        });
        setToastMessage("Registro exitoso. Sesión iniciada automáticamente.");
      } catch (error) {
        setToastMessage(
          extractErrorMessage(
            error,
            "Registro exitoso, pero falló el inicio de sesión automático."
          )
        );
      } finally {
        cleanupNavigation();
      }
    };
    void autoLogin();
  }, [location, login, navigate]);
  useEffect(() => {
    if (!toastMessage) return;
    const timeoutId = window.setTimeout(() => {
      setToastMessage("");
    }, 4000);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toastMessage]);
  const handleCloseToast = () => {
    setToastMessage("");
  };
  return (
    <PageLayout
      overlay={
        <FloatingToast message={toastMessage} onClose={handleCloseToast} />
      }
      contentClassName="overflow-y-auto"
    >
      <HeroSection title="" image="logo.png" />
      <div className="max-w-4xl mx-auto px-4 py-8 text-white">
        <h1 className="text-5xl md:text-6xl font-bold text-center mb-6">
          Bienvenido a The Elder Cards
        </h1>
        <p className="text-xl md:text-2xl text-center text-gray-300 mb-12">
          La plataforma definitiva para crear, coleccionar y compartir cartas
          personalizadas
        </p>
        <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 md:p-8 mb-8">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            ¿Qué es The Elder Cards?
          </h2>
          <p className="text-base md:text-lg text-gray-300 leading-relaxed mb-4">
            The Elder Cards es una comunidad creativa donde puedes dar rienda
            suelta a tu imaginación. Diseña cartas únicas, crea colecciones
            temáticas, comparte tus creaciones con amigos y descubre las
            increíbles cartas que otros usuarios han creado.
          </p>
          <p className="text-base md:text-lg text-gray-300 leading-relaxed">
            Ya seas un artista, un jugador, o simplemente alguien que ama la
            creatividad, aquí encontrarás las herramientas perfectas para
            expresarte.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 hover:bg-opacity-70 transition-all cursor-default">
            <div className="text-4xl mb-3">🎨</div>
            <h3 className="text-xl md:text-2xl font-semibold mb-2">
              Crea Cartas Únicas
            </h3>
            <p className="text-base md:text-lg text-gray-300">
              Utiliza nuestro generador de cartas para crear diseños
              personalizados con estadísticas, imágenes y descripciones únicas.
            </p>
          </div>
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 hover:bg-opacity-70 transition-all cursor-default">
            <div className="text-4xl mb-3">📚</div>
            <h3 className="text-xl md:text-2xl font-semibold mb-2">
              Organiza Colecciones
            </h3>
            <p className="text-base md:text-lg text-gray-300">
              Agrupa tus cartas en colecciones temáticas y compártelas con la
              comunidad. Crea sets completos con tu propia narrativa.
            </p>
          </div>

          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 hover:bg-opacity-70 transition-all cursor-default">
            <div className="text-4xl mb-3">👥</div>
            <h3 className="text-xl md:text-2xl font-semibold mb-2">
              Conecta con Amigos
            </h3>
            <p className="text-base md:text-lg text-gray-300">
              Añade amigos, comparte mensajes y descubre las creaciones de otros
              usuarios. Construye una red de creatividad.
            </p>
          </div>

          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 hover:bg-opacity-70 transition-all cursor-default">
            <div className="text-4xl mb-3">⚔️</div>
            <h3 className="text-xl md:text-2xl font-semibold mb-2">
              Explora Facciones
            </h3>
            <p className="text-base md:text-lg text-gray-300">
              Descubre diferentes facciones, cada una con su propio estilo y
              características. Dale identidad única a tus cartas.
            </p>
          </div>
        </div>
        <div className="bg-gray-700 bg-opacity-50 rounded-lg p-6 md:p-8 mb-8 border border-gray-600">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-center">
            ¿Cómo empezar?
          </h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <span className="bg-gray-600 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 mr-4 font-bold text-lg">
                1
              </span>
              <div>
                <h4 className="text-lg md:text-xl font-semibold mb-1">
                  Regístrate
                </h4>
                <p className="text-base md:text-lg text-gray-300">
                  Crea tu cuenta gratuita en solo unos segundos
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="bg-gray-600 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 mr-4 font-bold text-lg">
                2
              </span>
              <div>
                <h4 className="text-lg md:text-xl font-semibold mb-1">
                  Crea tu primera carta
                </h4>
                <p className="text-base md:text-lg text-gray-300">
                  Usa el generador de cartas para diseñar tu primera creación
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="bg-gray-600 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 mr-4 font-bold text-lg">
                3
              </span>
              <div>
                <h4 className="text-lg md:text-xl font-semibold mb-1">
                  Comparte y conecta
                </h4>
                <p className="text-base md:text-lg text-gray-300">
                  Comparte tus cartas, añade amigos y explora la comunidad
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 mb-8">
          <h3 className="text-2xl md:text-3xl font-semibold mb-4 text-center">
            Información Importante
          </h3>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate("/rules")}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors font-medium text-base md:text-lg"
            >
              📖 Reglas de la Plataforma
            </button>
            <button
              onClick={() => navigate("/terms")}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors font-medium text-base md:text-lg"
            >
              📜 Términos y Condiciones
            </button>
          </div>
        </div>
        {!user && (
          <div className="text-center">
            <button
              onClick={() => navigate("/register")}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xl px-12 py-4 rounded-lg font-bold shadow-lg transform hover:scale-105 transition-all"
            >
              ¡Únete Ahora!
            </button>
            <p className="text-gray-400 mt-4">
              ¿Ya tienes cuenta?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-blue-400 hover:text-blue-300 font-semibold underline"
              >
                Inicia sesión aquí
              </button>
            </p>
          </div>
        )}

        <div className="mt-12 pt-8 pb-16 border-t border-gray-700">
          <div className="bg-gray-800 bg-opacity-30 rounded-lg p-4 text-center">
            <p className="text-gray-400 text-base md:text-lg leading-relaxed">
              <strong className="text-gray-300">The Elder Cards</strong> es un
              proyecto sin ánimo de lucro creado por fans. No está afiliado con
              Bethesda Softworks, ZeniMax Media ni ninguna otra empresa. The
              Elder Scrolls® y todas las marcas relacionadas son propiedad de
              sus respectivos dueños.
            </p>
            <p className="text-gray-500 text-sm md:text-base mt-2">
              Este proyecto es un tributo a los universos que amamos.
              <button
                onClick={() => navigate("/terms")}
                className="text-blue-400 hover:text-blue-300 ml-1 underline"
              >
                Ver términos completos
              </button>
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
export default Landing;

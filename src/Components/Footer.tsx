import { useNavigate } from "react-router-dom";

function Footer() {
  const navigate = useNavigate();

  return (
    <div className="mt-auto bg-black/80 text-white py-4 sm:py-6">
      <div className="max-w-screen-lg mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-4 mb-4">
          <button
            onClick={() => navigate("/rules")}
            className="text-gray-300 hover:text-white text-sm sm:text-base transition-colors"
          >
            Reglas
          </button>
          <span className="text-gray-600">•</span>
          <button
            onClick={() => navigate("/terms")}
            className="text-gray-300 hover:text-white text-sm sm:text-base transition-colors"
          >
            Términos y Condiciones
          </button>
        </div>
        <p className="text-center text-sm sm:text-base md:text-lg text-gray-400">
          &copy; {new Date().getFullYear()} The Elder Cards. Todos los derechos
          reservados.
        </p>
      </div>
    </div>
  );
}
export default Footer;

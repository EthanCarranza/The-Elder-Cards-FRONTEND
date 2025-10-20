import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { DEFAULT_PROFILE_IMAGE } from "../constants/user";
import { useFriendshipNotifications } from "../hooks/useFriendshipNotifications";
import { useMessageNotifications } from "../hooks/useMessageNotifications";
import { setGlobalFriendshipNotifications } from "../utils/friendshipNotifications";
import { useEffect } from "react";
type PrimaryLink = {
  to: string;
  label: string;
  isAnchor?: boolean;
};
const primaryLinks: PrimaryLink[] = [
  { to: "/", label: "Inicio" },
  { to: "/cards", label: "Cartas" },
  { to: "/collections", label: "Colecciones" },
  { to: "/factions", label: "Facciones" },
  { to: "/bestiary", label: "Bestiario" },
];
function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const friendshipNotifications = useFriendshipNotifications();
  const { unreadCount } = useMessageNotifications();

  useEffect(() => {
    setGlobalFriendshipNotifications(friendshipNotifications);
  }, [friendshipNotifications]);

  const handleCloseMenu = () => setMenuOpen(false);
  const handleBackdropClick = () => {
    if (menuOpen) {
      setMenuOpen(false);
    }
  };
  return (
    <>
      {}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
      )}
      <header className="sticky top-0 z-50 bg-black/95 shadow-md backdrop-blur border-b border-white/10">
        <nav className="mx-auto flex w-full max-w-[2800px] flex-col gap-4 px-4 py-4 sm:px-6 lg:px-6 xl:px-10">
          {}
          <div className="flex items-center justify-between lg:hidden">
            <Link
              to="/"
              className="flex items-center gap-3 text-white transition hover:opacity-80"
              onClick={handleCloseMenu}
            >
              <img
                src="/banner.png"
                alt="The Elder Cards"
                className="h-16 w-40 object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] transition duration-300 hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.85)] sm:h-20 sm:w-52"
              />
            </Link>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-white/20 px-3 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-expanded={menuOpen}
              aria-controls="primary-navigation"
            >
              <span className="sr-only">
                {menuOpen ? "Cerrar menú" : "Abrir menú"}
              </span>
              <svg
                className={`h-6 w-6 transition-transform duration-200 ${
                  menuOpen ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
          {}
          <div className="hidden lg:flex lg:items-center lg:justify-between lg:w-full lg:gap-8">
            {}
            <Link
              to="/"
              className="flex items-center gap-3 text-white transition hover:opacity-80 flex-shrink-0"
              onClick={handleCloseMenu}
            >
              <img
                src="/banner.png"
                alt="The Elder Cards"
                className="h-14 w-36 xl:h-16 xl:w-40 object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] transition duration-300 hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.85)]"
              />
            </Link>
            {}
            <div className="flex-1 flex justify-center">
              <ul className="flex items-center gap-6 xl:gap-8 text-base xl:text-xl text-white">
                {primaryLinks.map((link) => (
                  <li key={link.to}>
                    {link.isAnchor ? (
                      <a
                        href={link.to}
                        className="transition hover:text-gray-300 whitespace-nowrap"
                        onClick={handleCloseMenu}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.to}
                        className="transition hover:text-gray-300 whitespace-nowrap"
                        onClick={handleCloseMenu}
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
                {user && (
                  <>
                    <li>
                      <Link
                        to="/friends"
                        className="relative transition hover:text-gray-300 whitespace-nowrap"
                        onClick={handleCloseMenu}
                      >
                        Amigos
                        {friendshipNotifications.pendingRequestsCount > 0 && (
                          <span className="absolute -top-2 -right-2 min-w-[20px] h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                            {friendshipNotifications.pendingRequestsCount > 99
                              ? "99+"
                              : friendshipNotifications.pendingRequestsCount}
                          </span>
                        )}
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/messages"
                        className="relative transition hover:text-gray-300 whitespace-nowrap"
                        onClick={handleCloseMenu}
                      >
                        Mensajes
                        {unreadCount > 0 && (
                          <span className="absolute -top-2 -right-2 min-w-[20px] h-5 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        )}
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
            {}
            <div className="flex items-center gap-4 xl:gap-6 text-base xl:text-xl text-white flex-shrink-0">
              {!user ? (
                <>
                  <Link
                    to="/register"
                    className="transition hover:text-gray-300 whitespace-nowrap"
                    onClick={handleCloseMenu}
                  >
                    Registro
                  </Link>
                  <Link
                    to="/login"
                    className="inline-block rounded-lg bg-white/10 px-3 py-2 text-center transition hover:bg-white/20 whitespace-nowrap"
                    onClick={handleCloseMenu}
                  >
                    Iniciar sesión
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 transition hover:text-gray-300 whitespace-nowrap"
                    onClick={handleCloseMenu}
                  >
                    <img
                      src={user.image || DEFAULT_PROFILE_IMAGE}
                      alt="Avatar"
                      className="h-7 w-7 xl:h-8 xl:w-8 rounded-full object-cover border border-white/30 shadow-sm"
                    />
                    <span>Perfil</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      handleCloseMenu();
                    }}
                    className="transition hover:text-red-400 whitespace-nowrap"
                  >
                    Cerrar sesión
                  </button>
                </>
              )}
            </div>
          </div>
          {}
          <div
            id="primary-navigation"
            className={`${
              menuOpen ? "flex" : "hidden"
            } flex-col gap-6 border-t border-white/10 pt-4 text-white lg:hidden`}
          >
            <ul className="flex flex-col gap-4 text-lg">
              {primaryLinks.map((link) => (
                <li key={link.to}>
                  {link.isAnchor ? (
                    <a
                      href={link.to}
                      className="block py-2 transition hover:text-gray-300"
                      onClick={handleCloseMenu}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.to}
                      className="block py-2 transition hover:text-gray-300"
                      onClick={handleCloseMenu}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
              {user && (
                <>
                  <li>
                    <Link
                      to="/friends"
                      className="relative flex items-center py-2 transition hover:text-gray-300"
                      onClick={handleCloseMenu}
                    >
                      Amigos
                      {friendshipNotifications.pendingRequestsCount > 0 && (
                        <span className="ml-2 min-w-[20px] h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                          {friendshipNotifications.pendingRequestsCount > 99
                            ? "99+"
                            : friendshipNotifications.pendingRequestsCount}
                        </span>
                      )}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/messages"
                      className="relative flex items-center py-2 transition hover:text-gray-300"
                      onClick={handleCloseMenu}
                    >
                      Mensajes
                      {unreadCount > 0 && (
                        <span className="ml-2 min-w-[20px] h-5 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </Link>
                  </li>
                </>
              )}
            </ul>
            <div className="flex flex-col gap-4 border-t border-white/10 pt-4 text-lg">
              {!user ? (
                <>
                  <Link
                    to="/register"
                    className="block py-2 transition hover:text-gray-300"
                    onClick={handleCloseMenu}
                  >
                    Registro
                  </Link>
                  <Link
                    to="/login"
                    className="inline-block rounded-lg bg-white/10 px-4 py-2 text-center transition hover:bg-white/20"
                    onClick={handleCloseMenu}
                  >
                    Iniciar sesión
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 py-2 transition hover:text-gray-300"
                    onClick={handleCloseMenu}
                  >
                    <img
                      src={user.image || DEFAULT_PROFILE_IMAGE}
                      alt="Avatar"
                      className="h-8 w-8 rounded-full object-cover border border-white/30 shadow-sm"
                    />
                    <span>Perfil</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      handleCloseMenu();
                    }}
                    className="block py-2 text-left transition hover:text-red-400"
                  >
                    Cerrar sesión
                  </button>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}
export default Navbar;

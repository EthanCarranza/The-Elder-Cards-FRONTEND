import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaUser, FaCamera } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import { DEFAULT_PROFILE_IMAGE } from "../constants/user";
import { apiFetch } from "./api";
import Message from "./Message";
import PageLayout from "./PageLayout";
import FormInput from "./FormInput";
import { extractErrorMessage } from "../utils/errors";
interface UserProfile {
  _id: string;
  id?: string;
  username: string;
  email: string;
  image?: string;
  role: string;
}
interface UpdateImageResponse {
  imageUrl: string;
  user: UserProfile;
}
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [imagePreview, setImagePreview] = useState(DEFAULT_PROFILE_IMAGE);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const updateUserRef = useRef(updateUser);
  const logoutRef = useRef(logout);
  useEffect(() => {
    updateUserRef.current = updateUser;
  }, [updateUser]);
  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      setLoading(false);
      return;
    }
    setLoading(true);
    const currentUsername = user.username ?? "";
    const currentEmail = user.email ?? "";
    const currentImage = user.image ?? DEFAULT_PROFILE_IMAGE;
    const fetchProfile = async () => {
      try {
        const response = await apiFetch<UserProfile>(`/users/${user.userId}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        if (response.status !== 200) {
          setErrorMessage("No fue posible cargar el perfil.");
          return;
        }
        const data = response.data;
        const resolvedImage = data.image ?? DEFAULT_PROFILE_IMAGE;
        setProfile(data);
        setUsername(data.username ?? "");
        setEmail(data.email ?? "");
        setImagePreview(resolvedImage);
        if (
          data.username !== currentUsername ||
          data.email !== currentEmail ||
          resolvedImage !== currentImage
        ) {
          const updater = updateUserRef.current;
          if (updater) {
            updater({
              username: data.username ?? "",
              email: data.email ?? currentEmail,
              image: resolvedImage,
            });
          }
        }
      } catch (error) {
        const message = extractErrorMessage(
          error,
          "No fue posible cargar el perfil."
        );
        setErrorMessage(message);
        if (
          error &&
          typeof error === "object" &&
          "response" in error &&
          error.response &&
          typeof error.response === "object" &&
          "status" in error.response &&
          (error.response as { status?: number }).status === 401
        ) {
          const logoutFn = logoutRef.current;
          if (logoutFn) {
            logoutFn();
          }
          navigate("/login", { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };
    void fetchProfile();
  }, [user, navigate]);
  const currentImage = useMemo(
    () => imagePreview || DEFAULT_PROFILE_IMAGE,
    [imagePreview]
  );
  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      return;
    }
    setSelectedFile(file);
    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };
  const resetFeedback = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetFeedback();
    if (!user || !profile) {
      setErrorMessage("Sesión no válida. Vuelve a iniciar sesión.");
      return;
    }
    const updates: Record<string, string> = {};
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedUsername && trimmedUsername !== profile.username) {
      updates.username = trimmedUsername;
    }
    if (trimmedEmail && trimmedEmail !== profile.email) {
      updates.email = trimmedEmail;
    }
    if (password) {
      if (password !== confirmPassword) {
        setErrorMessage("Las contraseñas no coinciden.");
        return;
      }
      if (!passwordRegex.test(password)) {
        setErrorMessage(
          "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo especial."
        );
        return;
      }
      updates.password = password;
    }
    if (Object.keys(updates).length === 0 && !selectedFile) {
      setSuccessMessage("No hay cambios para guardar.");
      return;
    }
    setSaving(true);
    try {
      let updatedUser = profile;
      if (Object.keys(updates).length > 0) {
        const response = await apiFetch<UserProfile>(`/users/${user.userId}`, {
          method: "put",
          body: updates,
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        if (response.status !== 200) {
          setErrorMessage("No fue posible actualizar los datos básicos.");
          return;
        }
        updatedUser = response.data;
        setProfile(updatedUser);
        setUsername(updatedUser.username ?? "");
        setEmail(updatedUser.email ?? "");
      }
      if (selectedFile) {
        const formData = new FormData();
        formData.append("img", selectedFile);
        const response = await apiFetch<UpdateImageResponse>(
          `/users/profileImage/${user.userId}`,
          {
            method: "put",
            body: formData,
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        if (response.status !== 200) {
          setErrorMessage("No fue posible actualizar la imagen de perfil.");
          return;
        }
        const imageUrl = response.data.imageUrl ?? DEFAULT_PROFILE_IMAGE;
        setProfile(response.data.user);
        setImagePreview(imageUrl);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        updatedUser = response.data.user;
      }
      const resolvedImage =
        updatedUser.image ?? imagePreview ?? DEFAULT_PROFILE_IMAGE;
      updateUser({
        username: updatedUser.username ?? username,
        email: updatedUser.email ?? email,
        image: resolvedImage,
      });
      setPassword("");
      setConfirmPassword("");
      setSuccessMessage("Perfil actualizado correctamente.");
    } catch (error) {
      setErrorMessage(
        extractErrorMessage(error, "No fue posible guardar los cambios.")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !profile) return;

    if (!deletePassword.trim()) {
      setErrorMessage("Ingresa tu contraseña para confirmar la eliminación");
      return;
    }

    setDeleting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await apiFetch("/users/login", {
        method: "POST",
        body: {
          email: profile.email,
          password: deletePassword,
        },
      });

      await apiFetch(`/users/${profile._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      setSuccessMessage("Cuenta eliminada correctamente. Serás redirigido...");

      setTimeout(() => {
        logoutRef.current();
        navigate("/");
      }, 2000);
    } catch (error) {
      setErrorMessage(
        extractErrorMessage(
          error,
          "Error al eliminar la cuenta. Verifica tu contraseña."
        )
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <PageLayout contentClassName="flex items-center justify-center">
        <p className="text-lg">Cargando perfil...</p>
      </PageLayout>
    );
  }
  if (!user) {
    return null;
  }
  return (
    <PageLayout contentClassName="flex flex-1 justify-center py-10">
      <div className="w-full max-w-3xl rounded-lg bg-white p-8 text-black shadow-2xl">
        <h1 className="mb-6 text-3xl font-bold text-center">Perfil</h1>
        <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-black/80 shadow-lg">
            <img
              src={currentImage}
              alt="Perfil"
              className="h-full w-full object-cover"
            />
            <label className="absolute bottom-2 right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black text-white shadow-lg transition-colors hover:bg-gray-800">
              <FaCamera />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-xl font-semibold">
              {username || profile?.username}
            </p>
            <p className="text-sm text-gray-600">{email || profile?.email}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-gray-500">
              Rol: {profile?.role}
            </p>
          </div>
        </div>
        <Message message={errorMessage} type="error" />
        <Message message={successMessage} type="success" />
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            id="username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Nombre de usuario"
            icon={<FaUser />}
            autoComplete="username"
          />
          <FormInput
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Correo electrónico"
            icon={<FaEnvelope />}
            autoComplete="email"
          />
          <FormInput
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Nueva contraseña"
            icon={<FaLock />}
            autoComplete="new-password"
          />
          <FormInput
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirmar contraseña"
            icon={<FaLock />}
            autoComplete="new-password"
          />
          <button
            type="submit"
            className="w-full rounded bg-black px-4 py-2 font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-600"
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>

        <div className="mt-8 border-t pt-6">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            Zona peligrosa
          </h2>

          {!showDeleteConfirmation ? (
            <button
              onClick={() => setShowDeleteConfirmation(true)}
              className="w-full rounded bg-red-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-700"
            >
              Eliminar cuenta permanentemente
            </button>
          ) : (
            <div className="space-y-4 border rounded-lg border-red-300 bg-red-50 p-4">
              <h3 className="font-semibold text-red-800">
                ⚠️ ¿Estás seguro de que quieres eliminar tu cuenta?
              </h3>
              <p className="text-sm text-red-700">
                Esta acción es <strong>irreversible</strong>. Se eliminarán:
              </p>
              <ul className="text-sm text-red-700 list-disc list-inside ml-4">
                <li>Tu perfil y toda tu información personal</li>
                <li>Todas tus cartas creadas</li>
                <li>Todas tus colecciones</li>
                <li>Todos tus mensajes y conversaciones</li>
                <li>Todas tus conexiones de amistad</li>
              </ul>

              <FormInput
                id="delete-password"
                type="password"
                value={deletePassword}
                onChange={(event) => setDeletePassword(event.target.value)}
                placeholder="Ingresa tu contraseña para confirmar"
                icon={<FaLock />}
                autoComplete="current-password"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirmation(false);
                    setDeletePassword("");
                    setErrorMessage("");
                  }}
                  className="flex-1 rounded bg-gray-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting || !deletePassword.trim()}
                  className="flex-1 rounded bg-red-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {deleting ? "Eliminando..." : "Eliminar definitivamente"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};
export default Profile;

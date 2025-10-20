import { type ChangeEvent, type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "./api";
import { extractErrorMessage } from "../utils/errors";
import { FaUser, FaLock } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import { DEFAULT_PROFILE_IMAGE } from "../constants/user";
import FormInput from "./FormInput";
import Message from "./Message";
import PageLayout from "./PageLayout";
interface LoginUser {
  email: string;
  id: string;
  role: string;
  username?: string;
  image?: string;
}
interface LoginSuccessResponse {
  token: string;
  user: LoginUser;
}
interface LoginErrorResponse {
  message?: string;
}
type LoginResponse = LoginSuccessResponse | LoginErrorResponse;
const isLoginSuccess = (data: LoginResponse): data is LoginSuccessResponse => {
  return (
    typeof data === "object" &&
    data !== null &&
    "token" in data &&
    "user" in data &&
    typeof (data as LoginSuccessResponse).user?.email === "string"
  );
};
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    if (id === "email") setEmail(value);
    if (id === "password") setPassword(value);
  };
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    if (!email || !password) {
      setErrorMessage("Todos los campos son obligatorios.");
      return;
    }
    try {
      const response = await apiFetch<LoginResponse>("/users/login", {
        method: "post",
        body: { email, password },
      });
      if (response.status === 401) {
        const data = response.data as LoginErrorResponse;
        setErrorMessage(data.message ?? "Credenciales incorrectas.");
        return;
      }
      if (response.status !== 200) {
        setErrorMessage(
          "Hubo un error al intentar iniciar sesión. Por favor, inténtalo más tarde."
        );
        return;
      }
      const data = response.data;
      if (!isLoginSuccess(data)) {
        setErrorMessage("Respuesta inesperada del servidor.");
        return;
      }
      setSuccessMessage("¡Inicio de sesión exitoso!");
      login({
        email: data.user.email,
        userId: data.user.id,
        token: data.token,
        role: data.user.role,
        username: data.user.username ?? "",
        image: data.user.image ?? DEFAULT_PROFILE_IMAGE,
      });
      setEmail("");
      setPassword("");

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error: unknown) {
      setErrorMessage(extractErrorMessage(error, "Error de conexión."));
    }
  };
  return (
    <PageLayout contentClassName="flex flex-1 items-center justify-center py-12">
      <div className="w-full max-w-lg rounded-lg bg-white p-8 text-2xl shadow-2xl">
        <h2 className="mb-6 text-center text-4xl font-bold text-black">
          Inicia sesión
        </h2>
        <Message message={errorMessage} type="error" />
        <Message message={successMessage} type="success" />
        <form onSubmit={handleSubmit}>
          <FormInput
            id="email"
            type="text"
            value={email}
            onChange={handleChange}
            placeholder="Correo electrónico o nombre de usuario"
            icon={<FaUser />}
            autoComplete="username"
          />
          <FormInput
            id="password"
            type="password"
            value={password}
            onChange={handleChange}
            placeholder="Contraseña"
            icon={<FaLock />}
            autoComplete="current-password"
          />
          <button
            type="submit"
            className="mt-4 w-full rounded bg-black px-4 py-2 font-bold text-white transition-colors hover:bg-gray-800"
          >
            Iniciar sesión
          </button>
        </form>
      </div>
    </PageLayout>
  );
}
export default Login;

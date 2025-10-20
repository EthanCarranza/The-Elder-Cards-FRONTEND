import { type ChangeEvent, type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "./api";
import { extractErrorMessage } from "../utils/errors";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import FormInput from "./FormInput";
import Message from "./Message";
import PageLayout from "./PageLayout";
function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const usernameRegex = /^.{3,}$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    if (id === "username") setUsername(value);
    if (id === "email") setEmail(value);
    if (id === "password") setPassword(value);
  };
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    if (!username || !email || !password) {
      setErrorMessage("Todos los campos son obligatorios.");
    } else if (!usernameRegex.test(username)) {
      setErrorMessage("El nombre de usuario debe tener al menos 3 caracteres.");
    } else if (!emailRegex.test(email)) {
      setErrorMessage("El correo electrónico no es válido.");
    } else if (!passwordRegex.test(password)) {
      setErrorMessage(
        "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo especial."
      );
    } else {
      const credentials = { email, password };
      try {
        const response = await apiFetch("/users/register", {
          method: "post",
          body: { username, email, password },
        });
        if (response.status === 409) {
          const message = (response.data as { message?: string })?.message;
          if (message === "Ya existe un usuario con ese nombre") {
            setErrorMessage(
              "Ya existe un usuario con este nombre único. Por favor, introduce otro username."
            );
          } else {
            setErrorMessage(
              "Ya existe un usuario con este correo electrónico. Por favor, introduce otro correo."
            );
          }
          return;
        }
        if (response.status !== 201) {
          setErrorMessage(
            "Hubo un error al intentar registrarse. Por favor, inténtalo más tarde."
          );
          return;
        }
        setUsername("");
        setEmail("");
        setPassword("");
        navigate("/", { state: { registrationSuccess: true, credentials } });
      } catch (error: unknown) {
        setErrorMessage(extractErrorMessage(error, "Error de conexión."));
      }
    }
  };
  return (
    <PageLayout contentClassName="flex flex-1 items-center justify-center py-12">
      <div className="w-full max-w-lg rounded-lg bg-white p-8 text-2xl shadow-2xl">
        <h2 className="mb-6 text-center text-4xl font-bold text-black">
          Crea tu cuenta
        </h2>
        <Message message={errorMessage} type="error" />
        <form onSubmit={handleSubmit}>
          <FormInput
            id="username"
            type="text"
            value={username}
            onChange={handleChange}
            placeholder="Nombre de usuario"
            icon={<FaUser />}
            autoComplete="username"
          />
          <FormInput
            id="email"
            type="email"
            value={email}
            onChange={handleChange}
            placeholder="Correo electrónico"
            icon={<FaEnvelope />}
            autoComplete="email"
          />
          <FormInput
            id="password"
            type="password"
            value={password}
            onChange={handleChange}
            placeholder="Contraseña"
            icon={<FaLock />}
            autoComplete="new-password"
          />
          <button
            type="submit"
            className="mt-4 w-full rounded bg-black px-4 py-2 font-bold text-white transition-colors hover:bg-gray-800"
          >
            Registrarse
          </button>
        </form>
      </div>
    </PageLayout>
  );
}
export default Register;

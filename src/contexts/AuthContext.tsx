import { useState, ReactNode } from "react";
import { DEFAULT_PROFILE_IMAGE } from "../constants/user";
import { AuthContext } from "./AuthContextDefinition";
interface AuthUser {
  email: string;
  userId: string;
  token: string;
  role: string;
  username: string;
  image: string;
}
interface AuthProviderProps {
  children: ReactNode;
}
const persistUser = (data: AuthUser) => {
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", data.userId);
  localStorage.setItem("email", data.email);
  localStorage.setItem("role", data.role);
  localStorage.setItem("username", data.username);
  localStorage.setItem("image", data.image);
};
const normaliseUser = (data: AuthUser): AuthUser => ({
  ...data,
  username: data.username ?? "",
  image: data.image ?? DEFAULT_PROFILE_IMAGE,
});
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user");
    const email = localStorage.getItem("email");
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username") ?? "";
    const image = localStorage.getItem("image") ?? DEFAULT_PROFILE_IMAGE;
    if (token && userId && email && role) {
      return {
        email,
        userId,
        token,
        role,
        username,
        image,
      };
    }
    return null;
  });
  const login = (data: AuthUser) => {
    const userData = normaliseUser(data);
    setUser(userData);
    persistUser(userData);
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("image");
  };
  const updateUser = (data: Partial<Omit<AuthUser, "userId">>) => {
    setUser((current) => {
      if (!current) return current;
      const updated: AuthUser = normaliseUser({
        ...current,
        ...data,
        userId: current.userId,
        token: data.token ?? current.token,
        role: data.role ?? current.role,
        email: data.email ?? current.email,
      });
      persistUser(updated);
      return updated;
    });
  };
  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

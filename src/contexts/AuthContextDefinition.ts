import { createContext } from "react";
interface AuthUser {
  email: string;
  userId: string;
  token: string;
  role: string;
  username: string;
  image: string;
}
export interface AuthContextType {
  user: AuthUser | null;
  login: (data: AuthUser) => void;
  logout: () => void;
  updateUser: (data: Partial<Omit<AuthUser, "userId">>) => void;
}
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

import { useContext } from "react";
import {
  AuthContext,
  AuthContextType,
} from "../contexts/AuthContextDefinition";
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

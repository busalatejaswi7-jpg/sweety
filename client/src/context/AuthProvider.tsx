import { useEffect, useState, type ReactNode } from "react";
import api from "../services/api";
import type { AuthResponse, User, SignupPayload, LoginPayload } from "../types/auth.types";
import { AuthContext } from "./auth-context";

function isUser(value: unknown): value is User {
  if (!value || typeof value !== "object") return false;

  const user = value as Record<string, unknown>;
  return (
    Number.isInteger(user.id) &&
    typeof user.name === "string" &&
    typeof user.email === "string" &&
    (user.role === undefined || user.role === "patient" || user.role === "doctor" || user.role === "doctor_pending")
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        try {
          const parsedUser: unknown = JSON.parse(savedUser);
          if (isUser(parsedUser)) {
            setUser(parsedUser);
          } else {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
        } catch {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }

      setLoading(false);
    };

    void restoreSession();
  }, []);

  const saveSession = (data: AuthResponse["data"]): User => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const signup = async (payload: SignupPayload) => {
    const response = await api.post<AuthResponse>("/auth/signup", payload);
    if (response.data.data.user.role === "patient") {
      saveSession(response.data.data);
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const login = async (payload: LoginPayload) => {
    const response = await api.post<AuthResponse>("/auth/login", payload);
    return saveSession(response.data.data);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
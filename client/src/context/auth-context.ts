import { createContext } from "react";
import type { User, SignupPayload, LoginPayload } from "../types/auth.types";

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signup: (payload: SignupPayload) => Promise<void>;
  login: (payload: LoginPayload) => Promise<User>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
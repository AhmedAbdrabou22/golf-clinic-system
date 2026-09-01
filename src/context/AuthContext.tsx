import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import type { AuthUser } from "@/types";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  setUser: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(Cookies.get("token") ?? null);

  useEffect(() => {
    setToken(Cookies.get("token") ?? null);
  }, []);

  const login = (userData: AuthUser, authToken: string) => {
    Cookies.set("token", authToken, { expires: 7 });
    localStorage.setItem("user", JSON.stringify(userData));
    setUserState(userData);
    setToken(authToken);
  };

  const logout = () => {
    Cookies.remove("token");
    localStorage.removeItem("user");
    setUserState(null);
    setToken(null);
  };

  const setUser = (userData: AuthUser) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUserState(userData);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!token, login, logout, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth يجب أن يُستخدم داخل AuthProvider");
  return ctx;
};

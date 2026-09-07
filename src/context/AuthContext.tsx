// import React, { createContext, useContext, useEffect, useState } from "react";
// import Cookies from "js-cookie";
// import type { AuthUser } from "@/types";

// interface AuthContextValue {
//   user: AuthUser | null;
//   token: string | null;
//   isAuthenticated: boolean;
//   login: (user: AuthUser, token: string) => void;
//   logout: () => void;
//   setUser: (user: AuthUser) => void;
// }

// const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUserState] = useState<AuthUser | null>(() => {
//     const stored = localStorage.getItem("user");
//     return stored ? JSON.parse(stored) : null;
//   });
//   const [token, setToken] = useState<string | null>(Cookies.get("token") ?? null);

//   useEffect(() => {
//     setToken(Cookies.get("token") ?? null);
//   }, []);

//   const login = (userData: AuthUser, authToken: string) => {
//     Cookies.set("token", authToken, { expires: 7 });
//     localStorage.setItem("user", JSON.stringify(userData));
//     setUserState(userData);
//     setToken(authToken);
//   };

//   const logout = () => {
//     Cookies.remove("token");
//     localStorage.removeItem("user");
//     setUserState(null);
//     setToken(null);
//   };

//   const setUser = (userData: AuthUser) => {
//     localStorage.setItem("user", JSON.stringify(userData));
//     setUserState(userData);
//   };

//   return (
//     <AuthContext.Provider
//       value={{ user, token, isAuthenticated: !!token, login, logout, setUser }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth يجب أن يُستخدم داخل AuthProvider");
//   return ctx;
// };


import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import type { AuthUser } from "@/types";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  hasOpenShift: boolean;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  setUser: (user: AuthUser) => void;
  setShiftOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(Cookies.get("token") ?? null);
  const [hasOpenShift, setHasOpenShift] = useState<boolean>(
    () => localStorage.getItem("shift_open") === "1"
  );

  useEffect(() => {
    setToken(Cookies.get("token") ?? null);
  }, []);

  const login = (userData: AuthUser, authToken: string) => {
    Cookies.set("token", authToken, { expires: 7 });
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.removeItem("shift_open");
    setUserState(userData);
    setToken(authToken);
    setHasOpenShift(false);
  };

  const logout = () => {
    Cookies.remove("token");
    localStorage.removeItem("user");
    localStorage.removeItem("shift_open");
    setUserState(null);
    setToken(null);
    setHasOpenShift(false);
  };

  const setUser = (userData: AuthUser) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUserState(userData);
  };

  const setShiftOpen = (open: boolean) => {
    if (open) localStorage.setItem("shift_open", "1");
    else localStorage.removeItem("shift_open");
    setHasOpenShift(open);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        hasOpenShift,
        login,
        logout,
        setUser,
        setShiftOpen,
      }}
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
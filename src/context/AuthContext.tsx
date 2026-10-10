



// import React, { createContext, useContext, useEffect, useState } from "react";
// import Cookies from "js-cookie";
// import type { AuthUser, Shift } from "@/types";

// const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

// interface AuthContextValue {
//   user: AuthUser | null;
//   token: string | null;
//   isAuthenticated: boolean;
//   activeShift: Shift | null;
//   hasOpenShift: boolean;
//   login: (user: AuthUser, token: string) => void;
//   logout: () => void;
//   setUser: (user: AuthUser) => void;
//   setActiveShift: (shift: Shift | null) => void;
// }

// const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// const readStoredUser = (): AuthUser | null => {
//   const stored = localStorage.getItem("user");
//   return stored ? JSON.parse(stored) : null;
// };

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUserState] = useState<AuthUser | null>(() => readStoredUser());
//   const [token, setToken] = useState<string | null>(Cookies.get("token") ?? null);

//   useEffect(() => {
//     setToken(Cookies.get("token") ?? null);
//   }, []);

//   const login = (userData: AuthUser, authToken: string) => {
//     Cookies.set("token", authToken, { expires: new Date(Date.now() + TOKEN_TTL_MS) });
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

//   const setActiveShift = (shift: Shift | null) => {
//     setUserState((prev) => {
//       if (!prev) return prev;
//       const updated: AuthUser = { ...prev, shift };
//       localStorage.setItem("user", JSON.stringify(updated));
//       return updated;
//     });
//   };

//   const activeShift = user?.shift?.status === "open" ? user.shift : null;

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         token,
//         isAuthenticated: !!token,
//         activeShift,
//         hasOpenShift: !!activeShift,
//         login,
//         logout,
//         setUser,
//         setActiveShift,
//       }}
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

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import type { AuthUser, Shift } from "@/types";

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  activeShift: Shift | null;
  hasOpenShift: boolean;
  permissions: string[];
  can: (permission?: string) => boolean;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  setUser: (user: AuthUser) => void;
  setActiveShift: (shift: Shift | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const readStoredUser = (): AuthUser | null => {
  const stored = localStorage.getItem("user");
  return stored ? JSON.parse(stored) : null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<AuthUser | null>(() => readStoredUser());
  const [token, setToken] = useState<string | null>(Cookies.get("token") ?? null);

  useEffect(() => {
    setToken(Cookies.get("token") ?? null);
  }, []);

  const login = (userData: AuthUser, authToken: string) => {
    Cookies.set("token", authToken, { expires: new Date(Date.now() + TOKEN_TTL_MS) });
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

  const setActiveShift = (shift: Shift | null) => {
    setUserState((prev) => {
      if (!prev) return prev;
      const updated: AuthUser = { ...prev, shift };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  const activeShift = user?.shift?.status === "open" ? user.shift : null;

  console.log("user",user);

  // نحوّل الصلاحيات لمصفوفة أسماء بغض النظر عن شكلها
  const permissions = useMemo<string[]>(
    () => (user?.role?.permissions ?? []).map((p) => (typeof p === "string" ? p : p.name)),
    [user]
  );

  const can = (permission?: string) => {
    if (!permission) return true; // الرابط مفيهوش صلاحية مطلوبة
    if (user?.type === "admin") return true; // المدير يشوف كل حاجة
    return permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        activeShift,
        hasOpenShift: !!activeShift,
        permissions,
        can,
        login,
        logout,
        setUser,
        setActiveShift,
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
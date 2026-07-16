import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  getMe,
  login as loginApi,
} from "../services/authService";

import type {
  AuthUser,
  LoginPayload,
} from "../types/Auth";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginPayload) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<
  AuthContextValue | undefined
>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    const restoreLogin = async () => {
      const token =
        localStorage.getItem("accessToken");

      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await getMe();

        setUser(currentUser);

        localStorage.setItem(
          "user",
          JSON.stringify(currentUser)
        );
      } catch (error) {
        console.error(
          "Không thể khôi phục đăng nhập:",
          error
        );

        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");

        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void restoreLogin();
  }, []);

  const login = async (
    data: LoginPayload
  ): Promise<AuthUser> => {
    const result = await loginApi(data);

    localStorage.setItem(
      "accessToken",
      result.accessToken
    );

    localStorage.setItem(
      "user",
      JSON.stringify(result.user)
    );

    setUser(result.user);

    return result.user;
  };

  const logout = (): void => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth phải nằm bên trong AuthProvider"
    );
  }

  return context;
}
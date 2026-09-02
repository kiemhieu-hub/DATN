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
  revokeCurrentSession,
} from "../services/authService";
import { fetchBusinessQuery } from "../lib/queryApi";
import { queryClient } from "../lib/queryClient";
import { queryKeys } from "../lib/queryKeys";
import type {
  AuthUser,
  LoginPayload,
  UserRole,
} from "../types/Auth";

type AuthSessions = Record<UserRole, AuthUser | null>;

interface AuthContextValue {
  sessions: AuthSessions;
  isLoading: boolean;
  login: (
    role: UserRole,
    data: LoginPayload
  ) => Promise<AuthUser>;
  logout: (role: UserRole) => void;
  updateSession: (role: UserRole, user: AuthUser) => void;
}

interface RoleAuthValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginPayload) => Promise<AuthUser>;
  logout: () => void;
  updateUser: (user: AuthUser) => void;
}

const emptySessions: AuthSessions = {
  CLIENT: null,
  BARBER: null,
  RECEPTIONIST: null,
  ADMIN: null,
};

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

const storagePrefix: Record<UserRole, string> = {
  CLIENT: "client",
  BARBER: "barber",
  RECEPTIONIST: "receptionist",
  ADMIN: "admin",
};

function tokenKey(role: UserRole): string {
  return `${storagePrefix[role]}AccessToken`;
}

function userKey(role: UserRole): string {
  return `${storagePrefix[role]}User`;
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [sessions, setSessions] =
    useState<AuthSessions>(emptySessions);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSessions = async () => {
      const roles: UserRole[] = [
        "CLIENT",
        "BARBER",
        "RECEPTIONIST",
        "ADMIN",
      ];

      const cachedSessions = roles.reduce<AuthSessions>((result, role) => {
        const cachedUser = localStorage.getItem(userKey(role));
        if (!cachedUser) return result;
        try {
          const parsed = JSON.parse(cachedUser) as AuthUser;
          if (parsed.role === role) result[role] = parsed;
        } catch {
          localStorage.removeItem(userKey(role));
        }
        return result;
      }, { ...emptySessions });

      // Hiển thị ngay dữ liệu phiên đã lưu, không bắt mọi trang phải chờ tối đa
      // bốn request /auth/me (client, barber, lễ tân và admin).
      setSessions(cachedSessions);
      setIsLoading(false);

      const path = window.location.pathname;
      const activeRole: UserRole = path.startsWith("/admin")
        ? "ADMIN"
        : path.startsWith("/receptionist")
          ? "RECEPTIONIST"
          : path.startsWith("/barber")
            ? "BARBER"
            : "CLIENT";

      const restored = await Promise.all(
        roles.map(async (role) => {
          const accessToken = localStorage.getItem(
            tokenKey(role)
          );

          if (!accessToken) {
            return [role, null] as const;
          }

          // Các vai trò không dùng ở tab hiện tại lấy từ cache. API vẫn kiểm
          // tra token khi người dùng chuyển sang đúng khu vực của vai trò đó.
          if (role !== activeRole) {
            return [role, cachedSessions[role]] as const;
          }

          try {
            const currentUser = await fetchBusinessQuery(
              "auth-session",
              () => getMe(accessToken),
              role,
              30_000
            );

            if (currentUser.role !== role) {
              throw new Error("Phiên đăng nhập sai quyền");
            }

            localStorage.setItem(
              userKey(role),
              JSON.stringify(currentUser)
            );

            return [role, currentUser] as const;
          } catch {
            localStorage.removeItem(tokenKey(role));
            localStorage.removeItem(userKey(role));
            return [role, null] as const;
          }
        })
      );

      setSessions({
        CLIENT: restored.find(([role]) => role === "CLIENT")?.[1] ?? null,
        BARBER: restored.find(([role]) => role === "BARBER")?.[1] ?? null,
        RECEPTIONIST: restored.find(([role]) => role === "RECEPTIONIST")?.[1] ?? null,
        ADMIN: restored.find(([role]) => role === "ADMIN")?.[1] ?? null,
      });
    };

    void restoreSessions();
  }, []);

  const login = async (
    role: UserRole,
    data: LoginPayload
  ): Promise<AuthUser> => {
    const result = await loginApi(data, role);

    localStorage.setItem(
      tokenKey(role),
      result.accessToken
    );
    localStorage.setItem(
      userKey(role),
      JSON.stringify(result.user)
    );

    setSessions((current) => ({
      ...current,
      [role]: result.user,
    }));
    queryClient.setQueryData(queryKeys.auth(role), result.user);

    return result.user;
  };

  const logout = (role: UserRole): void => {
    void revokeCurrentSession().catch(() => undefined);
    localStorage.removeItem(tokenKey(role));
    localStorage.removeItem(userKey(role));

    setSessions((current) => ({
      ...current,
      [role]: null,
    }));
    queryClient.removeQueries({ queryKey: queryKeys.auth(role) });
  };

  const updateSession = (role: UserRole, user: AuthUser): void => {
    localStorage.setItem(userKey(role), JSON.stringify(user));
    setSessions((current) => ({ ...current, [role]: user }));
    queryClient.setQueryData(queryKeys.auth(role), user);
  };

  return (
    <AuthContext.Provider
      value={{ sessions, isLoading, login, logout, updateSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(
  role: UserRole = "CLIENT"
): RoleAuthValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth phải nằm bên trong AuthProvider");
  }

  const user = context.sessions[role];

  return {
    user,
    isAuthenticated: Boolean(user),
    isLoading: context.isLoading,
    login: (data) => context.login(role, data),
    logout: () => context.logout(role),
    updateUser: (nextUser) => context.updateSession(role, nextUser),
  };
}

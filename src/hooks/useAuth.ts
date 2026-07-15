import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { logout as logoutAction, getCurrentUser, initializeAuth } from '../store/slices/authSlice';
import type { UserRole } from '../types/User';
import { ROUTES } from '../constants/role';

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Main useAuth hook
export const useAuth = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading, error, accessToken } = useAppSelector(
        (state) => state.auth
    );

    const login = async (phone: string, password: string) => {
        const { login: loginAction } = await import('../store/slices/authSlice');
        const result = await dispatch(loginAction({ phone, password }));
        if (loginAction.fulfilled.match(result)) {
            return { success: true, user: result.payload.user };
        }
        return { success: false, error: result.payload };
    };

    const registerClient = async (data: {
        fullName: string;
        phone: string;
        email: string;
        password: string;
        confirmPassword: string;
    }) => {
        const { registerClient: registerAction } = await import('../store/slices/authSlice');
        const result = await dispatch(registerAction(data));
        if (registerAction.fulfilled.match(result)) {
            return { success: true, user: result.payload.user };
        }
        return { success: false, error: result.payload };
    };

    const registerBarber = async (data: {
        fullName: string;
        phone: string;
        email: string;
        password: string;
        confirmPassword: string;
        specialty: string;
        experience: number;
        bio?: string;
    }) => {
        const { registerBarber: registerAction } = await import('../store/slices/authSlice');
        const result = await dispatch(registerAction(data));
        if (registerAction.fulfilled.match(result)) {
            return { success: true, user: result.payload.user };
        }
        return { success: false, error: result.payload };
    };

    const logout = async () => {
        await dispatch(logoutAction());
        navigate(ROUTES.LOGIN);
    };

    const checkAuth = async () => {
        if (accessToken && !user) {
            await dispatch(getCurrentUser());
        }
    };

    const hasRole = (roles: UserRole | UserRole[]): boolean => {
        if (!user) return false;
        const roleArray = Array.isArray(roles) ? roles : [roles];
        return roleArray.includes(user.role);
    };

    return {
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        logout,
        registerClient,
        registerBarber,
        checkAuth,
        hasRole,
    };
};

// Hook để bảo vệ route
export const useAuthGuard = (allowedRoles?: UserRole[]) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(initializeAuth());
    }, [dispatch]);

    return {
        user,
        isAuthenticated,
        isLoading,
        isAuthorized: allowedRoles ? (user ? allowedRoles.includes(user.role) : false) : isAuthenticated,
    };
};

export default useAuth;

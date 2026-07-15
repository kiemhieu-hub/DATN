import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types/User';
import { ROUTES } from '../constants/role';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
    redirectTo?: string;
}

const ProtectedRoute = ({ children, allowedRoles, redirectTo }: ProtectedRouteProps) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    // Loading state
    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
        return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
    }

    // Check role authorization
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Redirect về dashboard phù hợp với role
        let dashboardPath = redirectTo;
        if (!dashboardPath) {
            switch (user.role) {
                case 'admin':
                    dashboardPath = ROUTES.ADMIN_DASHBOARD;
                    break;
                case 'barber':
                    dashboardPath = ROUTES.BARBER_DASHBOARD;
                    break;
                default:
                    dashboardPath = ROUTES.HOME;
            }
        }
        return <Navigate to={dashboardPath} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;

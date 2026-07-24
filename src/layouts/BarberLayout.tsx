import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import NotificationBell from "../components/NotificationBell/NotificationBell";

import "./BarberLayout.css";

interface BarberNavigationItem {
  to: string;
  label: string;
  icon: string;
}

const navigationItems: BarberNavigationItem[] = [
  {
    to: "/barber/dashboard",
    label: "Dashboard",
    icon: "📊",
  },
  {
    to: "/barber/schedule",
    label: "Lịch hẹn",
    icon: "📅",
  },
  {
    to: "/barber/working-schedule",
    label: "Lịch làm việc",
    icon: "🕐",
  },
  {
    to: "/barber/profile",
    label: "Hồ sơ cá nhân",
    icon: "👤",
  },
];

function BarberLayout() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, logout } = useAuth("BARBER");

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user || user.role !== "BARBER") {
      navigate("/barber/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, user]);

  const handleLogout = (): void => {
    logout();
    navigate("/barber/login", { replace: true });
  };

  if (isLoading) {
    return (
      <div className="barber-shell-loading">
        <div className="loading-spinner"></div>
        <p>Đang kiểm tra phiên đăng nhập...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== "BARBER") {
    return null;
  }

  return (
    <div className="barber-shell">
      <aside className="barber-shell-sidebar">
        <div className="barber-header-section">
          <NavLink to="/barber/dashboard" className="barber-shell-brand">
            <div className="barber-shell-logo">B</div>
            <div className="barber-shell-brand-text">
              <h2>THADS</h2>
              <span>BARBER</span>
            </div>
          </NavLink>

          <NotificationBell />
        </div>

        <nav className="barber-shell-navigation">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? "barber-nav-link active" : "barber-nav-link"
              }
            >
              <span className="barber-nav-icon">{item.icon}</span>
              <span className="barber-nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="barber-shell-user">
          <span className="barber-user-label">Barber</span>
          <b className="barber-user-name">{user?.fullName || "Barber"}</b>

          <button type="button" onClick={handleLogout} className="barber-logout-btn">
            <span>Đăng xuất</span>
            <span className="barber-logout-icon">↪</span>
          </button>
        </div>
      </aside>

      <main className="barber-shell-content">
        <Outlet />
      </main>
    </div>
  );
}

export default BarberLayout;

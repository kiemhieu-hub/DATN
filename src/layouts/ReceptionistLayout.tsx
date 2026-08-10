import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import { getStaffNotifications } from "../services/staffNotification.service";
import "./AdminLayout.css";

function ReceptionistLayout() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, logout } = useAuth("RECEPTIONIST");
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("receptionistSidebarCollapsed") === "true"
  );
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user || user.role !== "RECEPTIONIST")) {
      navigate("/receptionist/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, user]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "RECEPTIONIST") return;

    const loadCount = async () => {
      try {
        const response = await getStaffNotifications(true);
        setNotificationCount(response.unreadCount);
      } catch {
        setNotificationCount(0);
      }
    };

    void loadCount();
    const timer = window.setInterval(() => {
      void loadCount();
    }, 30_000);

    return () => window.clearInterval(timer);
  }, [isAuthenticated, user?.role]);

  if (isLoading) return <div className="admin-shell-loading">Đang kiểm tra phiên đăng nhập...</div>;
  if (!isAuthenticated || !user || user.role !== "RECEPTIONIST") return null;

  return (
    <div className={`admin-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="admin-shell-sidebar">
        <NavLink to="/receptionist/dashboard" className="admin-shell-brand">
          <div className="admin-shell-logo">T</div>
          <div className="admin-shell-brand-text"><h2>THADS</h2><span>RECEPTION CENTER</span></div>
        </NavLink>
        <button
          type="button"
          className="admin-sidebar-toggle"
          onClick={() => setCollapsed((current) => {
            localStorage.setItem("receptionistSidebarCollapsed", String(!current));
            return !current;
          })}
        >
          {collapsed ? "›" : "‹"}
        </button>
        <nav className="admin-shell-navigation">
          <NavLink to="/receptionist/notifications" className={({ isActive }) => isActive ? "admin-nav-link active" : "admin-nav-link"}>
            <span className="admin-nav-icon">TB</span>
            <span className="admin-nav-label">Thông báo</span>
            {notificationCount > 0 && (
              <span className="admin-nav-badge">
                {notificationCount > 99 ? "99+" : notificationCount}
              </span>
            )}
          </NavLink>
          <NavLink to="/receptionist/dashboard" className={({ isActive }) => isActive ? "admin-nav-link active" : "admin-nav-link"}>
            <span className="admin-nav-icon">LH</span><span className="admin-nav-label">Quản lý lịch hẹn</span>
          </NavLink>
          <NavLink to="/receptionist/barbers" className={({ isActive }) => isActive ? "admin-nav-link active" : "admin-nav-link"}>
            <span className="admin-nav-icon">BB</span><span className="admin-nav-label">Lịch làm việc Barber</span>
          </NavLink>
          <NavLink to="/receptionist/barber-day-schedule" className={({ isActive }) => isActive ? "admin-nav-link active" : "admin-nav-link"}>
            <span className="admin-nav-icon">CT</span><span className="admin-nav-label">Lịch chi tiết Barber</span>
          </NavLink>
        </nav>
        <div className="admin-shell-user">
          <span className="admin-user-label">Tài khoản lễ tân</span>
          <b className="admin-user-name">{user.fullName}</b>
          <small className="admin-user-email">{user.email}</small>
          <button type="button" onClick={() => { logout(); navigate("/receptionist/login"); }}>
            <span className="admin-logout-full">Đăng xuất</span><span className="admin-logout-short">↪</span>
          </button>
        </div>
      </aside>
      <main className="admin-shell-content"><Outlet /></main>
    </div>
  );
}

export default ReceptionistLayout;

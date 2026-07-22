import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import "./AdminLayout.css";

function ReceptionistLayout() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, logout } = useAuth("RECEPTIONIST");
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("receptionistSidebarCollapsed") === "true"
  );

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user || user.role !== "RECEPTIONIST")) {
      navigate("/receptionist/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, user]);

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
          <NavLink to="/receptionist/dashboard" className={({ isActive }) => isActive ? "admin-nav-link active" : "admin-nav-link"}>
            <span className="admin-nav-icon">LH</span><span className="admin-nav-label">Quản lý lịch hẹn</span>
          </NavLink>
          <NavLink to="/receptionist/barbers" className={({ isActive }) => isActive ? "admin-nav-link active" : "admin-nav-link"}>
            <span className="admin-nav-icon">BB</span><span className="admin-nav-label">Lịch làm việc Barber</span>
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

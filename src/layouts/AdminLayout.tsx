import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

import "./AdminLayout.css";

interface AdminNavigationItem {
  to: string;
  label: string;
  icon: string;
}

const navigationItems: AdminNavigationItem[] = [
  {
    to: "/admin/revenue",
    label: "Quản lý doanh thu",
    icon: "DT",
  },
  {
    to: "/admin/invoices",
    label: "Quản lý hóa đơn",
    icon: "HĐ",
  },
  {
    to: "/admin/vouchers",
    label: "Quản lý voucher",
    icon: "VC",
  },
  {
    to: "/admin/reviews",
    label: "Quản lý review",
    icon: "RV",
  },
  {
    to: "/admin/users",
    label: "Quản lý người dùng",
    icon: "ND",
  },
  {
    to: "/admin/barbers",
    label: "Quản lý barber",
    icon: "BB",
  },
  {
    to: "/admin/service-categories",
    label: "Quản lý danh mục dịch vụ",
    icon: "DM",
  },
  {
    to: "/admin/services",
    label: "Quản lý dịch vụ",
    icon: "DV",
  },
  {
    to: "/admin/appointments",
    label: "Quản lý lịch hẹn",
    icon: "LH",
  },
  {
    to: "/admin/barber-schedules",
    label: "Lịch làm việc Barber",
    icon: "LB",
  },
  {
    to: "/admin/hairstyle-gallery",
    label: "Quản lý hairstyle gallery",
    icon: "HG",
  },
];

function AdminLayout() {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(
    () => localStorage.getItem("adminSidebarCollapsed") === "true"
  );
  const {
    user,
    isAuthenticated,
    isLoading,
    logout,
  } = useAuth("ADMIN");

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user || user.role !== "ADMIN") {
      navigate("/admin/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, user]);

  const handleLogout = (): void => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  const toggleSidebar = (): void => {
    setIsCollapsed((current) => {
      const next = !current;
      localStorage.setItem("adminSidebarCollapsed", String(next));
      return next;
    });
  };

  if (isLoading) {
    return <div className="admin-shell-loading">Đang kiểm tra phiên đăng nhập...</div>;
  }

  if (!isAuthenticated || !user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className={`admin-shell ${isCollapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="admin-shell-sidebar">
        <NavLink
          to="/admin/dashboard"
          className="admin-shell-brand"
          title="Quay về Dashboard"
        >
          <div className="admin-shell-logo">T</div>

          <div className="admin-shell-brand-text">
            <h2>THADS</h2>
            <span>ADMIN CENTER</span>
          </div>
        </NavLink>

        <button
          type="button"
          className="admin-sidebar-toggle"
          onClick={toggleSidebar}
          aria-label={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          title={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
        >
          {isCollapsed ? "›" : "‹"}
        </button>

        <nav className="admin-shell-navigation">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? "admin-nav-link active" : "admin-nav-link"
              }
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span className="admin-nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-shell-user">
          <span className="admin-user-label">Tài khoản quản trị</span>
          <b className="admin-user-name">{user?.fullName || "Admin"}</b>
          <small className="admin-user-email">{user?.email}</small>

          <button type="button" onClick={handleLogout}>
            <span className="admin-logout-full">Đăng xuất</span>
            <span className="admin-logout-short">↪</span>
          </button>
        </div>
      </aside>

      <main className="admin-shell-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;

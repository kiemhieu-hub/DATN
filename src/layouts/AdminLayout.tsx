import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
    FaBars,
    FaHome,
    FaCalendarAlt,
    FaSignOutAlt,
} from "react-icons/fa";
import { useState } from "react";

const AdminLayout = () => {
    const navigate = useNavigate();
    const [collapse, setCollapse] = useState(false);

    const sidebarStyle: React.CSSProperties = {
        width: collapse ? 90 : 270,
        background: "#161616",
        minHeight: "100vh",
        color: "#fff",
        transition: ".35s",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRight: "2px solid #c5a880",
        boxShadow: "4px 0 20px rgba(0,0,0,.4)",
    };

    const menuStyle: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        gap: 15,
        padding: "15px 20px",
        color: "#ddd",
        textDecoration: "none",
        borderRadius: 10,
        marginBottom: 8,
        transition: ".3s",
        fontWeight: 600,
    };

    return (
        <div
            style={{
                display: "flex",
                background: "#121212",
                minHeight: "100vh",
            }}
        >
            {/* Sidebar */}
            <aside style={sidebarStyle}>
                <div>
                    {/* Logo */}
                    <div
                        style={{
                            textAlign: "center",
                            padding: 25,
                            borderBottom: "1px solid #2d2d2d",
                        }}
                    >
                        <img
                            src="/img/logo.png"
                            alt=""
                            style={{
                                width: collapse ? 55 : 95,
                                marginBottom: 15,
                            }}
                        />

                        {!collapse && (
                            <>
                                <h2 style={{ margin: 0, color: "#c5a880", letterSpacing: 2 }}>
                                    PERUKAR
                                </h2>
                                <span style={{ color: "#888", fontSize: 12, letterSpacing: 3 }}>
                                    ADMIN PANEL
                                </span>
                            </>
                        )}
                    </div>

                    {/* Menu */}
                    <div style={{ padding: 15 }}>
                        {!collapse && (
                            <p
                                style={{
                                    color: "#666",
                                    fontSize: 12,
                                    letterSpacing: 2,
                                    textTransform: "uppercase",
                                    marginBottom: 18,
                                }}
                            >
                                Administrator
                            </p>
                        )}

                        {/* 1. DASHBOARD */}
                        <NavLink
                            to="/admin/dashboard"
                            style={({ isActive }) => ({
                                ...menuStyle,
                                background: isActive ? "#c5a880" : "transparent",
                                color: isActive ? "#000" : "#ddd",
                            })}
                        >
                            <FaHome />
                            {!collapse && "Dashboard"}
                        </NavLink>

                        {/* 2. QUẢN LÝ LỊCH HẸN (Tính năng Điển phụ trách) */}
                        <NavLink
                            to="/admin/bookings"
                            style={({ isActive }) => ({
                                ...menuStyle,
                                background: isActive ? "#c5a880" : "transparent",
                                color: isActive ? "#000" : "#ddd",
                            })}
                        >
                            <FaCalendarAlt />
                            {!collapse && "Quản lý lịch hẹn"}
                        </NavLink>
                    </div>
                </div>

                {/* Logout */}
                <div style={{ padding: 20, borderTop: "1px solid #2a2a2a" }}>
                    <button
                        onClick={() => navigate("/")}
                        style={{
                            width: "100%",
                            padding: "14px",
                            background: "transparent",
                            border: "1px solid #c5a880",
                            color: "#c5a880",
                            borderRadius: 10,
                            cursor: "pointer",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 10,
                            transition: ".3s",
                        }}
                    >
                        <FaSignOutAlt />
                        {!collapse && "Đăng xuất"}
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {/* Header */}
                <header
                    style={{
                        height: 75,
                        background: "#181818",
                        borderBottom: "1px solid #2a2a2a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 30px",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                        <button
                            onClick={() => setCollapse(!collapse)}
                            style={{
                                width: 42,
                                height: 42,
                                borderRadius: 10,
                                border: "none",
                                background: "#c5a880",
                                color: "#000",
                                cursor: "pointer",
                                fontSize: 18,
                            }}
                        >
                            <FaBars />
                        </button>

                        <div>
                            <h2 style={{ margin: 0, color: "#c5a880" }}>
                                Admin Dashboard
                            </h2>
                            <span style={{ color: "#888", fontSize: 13 }}>
                                Hệ thống quản trị PERUKAR
                            </span>
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontWeight: "bold", color: "#fff" }}>
                                Administrator
                            </div>
                            <div style={{ color: "#999", fontSize: 13 }}>
                                Quản trị viên
                            </div>
                        </div>

                        <img
                            src="https://i.pravatar.cc/150?img=11"
                            alt=""
                            style={{
                                width: 45,
                                height: 45,
                                borderRadius: "50%",
                                border: "2px solid #c5a880",
                            }}
                        />
                    </div>
                </header>

                {/* Content */}
                <main
                    style={{
                        flex: 1,
                        padding: 30,
                        background: "#121212",
                        overflowY: "auto",
                    }}
                >
                    {/* Phần nội dung của trang con sẽ hiển thị sạch sẽ ở đây */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
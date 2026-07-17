import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
    FaHome,
    FaCalendarAlt,
    FaClock,
    FaUserAlt,
    FaSignOutAlt,
    FaBars,
} from "react-icons/fa";
import { useState } from "react";

const BarberLayout = () => {
    const navigate = useNavigate();
    const [collapse, setCollapse] = useState(false);

    const sidebarStyle: React.CSSProperties = {
        width: collapse ? 90 : 260,
        background: "#161616",
        transition: "0.35s",
        borderRight: "2px solid #c5a880",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: "5px 0 20px rgba(0,0,0,.4)",
    };

    const menuStyle: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        gap: 15,
        padding: "15px 20px",
        color: "#ddd",
        textDecoration: "none",
        fontSize: 15,
        fontWeight: 600,
        letterSpacing: 1,
        transition: ".3s",
        borderRadius: 10,
        marginBottom: 8,
    };

    return (
        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                background: "#121212",
                color: "#fff",
            }}
        >
            {/* Sidebar */}
            <aside style={sidebarStyle}>
                <div>
                    <div
                        style={{
                            padding: 25,
                            textAlign: "center",
                            borderBottom: "1px solid #2b2b2b",
                        }}
                    >
                        <img
                            src="/img/logo.png"
                            alt=""
                            style={{
                                width: collapse ? 50 : 90,
                                marginBottom: 15,
                            }}
                        />

                        {!collapse && (
                            <>
                                <h2 style={{ color: "#c5a880", margin: 0, letterSpacing: 2 }}>
                                    PERUKAR
                                </h2>
                                <span style={{ fontSize: 12, color: "#999", letterSpacing: 3 }}>
                                    BARBER SHOP
                                </span>
                            </>
                        )}
                    </div>

                    <div style={{ padding: 15 }}>
                        {!collapse && (
                            <p
                                style={{
                                    color: "#777",
                                    fontSize: 12,
                                    textTransform: "uppercase",
                                    marginBottom: 20,
                                    letterSpacing: 2,
                                }}
                            >
                                Barber Menu
                            </p>
                        )}

                        {/* 1. DASHBOARD */}
                        <NavLink
                            to="/barber/dashboard"
                            style={({ isActive }) => ({
                                ...menuStyle,
                                background: isActive ? "#c5a880" : "transparent",
                                color: isActive ? "#000" : "#ddd",
                            })}
                        >
                            <FaHome size={18} />
                            {!collapse && <span>Dashboard</span>}
                        </NavLink>

                        {/* 2. LỊCH HẸN (Chính là trang BookingManager của Điển) */}
                        <NavLink
                            to="/barber/schedule"
                            style={({ isActive }) => ({
                                ...menuStyle,
                                background: isActive ? "#c5a880" : "transparent",
                                color: isActive ? "#000" : "#ddd",
                            })}
                        >
                            <FaCalendarAlt size={18} />
                            {!collapse && <span>Lịch Làm Việc</span>}
                        </NavLink>

                        {/* 3. CA LÀM VIỆC (Chính là trang ScheduleManager của Điển) */}
                        <NavLink
                            to="/barber/work"
                            style={({ isActive }) => ({
                                ...menuStyle,
                                background: isActive ? "#c5a880" : "transparent",
                                color: isActive ? "#000" : "#ddd",
                            })}
                        >
                            <FaClock size={18} />
                            {!collapse && <span>Ca làm việc</span>}
                        </NavLink>

                        {/* 4. HỒ SƠ CÁ NHÂN (Chính là trang BarberProfileManager của Điển) */}
                        <NavLink
                            to="/barber/profile"
                            style={({ isActive }) => ({
                                ...menuStyle,
                                background: isActive ? "#c5a880" : "transparent",
                                color: isActive ? "#000" : "#ddd",
                            })}
                        >
                            <FaUserAlt size={18} />
                            {!collapse && <span>Hồ sơ cá nhân</span>}
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
                            cursor: "pointer",
                            borderRadius: 10,
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

            {/* Right Content Pane */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {/* Header */}
                <header
                    style={{
                        height: 75,
                        background: "#181818",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0 30px",
                        borderBottom: "1px solid #2a2a2a",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                        <button
                            onClick={() => setCollapse(!collapse)}
                            style={{
                                background: "#c5a880",
                                color: "#000",
                                border: "none",
                                width: 42,
                                height: 42,
                                borderRadius: 10,
                                cursor: "pointer",
                                fontSize: 18,
                            }}
                        >
                            <FaBars />
                        </button>

                        <div>
                            <h2 style={{ margin: 0, color: "#c5a880" }}>
                                Barber Workspace
                            </h2>
                            <span style={{ color: "#888", fontSize: 13 }}>
                                Chào mừng quay trở lại
                            </span>
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontWeight: "bold" }}>Barber Điển</div>
                            <div style={{ color: "#999", fontSize: 13 }}>Nhân viên cắt tóc</div>
                        </div>

                        <img
                            src="https://i.pravatar.cc/150?img=12"
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

                {/* Content Area */}
                <main
                    style={{
                        flex: 1,
                        padding: 30,
                        overflowY: "auto",
                        background: "#121212",
                    }}
                >
                    {/* Outlet sẽ hiển thị động các trang con tại đây mà không bị dính cứng phần thống kê */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default BarberLayout;
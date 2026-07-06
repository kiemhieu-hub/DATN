import { Outlet } from "react-router-dom";

const AdminLayout = () => {
    return (
        <div style={{ display: "flex" }}>
            <aside
                style={{
                    width: 250,
                    background: "#222",
                    color: "white",
                    minHeight: "100vh",
                }}
            >
                Sidebar
            </aside>

            <div style={{ flex: 1 }}>
                <header
                    style={{
                        height: 70,
                        background: "#f5f5f5",
                    }}
                >
                    Header
                </header>

                <main style={{ padding: 20 }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
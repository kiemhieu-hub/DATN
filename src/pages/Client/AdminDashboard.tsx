import React from 'react';

const AdminDashboard = () => {
    return (
        <>
            {/* Welcome Box */}
            <div
                style={{
                    background: "#1b1b1b",
                    border: "1px solid #2a2a2a",
                    borderLeft: "5px solid #c5a880",
                    borderRadius: 12,
                    padding: 25,
                    marginBottom: 25,
                }}
            >
                <h2 style={{ margin: 0, color: "#c5a880" }}>Xin chào Admin 👋</h2>
                <p style={{ marginTop: 10, color: "#bbb", lineHeight: 1.8 }}>
                    Chào mừng quay trở lại hệ thống quản trị PERUKAR BARBER SHOP.
                    Hãy kiểm tra thống kê và quản lý hoạt động của cửa hàng.
                </p>
            </div>

            {/* Statistics Widgets */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
                    gap: 20,
                    marginBottom: 30,
                }}
            >
                {[
                    { title: "Tổng người dùng", value: "1,250" },
                    { title: "Tổng Barber", value: "18" },
                    { title: "Lịch hôm nay", value: "46" },
                    { title: "Doanh thu", value: "32.5M" },
                ].map((item) => (
                    <div
                        key={item.title}
                        style={{
                            background: "#1c1c1c",
                            border: "1px solid #2b2b2b",
                            borderRadius: 15,
                            padding: 25,
                        }}
                    >
                        <div style={{ color: "#999", marginBottom: 15 }}>{item.title}</div>
                        <h1 style={{ margin: 0, color: "#c5a880" }}>{item.value}</h1>
                    </div>
                ))}
            </div>
        </>
    );
};

export default AdminDashboard;
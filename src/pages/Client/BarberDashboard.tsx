import React from 'react';

const BarberDashboard = () => {
    return (
        <>
            {/* Welcome Card */}
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
                <h2 style={{ margin: 0, color: "#c5a880" }}>Xin chào 👋</h2>
                <p style={{ marginTop: 10, color: "#bbb", lineHeight: 1.8 }}>
                    Chúc bạn có một ngày làm việc hiệu quả. Hãy kiểm tra lịch hẹn và chuẩn bị cho khách hàng.
                </p>
            </div>

          
        </>
    );
};

export default BarberDashboard;
import React, { useState } from 'react';
import { mockBarberSchedules, BarberSchedule } from '../../constants/dienMockData';

const ScheduleManager = () => {
  const [schedules, setSchedules] = useState<BarberSchedule[]>(mockBarberSchedules);
  const [newDate, setNewDate] = useState('');
  const [newStart, setNewStart] = useState('08:00');
  const [newEnd, setNewEnd] = useState('12:00');

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) return alert("Vui lòng chọn ngày làm việc!");

    const newSession: BarberSchedule = {
      id: Date.now(),
      barberId: 101,
      barberName: "Nguyễn Văn Anh",
      workDate: newDate,
      startTime: newStart,
      endTime: newEnd,
      isAvailable: true
    };

    setSchedules([newSession, ...schedules]);
    alert("Đăng ký ca làm việc thành công!");
  };

  return (
    <div style={{ background: '#121212', minHeight: '100vh', padding: '120px 20px 60px' }}>
      <div className="container">
        {/* Header */}
        <div className="section-head text-center mb-50">
          <div className="section-subtitle">Work Schedule</div>
          <div className="section-title" style={{ color: '#c5a880' }}>Lịch Làm Việc Barber</div>
        </div>

        {/* Form đăng ký phong cách biểu mẫu đặt lịch của Barber Shop */}
        <div style={{ background: '#1e1e1e', padding: '30px', border: '1px solid #c5a880', marginBottom: '40px' }}>
          <h4 style={{ color: '#c5a880', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>➕ Đăng ký ca làm việc mới</h4>
          <form onSubmit={handleAddSchedule}>
            <div className="row g-3">
              <div className="col-md-4">
                <label
                  style={{
                    color: "#ccc",
                    fontSize: "13px",
                    marginBottom: "5px",
                    display: "block",
                  }}
                >
                  Ngày làm việc:
                </label>

                <input
                  type="date"
                  value={newDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setNewDate(e.target.value)}
                  style={{
                    width: "100%",
                    height: "50px",
                    padding: "10px 15px",
                    background: "#fff",
                    color: "#000",
                    border: "1px solid #c5a880",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                />
              </div>
              <div className="col-md-3">
                <label style={{ color: '#ccc', fontSize: '13px', marginBottom: '5px' }}>Từ giờ:</label>
                <input
                  type="time"
                  value={newStart}
                  onChange={(e) => setNewStart(e.target.value)}
                  style={{
                    width: "100%",
                    height: "50px",
                    padding: "10px 15px",
                    background: "#fff",
                    color: "#000",
                    border: "1px solid #c5a880",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                />
              </div>
              <div className="col-md-3">
                <label style={{ color: '#ccc', fontSize: '13px', marginBottom: '5px' }}>Đến giờ:</label>
                <input
                  type="time"
                  value={newEnd}
                  onChange={(e) => setNewEnd(e.target.value)}
                  style={{
                    width: "100%",
                    height: "50px",
                    padding: "10px 15px",
                    background: "#fff",
                    color: "#000",
                    border: "1px solid #c5a880",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                />
              </div>
              <div className="col-md-2 d-flex align-items-end">
                <button type="submit" className="btn-form1-submit" style={{ width: '100%', padding: '14px', background: '#c5a880', color: '#000', border: 'none', fontWeight: 'bold', letterSpacing: '1px' }}>ĐĂNG KÝ</button>
              </div>
            </div>
          </form>
        </div>

        {/* Grid Lịch Làm Việc */}
        <h3 style={{ color: '#c5a880', fontSize: '20px', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>📆 Danh Sách Ca Đã Đăng Ký</h3>
        <div className="row g-4">
          {schedules.map(s => (
            <div key={s.id} className="col-md-4">
              <div style={{ background: '#1e1e1e', padding: '25px', border: '1px solid #2e2e2e', borderTop: '3px solid #c5a880', position: 'relative' }}>
                <h5 style={{ color: '#fff', fontSize: '18px', marginBottom: '15px' }}>{s.barberName}</h5>
                <p style={{ color: '#aaa', margin: '5px 0' }}>📆 Ngày: <strong style={{ color: '#fff' }}>{s.workDate}</strong></p>
                <p style={{ color: '#aaa', margin: '5px 0' }}>⏱️ Ca: <strong style={{ color: '#fff' }}>{s.startTime} - {s.endTime}</strong></p>
                <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: '#888' }}>Trạng thái:</span>
                  <span style={{
                    fontWeight: 'bold', fontSize: '12px', letterSpacing: '1px',
                    color: s.isAvailable ? '#28a745' : '#dc3545'
                  }}>
                    {s.isAvailable ? '🟢 TRỐNG LỊCH' : '🔴 ĐÃ ĐƯỢC ĐẶT'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScheduleManager;
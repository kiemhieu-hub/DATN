import React, { useState } from 'react';
import { mockBookingAppointments, BookingAppointment } from '../../constants/dienMockData';

const BookingManager = () => {
  const [bookings, setBookings] = useState<BookingAppointment[]>(mockBookingAppointments);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const updateStatus = (id: number, newStatus: BookingAppointment['status']) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
  };

  const filteredBookings = filterStatus === 'ALL' 
    ? bookings 
    : bookings.filter(b => b.status === filterStatus);

  return (
    <div style={{ background: '#121212', minHeight: '100vh', padding: '120px 20px 60px' }}>
      <div className="container">
        {/* Tiêu đề chuẩn Style Template */}
        <div className="section-head text-center mb-50">
          <div className="section-subtitle">Admin Panel</div>
          <div className="section-title" style={{ color: '#c5a880' }}>Quản Lý Lịch Hẹn</div>
        </div>
        
        {/* Bộ lọc thiết kế dạng Tab gỗ sang trọng */}
        <div className="d-flex justify-content-center gap-2 mb-4">
          {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(status => (
            <button 
              key={status}
              onClick={() => setFilterStatus(status)} 
              className="btn-form1-submit"
              style={{ 
                padding: '10px 20px', 
                background: filterStatus === status ? '#c5a880' : '#1e1e1e', 
                color: filterStatus === status ? '#000' : '#fff', 
                border: '1px solid #c5a880',
                borderRadius: '0',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '13px',
                letterSpacing: '1px',
                transition: 'all 0.3s'
              }}
            >
              {status === 'ALL' ? 'TẤT CẢ' : status}
            </button>
          ))}
        </div>

        {/* Bảng danh sách cách điệu */}
        <div className="table-responsive" style={{ background: '#1e1e1e', padding: '20px', border: '1px solid #2e2e2e' }}>
          <table className="table" style={{ color: '#fff', verticalAlign: 'middle' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #c5a880', color: '#c5a880', textTransform: 'uppercase', fontSize: '13px', letterSpacing: '1px' }}>
                <th style={{ padding: '15px' }}>Mã Đơn</th>
                <th style={{ padding: '15px' }}>Khách Hàng</th>
                <th style={{ padding: '15px' }}>Barber</th>
                <th style={{ padding: '15px' }}>Thời Gian</th>
                <th style={{ padding: '15px' }}>Dịch Vụ</th>
                <th style={{ padding: '15px' }}>Tổng Tiền</th>
                <th style={{ padding: '15px' }}>Trạng Thái</th>
                <th style={{ padding: '15px' }}>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(b => (
                <tr key={b.id} style={{ borderBottom: '1px solid #2e2e2e' }}>
                  <td style={{ padding: '15px' }}><span style={{ color: '#c5a880', fontWeight: 'bold' }}>{b.bookingCode}</span></td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ fontWeight: '600' }}>{b.customerName}</span>
                    <br/>
                    <small style={{ color: '#888' }}>{b.customerPhone}</small>
                  </td>
                  <td style={{ padding: '15px', color: '#ccc' }}>{b.barberName}</td>
                  <td style={{ padding: '15px' }}>
                    <span>{b.timeSlot}</span>
                    <br/>
                    <small style={{ color: '#888' }}>{b.bookingDate}</small>
                  </td>
                  <td style={{ padding: '15px', color: '#bbb' }}>{b.services.join(', ')}</td>
                  <td style={{ padding: '15px', color: '#c5a880', fontWeight: 'bold' }}>{b.totalAmount.toLocaleString()} đ</td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ 
                      padding: '5px 10px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px',
                      border: `1px solid ${b.status === 'PENDING' ? '#ffc107' : b.status === 'CONFIRMED' ? '#28a745' : b.status === 'COMPLETED' ? '#17a2b8' : '#dc3545'}`,
                      color: b.status === 'PENDING' ? '#ffc107' : b.status === 'CONFIRMED' ? '#28a745' : b.status === 'COMPLETED' ? '#17a2b8' : '#dc3545',
                    }}>
                      {b.status}
                    </span>
                  </td>
                  <td style={{ padding: '15px' }}>
                    {b.status === 'PENDING' && (
                      <div className="d-flex gap-1">
                        <button onClick={() => updateStatus(b.id, 'CONFIRMED')} style={{ backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>DUYỆT</button>
                        <button onClick={() => updateStatus(b.id, 'CANCELLED')} style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>HỦY</button>
                      </div>
                    )}
                    {b.status === 'CONFIRMED' && (
                      <button onClick={() => updateStatus(b.id, 'SERVING')} style={{ backgroundColor: '#c5a880', color: '#000', border: 'none', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>BẮT ĐẦU CẮT</button>
                    )}
                    {b.status === 'SERVING' && (
                      <button onClick={() => updateStatus(b.id, 'COMPLETED')} style={{ backgroundColor: '#17a2b8', color: '#fff', border: 'none', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>HOÀN THÀNH</button>
                    )}
                    {b.status === 'COMPLETED' && <span style={{ color: '#28a745', fontSize: '13px' }}>✅ Hoàn thành</span>}
                    {b.status === 'CANCELLED' && <span style={{ color: '#888', fontSize: '13px' }}>❌ Đã hủy</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BookingManager;
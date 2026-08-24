import React, { useState } from 'react';
import type { CatalogBarber } from '../types/Catalog';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  barbers?: CatalogBarber[];
  currentUser?: { id?: string; _id?: string; fullName?: string; role?: string };
  isReceptionist?: boolean;
  onSuccess: () => void;
}

const LEAVE_REASONS = [
  { value: 'SICK', label: 'Bị ốm / Sức khỏe' },
  { value: 'PERSONAL', label: 'Việc gia đình / Cá nhân' },
  { value: 'VACATION', label: 'Nghỉ phép năm' },
  { value: 'OTHER', label: 'Lý do khác' }
];

export const BarberLeaveRegistrationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  barbers = [],
  currentUser,
  isReceptionist = false,
  onSuccess
}) => {
  const currentUserId = currentUser?.id || (currentUser as any)?._id || '';
  const [selectedTarget, setSelectedTarget] = useState(currentUserId);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reasonType, setReasonType] = useState('PERSONAL');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toastSuccess, setToastSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = isReceptionist ? selectedTarget : currentUserId;

    if (!targetId) {
      setError('Vui lòng chọn đối tượng nghỉ');
      return;
    }
    if (!startDate || !endDate) {
      setError('Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError('Ngày kết thúc không được nhỏ hơn ngày bắt đầu');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const token =
        localStorage.getItem('receptionistAccessToken') ||
        localStorage.getItem('token') ||
        localStorage.getItem('accessToken') ||
        localStorage.getItem('auth_token') ||
        '';

      const response = await fetch('/api/barber-schedules/leaves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          staffId: targetId,
          startDate,
          endDate,
          reasonType,
          note: note.trim()
        })
      });

      const resData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(resData.message || `Lỗi server (${response.status})`);
      }

      // Kích hoạt Toast thông báo xịn sò
      setToastSuccess(true);
      onSuccess();

      // Đóng modal sau 1.2s để người dùng kịp nhìn thấy thông báo thành công
      setTimeout(() => {
        setToastSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="appointment-modal-backdrop" onMouseDown={onClose}>
      {/* Toast thông báo phong cách Barber */}
      {toastSuccess && (
        <div
          style={{
            position: 'fixed',
            top: '28px',
            right: '28px',
            zIndex: 99999,
            background: '#1a1918',
            color: '#e5b869',
            border: '1px solid #e5b869',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          <span style={{ fontSize: '18px' }}>✓</span>
          <span>Đăng ký lịch nghỉ thành công!</span>
        </div>
      )}

      <section
        className="appointment-modal"
        onMouseDown={(e) => e.stopPropagation()}
        style={{ maxWidth: '480px', width: '100%' }}
      >
        <button type="button" className="appointment-modal-close" onClick={onClose}>
          ×
        </button>

        <p className="appointment-modal-brand">THADS BARBER</p>
        <h2>Đăng ký lịch nghỉ</h2>

        {error && <div className="appointment-alert appointment-alert-error">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
          {isReceptionist ? (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
                Người xin nghỉ
              </label>
              <select
                value={selectedTarget}
                onChange={(e) => setSelectedTarget(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #c8b8a6', background: '#fff' }}
                required
              >
                <option value={currentUserId}>-- Bản thân tôi (Lễ tân: {currentUser?.fullName}) --</option>
                <optgroup label="Đăng ký hộ cho Barber:">
                  {barbers.map((b) => (
                    <option key={b.id} value={b.id}>
                      Barber: {b.fullName}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          ) : (
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
              Barber: <b>{currentUser?.fullName}</b>
            </p>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Từ ngày</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #c8b8a6', background: '#fff' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Đến ngày</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #c8b8a6', background: '#fff' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Lý do nghỉ</label>
            <select
              value={reasonType}
              onChange={(e) => setReasonType(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #c8b8a6', background: '#fff' }}
            >
              {LEAVE_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Chi tiết lý do</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập lý do cụ thể..."
              rows={3}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #c8b8a6', background: '#fff' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #c8b8a6', background: '#fff', cursor: 'pointer' }}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || toastSuccess}
              style={{
                padding: '8px 20px',
                borderRadius: '6px',
                border: 'none',
                background: '#1a1918',
                color: '#e5b869',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {loading ? 'Đang lưu...' : 'Xác nhận đăng ký'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
import React, { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  staffName?: string;
  roleName: 'Barber' | 'Lễ tân';
  onSuccess: () => void;
}

const LEAVE_REASONS = [
  { value: 'SICK', label: 'Bị ốm / Sức khỏe' },
  { value: 'PERSONAL', label: 'Việc gia đình / Cá nhân' },
  { value: 'VACATION', label: 'Nghỉ phép năm' },
  { value: 'OTHER', label: 'Lý do khác' }
];

export const LeaveRegistrationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  staffName,
  roleName,
  onSuccess
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reasonType, setReasonType] = useState('PERSONAL');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

      const token = localStorage.getItem('token') || '';
      const response = await fetch('/api/schedules/leaves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          startDate,
          endDate,
          reasonType,
          note: note.trim()
        })
      });

      let resData: any = {};
      const text = await response.text();
      try {
        resData = text ? JSON.parse(text) : {};
      } catch {
        resData = { message: text };
      }

      if (!response.ok) {
        throw new Error(resData.message || `Lỗi server (${response.status})`);
      }

      alert('Đăng ký lịch nghỉ thành công!');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi gửi yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="appointment-modal-backdrop" onMouseDown={onClose}>
      <section 
        className="appointment-modal" 
        onMouseDown={(e) => e.stopPropagation()}
        style={{ maxWidth: '460px', width: '100%' }}
      >
        <button type="button" className="appointment-modal-close" onClick={onClose}>
          ×
        </button>

        <p className="appointment-modal-brand">THADS BARBER</p>
        <h2>Đơn xin nghỉ phép ({roleName})</h2>
        <p style={{ margin: '4px 0 16px', fontSize: '14px', color: '#6b7280' }}>
          Nhân sự: <b>{staffName || 'Tôi'}</b>
        </p>

        {error && <div className="appointment-alert appointment-alert-error">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
                Từ ngày
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #c8b8a6', background: '#fff' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
                Đến ngày
              </label>
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
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
              Lý do nghỉ
            </label>
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
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
              Chi tiết lý do
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập ghi chú chi tiết lý do nghỉ..."
              rows={3}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #c8b8a6', background: '#fff' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '8px 18px',
                borderRadius: '6px',
                border: '1px solid #c8b8a6',
                background: '#fff',
                color: '#333',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
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
              {loading ? 'Đang gửi...' : 'Nộp đơn xin nghỉ'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
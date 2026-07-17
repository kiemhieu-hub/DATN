import React, { useState } from 'react';
import { mockBarberProfiles, BarberProfile } from '../../constants/dienMockData';

const BarberProfileManager = () => {
  const [profile, setProfile] = useState<BarberProfile>(mockBarberProfiles[0]);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    alert("Cập nhật hồ sơ cá nhân thành công!");
  };

  return (
    <div style={{ background: '#121212', minHeight: '100vh', padding: '120px 20px 60px' }}>
      <div className="container">
        {/* Header */}
        <div className="section-head text-center mb-50">
          <div className="section-subtitle">My Profile</div>
          <div className="section-title" style={{ color: '#c5a880' }}>Hồ Sơ Barber Cá Nhân</div>
        </div>

        {/* Khung profile cổ điển */}
        <div className="mx-auto" style={{ maxWidth: '800px', background: '#1e1e1e', padding: '40px', border: '1px solid #2e2e2e', boxShadow: '0px 10px 30px rgba(0,0,0,0.5)' }}>
          <div className="row g-4 align-items-center">
            
            {/* Cột Trái: Ảnh và Đánh giá */}
            <div className="col-md-4 text-center" style={{ borderRight: '1px solid #2e2e2e' }}>
              <img 
                src={profile.avatarUrl} 
                alt="Avatar" 
                style={{ width: '160px', height: '160px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #c5a880', padding: '5px', marginBottom: '15px' }} 
              />
              <h5 style={{ color: '#c5a880', margin: '5px 0' }}>⭐ {profile.averageRating}</h5>
              <small style={{ color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>{profile.totalReviews} ĐÁNH GIÁ</small>
            </div>

            {/* Cột Phải: Thông tin chi tiết / Form chỉnh sửa */}
            <div className="col-md-8" style={{ paddingLeft: '30px' }}>
              {!isEditing ? (
                <div>
                  <h3 style={{ color: '#fff', marginBottom: '15px', fontFamily: 'serif' }}>{profile.fullName}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: '#ccc' }}>
                    <p style={{ margin: 0 }}><strong>Cấp bậc:</strong> <span style={{ color: '#c5a880', fontWeight: 'bold' }}>{profile.level}</span></p>
                    <p style={{ margin: 0 }}><strong>Kinh nghiệm:</strong> {profile.experienceYear} Năm trong nghề</p>
                    <p style={{ margin: 0 }}><strong>Điện thoại:</strong> {profile.phone}</p>
                    <p style={{ margin: 0, color: '#aaa', fontStyle: 'italic', lineHeight: '1.6' }}><strong>Giới thiệu:</strong> "{profile.description}"</p>
                  </div>
                  <button 
                    onClick={() => setIsEditing(true)} 
                    className="btn-form1-submit"
                    style={{ background: '#c5a880', color: '#000', border: 'none', padding: '10px 25px', fontWeight: 'bold', marginTop: '25px', cursor: 'pointer', letterSpacing: '1px' }}
                  >
                    CHỈNH SỬA HỒ SƠ
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSave}>
                  <h4 style={{ color: '#c5a880', marginBottom: '20px' }}>✏️ Chỉnh Sửa Hồ Sơ</h4>
                  <div className="mb-3">
                    <label style={{ color: '#ccc', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Họ và Tên:</label>
                    <input type="text" value={profile.fullName} onChange={e => setProfile({...profile, fullName: e.target.value})} style={{ width: '100%', padding: '10px', background: '#121212', color: '#fff', border: '1px solid #333' }} />
                  </div>
                  <div className="mb-3">
                    <label style={{ color: '#ccc', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Kinh nghiệm (Năm):</label>
                    <input type="number" value={profile.experienceYear} onChange={e => setProfile({...profile, experienceYear: Number(e.target.value)})} style={{ width: '100%', padding: '10px', background: '#121212', color: '#fff', border: '1px solid #333' }} />
                  </div>
                  <div className="mb-3">
                    <label style={{ color: '#ccc', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Mô tả bản thân:</label>
                    <textarea value={profile.description} onChange={e => setProfile({...profile, description: e.target.value})} style={{ width: '100%', padding: '10px', background: '#121212', color: '#fff', border: '1px solid #333', height: '100px', resize: 'none' }} />
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" style={{ background: '#28a745', color: '#fff', border: 'none', padding: '10px 20px', fontWeight: 'bold', cursor: 'pointer' }}>LƯU LẠI</button>
                    <button type="button" onClick={() => setIsEditing(false)} style={{ background: '#555', color: '#fff', border: 'none', padding: '10px 20px', cursor: 'pointer' }}>HỦY</button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default BarberProfileManager;
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

interface BarberUser {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar?: string;
  role: string;
  status: string;
  bio?: string;
}

// Interface định nghĩa kiểu dữ liệu Review nhận về từ API
interface ReviewItem {
  _id: string;
  client?: {
    fullName?: string;
    avatar?: string;
  };
  barberRating: number;
  barberComment?: string;
  createdAt: string;
}

function TeamDetails() {
  const { id } = useParams<{ id: string }>();
  const [barber, setBarber] = useState<BarberUser | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]); // State lưu danh sách review
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBarberDetailAndReviews = async () => {
      try {
        let currentBarberId = id;

        // 1. Lấy thông tin Barber
        if (!currentBarberId) {
          const res = await fetch("http://localhost:5000/api/users?role=BARBER");
          if (res.ok) {
            const data = await res.json();
            const list = Array.isArray(data) ? data : data.users || [];
            if (list.length > 0) {
              setBarber(list[0]);
              currentBarberId = list[0]._id;
            }
          }
        } else {
          const response = await fetch(`http://localhost:5000/api/users/${currentBarberId}`);
          if (response.ok) {
            const data = await response.json();
            setBarber(data.user || data);
          }
        }

        // 2. Lấy danh sách đánh giá ĐÃ DUYỆT (APPROVED) của Barber này
        if (currentBarberId) {
          const resReview = await fetch(`http://localhost:5000/api/reviews/barber/${currentBarberId}`);
          if (resReview.ok) {
            const reviewData = await resReview.json();
            setReviews(reviewData.reviews || []);
          }
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin chi tiết Barber hoặc Đánh giá:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBarberDetailAndReviews();
  }, [id]);

  if (loading) {
    return <div className="text-center my-5 text-white">Đang tải thông tin Barber...</div>;
  }

  // Hàm bổ trợ hiển thị số sao ★
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} style={{ color: index < rating ? "#ffb400" : "#ccc", fontSize: "16px" }}>
        ★
      </span>
    ));
  };

  return (
    <div>
      {/* Progress scroll to top */}
      <div className="progress-wrap cursor-pointer">
        <svg className="progress-circle svg-content" width="100%" height="100%" viewBox="-1 -1 102 102">
          <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" />
        </svg>
      </div>

      {/* Navbar */}
      <nav className="navbar navbar-expand-lg">
        <div className="container">
          <div className="logo-wrapper">
            <Link className="logo" to="/"> 
              <img src="/img/logo.png" className="logo-img" alt="THADS Barber" /> 
            </Link>
          </div>
          
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar" aria-controls="navbar" aria-expanded="false" aria-label="Toggle navigation"> 
            <span className="navbar-toggler-icon"><i className="ti-menu"></i></span> 
          </button>
          
          <div className="collapse navbar-collapse" id="navbar">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item"><Link className="nav-link" to="/">Trang chủ</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/about">Giới thiệu</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/services">Dịch vụ</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/team">Đội ngũ Barber</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/contact">Liên hệ</Link></li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Header Banner */}
      <div className="banner-header valign bg-img bg-fixed" data-overlay-dark="4" data-background="/img/slider/3.jpg">
        <div className="container">
          <div className="row">
            <div className="col-md-12 text-center caption mt-60">
              <h5>Chuyên Gia Tạo Kiểu</h5>
              <h1>{barber?.fullName || "Thông Tin Barber"}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Team Details */}
      <section className="team-box section-padding pb-0">
        <div className="container">
          <div className="row">
            <div className="col-md-6 mb-30"> 
              <img 
                src={barber?.avatar && barber.avatar.trim() !== "" ? barber.avatar : "/img/team/team-detail.jpg"} 
                className="img-fluid mb-30 w-100" 
                alt={barber?.fullName} 
                style={{ maxHeight: "500px", objectFit: "cover", borderRadius: "8px" }}
              />
              <div className="section-head mb-20">
                <div className="section-subtitle">Thông Tin Chuyên Gia</div>
                <div className="section-title mb-15">{barber?.fullName}</div>
                <p>
                  {barber?.bio || `${barber?.fullName} là một trong những Barber tay nghề cao tại THADS Barber, luôn chú trọng đến sự hài lòng của khách hàng và cập nhật xu hướng tóc nam mới nhất.`}
                </p>
                <ul className="about-list list-unstyled mb-30">
                  <li>
                    <div className="about-list-icon"> <span className="ti-check"></span> </div>
                    <div className="about-list-text">
                      <p>Barber chuyên nghiệp được chứng nhận và đào tạo bài bản.</p>
                    </div>
                  </li>
                  <li>
                    <div className="about-list-icon"> <span className="ti-check"></span> </div>
                    <div className="about-list-text">
                      <p>Cam kết đem lại trải nghiệm dịch vụ và sự hài lòng cao nhất.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Sidebar info */}
            <div className="col-md-5 offset-md-1">
              <div className="wrap">
                <div className="desc">
                  <div className="section-title mb-15">Liên Hệ Trực Tiếp</div>
                  <p>Đặt lịch ngay để được tư vấn và trải nghiệm dịch vụ tạo kiểu tóc từ {barber?.fullName}.</p>
                </div>
                
                <div className="cont">
                  <div className="coll">
                    <h6>Email</h6>
                  </div>
                  <div className="coll">
                    <h5>{barber?.email || "Chưa cập nhật"}</h5>
                  </div>
                </div>

                <div className="cont">
                  <div className="coll">
                    <h6>Số Điện Thoại</h6>
                  </div>
                  <div className="coll">
                    <h5>{barber?.phone || "Chưa cập nhật"}</h5>
                  </div>
                </div>

                <div className="cont">
                  <div className="coll">
                    <Link to="/booking" className="button-1 mt-15">
                      Đặt Lịch Với Barber Này
                      <span />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PHẦN ĐÁNH GIÁ CỦA KHÁCH HÀNG (MỚI THÊM) ================= */}
      <section className="section-padding bg-dark">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="section-head mb-30">
                <div className="section-subtitle">Phản Hồi</div>
                <div className="section-title text-white">Đánh giá từ khách hàng ({reviews.length})</div>
              </div>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="text-white opacity-75">Chưa có đánh giá nào được duyệt cho Barber này.</div>
          ) : (
            <div className="row">
              {reviews.map((rev) => (
                <div className="col-md-6 mb-30" key={rev._id}>
                  <div style={{ background: "#1b1b1b", padding: "20px", borderRadius: "8px", border: "1px solid #333" }}>
                    <div className="d-flex align-items-center mb-15">
                      <img
                        src={rev.client?.avatar || "/img/team/b1.jpg"}
                        alt={rev.client?.fullName || "Khách hàng"}
                        style={{ width: "45px", height: "45px", borderRadius: "50%", objectFit: "cover", marginRight: "12px" }}
                      />
                      <div>
                        <h6 className="text-white mb-0" style={{ fontSize: "16px" }}>{rev.client?.fullName || "Khách hàng"}</h6>
                        <small className="text-muted">{new Date(rev.createdAt).toLocaleDateString("vi-VN")}</small>
                      </div>
                    </div>
                    <div className="mb-10">{renderStars(rev.barberRating)}</div>
                    <p className="text-white mb-0" style={{ fontStyle: "italic", opacity: 0.9 }}>
                      "{rev.barberComment || "Không có nhận xét."}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer mt-60">
        <div className="footer-bottom">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="footer-bottom-inner text-center">
                  <p className="footer-bottom-copy-right">&copy; {new Date().getFullYear()} THADS Barber. All Rights Reserved.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default TeamDetails;
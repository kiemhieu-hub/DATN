import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface BarberUser {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar?: string;
  role: string;
  status: string;
  bio?: string;
  specialty?: string;
}

function Team() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  
  const [barbers, setBarbers] = useState<BarberUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        // Thay đường dẫn API backend phù hợp với dự án của bạn (ví dụ: /api/users/barbers hoặc /api/barbers)
        const response = await fetch("http://localhost:5000/api/users?role=BARBER"); 
        if (response.ok) {
          const data = await response.json();
          // Lọc danh sách barber đang ACTIVE
          const activeBarbers = (Array.isArray(data) ? data : data.users || []).filter(
            (b: BarberUser) => b.role === "BARBER" && b.status === "ACTIVE"
          );
          setBarbers(activeBarbers);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách barber:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBarbers();
  }, []);

  const handleLogout = (): void => {
    logout();
    navigate("/", { replace: true });
  };

  const handleBooking = (): void => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    navigate("/booking");
  };

  return (
    <div>
      {/* Progress scroll to top */}
      <div className="progress-wrap cursor-pointer">
        <svg
          className="progress-circle svg-content"
          width="100%"
          height="100%"
          viewBox="-1 -1 102 102"
        >
          <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" />
        </svg>
      </div>

      {/* Navbar */}
      <nav className="navbar navbar-expand-lg">
        <div className="container">
          <div className="logo-wrapper">
            <Link className="logo" to="/">
              <img
                src="/img/logo.png"
                className="logo-img"
                alt="THADS Barber"
              />
            </Link>
          </div>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbar"
            aria-controls="navbar"
            aria-expanded="false"
            aria-label="Mở menu"
          >
            <span className="navbar-toggler-icon">
              <i className="ti-menu" />
            </span>
          </button>

          <div className="collapse navbar-collapse" id="navbar">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/">Trang chủ</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/about">Giới thiệu</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/services">Dịch vụ</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/pricing">Bảng giá</Link>
              </li>

              <li className="nav-item dropdown">
                <button
                  className="nav-link active dropdown-toggle navbar-dropdown-button"
                  type="button"
                  data-bs-toggle="dropdown"
                  data-bs-auto-close="outside"
                  aria-expanded="false"
                >
                  Khám phá <i className="ti-angle-down" />
                </button>

                <ul className="dropdown-menu">
                  <li><Link className="dropdown-item" to="/portfolio"><span>Thư viện kiểu tóc</span></Link></li>
                  <li><Link className="dropdown-item active" to="/team"><span>Đội ngũ Barber</span></Link></li>
                  <li><Link className="dropdown-item" to="/faq"><span>Câu hỏi thường gặp</span></Link></li>
                  <li><Link className="dropdown-item" to="/services-page"><span>Chi tiết dịch vụ</span></Link></li>
                  <li><Link className="dropdown-item" to="/blog"><span>Tin tức và bài viết</span></Link></li>
                </ul>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/contact">Liên hệ</Link>
              </li>

              {isAuthenticated && user ? (
                <li className="nav-item dropdown">
                  <button
                    className="nav-link dropdown-toggle auth-user-button"
                    type="button"
                    data-bs-toggle="dropdown"
                    data-bs-auto-close="outside"
                    aria-expanded="false"
                  >
                    <i className="ti-user" /> {user.fullName} <i className="ti-angle-down" />
                  </button>

                  <ul className="dropdown-menu dropdown-menu-end">
                    <li><Link className="dropdown-item" to="/profile"><span>Hồ sơ cá nhân</span></Link></li>
                    <li><Link className="dropdown-item" to="/booking-history"><span>Lịch sử đặt lịch</span></Link></li>
                    <li>
                      <button type="button" className="dropdown-item logout-menu-button" onClick={handleLogout}>
                        <span>Đăng xuất</span>
                      </button>
                    </li>
                  </ul>
                </li>
              ) : (
                <>
                  <li className="nav-item"><Link className="nav-link" to="/login">Đăng nhập</Link></li>
                  <li className="nav-item"><Link className="nav-link" to="/register">Đăng ký</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* Header Banner */}
      <div
        className="banner-header valign bg-img bg-fixed"
        data-overlay-dark={5}
        data-background="img/slider/12.jpg"
      >
        <div className="container">
          <div className="row">
            <div className="col-md-12 text-center caption mt-60">
              <h5>Đội ngũ chuyên nghiệp</h5>
              <h1>Barber tại THADS Barber</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Team */}
      <section className="team-page section-padding">
        <div className="container">
          {loading ? (
            <div className="text-center my-5">
              <p>Đang tải danh sách Barber...</p>
            </div>
          ) : (
            <div className="row">
              {barbers.map((barber, index) => (
                <div
                  className="col-md-4 animate-box mb-30"
                  key={barber._id}
                >
                  <div className="team-page-card">
                    <div className="team-img">
                      <img
                        src={barber.avatar && barber.avatar.trim() !== "" ? barber.avatar : "/img/team/b1.jpg"}
                        alt={barber.fullName}
                        className="w-100"
                        style={{ height: "350px", objectFit: "cover" }}
                      />
                    </div>

                    <div className="team-content">
                      <h3 className="team-title">
                        {barber.fullName}
                        <span>Barber Chuyên Nghiệp</span>
                      </h3>

                      <p className="team-text">
                        {barber.bio || "Chuyên gia tạo kiểu tóc nam chuyên nghiệp, tận tâm trong từng đường kéo tại THADS Barber."}
                      </p>

                      <div className="social">
                        <div className="full-width">
                          <a href="#facebook" aria-label={`Facebook ${barber.fullName}`}><i className="ti-facebook" /></a>
                          <a href="#instagram" aria-label={`Instagram ${barber.fullName}`}><i className="ti-instagram" /></a>
                          <a href="#youtube" aria-label={`YouTube ${barber.fullName}`}><i className="ti-youtube" /></a>
                        </div>
                      </div>

                      <Link
                        to={`/team-details/${barber._id}`}
                        className="button-1 mt-15"
                      >
                        Xem thông tin
                        <span />
                      </Link>
                    </div>

                    <div className="title-box">
                      <h3 className="mb-0">
                        {barber.fullName}
                        <span>Barber Chuyên Nghiệp</span>
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Appointment Form */}
      <section className="testimonials">
        <div
          className="background bg-img bg-fixed section-padding pb-0"
          data-background="img/slider/18.jpg"
          data-overlay-dark={6}
        >
          <div className="container">
            <div className="row">
              <div className="col-md-5 mb-30 mt-60">
                <p className="mb-0">
                  <i className="star-rating" />
                  <i className="star-rating" />
                  <i className="star-rating" />
                  <i className="star-rating" />
                  <i className="star-rating" />
                </p>
                <h5>Lựa chọn Barber phù hợp và đặt lịch nhanh chóng tại THADS Barber.</h5>
                <div className="reservations mb-10">
                  <div className="icon color-1"><span className="icon-icon-1-1" /></div>
                  <div className="text">
                    <p className="color-1">Liên hệ đặt lịch</p>
                    <a className="color-1" href="tel:0987654321">0987 654 321</a>
                  </div>
                </div>
              </div>

              <div className="col-md-5 offset-md-2">
                <div className="booking-box">
                  <div className="head-box text-center">
                    <h4>Đặt lịch cắt tóc</h4>
                  </div>
                  <div className="booking-inner clearfix">
                    <form className="form1 clearfix" onSubmit={(e) => { e.preventDefault(); handleBooking(); }}>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="input1_wrapper">
                            <label>Họ và tên</label>
                            <div className="input2_inner">
                              <input type="text" className="form-control input" placeholder="Nhập họ và tên" defaultValue={user?.fullName ?? ""} required />
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input1_wrapper">
                            <label>Số điện thoại</label>
                            <div className="input2_inner">
                              <input type="tel" className="form-control input" placeholder="Nhập số điện thoại" defaultValue={user?.phone ?? ""} required />
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="select1_wrapper">
                            <label>Chọn Barber</label>
                            <div className="select1_inner">
                              <select className="select2 select" style={{ width: "100%" }} defaultValue="" required>
                                <option value="" disabled>Chọn Barber</option>
                                {barbers.map((b) => (
                                  <option key={b._id} value={b._id}>{b.fullName}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input1_wrapper">
                            <label>Ngày đặt lịch</label>
                            <div className="input1_inner">
                              <input type="date" className="form-control input" required />
                            </div>
                          </div>
                        </div>
                        <div className="col-md-12">
                          <button type="submit" className="btn-form1-submit mt-15">Tiếp tục đặt lịch</button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-bottom">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="footer-bottom-inner">
                  <p className="footer-bottom-copy-right">
                    © {new Date().getFullYear()} THADS Barber. Bảo lưu mọi quyền.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Team;
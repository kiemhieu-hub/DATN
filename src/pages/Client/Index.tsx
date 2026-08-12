import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";

function Index() {
  const navigate = useNavigate();

  const {
    user,
    isAuthenticated,
    logout,
  } = useAuth();

  const handleLogout = (): void => {
    logout();

    navigate("/", {
      replace: true,
    });
  };

  return (
    <div>
      {/* ================= SCROLL TO TOP ================= */}

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

      {/* ================= NAVBAR ================= */}

      <nav className="navbar navbar-expand-lg">
        <div className="container">
          {/* Logo */}
          <div className="logo-wrapper">
            <Link className="logo" to="/">
              <img
                src="/img/logo.png"
                className="logo-img"
                alt="THADS Barber"
              />
            </Link>
          </div>

          {/* Mobile menu button */}
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

          {/* Menu */}
          <div
            className="collapse navbar-collapse"
            id="navbar"
          >
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link
                  className="nav-link active"
                  to="/"
                >
                  Trang chủ
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className="nav-link"
                  to="/about"
                >
                  Giới thiệu
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className="nav-link"
                  to="/services"
                >
                  Dịch vụ
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className="nav-link"
                  to="/pricing"
                >
                  Bảng giá
                </Link>
              </li>

              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle navbar-dropdown-button"
                  type="button"
                  data-bs-toggle="dropdown"
                  data-bs-auto-close="outside"
                  aria-expanded="false"
                >
                  Khám phá{" "}
                  <i className="ti-angle-down" />
                </button>

                <ul className="dropdown-menu">
                  <li>
                    <Link
                      to="/portfolio"
                      className="dropdown-item"
                    >
                      <span>Thư viện kiểu tóc</span>
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/team.html"
                      className="dropdown-item"
                    >
                      <span>Đội ngũ Barber</span>
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/faq.html"
                      className="dropdown-item"
                    >
                      <span>Câu hỏi thường gặp</span>
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/services-page"
                      className="dropdown-item"
                    >
                      <span>Chi tiết dịch vụ</span>
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/team-details"
                      className="dropdown-item"
                    >
                      <span>Thông tin Barber</span>
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/blog.html"
                      className="dropdown-item"
                    >
                      <span>Tin tức & bài viết</span>
                    </Link>
                  </li>
                </ul>
              </li>

              <li className="nav-item">
                <Link
                  className="nav-link"
                  to="/contact"
                >
                  Liên hệ
                </Link>
              </li>

              {/* ================= AUTH MENU ================= */}

              {isAuthenticated && user ? (
                <li className="nav-item dropdown">
                  <button
                    className="nav-link dropdown-toggle auth-user-button"
                    type="button"
                    data-bs-toggle="dropdown"
                    data-bs-auto-close="outside"
                    aria-expanded="false"
                  >
                    <i className="ti-user" />{" "}
                    {user.fullName}{" "}
                    <i className="ti-angle-down" />
                  </button>

                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/profile"
                      >
                        <span>Hồ sơ cá nhân</span>
                      </Link>
                    </li>

                    <li>
                      <Link
                        className="dropdown-item"
                        to="/booking-history"
                      >
                        <span>Lịch sử đặt lịch</span>
                      </Link>
                    </li>

                    <li>
                      <button
                        type="button"
                        className="dropdown-item logout-menu-button"
                        onClick={handleLogout}
                      >
                        <span>Đăng xuất</span>
                      </button>
                    </li>
                  </ul>
                </li>
              ) : (
                <>
                  <li className="nav-item">
                    <Link
                      className="nav-link"
                      to="/login"
                    >
                      Đăng nhập
                    </Link>
                  </li>

                  <li className="nav-item">
                    <Link
                      className="nav-link"
                      to="/register"
                    >
                      Đăng ký
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* ================= BANNER ================= */}

      <div
        className="banner-header full-height valign bg-img bg-fixed"
        data-overlay-dark={5}
        data-background="img/slider/23.jpg"
      >
        <div className="container">
          <div className="row content-justify-center">
            <div className="col-md-12 text-center">
              <div className="v-middle">
                <h5>
                  Phong cách sắc nét, diện mạo hoàn hảo
                </h5>

                <h1>
                  THADS BARBER
                  <br />
                  KHẲNG ĐỊNH PHONG CÁCH CỦA BẠN
                </h1>

                <h5>
                  Chăm sóc mái tóc - Nâng tầm phong cách
                </h5>

                <Link
                  to="/booking"
                  className="button-1 mt-20"
                >
                  Đặt lịch ngay
                  <span />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="arrow bounce text-center">
          <a href="#about">
            <i className="ti-arrow-down" />
          </a>
        </div>
      </div>

      {/* ================= GIỚI THIỆU ================= */}

      <section
        id="about"
        className="about section-padding"
      >
        <div className="container">
          <div className="row">
            <div className="col-md-6 mb-30">
              <div className="section-head mb-20">
                <div className="section-subtitle">
                  Chuyên nghiệp - Tận tâm - Phong cách
                </div>

                <div className="section-title">
                  THADS Barber
                </div>
              </div>

              <p>
                THADS Barber mang đến trải nghiệm chăm sóc
                tóc chuyên nghiệp dành cho phái mạnh. Chúng
                tôi luôn chú trọng từng đường kéo, từng chi
                tiết để giúp khách hàng sở hữu diện mạo tự
                tin và phong cách nhất.
              </p>

              <ul className="about-list list-unstyled mb-30">
                <li>
                  <div className="about-list-icon">
                    <span className="ti-check" />
                  </div>

                  <div className="about-list-text">
                    <p>
                      Đội ngũ Barber chuyên nghiệp, tận tâm
                      và giàu kinh nghiệm
                    </p>
                  </div>
                </li>

                <li>
                  <div className="about-list-icon">
                    <span className="ti-check" />
                  </div>

                  <div className="about-list-text">
                    <p>
                      Dịch vụ chất lượng và quy trình phục vụ
                      chuyên nghiệp
                    </p>
                  </div>
                </li>

                <li>
                  <div className="about-list-icon">
                    <span className="ti-check" />
                  </div>

                  <div className="about-list-text">
                    <p>
                      Đặt lịch nhanh chóng, thuận tiện và tiết
                      kiệm thời gian
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div
              className="col col-md-3 animate-box"
              data-animate-effect="fadeInUp"
            >
              <img
                src="/img/about2.jpg"
                alt="Không gian THADS Barber"
                className="mt-90 mb-30"
              />
            </div>

            <div
              className="col col-md-3 animate-box"
              data-animate-effect="fadeInUp"
            >
              <img
                src="/img/about.jpg"
                alt="Dịch vụ tại THADS Barber"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= DỊCH VỤ ================= */}

      <section className="services-box section-padding pt-0">
        <div className="container">
          <div className="row">
            <div className="col-md-4">
              <div className="item">
                <span className="icon icon-icon-1-6" />

                <div className="cont">
                  <h5>Cắt tóc nam</h5>

                  <p>
                    Tư vấn và tạo kiểu tóc phù hợp với khuôn
                    mặt, phong cách và sở thích riêng của
                    từng khách hàng.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="item">
                <span className="icon icon-icon-1-3" />

                <div className="cont">
                  <h5>Tạo kiểu & Fade</h5>

                  <p>
                    Kỹ thuật Fade chuyên nghiệp với những
                    đường chuyển sắc sắc nét, mang lại diện
                    mạo hiện đại và cá tính.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="item">
                <span className="icon icon-icon-1-1" />

                <div className="cont">
                  <h5>Cạo mặt & chăm sóc</h5>

                  <p>
                    Dịch vụ cạo mặt và chăm sóc chuyên nghiệp
                    giúp bạn thư giãn và sở hữu diện mạo sạch
                    sẽ, chỉn chu.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CÂU CHUYỆN THADS ================= */}

      <section className="about section-padding bg-darkbrown">
        <div className="container">
          <div className="row">
            <div
              className="col-md-5 mb-30 animate-box"
              data-animate-effect="fadeInLeft"
            >
              <img
                src="/img/about3.jpg"
                alt="Câu chuyện THADS Barber"
              />
            </div>

            <div
              className="col-md-7 valign mb-30 animate-box"
              data-animate-effect="fadeInRight"
            >
              <div className="row">
                <div className="col-md-12">
                  <div className="section-head mb-20">
                    <div className="section-subtitle">
                      Không chỉ là một mái tóc
                    </div>

                    <div className="section-title white">
                      THADS Barber giúp bạn khẳng định phong
                      cách riêng
                    </div>
                  </div>

                  <p>
                    Chúng tôi tin rằng một kiểu tóc phù hợp
                    không chỉ thay đổi diện mạo mà còn mang
                    lại sự tự tin. Tại THADS Barber, mỗi
                    khách hàng đều được tư vấn và chăm sóc
                    theo nhu cầu riêng.
                  </p>

                  <div className="about-bottom">
                    <img
                      src="/img/signature.svg"
                      alt="THADS Barber"
                      className="image about-signature"
                    />

                    <div className="about-name-wrapper">
                      <div className="about-rol">
                        Đội ngũ THADS Barber
                      </div>

                      <div className="about-name">
                        THADS Barber
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ĐẶT LỊCH ================= */}

      <section className="testimonials">
        <div
          className="background bg-img bg-fixed section-padding pb-0"
          data-background="img/slider/18.jpg"
          data-overlay-dark={6}
        >
          <div className="container">
            <div className="row">
              <div className="col-md-5 mb-30 mt-60">
                <h5>
                  Sẵn sàng thay đổi diện mạo? Đặt lịch ngay
                  hôm nay tại THADS Barber.
                </h5>
              </div>

              <div className="col-md-5 offset-md-2">
                <div className="booking-box">
                  <div className="head-box text-center">
                    <h4>Đặt lịch cắt tóc</h4>
                  </div>

                  <div className="booking-inner clearfix">
                    <form className="form1 clearfix">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="input1_wrapper">
                            <label>Họ và tên</label>

                            <input
                              type="text"
                              className="form-control input"
                              placeholder="Nhập họ và tên"
                              required
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="input1_wrapper">
                            <label>Số điện thoại</label>

                            <input
                              type="tel"
                              className="form-control input"
                              placeholder="Nhập số điện thoại"
                              required
                            />
                          </div>
                        </div>

                        <div className="col-md-12 mt-15">
                          <Link
                            to="/booking"
                            className="btn-form1-submit"
                          >
                            Đặt lịch ngay
                          </Link>
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

      {/* ================= FOOTER ================= */}

      <footer className="footer">
        <div className="footer-bottom">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="footer-bottom-inner">
                  <p className="footer-bottom-copy-right">
                    © 2026 THADS Barber. Bảo lưu mọi quyền.
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

export default Index;

import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";

function About() {
  const navigate = useNavigate();

  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = (): void => {
    logout();
    navigate("/", { replace: true });
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
                <Link className="nav-link" to="/">
                  Trang chủ
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className="nav-link active"
                  to="/about.html"
                >
                  Giới thiệu
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className="nav-link"
                  to="/services.html"
                >
                  Dịch vụ
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className="nav-link"
                  to="/pricing.html"
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
                  Khám phá <i className="ti-angle-down" />
                </button>

                <ul className="dropdown-menu">
                  <li>
                    <Link
                      to="/portfolio.html"
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
                      to="/services-page.html"
                      className="dropdown-item"
                    >
                      <span>Chi tiết dịch vụ</span>
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/team-details.html"
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
                      <span>Tin tức và bài viết</span>
                    </Link>
                  </li>
                </ul>
              </li>

              <li className="nav-item">
                <Link
                  className="nav-link"
                  to="/contact.html"
                >
                  Liên hệ
                </Link>
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

      {/* Header Banner */}
      <div
        className="banner-header valign bg-img bg-fixed"
        data-overlay-dark={4}
        data-background="img/slider/1.jpg"
      >
        <div className="container">
          <div className="row">
            <div className="col-md-12 text-center caption mt-60">
              <h5>Về chúng tôi</h5>
              <h1>Câu chuyện THADS Barber</h1>
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <section className="about section-padding">
        <div className="container">
          <div className="row">
            <div className="col-md-6 mb-30">
              <div className="section-head mb-20">
                <div className="section-subtitle">
                  Chuyên nghiệp và tận tâm
                </div>

                <div className="section-title">
                  THADS Barber
                </div>
              </div>

              <p>
                THADS Barber là không gian chăm sóc tóc
                chuyên nghiệp dành cho phái mạnh. Chúng tôi
                mong muốn mỗi khách hàng khi bước ra khỏi
                salon đều cảm thấy tự tin hơn với diện mạo
                và phong cách của mình.
              </p>

              <p>
                Với đội ngũ Barber giàu kinh nghiệm, quy
                trình phục vụ tận tâm cùng các sản phẩm chất
                lượng, THADS Barber mang đến trải nghiệm
                thoải mái, hiện đại và phù hợp với từng khách
                hàng.
              </p>

              <ul className="about-list list-unstyled mb-30">
                <li>
                  <div className="about-list-icon">
                    <span className="ti-check" />
                  </div>

                  <div className="about-list-text">
                    <p>
                      Đội ngũ Barber chuyên nghiệp và giàu
                      kinh nghiệm
                    </p>
                  </div>
                </li>

                <li>
                  <div className="about-list-icon">
                    <span className="ti-check" />
                  </div>

                  <div className="about-list-text">
                    <p>
                      Sử dụng sản phẩm chăm sóc tóc chất lượng
                    </p>
                  </div>
                </li>

                <li>
                  <div className="about-list-icon">
                    <span className="ti-check" />
                  </div>

                  <div className="about-list-text">
                    <p>
                      Luôn đặt sự hài lòng của khách hàng lên
                      hàng đầu
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="col col-md-3">
              <img
                src="/img/about2.jpg"
                alt="Không gian THADS Barber"
                className="mt-90 mb-30"
              />
            </div>

            <div className="col col-md-3">
              <img
                src="/img/about.jpg"
                alt="Dịch vụ tại THADS Barber"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Box */}
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
                    mặt, cá tính và nhu cầu của từng khách
                    hàng.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="item">
                <span className="icon icon-icon-1-3" />

                <div className="cont">
                  <h5>Tạo kiểu và Fade</h5>

                  <p>
                    Kỹ thuật Fade chuyên nghiệp với đường
                    chuyển sắc sắc nét, hiện đại và đầy cá
                    tính.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="item">
                <span className="icon icon-icon-1-1" />

                <div className="cont">
                  <h5>Cạo mặt và chăm sóc</h5>

                  <p>
                    Dịch vụ cạo mặt và chăm sóc giúp khách
                    hàng thư giãn, sạch sẽ và chỉn chu hơn.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our History */}
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
                      Giúp khách hàng tự tin với phong cách
                      riêng
                    </div>
                  </div>

                  <p>
                    THADS Barber tin rằng một kiểu tóc phù hợp
                    không chỉ thay đổi diện mạo mà còn tạo nên
                    sự tự tin. Mỗi khách hàng đều được tư vấn
                    kỹ lưỡng để lựa chọn kiểu tóc phù hợp với
                    gương mặt, công việc và phong cách sống.
                  </p>

                  <div className="about-bottom">
                    <img
                      src="/img/signature.svg"
                      alt="THADS Barber"
                      className="image about-signature"
                    />

                    <div className="about-name-wrapper">
                      <div className="about-rol">
                        Đội ngũ sáng lập
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

      {/* Video */}
      <section
        className="section-padding video-wrapper video bg-img bg-fixed"
        data-overlay-dark={4}
        data-background="img/slider/5.jpg"
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-7">
              <div className="section-head text-center">
                <div className="section-title white">
                  Khám phá không gian THADS Barber
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-12 text-center">
              <a
                className="vid"
                href="https://youtu.be/e2x0UXVU2yg"
                target="_blank"
                rel="noreferrer"
              >
                <div className="vid-butn">
                  <span className="icon">
                    <i className="ti-control-play" />
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="team section-padding">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="section-head text-center">
                <div className="section-subtitle">
                  Đội ngũ của chúng tôi
                </div>

                <div className="section-title black">
                  Barber chuyên nghiệp
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-12">
              <div className="owl-carousel owl-theme">
                <div className="team-card mb-30">
                  <div className="team-img">
                    <img
                      src="/img/team/b1.jpg"
                      alt="Barber Nguyễn Minh"
                      className="w-100"
                    />
                  </div>

                  <div className="team-content">
                    <h3 className="team-title">
                      Nguyễn Minh
                      <span>Barber cao cấp</span>
                    </h3>

                    <p className="team-text">
                      Chuyên cắt tóc nam hiện đại, Fade và tư
                      vấn kiểu tóc phù hợp với khuôn mặt.
                    </p>

                    <div className="social">
                      <div className="full-width">
                        <a href="#">
                          <i className="ti-facebook" />
                        </a>

                        <a href="#">
                          <i className="ti-instagram" />
                        </a>
                      </div>
                    </div>

                    <Link
                      to="/team-details.html"
                      className="button-1 mt-20"
                    >
                      Xem thông tin
                      <span />
                    </Link>
                  </div>

                  <div className="title-box">
                    <h3 className="mb-0">
                      Nguyễn Minh
                      <span>Barber cao cấp</span>
                    </h3>
                  </div>
                </div>

                <div className="team-card mb-30">
                  <div className="team-img">
                    <img
                      src="/img/team/b2.jpg"
                      alt="Barber Đức Anh"
                      className="w-100"
                    />
                  </div>

                  <div className="team-content">
                    <h3 className="team-title">
                      Đức Anh
                      <span>Chuyên gia tạo kiểu</span>
                    </h3>

                    <p className="team-text">
                      Có kinh nghiệm tư vấn, tạo kiểu và chăm
                      sóc tóc phù hợp với nhiều phong cách.
                    </p>

                    <div className="social">
                      <div className="full-width">
                        <a href="#">
                          <i className="ti-facebook" />
                        </a>

                        <a href="#">
                          <i className="ti-instagram" />
                        </a>
                      </div>
                    </div>

                    <Link
                      to="/team-details.html"
                      className="button-1 mt-20"
                    >
                      Xem thông tin
                      <span />
                    </Link>
                  </div>

                  <div className="title-box">
                    <h3 className="mb-0">
                      Đức Anh
                      <span>Chuyên gia tạo kiểu</span>
                    </h3>
                  </div>
                </div>

                <div className="team-card mb-30">
                  <div className="team-img">
                    <img
                      src="/img/team/b3.jpg"
                      alt="Barber Thành Nam"
                      className="w-100"
                    />
                  </div>

                  <div className="team-content">
                    <h3 className="team-title">
                      Thành Nam
                      <span>Barber</span>
                    </h3>

                    <p className="team-text">
                      Chuyên tóc ngắn, tóc Layer và những kiểu
                      tóc trẻ trung, hiện đại.
                    </p>

                    <div className="social">
                      <div className="full-width">
                        <a href="#">
                          <i className="ti-facebook" />
                        </a>

                        <a href="#">
                          <i className="ti-instagram" />
                        </a>
                      </div>
                    </div>

                    <Link
                      to="/team-details.html"
                      className="button-1 mt-20"
                    >
                      Xem thông tin
                      <span />
                    </Link>
                  </div>

                  <div className="title-box">
                    <h3 className="mb-0">
                      Thành Nam
                      <span>Barber</span>
                    </h3>
                  </div>
                </div>

                <div className="team-card mb-30">
                  <div className="team-img">
                    <img
                      src="/img/team/b4.jpg"
                      alt="Barber Hoàng Sơn"
                      className="w-100"
                    />
                  </div>

                  <div className="team-content">
                    <h3 className="team-title">
                      Hoàng Sơn
                      <span>Barber</span>
                    </h3>

                    <p className="team-text">
                      Luôn tận tâm trong từng đường kéo và tư
                      vấn phong cách phù hợp cho khách hàng.
                    </p>

                    <div className="social">
                      <div className="full-width">
                        <a href="#">
                          <i className="ti-facebook" />
                        </a>

                        <a href="#">
                          <i className="ti-instagram" />
                        </a>
                      </div>
                    </div>

                    <Link
                      to="/team-details.html"
                      className="button-1 mt-20"
                    >
                      Xem thông tin
                      <span />
                    </Link>
                  </div>

                  <div className="title-box">
                    <h3 className="mb-0">
                      Hoàng Sơn
                      <span>Barber</span>
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-top">
          <div className="container">
            <div className="row">
              <div className="col-md-3">
                <div className="footer-column footer-contact">
                  <h3 className="footer-title">
                    Liên hệ
                  </h3>

                  <p className="footer-contact-text">
                    THADS Barber
                    <br />
                    Hà Nội, Việt Nam
                  </p>

                  <div className="footer-contact-info">
                    <p className="footer-contact-phone">
                      0987 654 321
                    </p>

                    <p className="footer-contact-mail">
                      contact@thadsbarber.com
                    </p>
                  </div>

                  <div className="footer-about-social-list">
                    <a href="#">
                      <i className="ti-instagram" />
                    </a>

                    <a href="#">
                      <i className="ti-youtube" />
                    </a>

                    <a href="#">
                      <i className="ti-facebook" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="col-md-3 offset-md-1">
                <div className="item opening">
                  <h3 className="footer-title">
                    Giờ làm việc
                  </h3>

                  <ul>
                    <li>
                      <div className="tit">
                        Thứ Hai
                      </div>
                      <div className="dots" />
                      <span>09:00 - 21:00</span>
                    </li>

                    <li>
                      <div className="tit">
                        Thứ Ba
                      </div>
                      <div className="dots" />
                      <span>09:00 - 21:00</span>
                    </li>

                    <li>
                      <div className="tit">
                        Thứ Tư
                      </div>
                      <div className="dots" />
                      <span>09:00 - 21:00</span>
                    </li>

                    <li>
                      <div className="tit">
                        Thứ Năm
                      </div>
                      <div className="dots" />
                      <span>09:00 - 21:00</span>
                    </li>

                    <li>
                      <div className="tit">
                        Thứ Sáu
                      </div>
                      <div className="dots" />
                      <span>09:00 - 21:00</span>
                    </li>

                    <li>
                      <div className="tit">
                        Cuối tuần
                      </div>
                      <div className="dots" />
                      <span>08:00 - 22:00</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="col-md-4 offset-md-1">
                <div className="footer-column footer-explore clearfix">
                  <h3 className="footer-title">
                    Nhận thông tin mới
                  </h3>

                  <div className="row subscribe">
                    <div className="col-md-12">
                      <p>
                        Đăng ký email để nhận thông tin về ưu
                        đãi, dịch vụ và chương trình mới nhất.
                      </p>

                      <form>
                        <input
                          type="email"
                          name="email"
                          placeholder="Email của bạn"
                          required
                        />

                        <button type="submit">
                          Đăng ký
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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

export default About;
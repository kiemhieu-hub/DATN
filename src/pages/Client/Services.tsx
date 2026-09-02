import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";

function Services() {
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
                <Link className="nav-link" to="/about">
                  Giới thiệu
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className="nav-link active"
                  to="/services"
                >
                  Dịch vụ
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/pricing">
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
                      className="dropdown-item"
                      to="/portfolio"
                    >
                      <span>Thư viện kiểu tóc</span>
                    </Link>
                  </li>

                  <li>
                    <Link
                      className="dropdown-item"
                      to="/team"
                    >
                      <span>Đội ngũ Barber</span>
                    </Link>
                  </li>

                  <li>
                    <Link
                      className="dropdown-item"
                      to="/faq"
                    >
                      <span>Câu hỏi thường gặp</span>
                    </Link>
                  </li>

                  <li>
                    <Link
                      className="dropdown-item"
                      to="/services-page"
                    >
                      <span>Chi tiết dịch vụ</span>
                    </Link>
                  </li>

                  <li>
                    <Link
                      className="dropdown-item"
                      to="/team-details"
                    >
                      <span>Thông tin Barber</span>
                    </Link>
                  </li>

                  <li>
                    <Link
                      className="dropdown-item"
                      to="/blog"
                    >
                      <span>Tin tức và bài viết</span>
                    </Link>
                  </li>
                </ul>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/contact">
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
                    <Link className="nav-link" to="/login">
                      Đăng nhập
                    </Link>
                  </li>

                  <li className="nav-item">
                    <Link className="nav-link" to="/register">
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
        data-background="img/slider/4.jpg"
      >
        <div className="container">
          <div className="row">
            <div className="col-md-12 text-center caption mt-60">
              <h5>THADS Barber mang đến</h5>
              <h1>Dịch vụ của chúng tôi</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Services */}
      <section className="services-1 section-padding">
        <div className="container">
          <div className="row">
            <div className="col-md-4">
              <div className="item">
                <Link to="/services-page">
                  <span className="icon icon-icon-1-1" />

                  <h5>Tỉa ria mép</h5>

                  <p>
                    Tạo đường nét gọn gàng, cân đối và phù
                    hợp với phong cách khuôn mặt của khách
                    hàng.
                  </p>

                  <div className="shape">
                    <span className="icon icon-icon-1-1" />
                  </div>
                </Link>
              </div>
            </div>

            <div className="col-md-4">
              <div className="item">
                <Link to="/services-page">
                  <span className="icon icon-icon-1-9" />

                  <h5>Cạo mặt</h5>

                  <p>
                    Dịch vụ cạo mặt chuyên nghiệp giúp làn da
                    sạch sẽ, thư giãn và mang lại diện mạo
                    chỉn chu.
                  </p>

                  <div className="shape">
                    <span className="icon icon-icon-1-9" />
                  </div>
                </Link>
              </div>
            </div>

            <div className="col-md-4">
              <div className="item">
                <Link to="/services-page">
                  <span className="icon icon-icon-1-3" />

                  <h5>Tỉa và tạo kiểu râu</h5>

                  <p>
                    Tư vấn và tạo hình bộ râu phù hợp với
                    khuôn mặt, cá tính và phong cách riêng.
                  </p>

                  <div className="shape">
                    <span className="icon icon-icon-1-3" />
                  </div>
                </Link>
              </div>
            </div>

            <div className="col-md-4">
              <div className="item">
                <Link to="/services-page">
                  <span className="icon icon-icon-1-2" />

                  <h5>Cắt tóc nam</h5>

                  <p>
                    Cắt và tạo kiểu theo xu hướng, phù hợp với
                    khuôn mặt, công việc và sở thích của từng
                    khách hàng.
                  </p>

                  <div className="shape">
                    <span className="icon icon-icon-1-2" />
                  </div>
                </Link>
              </div>
            </div>

            <div className="col-md-4">
              <div className="item">
                <Link to="/services-page">
                  <span className="icon icon-icon-1-6" />

                  <h5>Cắt Fade chuyên nghiệp</h5>

                  <p>
                    Kỹ thuật Fade sắc nét với đường chuyển
                    mượt mà, mang đến phong cách trẻ trung và
                    hiện đại.
                  </p>

                  <div className="shape">
                    <span className="icon icon-icon-1-6" />
                  </div>
                </Link>
              </div>
            </div>

            <div className="col-md-4">
              <div className="item">
                <Link to="/services-page">
                  <span className="icon icon-icon-1-8" />

                  <h5>Chăm sóc da và massage</h5>

                  <p>
                    Làm sạch da mặt kết hợp massage thư giãn,
                    giúp giảm căng thẳng và chăm sóc làn da.
                  </p>

                  <div className="shape">
                    <span className="icon icon-icon-1-8" />
                  </div>
                </Link>
              </div>
            </div>

            <div className="col-md-4">
              <div className="item">
                <Link to="/services-page">
                  <span className="icon icon-icon-1-4" />

                  <h5>Gội đầu thư giãn</h5>

                  <p>
                    Làm sạch tóc và da đầu kết hợp massage,
                    mang lại cảm giác thư giãn và dễ chịu.
                  </p>

                  <div className="shape">
                    <span className="icon icon-icon-1-4" />
                  </div>
                </Link>
              </div>
            </div>

            <div className="col-md-4">
              <div className="item">
                <Link to="/services-page">
                  <span className="icon icon-icon-1-18" />

                  <h5>Sấy và tạo kiểu</h5>

                  <p>
                    Sấy phồng, vuốt tạo kiểu và hoàn thiện mái
                    tóc theo phong cách khách hàng lựa chọn.
                  </p>

                  <div className="shape">
                    <span className="icon icon-icon-1-18" />
                  </div>
                </Link>
              </div>
            </div>

            <div className="col-md-4">
              <div className="item">
                <Link to="/services-page">
                  <span className="icon icon-icon-1-10" />

                  <h5>Nhuộm tóc</h5>

                  <p>
                    Tư vấn màu tóc phù hợp, sử dụng sản phẩm
                    chất lượng và kỹ thuật nhuộm chuyên
                    nghiệp.
                  </p>

                  <div className="shape">
                    <span className="icon icon-icon-1-10" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* First Class Services */}
      <section className="first-class-services section-padding">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="section-head text-center">
                <div className="section-subtitle">
                  Dịch vụ nổi bật
                </div>

                <div className="section-title white">
                  Trải nghiệm tại THADS Barber
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-4">
              <div className="square-flip">
                <div
                  className="square bg-img"
                  data-background="img/barber.jpg"
                >
                  <div className="square-container d-flex align-items-end justify-content-end">
                    <div className="box-title">
                      <h4>Cạo mặt chuyên nghiệp</h4>
                    </div>
                  </div>

                  <div className="flip-overlay" />
                </div>

                <div className="square2">
                  <div className="square-container2">
                    <h4>Cạo mặt chuyên nghiệp</h4>

                    <p>
                      <i>
                        Quy trình cạo mặt an toàn, sạch sẽ và
                        thư giãn, giúp khách hàng có diện mạo
                        gọn gàng và lịch lãm.
                      </i>
                    </p>

                    <Link
                      to="/booking"
                      className="button-2 mt-15"
                    >
                      Đặt lịch
                      <span />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="square-flip">
                <div
                  className="square bg-img"
                  data-background="img/kids.jpg"
                >
                  <div className="square-container d-flex align-items-end justify-content-end">
                    <div className="box-title">
                      <h4>Cắt tóc trẻ em</h4>
                    </div>
                  </div>

                  <div className="flip-overlay" />
                </div>

                <div className="square2">
                  <div className="square-container2">
                    <h4>Cắt tóc trẻ em</h4>

                    <p>
                      <i>
                        Không gian thân thiện cùng Barber kiên
                        nhẫn, giúp trẻ nhỏ thoải mái trong quá
                        trình cắt tóc.
                      </i>
                    </p>

                    <Link
                      to="/booking"
                      className="button-2 mt-15"
                    >
                      Đặt lịch
                      <span />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="square-flip">
                <div
                  className="square bg-img"
                  data-background="img/team/b3.jpg"
                >
                  <div className="square-container d-flex align-items-end justify-content-end">
                    <div className="box-title">
                      <h4>Barber sáng tạo</h4>
                    </div>
                  </div>

                  <div className="flip-overlay" />
                </div>

                <div className="square2">
                  <div className="square-container2">
                    <h4>Barber sáng tạo</h4>

                    <p>
                      <i>
                        Đội ngũ Barber chuyên nghiệp, thường
                        xuyên cập nhật xu hướng và tư vấn kiểu
                        tóc phù hợp.
                      </i>
                    </p>

                    <Link
                      to="/team"
                      className="button-2 mt-15"
                    >
                      Xem đội ngũ
                      <span />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Appointment */}
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

                <h5>
                  THADS Barber mang đến trải nghiệm cắt tóc
                  chuyên nghiệp, hiện đại và tận tâm.
                </h5>

                <div className="reservations mb-10">
                  <div className="icon color-1">
                    <span className="icon-icon-1-1" />
                  </div>

                  <div className="text">
                    <p className="color-1">Liên hệ đặt lịch</p>

                    <a
                      className="color-1"
                      href="tel:0987654321"
                    >
                      0987 654 321
                    </a>
                  </div>
                </div>
              </div>

              <div className="col-md-5 offset-md-2">
                <div className="booking-box">
                  <div className="head-box text-center">
                    <h4>Đặt lịch cắt tóc</h4>
                  </div>

                  <div className="booking-inner clearfix">
                    <form
                      className="form1 clearfix"
                      onSubmit={(event) => {
                        event.preventDefault();
                        navigate("/booking");
                      }}
                    >
                      <div className="row">
                        <div className="col-md-6">
                          <div className="input1_wrapper">
                            <label>Họ và tên</label>

                            <div className="input2_inner">
                              <input
                                type="text"
                                className="form-control input"
                                placeholder="Nhập họ và tên"
                                defaultValue={user?.fullName ?? ""}
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="input1_wrapper">
                            <label>Số điện thoại</label>

                            <div className="input2_inner">
                              <input
                                type="tel"
                                className="form-control input"
                                placeholder="Nhập số điện thoại"
                                defaultValue={user?.phone ?? ""}
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="input1_wrapper">
                            <label>Ngày đặt lịch</label>

                            <div className="input1_inner">
                              <input
                                type="date"
                                className="form-control input"
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="select1_wrapper">
                            <label>Khung giờ</label>

                            <div className="select1_inner">
                              <select
                                className="select2 select"
                                style={{ width: "100%" }}
                                defaultValue=""
                                required
                              >
                                <option value="" disabled>
                                  Chọn giờ
                                </option>
                                <option value="09:00">09:00</option>
                                <option value="10:00">10:00</option>
                                <option value="11:00">11:00</option>
                                <option value="13:00">13:00</option>
                                <option value="15:00">15:00</option>
                                <option value="17:00">17:00</option>
                                <option value="19:00">19:00</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="select1_wrapper">
                            <label>Dịch vụ</label>

                            <div className="select1_inner">
                              <select
                                className="select2 select"
                                style={{ width: "100%" }}
                                defaultValue=""
                                required
                              >
                                <option value="" disabled>
                                  Chọn dịch vụ
                                </option>
                                <option value="haircut">
                                  Cắt tóc nam
                                </option>
                                <option value="fade">
                                  Cắt Fade
                                </option>
                                <option value="shaving">
                                  Cạo mặt
                                </option>
                                <option value="beard">
                                  Tỉa râu
                                </option>
                                <option value="hair-wash">
                                  Gội đầu
                                </option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="select1_wrapper">
                            <label>Chọn Barber</label>

                            <div className="select1_inner">
                              <select
                                className="select2 select"
                                style={{ width: "100%" }}
                                defaultValue=""
                                required
                              >
                                <option value="" disabled>
                                  Chọn Barber
                                </option>
                                <option value="barber-1">
                                  Nguyễn Minh
                                </option>
                                <option value="barber-2">
                                  Đức Anh
                                </option>
                                <option value="barber-3">
                                  Thành Nam
                                </option>
                                <option value="barber-4">
                                  Hoàng Sơn
                                </option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-12">
                          <button
                            type="submit"
                            className="btn-form1-submit mt-15"
                          >
                            Tiếp tục đặt lịch
                          </button>
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

      {/* Clients */}
      <section className="clients">
        <div className="container">
          <div className="row">
            <div className="col-md-7">
              <div className="owl-carousel owl-theme">
                {[2, 3, 4, 5, 6].map((number) => (
                  <div
                    className="clients-logo"
                    key={number}
                  >
                    <img
                      src={`/img/clients/${number}.png`}
                      alt={`Đối tác ${number}`}
                    />
                  </div>
                ))}
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
                  <h3 className="footer-title">Liên hệ</h3>

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
                    <a href="#instagram">
                      <i className="ti-instagram" />
                    </a>

                    <a href="#youtube">
                      <i className="ti-youtube" />
                    </a>

                    <a href="#facebook">
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
                      <div className="tit">Thứ Hai</div>
                      <div className="dots" />
                      <span>09:00 - 21:00</span>
                    </li>

                    <li>
                      <div className="tit">Thứ Ba</div>
                      <div className="dots" />
                      <span>09:00 - 21:00</span>
                    </li>

                    <li>
                      <div className="tit">Thứ Tư</div>
                      <div className="dots" />
                      <span>09:00 - 21:00</span>
                    </li>

                    <li>
                      <div className="tit">Thứ Năm</div>
                      <div className="dots" />
                      <span>09:00 - 21:00</span>
                    </li>

                    <li>
                      <div className="tit">Thứ Sáu</div>
                      <div className="dots" />
                      <span>09:00 - 21:00</span>
                    </li>

                    <li>
                      <div className="tit">Cuối tuần</div>
                      <div className="dots" />
                      <span>08:00 - 22:00</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="col-md-4 offset-md-1">
                <div className="footer-column footer-explore clearfix">
                  <h3 className="footer-title">
                    Nhận thông tin ưu đãi
                  </h3>

                  <div className="row subscribe">
                    <div className="col-md-12">
                      <p>
                        Đăng ký email để nhận thông tin về
                        dịch vụ, chương trình và ưu đãi mới.
                      </p>

                      <form
                        onSubmit={(event) =>
                          event.preventDefault()
                        }
                      >
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

export default Services;

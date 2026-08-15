import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";

function Pricing() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

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
      {/* Scroll to top */}
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
                <Link className="nav-link" to="/services">
                  Dịch vụ
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className="nav-link active"
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
        data-overlay-dark={5}
        data-background="img/slider/18.jpg"
      >
        <div className="container">
          <div className="row">
            <div className="col-md-12 text-center caption mt-60">
              <h5>Dịch vụ chất lượng, giá rõ ràng</h5>
              <h1>Bảng giá THADS Barber</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <section className="barber-pricing2 barber-pricing3 section-padding">
        <div className="container">
          {/* Cắt tóc */}
          <div className="row">
            <div className="col-md-6 p-0 item">
              <div className="img left">
                <img
                  src="/img/slider/6.jpg"
                  alt="Dịch vụ cắt tóc nam"
                />

                <div className="centered">
                  <h2>Cắt tóc</h2>
                </div>
              </div>
            </div>

            <div className="col-md-6 p-0 valign">
              <div className="content barber-pricing">
                <div className="menu-list mb-30">
                  <div className="item">
                    <div className="flex">
                      <div className="title">
                        Cắt tóc cơ bản
                      </div>

                      <div className="dots" />

                      <div className="price">
                        100.000đ
                      </div>
                    </div>

                    <p>
                      <i>
                        Tư vấn kiểu tóc, cắt tạo kiểu và
                        hoàn thiện bằng sáp vuốt tóc.
                      </i>
                    </p>
                  </div>
                </div>

                <div className="menu-list mb-30">
                  <div className="item">
                    <div className="flex">
                      <div className="title">
                        Cắt Fade chuyên nghiệp
                      </div>

                      <div className="dots" />

                      <div className="price">
                        130.000đ
                      </div>
                    </div>

                    <p>
                      <i>
                        Kỹ thuật Fade với đường chuyển sắc
                        mượt, phù hợp phong cách hiện đại.
                      </i>
                    </p>
                  </div>
                </div>

                <div className="menu-list mb-30">
                  <div className="item">
                    <div className="flex">
                      <div className="title">
                        Combo cắt tóc cao cấp
                      </div>

                      <div className="dots" />

                      <div className="price">
                        180.000đ
                      </div>
                    </div>

                    <p>
                      <i>
                        Cắt tóc, gội đầu, massage da đầu,
                        cạo mặt và tạo kiểu hoàn thiện.
                      </i>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Râu */}
          <div className="row">
            <div className="col-md-6 p-0 order2 valign">
              <div className="content barber-pricing">
                <div className="menu-list mb-30">
                  <div className="item">
                    <div className="flex">
                      <div className="title">
                        Tỉa râu cơ bản
                      </div>

                      <div className="dots" />

                      <div className="price">
                        50.000đ
                      </div>
                    </div>

                    <p>
                      <i>
                        Tỉa gọn bằng tông đơ và chỉnh độ dài
                        phù hợp với khuôn mặt.
                      </i>
                    </p>
                  </div>
                </div>

                <div className="menu-list mb-30">
                  <div className="item">
                    <div className="flex">
                      <div className="title">
                        Tạo kiểu và viền râu
                      </div>

                      <div className="dots" />

                      <div className="price">
                        80.000đ
                      </div>
                    </div>

                    <p>
                      <i>
                        Tạo hình bộ râu, chỉnh đường viền và
                        làm gọn vùng cổ, má.
                      </i>
                    </p>
                  </div>
                </div>

                <div className="menu-list mb-30">
                  <div className="item">
                    <div className="flex">
                      <div className="title">
                        Combo chăm sóc râu
                      </div>

                      <div className="dots" />

                      <div className="price">
                        120.000đ
                      </div>
                    </div>

                    <p>
                      <i>
                        Tỉa, tạo kiểu, khăn nóng và dưỡng râu
                        bằng sản phẩm chuyên dụng.
                      </i>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 p-0 order1 item">
              <div className="img left">
                <img
                  src="/img/slider/4.jpg"
                  alt="Dịch vụ chăm sóc râu"
                />

                <div className="centered">
                  <h2>Chăm sóc râu</h2>
                </div>
              </div>
            </div>
          </div>

          {/* Chăm sóc */}
          <div className="row">
            <div className="col-md-6 p-0 item">
              <div className="img left">
                <img
                  src="/img/slider/5.jpg"
                  alt="Dịch vụ chăm sóc và thư giãn"
                />

                <div className="centered">
                  <h2>Chăm sóc</h2>
                </div>
              </div>
            </div>

            <div className="col-md-6 p-0 valign">
              <div className="content barber-pricing">
                <div className="menu-list mb-30">
                  <div className="item">
                    <div className="flex">
                      <div className="title">
                        Cạo mặt khăn nóng
                      </div>

                      <div className="dots" />

                      <div className="price">
                        70.000đ
                      </div>
                    </div>

                    <p>
                      <i>
                        Cạo mặt kết hợp khăn nóng, làm sạch và
                        thư giãn làn da.
                      </i>
                    </p>
                  </div>
                </div>

                <div className="menu-list mb-30">
                  <div className="item">
                    <div className="flex">
                      <div className="title">
                        Gội đầu và massage
                      </div>

                      <div className="dots" />

                      <div className="price">
                        60.000đ
                      </div>
                    </div>

                    <p>
                      <i>
                        Gội sạch tóc và da đầu kết hợp massage
                        thư giãn vùng đầu, cổ và vai.
                      </i>
                    </p>
                  </div>
                </div>

                <div className="menu-list mb-30">
                  <div className="item">
                    <div className="flex">
                      <div className="title">
                        Chăm sóc da mặt cơ bản
                      </div>

                      <div className="dots" />

                      <div className="price">
                        150.000đ
                      </div>
                    </div>

                    <p>
                      <i>
                        Làm sạch, tẩy tế bào chết, đắp mặt nạ
                        và massage thư giãn.
                      </i>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Uốn nhuộm */}
          <div className="row">
            <div className="col-md-6 p-0 order2 valign">
              <div className="content barber-pricing">
                <div className="menu-list mb-30">
                  <div className="item">
                    <div className="flex">
                      <div className="title">
                        Nhuộm tóc nam
                      </div>

                      <div className="dots" />

                      <div className="price">
                        Từ 350.000đ
                      </div>
                    </div>

                    <p>
                      <i>
                        Giá thay đổi theo màu nhuộm, độ dài và
                        tình trạng tóc của khách hàng.
                      </i>
                    </p>
                  </div>
                </div>

                <div className="menu-list mb-30">
                  <div className="item">
                    <div className="flex">
                      <div className="title">
                        Uốn tạo kiểu
                      </div>

                      <div className="dots" />

                      <div className="price">
                        Từ 400.000đ
                      </div>
                    </div>

                    <p>
                      <i>
                        Uốn phồng, uốn texture hoặc tạo kiểu
                        theo tư vấn của Barber.
                      </i>
                    </p>
                  </div>
                </div>

                <div className="menu-list mb-30">
                  <div className="item">
                    <div className="flex">
                      <div className="title">
                        Tẩy và nhuộm thời trang
                      </div>

                      <div className="dots" />

                      <div className="price">
                        Từ 650.000đ
                      </div>
                    </div>

                    <p>
                      <i>
                        Mức giá phụ thuộc số lần tẩy, màu mong
                        muốn và tình trạng tóc thực tế.
                      </i>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 p-0 order1 item">
              <div className="img left">
                <img
                  src="/img/slider/18.jpg"
                  alt="Dịch vụ uốn và nhuộm tóc"
                />

                <div className="centered">
                  <h2>Uốn và nhuộm</h2>
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
                  Trải nghiệm dịch vụ chuyên nghiệp tại
                  THADS Barber với mức giá minh bạch.
                </h5>

                <div className="reservations mb-10">
                  <div className="icon color-1">
                    <span className="icon-icon-1-1" />
                  </div>

                  <div className="text">
                    <p className="color-1">
                      Liên hệ đặt lịch
                    </p>

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
                        handleBooking();
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

                                <option value="09:00">
                                  09:00
                                </option>

                                <option value="10:00">
                                  10:00
                                </option>

                                <option value="11:00">
                                  11:00
                                </option>

                                <option value="13:00">
                                  13:00
                                </option>

                                <option value="15:00">
                                  15:00
                                </option>

                                <option value="17:00">
                                  17:00
                                </option>

                                <option value="19:00">
                                  19:00
                                </option>
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
                                  Cắt tóc cơ bản
                                </option>

                                <option value="fade">
                                  Cắt Fade chuyên nghiệp
                                </option>

                                <option value="combo">
                                  Combo cắt tóc cao cấp
                                </option>

                                <option value="beard">
                                  Tỉa và chăm sóc râu
                                </option>

                                <option value="wash">
                                  Gội đầu và massage
                                </option>

                                <option value="dye">
                                  Nhuộm tóc
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

      {/* Partners */}
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
                    Nhận thông tin ưu đãi
                  </h3>

                  <div className="row subscribe">
                    <div className="col-md-12">
                      <p>
                        Đăng ký email để nhận thông tin về
                        dịch vụ và chương trình mới nhất.
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
                    © {new Date().getFullYear()} THADS Barber.
                    Bảo lưu mọi quyền.
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

export default Pricing;

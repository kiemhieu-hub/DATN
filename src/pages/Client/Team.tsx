import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";

interface BarberItem {
  id: number;
  name: string;
  role: string;
  image: string;
  description: string;
}

const barbers: BarberItem[] = [
  {
    id: 1,
    name: "Nguyễn Minh",
    role: "Barber cao cấp",
    image: "/img/team/b1.jpg",
    description:
      "Chuyên cắt Fade, Undercut và tư vấn kiểu tóc phù hợp với khuôn mặt, công việc và phong cách cá nhân.",
  },
  {
    id: 2,
    name: "Đức Anh",
    role: "Chuyên gia tạo kiểu",
    image: "/img/team/b2.jpg",
    description:
      "Có kinh nghiệm trong tạo kiểu, uốn tóc nam và chăm sóc tóc, luôn cập nhật những xu hướng mới nhất.",
  },
  {
    id: 3,
    name: "Thành Nam",
    role: "Barber",
    image: "/img/team/b3.jpg",
    description:
      "Chuyên tóc Layer, tóc ngắn hiện đại và các kiểu tóc trẻ trung dành cho học sinh, sinh viên.",
  },
  {
    id: 4,
    name: "Hoàng Sơn",
    role: "Barber",
    image: "/img/team/b4.jpg",
    description:
      "Tận tâm trong từng đường kéo, chuyên cạo mặt, tạo kiểu râu và chăm sóc diện mạo nam giới.",
  },
  {
    id: 5,
    name: "Quang Huy",
    role: "Barber cao cấp",
    image: "/img/team/b1.jpg",
    description:
      "Chuyên các kiểu tóc lịch lãm, cổ điển và hiện đại, phù hợp với khách hàng văn phòng.",
  },
  {
    id: 6,
    name: "Tuấn Kiệt",
    role: "Chuyên gia màu tóc",
    image: "/img/team/b2.jpg",
    description:
      "Chuyên tư vấn màu nhuộm, uốn tạo kiểu và phục hồi tóc nam sau quá trình sử dụng hóa chất.",
  },
];

function Team() {
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
                <Link className="nav-link" to="/services">
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
                  className="nav-link active dropdown-toggle navbar-dropdown-button"
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
                      className="dropdown-item active"
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
          <div className="row">
            {barbers.map((barber, index) => (
              <div
                className="col-md-4 animate-box"
                data-animate-effect="fadeInUp"
                key={barber.id}
              >
                <div
                  className={`team-page-card ${
                    index < 3 ? "mb-60" : ""
                  }`}
                >
                  <div className="team-img">
                    <img
                      src={barber.image}
                      alt={barber.name}
                      className="w-100"
                    />
                  </div>

                  <div className="team-content">
                    <h3 className="team-title">
                      {barber.name}
                      <span>{barber.role}</span>
                    </h3>

                    <p className="team-text">
                      {barber.description}
                    </p>

                    <div className="social">
                      <div className="full-width">
                        <a
                          href="#facebook"
                          aria-label={`Facebook ${barber.name}`}
                        >
                          <i className="ti-facebook" />
                        </a>

                        <a
                          href="#instagram"
                          aria-label={`Instagram ${barber.name}`}
                        >
                          <i className="ti-instagram" />
                        </a>

                        <a
                          href="#youtube"
                          aria-label={`YouTube ${barber.name}`}
                        >
                          <i className="ti-youtube" />
                        </a>
                      </div>
                    </div>

                    <Link
                      to="/team-details"
                      className="button-1 mt-15"
                    >
                      Xem thông tin
                      <span />
                    </Link>
                  </div>

                  <div className="title-box">
                    <h3 className="mb-0">
                      {barber.name}
                      <span>{barber.role}</span>
                    </h3>
                  </div>
                </div>
              </div>
            ))}
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
                  Lựa chọn Barber phù hợp và đặt lịch nhanh
                  chóng tại THADS Barber.
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

                                {barbers.map((barber) => (
                                  <option
                                    key={barber.id}
                                    value={barber.id}
                                  >
                                    {barber.name}
                                  </option>
                                ))}
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
                        Barber, dịch vụ và chương trình ưu đãi
                        mới nhất.
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

export default Team;

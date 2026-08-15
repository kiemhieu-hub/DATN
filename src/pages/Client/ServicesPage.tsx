import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";

interface ServiceItem {
  id: number;
  name: string;
  price: string;
  icon: string;
  description: string;
}

const serviceItems: ServiceItem[] = [
  {
    id: 1,
    name: "Cắt tóc cơ bản",
    price: "100.000đ",
    icon: "icon-icon-1-2",
    description:
      "Tư vấn kiểu tóc, cắt tạo kiểu và hoàn thiện bằng sản phẩm tạo kiểu phù hợp.",
  },
  {
    id: 2,
    name: "Cắt tóc và gội đầu",
    price: "140.000đ",
    icon: "icon-icon-1-4",
    description:
      "Cắt tóc kết hợp gội sạch, massage da đầu và tạo kiểu hoàn thiện.",
  },
  {
    id: 3,
    name: "Cắt Fade chuyên nghiệp",
    price: "130.000đ",
    icon: "icon-icon-1-6",
    description:
      "Kỹ thuật Fade với đường chuyển sắc mượt, phù hợp phong cách hiện đại.",
  },
  {
    id: 4,
    name: "Cắt tóc trẻ em",
    price: "80.000đ",
    icon: "icon-icon-1-2",
    description:
      "Dịch vụ cắt tóc dành cho trẻ nhỏ trong không gian thân thiện và thoải mái.",
  },
  {
    id: 5,
    name: "Gội đầu và tạo kiểu",
    price: "70.000đ",
    icon: "icon-icon-1-18",
    description:
      "Gội sạch tóc, massage nhẹ và sấy tạo kiểu theo nhu cầu của khách hàng.",
  },
];

const otherServices = [
  {
    id: 1,
    name: "Tỉa ria mép",
    icon: "icon-icon-1-1",
    description:
      "Tỉa gọn và tạo đường nét ria mép cân đối với khuôn mặt.",
  },
  {
    id: 2,
    name: "Cạo mặt khăn nóng",
    icon: "icon-icon-1-9",
    description:
      "Cạo mặt kết hợp khăn nóng giúp thư giãn và làm sạch làn da.",
  },
  {
    id: 3,
    name: "Tỉa và tạo kiểu râu",
    icon: "icon-icon-1-3",
    description:
      "Tạo hình bộ râu phù hợp với khuôn mặt và phong cách cá nhân.",
  },
  {
    id: 4,
    name: "Cắt tóc nam",
    icon: "icon-icon-1-2",
    description:
      "Cắt tóc và tạo kiểu phù hợp với công việc, khuôn mặt và sở thích.",
  },
  {
    id: 5,
    name: "Cắt Fade",
    icon: "icon-icon-1-6",
    description:
      "Tạo đường chuyển sắc mượt mà, sắc nét và hiện đại.",
  },
  {
    id: 6,
    name: "Chăm sóc da và massage",
    icon: "icon-icon-1-8",
    description:
      "Làm sạch da mặt kết hợp massage giúp thư giãn và giảm căng thẳng.",
  },
  {
    id: 7,
    name: "Gội đầu thư giãn",
    icon: "icon-icon-1-4",
    description:
      "Làm sạch tóc, da đầu và massage vùng đầu, cổ, vai.",
  },
  {
    id: 8,
    name: "Sấy và tạo kiểu",
    icon: "icon-icon-1-18",
    description:
      "Sấy phồng và tạo kiểu tóc theo phong cách khách hàng lựa chọn.",
  },
  {
    id: 9,
    name: "Nhuộm tóc",
    icon: "icon-icon-1-10",
    description:
      "Tư vấn màu tóc phù hợp và thực hiện bằng sản phẩm chất lượng.",
  },
];

function ServicesPage() {
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
                      className="dropdown-item active"
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
                    <i className="ti-user" /> {user.fullName}{" "}
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
        data-background="img/slider/2.jpg"
      >
        <div className="container">
          <div className="row">
            <div className="col-md-12 text-center caption mt-60">
              <h5>Dịch vụ tại THADS Barber</h5>
              <h1>Cắt tóc nam chuyên nghiệp</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Service details */}
      <section className="barber-pricing section-padding">
        <div className="container">
          <div className="row">
            <div className="col-md-7 mb-30">
              <div className="section-head mb-15">
                <div className="section-subtitle">
                  Dịch vụ nổi bật
                </div>

                <div className="section-title">
                  Cắt tóc nam
                </div>
              </div>

              <p>
                Dịch vụ cắt tóc nam tại THADS Barber được thực
                hiện bởi đội ngũ Barber chuyên nghiệp. Khách
                hàng sẽ được tư vấn kiểu tóc phù hợp với khuôn
                mặt, chất tóc, công việc và phong cách cá nhân.
              </p>

              <p className="mb-45">
                Quy trình dịch vụ chú trọng từ khâu tư vấn,
                tạo form tóc, hoàn thiện đường viền cho đến
                sấy và tạo kiểu. THADS Barber luôn hướng đến
                trải nghiệm thoải mái, chỉn chu và tiết kiệm
                thời gian cho khách hàng.
              </p>

              {/* Pricing List */}
              {serviceItems.map((service, index) => (
                <div
                  className={`menu-list ${
                    index === serviceItems.length - 1
                      ? "mb-45"
                      : "mb-10"
                  }`}
                  key={service.id}
                >
                  <div className="item">
                    <div className="flex">
                      <div className="title">
                        {service.name}
                      </div>

                      <div className="dots" />

                      <div className="price">
                        {service.price}
                      </div>
                    </div>

                    <p>
                      <i>{service.description}</i>
                    </p>
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="button-1 mb-45"
                onClick={handleBooking}
              >
                Đặt lịch dịch vụ
                <span />
              </button>

              {/* Image Gallery */}
              <div className="row">
                {[1, 2, 3, 4, 5, 6].map((number) => (
                  <div
                    className="col-md-4 gallery-item"
                    key={number}
                  >
                    <a
                      href={`/img/slider/${number}.jpg`}
                      title={`Dịch vụ THADS Barber ${number}`}
                      className="img-zoom"
                    >
                      <div className="gallery-box">
                        <div className="gallery-img">
                          <img
                            src={`/img/slider/${number}.jpg`}
                            className="img-fluid mx-auto d-block"
                            alt={`Dịch vụ cắt tóc THADS Barber ${number}`}
                          />
                        </div>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-md-4 offset-md-1 sidebar-side">
              <aside className="sidebar blog-sidebar mb-60">
                <div className="sidebar-widget services">
                  <div className="widget-inner">
                    <div className="sidebar-title">
                      <h4>Tất cả dịch vụ</h4>
                    </div>

                    <ul>
                      <li className="active">
                        <Link to="/services-page">
                          Cắt tóc nam
                        </Link>
                      </li>

                      <li>
                        <Link to="/services-page">
                          Tỉa ria mép
                        </Link>
                      </li>

                      <li>
                        <Link to="/services-page">
                          Cạo mặt khăn nóng
                        </Link>
                      </li>

                      <li>
                        <Link to="/services-page">
                          Tỉa và tạo kiểu râu
                        </Link>
                      </li>

                      <li>
                        <Link to="/services-page">
                          Cắt Fade
                        </Link>
                      </li>

                      <li>
                        <Link to="/services-page">
                          Chăm sóc da và massage
                        </Link>
                      </li>

                      <li>
                        <Link to="/services-page">
                          Gội đầu thư giãn
                        </Link>
                      </li>

                      <li>
                        <Link to="/services-page">
                          Sấy và tạo kiểu
                        </Link>
                      </li>

                      <li>
                        <Link to="/services-page">
                          Uốn và nhuộm tóc
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>

                <div
                  className="sidebar-widget"
                  style={{ marginTop: "30px" }}
                >
                  <div className="widget-inner">
                    <div className="sidebar-title">
                      <h4>Thông tin dịch vụ</h4>
                    </div>

                    <ul>
                      <li>
                        <strong>Thời gian:</strong> 30 - 60 phút
                      </li>

                      <li>
                        <strong>Giá từ:</strong> 100.000đ
                      </li>

                      <li>
                        <strong>Phù hợp:</strong> Nam giới và
                        trẻ em
                      </li>

                      <li>
                        <strong>Đặt lịch:</strong> Trực tuyến
                        hoặc tại salon
                      </li>
                    </ul>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      {/* Other Services */}
      <section className="services-1 section-padding pt-0">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="section-head">
                <div className="section-subtitle">
                  THADS Barber
                </div>

                <div className="section-title">
                  Các dịch vụ khác
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            {otherServices.map((service) => (
              <div className="col-md-4" key={service.id}>
                <div className="item mb-30">
                  <Link to="/services-page">
                    <span
                      className={`icon ${service.icon}`}
                    />

                    <h5>{service.name}</h5>

                    <p>{service.description}</p>

                    <div className="shape">
                      <span
                        className={`icon ${service.icon}`}
                      />
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="row">
            <div className="col-md-12 text-center mt-20">
              <Link
                to="/pricing"
                className="button-1"
              >
                Xem toàn bộ bảng giá
                <span />
              </Link>
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
                    <a
                      href="#instagram"
                      aria-label="Instagram THADS Barber"
                    >
                      <i className="ti-instagram" />
                    </a>

                    <a
                      href="#youtube"
                      aria-label="YouTube THADS Barber"
                    >
                      <i className="ti-youtube" />
                    </a>

                    <a
                      href="#facebook"
                      aria-label="Facebook THADS Barber"
                    >
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
                        dịch vụ, bảng giá và chương trình mới
                        nhất.
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

export default ServicesPage;
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";

interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

const faqItems: FaqItem[] = [
  {
    id: 1,
    question: "THADS Barber có cắt tóc cho trẻ em không?",
    answer:
      "Có. THADS Barber nhận cắt tóc cho trẻ em. Đội ngũ Barber luôn cố gắng tạo không gian thoải mái, thân thiện để trẻ không cảm thấy lo lắng trong quá trình cắt tóc.",
  },
  {
    id: 2,
    question: "THADS Barber hỗ trợ những hình thức thanh toán nào?",
    answer:
      "Khách hàng có thể thanh toán bằng tiền mặt, chuyển khoản ngân hàng hoặc các phương thức thanh toán trực tuyến được THADS Barber hỗ trợ tại thời điểm sử dụng dịch vụ.",
  },
  {
    id: 3,
    question: "Làm thế nào để đặt lịch cắt tóc?",
    answer:
      "Bạn có thể đăng nhập vào website, chọn dịch vụ, Barber, ngày và khung giờ mong muốn. Sau khi kiểm tra thông tin, hệ thống sẽ ghi nhận lịch hẹn của bạn.",
  },
  {
    id: 4,
    question: "Tôi có thể hủy lịch hẹn không?",
    answer:
      "Có. Bạn có thể vào mục Lịch sử đặt lịch để hủy lịch hẹn khi lịch chưa chuyển sang trạng thái đang thực hiện hoặc đã hoàn thành.",
  },
  {
    id: 5,
    question: "THADS Barber có phục vụ khách hàng nữ không?",
    answer:
      "THADS Barber tập trung chính vào các dịch vụ tóc nam. Tuy nhiên, salon vẫn có thể tư vấn và phục vụ một số kiểu tóc ngắn phù hợp cho khách hàng nữ.",
  },
  {
    id: 6,
    question: "Barber có tư vấn kiểu tóc phù hợp không?",
    answer:
      "Có. Trước khi thực hiện dịch vụ, Barber sẽ tư vấn kiểu tóc dựa trên khuôn mặt, chất tóc, công việc và phong cách cá nhân của khách hàng.",
  },
  {
    id: 7,
    question: "THADS Barber có chương trình giảm giá không?",
    answer:
      "THADS Barber có thể triển khai voucher, ưu đãi theo dịp đặc biệt hoặc chương trình dành cho khách hàng thân thiết. Thông tin sẽ được cập nhật trên website.",
  },
  {
    id: 8,
    question: "Tôi có thể chọn Barber khi đặt lịch không?",
    answer:
      "Có. Trong quá trình đặt lịch, bạn có thể lựa chọn Barber đang có lịch làm việc phù hợp với ngày và khung giờ mong muốn.",
  },
];

function Faq() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const [openFaqId, setOpenFaqId] = useState<number | null>(1);

  const handleLogout = (): void => {
    logout();
    navigate("/", { replace: true });
  };

  const toggleFaq = (faqId: number): void => {
    setOpenFaqId((currentId) =>
      currentId === faqId ? null : faqId
    );
  };

  const firstColumnFaqs = faqItems.slice(0, 4);
  const secondColumnFaqs = faqItems.slice(4);

  const renderFaqItem = (faq: FaqItem) => {
    const isOpen = openFaqId === faq.id;

    return (
      <li
        className={`accordion block ${
          isOpen ? "active-block" : ""
        }`}
        key={faq.id}
      >
        <button
          type="button"
          className={`acc-btn size-20 ${
            isOpen ? "active" : ""
          }`}
          onClick={() => toggleFaq(faq.id)}
          aria-expanded={isOpen}
          aria-controls={`faq-answer-${faq.id}`}
          style={{
            width: "100%",
            border: 0,
            textAlign: "left",
            cursor: "pointer",
          }}
        >
          {faq.question}

          <span
            style={{
              float: "right",
              fontSize: "22px",
              lineHeight: 1,
            }}
          >
            {isOpen ? "−" : "+"}
          </span>
        </button>

        {isOpen && (
          <div
            id={`faq-answer-${faq.id}`}
            className="acc-content current"
            style={{
              display: "block",
            }}
          >
            <div className="content">
              <div className="text">{faq.answer}</div>
            </div>
          </div>
        )}
      </li>
    );
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
                <Link className="nav-link" to="/about.html">
                  Giới thiệu
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/services.html">
                  Dịch vụ
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/pricing.html">
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
                      to="/portfolio.html"
                    >
                      <span>Thư viện kiểu tóc</span>
                    </Link>
                  </li>

                  <li>
                    <Link
                      className="dropdown-item"
                      to="/team.html"
                    >
                      <span>Đội ngũ Barber</span>
                    </Link>
                  </li>

                  <li>
                    <Link
                      className="dropdown-item active"
                      to="/faq.html"
                    >
                      <span>Câu hỏi thường gặp</span>
                    </Link>
                  </li>

                  <li>
                    <Link
                      className="dropdown-item"
                      to="/services-page.html"
                    >
                      <span>Chi tiết dịch vụ</span>
                    </Link>
                  </li>

                  <li>
                    <Link
                      className="dropdown-item"
                      to="/team-details.html"
                    >
                      <span>Thông tin Barber</span>
                    </Link>
                  </li>

                  <li>
                    <Link
                      className="dropdown-item"
                      to="/blog.html"
                    >
                      <span>Tin tức và bài viết</span>
                    </Link>
                  </li>
                </ul>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/contact.html">
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
        data-background="img/slider/11.jpg"
      >
        <div className="container">
          <div className="row">
            <div className="col-md-12 text-center caption mt-60">
              <h5>THADS Barber giải đáp</h5>
              <h1>Câu hỏi thường gặp</h1>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <section className="section-padding">
        <div className="container">
          <div className="row mb-30">
            <div className="col-md-12">
              <div className="section-head text-center">
                <div className="section-subtitle">
                  Hỗ trợ khách hàng
                </div>

                <div className="section-title">
                  Những điều bạn cần biết
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <ul className="accordion-box clearfix">
                {firstColumnFaqs.map(renderFaqItem)}
              </ul>
            </div>

            <div className="col-md-6">
              <ul className="accordion-box clearfix">
                {secondColumnFaqs.map(renderFaqItem)}
              </ul>
            </div>
          </div>

          <div className="row mt-40">
            <div className="col-md-12 text-center">
              <p>
                Bạn vẫn chưa tìm thấy câu trả lời phù hợp?
              </p>

              <Link
                to="/contact"
                className="button-1 mt-15"
              >
                Liên hệ THADS Barber
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
                        dịch vụ, khuyến mãi và chương trình
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

export default Faq;
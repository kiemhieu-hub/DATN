import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import {
  getMyFavorites,
  removeFavorite,
  type FavoriteHairstyle,
} from "../../services/favoriteService";
import "./css/Favorites.css";

function Favorites() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteHairstyle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    void getMyFavorites()
      .then(setFavorites)
      .catch(() => setError("Không thể tải danh sách kiểu tóc yêu thích"))
      .finally(() => setLoading(false));
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const handleRemove = async (favoriteId: string) => {
    try {
      setError("");
      await removeFavorite(favoriteId);
      setFavorites((current) =>
        current.filter((favorite) => favorite._id !== favoriteId)
      );
    } catch {
      setError("Không thể bỏ kiểu tóc khỏi danh sách yêu thích");
    }
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
              <img src="/img/logo.png" className="logo-img" alt="THADS Barber" />
            </Link>
          </div>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbar"
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
                  className="nav-link dropdown-toggle navbar-dropdown-button"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  Khám phá <i className="ti-angle-down" />
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <Link className="dropdown-item" to="/portfolio">
                      <span>Thư viện kiểu tóc</span>
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/team">
                      <span>Đội ngũ Barber</span>
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/faq">
                      <span>Câu hỏi thường gặp</span>
                    </Link>
                  </li>
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
                  >
                    <i className="ti-user" /> {user.fullName} <i className="ti-angle-down" />
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        <span>Hồ sơ cá nhân</span>
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item active" to="/favorites">
                        <span>Kiểu tóc yêu thích</span>
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/booking-history">
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
                    <Link className="nav-link" to="/login">Đăng nhập</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/register">Đăng ký</Link>
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
        data-overlay-dark={6}
        data-background="img/slider/9.jpg"
      >
        <div className="container">
          <div className="row">
            <div className="col-md-12 text-center caption mt-60">
              <h5>Thư viện của bạn</h5>
              <h1>Kiểu tóc yêu thích</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Favorites Content */}
      <section className="section-padding">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="section-head text-center">
                <div className="section-subtitle">
                  {favorites.length} kiểu tóc đã lưu
                </div>
                <div className="section-title">
                  Danh sách yêu thích
                </div>
              </div>
            </div>
          </div>

          {error && <div className="favorites-alert">{error}</div>}

          {loading ? (
            <div className="text-center py-5">
              <div className="loading-spinner" />
            </div>
          ) : favorites.length === 0 ? (
            <div className="favorites-empty text-center">
              <i className="ti-heart" style={{ fontSize: "64px", color: "#ccc" }} />
              <h3>Chưa có kiểu tóc yêu thích</h3>
              <p>Hãy khám phá thư viện và lưu lại những kiểu tóc bạn thích nhé!</p>
              <Link to="/portfolio" className="button-1 mt-3">
                Khám phá thư viện
                <span />
              </Link>
            </div>
          ) : (
            <div className="row">
              {favorites.map((item) => (
                <div className="col-md-4 gallery-item" key={item._id}>
                  <div className="gallery-box">
                    <a
                      href={item.imageUrl}
                      title={item.title}
                      className="img-zoom"
                    >
                      <div className="gallery-img">
                        <img
                          src={item.imageUrl}
                          className="img-fluid mx-auto d-block"
                          alt={item.title}
                        />
                      </div>
                    </a>
                    <button
                      className="favorite-btn active"
                      type="button"
                      onClick={() => void handleRemove(item._id)}
                      aria-label="Bỏ yêu thích"
                    >
                      <i className="ti-heart" />
                    </button>
                    <div className="favorite-title">{item.title}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="row mt-5">
            <div className="col-md-12 text-center">
              <Link to="/booking" className="button-1">
                Đặt lịch ngay
                <span />
              </Link>
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

export default Favorites;
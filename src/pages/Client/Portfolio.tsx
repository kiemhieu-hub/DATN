import { fetchBusinessQuery } from "../../lib/queryApi";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRealtimeRefresh } from "../../hooks/useRealtimeRefresh";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  addFavorite,
  getMyFavorites,
  removeFavorite,
  type FavoriteHairstyle,
} from "../../services/favoriteService";
import { getPublicHairstyles } from "../../services/hairstyleGallery.service";
import type { HairstyleGalleryItem } from "../../types/HairstyleGallery";
import "./css/Portfolio.css";

function Portfolio() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [hairstyles, setHairstyles] = useState<HairstyleGalleryItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [galleryCategory, setGalleryCategory] = useState("ALL");
  const [favoritesByImage, setFavoritesByImage] = useState<
    Map<string, FavoriteHairstyle>
  >(new Map());
  const [favoriteLoadingImages, setFavoriteLoadingImages] = useState<
    Set<string>
  >(new Set());
  const [favoriteMessage, setFavoriteMessage] = useState("");

  const loadGallery = useCallback(() => {
    fetchBusinessQuery("public-hairstyles", () => getPublicHairstyles())
      .then((response) => setHairstyles(response.items))
      .catch(() => setHairstyles([]))
      .finally(() => setGalleryLoading(false));
  }, []);

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  const loadFavorites = useCallback(() => {
    if (!isAuthenticated) {
      setFavoritesByImage(new Map());
      return;
    }

    void fetchBusinessQuery("my-favorites", () => getMyFavorites())
      .then((items) => {
        setFavoritesByImage(
          new Map(items.map((favorite) => [favorite.imageUrl, favorite]))
        );
      })
      .catch(() => setFavoriteMessage("Không thể tải danh sách yêu thích"));
  }, [isAuthenticated]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  useRealtimeRefresh(() => {
    loadGallery();
    loadFavorites();
  });

  const galleryCategories = useMemo(
    () => [...new Set(hairstyles.map((item) => item.category).filter(Boolean))],
    [hairstyles]
  );
  const visibleHairstyles = galleryCategory === "ALL"
    ? hairstyles
    : hairstyles.filter((item) => item.category === galleryCategory);

  const handleLogout = (): void => {
    logout();
    navigate("/", { replace: true });
  };

  const toggleFavorite = async (
    item: HairstyleGalleryItem
  ): Promise<void> => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: { from: "/portfolio" },
      });
      return;
    }

    if (favoriteLoadingImages.has(item.image)) {
      return;
    }

    setFavoriteMessage("");
    setFavoriteLoadingImages((current) => {
      const next = new Set(current);
      next.add(item.image);
      return next;
    });

    try {
      const existing = favoritesByImage.get(item.image);

      if (existing) {
        await removeFavorite(existing._id);
        setFavoritesByImage((current) => {
          const next = new Map(current);
          next.delete(item.image);
          return next;
        });
      } else {
        const favorite = await addFavorite({
          imageUrl: item.image,
          title: item.title,
          category: item.category,
        });

        setFavoritesByImage((current) => {
          const next = new Map(current);
          next.set(item.image, favorite);
          return next;
        });
      }
    } catch {
      setFavoriteMessage("Không thể cập nhật kiểu tóc yêu thích");
    } finally {
      setFavoriteLoadingImages((current) => {
        const next = new Set(current);
        next.delete(item.image);
        return next;
      });
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
                      className="dropdown-item active"
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
                        to="/favorites"
                      >
                        <span>Kiểu tóc yêu thích</span>
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
        data-overlay-dark={6}
        data-background="img/slider/9.jpg"
      >
        <div className="container">
          <div className="row">
            <div className="col-md-12 text-center caption mt-60">
              <h5>Hình ảnh và video</h5>
              <h1>Thư viện THADS Barber</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <section className="section-padding">
        <div className="container">
          {favoriteMessage && (
            <div className="portfolio-favorite-alert">
              {favoriteMessage}
            </div>
          )}

          <div className="portfolio-gallery-filter">
            <button
              type="button"
              className={galleryCategory === "ALL" ? "active" : ""}
              onClick={() => setGalleryCategory("ALL")}
            >
              Tất cả
            </button>

            {galleryCategories.map((category) => (
              <button
                type="button"
                key={category}
                className={galleryCategory === category ? "active" : ""}
                onClick={() => setGalleryCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="row">
            {galleryLoading ? (
              <p className="portfolio-gallery-empty">Đang tải thư viện...</p>
            ) : visibleHairstyles.length === 0 ? (
              <p className="portfolio-gallery-empty">
                Chưa có hình ảnh trong thư viện.
              </p>
            ) : (
              visibleHairstyles.map((item) => (
                <div
                  className={item.isFeatured ? "col-md-6" : "col-md-4"}
                  key={item._id}
                >
                  <article className="portfolio-dynamic-card">
                    <a href={item.image} className="img-zoom" title={item.title}>
                      <img src={item.image} alt={item.title} />
                    </a>

                    <button
                      type="button"
                      className={`portfolio-favorite-button ${
                        favoritesByImage.has(item.image) ? "active" : ""
                      }`}
                      disabled={favoriteLoadingImages.has(item.image)}
                      aria-label={
                        favoritesByImage.has(item.image)
                          ? "Bỏ khỏi kiểu tóc yêu thích"
                          : "Thêm vào kiểu tóc yêu thích"
                      }
                      title={
                        favoritesByImage.has(item.image)
                          ? "Bỏ yêu thích"
                          : "Thêm vào yêu thích"
                      }
                      onClick={() => void toggleFavorite(item)}
                    >
                      <span aria-hidden="true">♥</span>
                    </button>

                    <div className="portfolio-dynamic-info">
                      <span>{item.category || "THADS STYLE"}</span>
                      <h3>{item.title}</h3>
                      {item.description && <p>{item.description}</p>}
                    </div>
                  </article>
                </div>
              ))
            )}
          </div>

          <div className="row" style={{ display: "none" }} aria-hidden="true">
            <div className="col-md-12">
              <div className="section-head text-center">
                <div className="section-subtitle">
                  Khoảnh khắc nổi bật
                </div>

                <div className="section-title">
                  Thư viện hình ảnh
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Video Gallery */}
      <section className="section-padding">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="section-head text-center">
                <div className="section-subtitle">
                  Trải nghiệm thực tế
                </div>

                <div className="section-title">
                  Thư viện video
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            {[
              {
                image: "/img/slider/8.jpg",
                title: "Quy trình cắt tóc tại THADS Barber",
              },
              {
                image: "/img/slider/9.jpg",
                title: "Không gian THADS Barber",
              },
              {
                image: "/img/slider/11.jpg",
                title: "Kỹ thuật Fade chuyên nghiệp",
              },
              {
                image: "/img/slider/13.jpg",
                title: "Tạo kiểu tóc nam hiện đại",
              },
              {
                image: "/img/slider/16.jpg",
                title: "Trải nghiệm của khách hàng",
              },
            ].map((video, index) => (
              <div
                className={index < 2 ? "col-md-6" : "col-md-4"}
                key={video.image}
              >
                <div className="vid-area mb-30">
                  <div className="vid-icon">
                    <img
                      src={video.image}
                      alt={video.title}
                    />

                    <a
                      className="video-gallery-button vid"
                      href="https://youtu.be/e2x0UXVU2yg"
                      target="_blank"
                      rel="noreferrer"
                      aria-label={video.title}
                    >
                      <span className="video-gallery-polygon">
                        <i className="ti-control-play" />
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="row">
            <div className="col-md-12 text-center mt-20">
              <Link
                to="/booking"
                className="button-1"
              >
                Đặt lịch trải nghiệm
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
                        kiểu tóc, dịch vụ và chương trình ưu
                        đãi mới nhất.
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

export default Portfolio;

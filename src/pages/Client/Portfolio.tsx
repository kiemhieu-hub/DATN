import {
  useMemo,
  useState,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  useNavigate,
} from "react-router-dom";

import ClientHeader from "../../components/ClientHeader";

import {
  useAuth,
} from "../../contexts/AuthContext";

import {
  addFavorite,
  getMyFavorites,
  removeFavorite,
} from "../../services/favoriteService";

import {
  getPublicHairstyles,
  type PublicHairstylesResponse,
} from "../../services/hairstyleGallery.service";

import type {
  HairstyleGalleryItem,
} from "../../types/HairstyleGallery";

import "./css/Portfolio.css";

function Portfolio() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    isAuthenticated,
  } = useAuth("CLIENT");

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("ALL");

  /*
   * Lấy danh sách kiểu tóc.
   */
  const galleryQuery =
    useQuery<PublicHairstylesResponse>({
      queryKey: [
        "public",
        "hairstyles",
      ],

      queryFn: () =>
        getPublicHairstyles(),
    });

  /*
   * Lấy danh sách yêu thích của khách hàng.
   *
   * API này chỉ được gọi khi khách hàng
   * đã đăng nhập.
   */
  const favoritesQuery = useQuery({
    queryKey: [
      "client",
      "favorites",
    ],

    queryFn: getMyFavorites,

    enabled: isAuthenticated,
  });

  /*
   * Thêm hoặc bỏ một kiểu tóc khỏi
   * danh sách yêu thích.
   */
  const favoriteMutation =
    useMutation({
      mutationFn: async (
        hairstyle: HairstyleGalleryItem
      ) => {
        const existingFavorite =
          favoritesQuery.data?.find(
            (favorite) =>
              favorite.imageUrl ===
              hairstyle.image
          );

        if (existingFavorite) {
          return removeFavorite(
            existingFavorite._id
          );
        }

        return addFavorite({
          imageUrl: hairstyle.image,
          title: hairstyle.title,
          category:
            hairstyle.category ||
            "Chưa phân loại",
        });
      },

      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: [
            "client",
            "favorites",
          ],
        });
      },
    });

  /*
   * Dữ liệu kiểu tóc từ API.
   */
  const hairstyles:
    HairstyleGalleryItem[] =
      galleryQuery.data?.items ?? [];

  /*
   * Lấy danh sách danh mục không trùng nhau.
   */
  const categories = useMemo<string[]>(
    () => {
      const values = hairstyles
        .map((item) => item.category)
        .filter(
          (
            category
          ): category is string =>
            Boolean(category)
        );

      return [...new Set(values)];
    },
    [hairstyles]
  );

  /*
   * Lọc kiểu tóc theo danh mục.
   */
  const visibleHairstyles =
    useMemo<HairstyleGalleryItem[]>(
      () => {
        if (
          selectedCategory === "ALL"
        ) {
          return hairstyles;
        }

        return hairstyles.filter(
          (item) =>
            item.category ===
            selectedCategory
        );
      },
      [
        hairstyles,
        selectedCategory,
      ]
    );

  /*
   * Kiểm tra một kiểu tóc
   * đã được yêu thích hay chưa.
   */
  const isFavorite = (
    hairstyle: HairstyleGalleryItem
  ): boolean => {
    return Boolean(
      favoritesQuery.data?.some(
        (favorite) =>
          favorite.imageUrl ===
          hairstyle.image
      )
    );
  };

  /*
   * Xử lý khi nhấn trái tim.
   */
  const handleFavorite = (
    hairstyle: HairstyleGalleryItem
  ): void => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: "/portfolio",
        },
      });

      return;
    }

    favoriteMutation.mutate(
      hairstyle
    );
  };

  return (
    <>
      <ClientHeader />

      <main className="client-portfolio-page">
        <header className="portfolio-hero">
          <p>THADS BARBER</p>

          <h1>
            Thư viện kiểu tóc
          </h1>

          <span>
            Chọn biểu tượng trái tim để
            lưu phong cách bạn yêu thích.
          </span>
        </header>

        <div className="portfolio-gallery-filter">
          <button
            type="button"
            className={
              selectedCategory === "ALL"
                ? "active"
                : ""
            }
            onClick={() =>
              setSelectedCategory("ALL")
            }
          >
            Tất cả
          </button>

          {categories.map(
            (category) => (
              <button
                type="button"
                key={category}
                className={
                  selectedCategory ===
                  category
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setSelectedCategory(
                    category
                  )
                }
              >
                {category}
              </button>
            )
          )}
        </div>

        {galleryQuery.isLoading && (
          <p className="portfolio-gallery-empty">
            Đang tải thư viện...
          </p>
        )}

        {galleryQuery.isError && (
          <p className="portfolio-gallery-empty error">
            Không thể tải thư viện
            kiểu tóc.
          </p>
        )}

        {!galleryQuery.isLoading &&
          !galleryQuery.isError &&
          visibleHairstyles.length ===
            0 && (
            <p className="portfolio-gallery-empty">
              Chưa có kiểu tóc trong
              danh mục này.
            </p>
          )}

        {!galleryQuery.isLoading &&
          !galleryQuery.isError &&
          visibleHairstyles.length >
            0 && (
            <section className="portfolio-grid">
              {visibleHairstyles.map(
                (hairstyle) => {
                  const saved =
                    isFavorite(
                      hairstyle
                    );

                  const isProcessing =
                    favoriteMutation.isPending &&
                    favoriteMutation
                      .variables?._id ===
                      hairstyle._id;

                  return (
                    <article
                      className="portfolio-dynamic-card"
                      key={hairstyle._id}
                    >
                      <a
                        href={
                          hairstyle.image
                        }
                        target="_blank"
                        rel="noreferrer"
                        title={
                          hairstyle.title
                        }
                      >
                        <img
                          src={
                            hairstyle.image
                          }
                          alt={
                            hairstyle.title
                          }
                        />
                      </a>

                      <button
                        type="button"
                        className={
                          saved
                            ? "portfolio-favorite-button active"
                            : "portfolio-favorite-button"
                        }
                        onClick={() =>
                          handleFavorite(
                            hairstyle
                          )
                        }
                        disabled={
                          isProcessing
                        }
                        aria-label={
                          saved
                            ? "Bỏ khỏi yêu thích"
                            : "Thêm vào yêu thích"
                        }
                        title={
                          saved
                            ? "Bỏ khỏi yêu thích"
                            : "Thêm vào yêu thích"
                        }
                      >
                        {isProcessing
                          ? "…"
                          : saved
                            ? "♥"
                            : "♡"}
                      </button>

                      <div className="portfolio-dynamic-info">
                        <span>
                          {hairstyle.category ||
                            "THADS STYLE"}
                        </span>

                        <h2>
                          {
                            hairstyle.title
                          }
                        </h2>

                        {hairstyle.description && (
                          <p>
                            {
                              hairstyle.description
                            }
                          </p>
                        )}
                      </div>
                    </article>
                  );
                }
              )}
            </section>
          )}
      </main>
    </>
  );
}

export default Portfolio;
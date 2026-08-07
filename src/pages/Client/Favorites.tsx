import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate } from "react-router-dom";

import ClientHeader from "../../components/ClientHeader";
import { useAuth } from "../../contexts/AuthContext";
import { getMyFavorites, removeFavorite } from "../../services/favoriteService";
import "./css/Favorites.css";

const errorMessage = (error: unknown) =>
  axios.isAxiosError(error)
    ? error.response?.data?.message ?? "Không thể tải danh sách yêu thích"
    : "Không thể tải danh sách yêu thích";

function Favorites() {
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading } = useAuth("CLIENT");

  const favoritesQuery = useQuery({
    queryKey: ["client", "favorites"],
    queryFn: getMyFavorites,
    enabled: isAuthenticated,
  });

  const removeMutation = useMutation({
    mutationFn: removeFavorite,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["client", "favorites"] }),
  });

  if (!isLoading && !isAuthenticated) return <Navigate to="/login" replace />;

  const favorites = favoritesQuery.data ?? [];

  return (
    <>
      <ClientHeader />
      <main className="client-favorites-page">
        <header className="client-favorites-hero">
          <p>THADS BARBER</p>
          <h1>Kiểu tóc yêu thích</h1>
          <span>Lưu lại những phong cách bạn muốn trao đổi với Barber.</span>
        </header>

        {favoritesQuery.isLoading ? (
          <div className="favorites-state">Đang tải danh sách...</div>
        ) : favoritesQuery.isError ? (
          <div className="favorites-state error">{errorMessage(favoritesQuery.error)}</div>
        ) : favorites.length === 0 ? (
          <div className="favorites-state">
            <h2>Bạn chưa lưu kiểu tóc nào</h2>
            <p>Khám phá thư viện và nhấn biểu tượng trái tim để lưu kiểu tóc.</p>
            <Link to="/portfolio">Khám phá thư viện</Link>
          </div>
        ) : (
          <section className="favorites-grid">
            {favorites.map((item) => (
              <article className="favorite-card" key={item._id}>
                <img src={item.imageUrl} alt={item.title} />
                <div>
                  <small>{item.category || "THADS STYLE"}</small>
                  <h2>{item.title}</h2>
                  <button
                    type="button"
                    disabled={removeMutation.isPending}
                    onClick={() => removeMutation.mutate(item._id)}
                  >
                    Bỏ khỏi yêu thích
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </>
  );
}

export default Favorites;

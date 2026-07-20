import axios from "axios";
import { useCallback, useEffect, useState } from "react";

import {
  deleteAdminContent,
  getAdminContent,
  type AdminContentItem,
  type AdminContentKind,
} from "../../services/adminContent.service";
import "./css/AdminContentManager.css";

interface Props {
  eyebrow: string;
  title: string;
  description: string;
  kind: AdminContentKind;
}

const text = (value: unknown, fallback = "—") =>
  typeof value === "string" && value.trim() ? value : fallback;

const personName = (value: unknown) => {
  if (value && typeof value === "object" && "fullName" in value) {
    return text((value as { fullName?: unknown }).fullName);
  }
  return "Không xác định";
};

const getItemInfo = (kind: AdminContentKind, item: AdminContentItem) => {
  if (kind === "vouchers") {
    return {
      name: text(item.code, text(item.name, "Voucher")),
      detail: `${String(item.discountPercent ?? item.discount ?? 0)}% giảm giá`,
    };
  }

  if (kind === "reviews") {
    return {
      name: `Review của ${personName(item.client)}`,
      detail: `${String(item.rating ?? item.overallRating ?? 0)}/5 · ${text(item.comment, "Không có nhận xét")}`,
    };
  }

  if (kind === "service-categories") {
    return {
      name: text(item.name, "Danh mục dịch vụ"),
      detail: text(item.description, text(item.slug)),
    };
  }

  return {
    name: text(item.title, text(item.name, "Kiểu tóc")),
    detail: text(item.description, text(item.category)),
  };
};

const errorMessage = (error: unknown) =>
  axios.isAxiosError(error)
    ? (error.response?.data as { message?: string } | undefined)?.message ??
      "Không thể xử lý dữ liệu"
    : "Không thể xử lý dữ liệu";

function AdminContentManager({ eyebrow, title, description, kind }: Props) {
  const [items, setItems] = useState<AdminContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAdminContent(kind);
      setItems(response.items);
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [kind]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const removeItem = async (item: AdminContentItem) => {
    const info = getItemInfo(kind, item);
    if (!window.confirm(`Xóa “${info.name}”? Dữ liệu sẽ không thể khôi phục.`)) {
      return;
    }

    try {
      setDeletingId(item._id);
      setError("");
      setMessage("");
      const response = await deleteAdminContent(kind, item._id);
      setItems((current) => current.filter((entry) => entry._id !== item._id));
      setMessage(response.message);
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="admin-content-page">
      <header className="admin-content-header">
        <p>{eyebrow}</p>
        <h1>{title}</h1>
        <span>{description}</span>
      </header>

      {error && <div className="admin-content-alert error">{error}</div>}
      {message && <div className="admin-content-alert success">{message}</div>}

      <div className="admin-content-card">
        <div className="admin-content-card-title">
          <h2>Danh sách dữ liệu</h2>
          <span>{items.length} mục</span>
        </div>

        {loading ? (
          <p className="admin-content-empty">Đang tải dữ liệu...</p>
        ) : items.length === 0 ? (
          <p className="admin-content-empty">Chưa có dữ liệu.</p>
        ) : (
          <div className="admin-content-list">
            {items.map((item) => {
              const info = getItemInfo(kind, item);
              return (
                <article className="admin-content-row" key={item._id}>
                  <div>
                    <strong>{info.name}</strong>
                    <small>{info.detail}</small>
                  </div>
                  <button
                    type="button"
                    disabled={deletingId === item._id}
                    onClick={() => void removeItem(item)}
                  >
                    {deletingId === item._id ? "Đang xóa..." : "Xóa"}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default AdminContentManager;

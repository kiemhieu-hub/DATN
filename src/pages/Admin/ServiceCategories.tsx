import axios from "axios";
import { useCallback, useEffect, useState, type FormEvent } from "react";

import {
  createAdminServiceCategory,
  deleteAdminServiceCategory,
  getAdminServiceCategories,
  updateAdminServiceCategory,
  updateAdminServiceCategoryStatus,
} from "../../services/adminServiceCategory.service";
import type { ServiceCategory, ServiceCategoryPayload } from "../../types/ServiceCategory";
import "./css/ServiceCategories.css";

const emptyForm: ServiceCategoryPayload = {
  name: "",
  slug: "",
  description: "",
  sortOrder: 0,
  isActive: true,
};

const errorMessage = (error: unknown) => axios.isAxiosError(error)
  ? (error.response?.data as { message?: string } | undefined)?.message ?? "Có lỗi xảy ra"
  : "Có lỗi xảy ra";

function ServiceCategories() {
  const [items, setItems] = useState<ServiceCategory[]>([]);
  const [form, setForm] = useState<ServiceCategoryPayload>(emptyForm);
  const [editing, setEditing] = useState<ServiceCategory | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setItems((await getAdminServiceCategories()).items);
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, sortOrder: items.length });
    setModalOpen(true);
  };

  const openEdit = (item: ServiceCategory) => {
    setEditing(item);
    setForm({
      name: item.name,
      slug: item.slug,
      description: item.description,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
    setModalOpen(true);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setProcessingId(editing?._id ?? "CREATE");
      setError("");
      setMessage("");
      const response = editing
        ? await updateAdminServiceCategory(editing._id, form)
        : await createAdminServiceCategory(form);
      setMessage(response.message);
      setModalOpen(false);
      await load();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setProcessingId(null);
    }
  };

  const toggleStatus = async (item: ServiceCategory) => {
    if (!window.confirm(`${item.isActive ? "Khóa" : "Mở"} danh mục “${item.name}”?`)) return;
    try {
      setProcessingId(item._id);
      setError("");
      const response = await updateAdminServiceCategoryStatus(item._id, !item.isActive);
      setMessage(response.message);
      await load();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setProcessingId(null);
    }
  };

  const remove = async (item: ServiceCategory) => {
    if (!window.confirm(`Xóa danh mục “${item.name}”?`)) return;
    try {
      setProcessingId(item._id);
      setError("");
      const response = await deleteAdminServiceCategory(item._id);
      setMessage(response.message);
      setItems((current) => current.filter((category) => category._id !== item._id));
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <section className="service-categories-page">
      <header className="category-header">
        <div><p>DANH MỤC</p><h1>Quản lý danh mục dịch vụ</h1><span>Tổ chức dịch vụ và kiểm soát nội dung hiển thị ở trang đặt lịch.</span></div>
        <button type="button" onClick={openCreate}>+ Thêm danh mục</button>
      </header>

      {error && <div className="category-alert error">{error}</div>}
      {message && <div className="category-alert success">{message}</div>}

      <div className="category-table-wrap">
        <table>
          <thead><tr><th>Thứ tự</th><th>Danh mục</th><th>Mã đường dẫn</th><th>Số dịch vụ</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="category-empty">Đang tải danh mục...</td></tr>
              : items.length === 0 ? <tr><td colSpan={6} className="category-empty">Chưa có danh mục dịch vụ.</td></tr>
              : items.map((item) => (
                <tr key={item._id}>
                  <td>{item.sortOrder}</td>
                  <td><strong>{item.name}</strong><small>{item.description || "Chưa có mô tả"}</small></td>
                  <td><code>{item.slug}</code></td>
                  <td>{item.serviceCount}</td>
                  <td><span className={`category-status ${item.isActive ? "active" : "inactive"}`}>{item.isActive ? "Hoạt động" : "Đã khóa"}</span></td>
                  <td><div className="category-actions"><button onClick={() => openEdit(item)}>Sửa</button><button disabled={processingId === item._id} onClick={() => void toggleStatus(item)}>{item.isActive ? "Khóa" : "Mở"}</button><button className="danger" disabled={processingId === item._id || item.serviceCount > 0} title={item.serviceCount > 0 ? "Phải chuyển hoặc xóa hết dịch vụ trước" : "Xóa danh mục"} onClick={() => void remove(item)}>Xóa</button></div></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="category-modal-bg" onMouseDown={() => setModalOpen(false)}>
          <form className="category-modal" onSubmit={submit} onMouseDown={(event) => event.stopPropagation()}>
            <h2>{editing ? "Chỉnh sửa danh mục" : "Thêm danh mục"}</h2>
            <label>Tên danh mục<input required maxLength={100} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
            <label>Mã đường dẫn <small>Có thể để trống để hệ thống tự tạo</small><input maxLength={120} value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="cat-toc-nam" /></label>
            <label>Mô tả<textarea maxLength={500} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
            <label>Thứ tự hiển thị<input min="0" type="number" value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: Number(event.target.value) })} /></label>
            <label className="category-check"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />Danh mục đang hoạt động</label>
            <div className="category-modal-actions"><button type="button" onClick={() => setModalOpen(false)}>Hủy</button><button className="primary" disabled={processingId !== null}>{processingId ? "Đang lưu..." : "Lưu danh mục"}</button></div>
          </form>
        </div>
      )}
    </section>
  );
}

export default ServiceCategories;

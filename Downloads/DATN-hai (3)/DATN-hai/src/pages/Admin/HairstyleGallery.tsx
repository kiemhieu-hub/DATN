import axios from "axios";
import { fetchBusinessQuery } from "../../lib/queryApi";
import { useRealtimeRefresh } from "../../hooks/useRealtimeRefresh";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  createAdminHairstyle,
  deleteAdminHairstyle,
  getAdminHairstyles,
  updateAdminHairstyle,
  updateAdminHairstyleStatus,
} from "../../services/adminHairstyleGallery.service";
import type { HairstyleGalleryItem, HairstyleGalleryPayload } from "../../types/HairstyleGallery";
import "./css/HairstyleGallery.css";

const emptyForm: HairstyleGalleryPayload = {
  title: "",
  image: "",
  category: "",
  description: "",
  sortOrder: 0,
  isFeatured: false,
  isActive: true,
};

const errorMessage = (error: unknown) => axios.isAxiosError(error)
  ? (error.response?.data as { message?: string } | undefined)?.message ?? "Có lỗi xảy ra"
  : "Có lỗi xảy ra";

function HairstyleGallery() {
  const [items, setItems] = useState<HairstyleGalleryItem[]>([]);
  const [form, setForm] = useState<HairstyleGalleryPayload>(emptyForm);
  const [editing, setEditing] = useState<HairstyleGalleryItem | null>(null);
  const [filter, setFilter] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setItems((await fetchBusinessQuery("admin-hairstyles", () => getAdminHairstyles())).items);
    } catch (error) { setError(errorMessage(error)); }
    finally { setLoading(false); }
  }, []);

  useRealtimeRefresh(() => {
    void load();
  });

  useEffect(() => { void load(); }, [load]);

  const categories = useMemo(
    () => [...new Set(items.map((item) => item.category).filter(Boolean))],
    [items]
  );
  const visibleItems = filter === "ALL"
    ? items
    : items.filter((item) => item.category === filter);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, sortOrder: items.length });
    setModalOpen(true);
  };
  const openEdit = (item: HairstyleGalleryItem) => {
    setEditing(item);
    setForm({
      title: item.title,
      image: item.image,
      category: item.category,
      description: item.description,
      sortOrder: item.sortOrder,
      isFeatured: item.isFeatured,
      isActive: item.isActive !== false,
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
        ? await updateAdminHairstyle(editing._id, form)
        : await createAdminHairstyle(form);
      setMessage(response.message);
      setModalOpen(false);
      await load();
    } catch (error) { setError(errorMessage(error)); }
    finally { setProcessingId(null); }
  };

  const toggleStatus = async (item: HairstyleGalleryItem) => {
    try {
      setProcessingId(item._id);
      setError("");
      const response = await updateAdminHairstyleStatus(item._id, item.isActive === false);
      setMessage(response.message);
      await load();
    } catch (error) { setError(errorMessage(error)); }
    finally { setProcessingId(null); }
  };

  const remove = async (item: HairstyleGalleryItem) => {
    if (!window.confirm(`Xóa hình ảnh “${item.title}”?`)) return;
    try {
      setProcessingId(item._id);
      setError("");
      const response = await deleteAdminHairstyle(item._id);
      setMessage(response.message);
      setItems((current) => current.filter((entry) => entry._id !== item._id));
    } catch (error) { setError(errorMessage(error)); }
    finally { setProcessingId(null); }
  };

  return (
    <section className="admin-gallery-page">
      <header className="admin-gallery-header">
        <div><p>BỘ SƯU TẬP</p><h1>Quản lý Hairstyle Gallery</h1><span>Quản lý hình ảnh kiểu tóc hiển thị cho khách hàng.</span></div>
        <button type="button" onClick={openCreate}>+ Thêm hình ảnh</button>
      </header>
      {error && <div className="gallery-alert error">{error}</div>}
      {message && <div className="gallery-alert success">{message}</div>}

      <div className="gallery-toolbar"><select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="ALL">Tất cả danh mục</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select><span>{visibleItems.length} hình ảnh</span></div>

      {loading ? <p className="gallery-empty">Đang tải hình ảnh...</p>
        : visibleItems.length === 0 ? <p className="gallery-empty">Chưa có hình ảnh kiểu tóc.</p>
        : <div className="admin-gallery-grid">{visibleItems.map((item) => (
          <article key={item._id} className={!item.isActive ? "inactive" : ""}>
            <div className="admin-gallery-image"><img src={item.image} alt={item.title} />{item.isFeatured && <b>Nổi bật</b>}</div>
            <div className="admin-gallery-info"><span>{item.category || "Chưa phân loại"}</span><h2>{item.title}</h2><p>{item.description || "Chưa có mô tả"}</p><small>Thứ tự: {item.sortOrder} · {item.isActive ? "Đang hiển thị" : "Đã ẩn"}</small></div>
            <footer><button onClick={() => openEdit(item)}>Sửa</button><button disabled={processingId === item._id} onClick={() => void toggleStatus(item)}>{item.isActive ? "Ẩn" : "Hiện"}</button><button className="danger" disabled={processingId === item._id} onClick={() => void remove(item)}>Xóa</button></footer>
          </article>
        ))}</div>}

      {modalOpen && <div className="gallery-modal-bg" onMouseDown={() => setModalOpen(false)}><form className="gallery-modal" onSubmit={submit} onMouseDown={(event) => event.stopPropagation()}><h2>{editing ? "Sửa hình ảnh" : "Thêm hình ảnh"}</h2>
        <label>Tên kiểu tóc<input required maxLength={150} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
        <label>Đường dẫn ảnh<input required value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} placeholder="/img/portfolio/1.jpg hoặc https://..." /></label>
        {form.image && <img className="gallery-preview" src={form.image} alt="Xem trước" />}
        <div className="gallery-form-grid"><label>Danh mục<input list="gallery-categories" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /><datalist id="gallery-categories">{categories.map((category) => <option key={category} value={category} />)}</datalist></label><label>Thứ tự<input min="0" type="number" value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: Number(event.target.value) })} /></label></div>
        <label>Mô tả<textarea maxLength={1000} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
        <div className="gallery-checks"><label><input type="checkbox" checked={form.isFeatured} onChange={(event) => setForm({ ...form, isFeatured: event.target.checked })} />Ảnh nổi bật</label><label><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />Đang hiển thị</label></div>
        <div className="gallery-modal-actions"><button type="button" onClick={() => setModalOpen(false)}>Hủy</button><button className="primary" disabled={processingId !== null}>{processingId ? "Đang lưu..." : "Lưu hình ảnh"}</button></div>
      </form></div>}
    </section>
  );
}

export default HairstyleGallery;

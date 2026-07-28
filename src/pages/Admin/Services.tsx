import axios from "axios";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { createAdminService, deleteAdminService, getAdminServices, updateAdminService, updateAdminServiceStatus } from "../../services/adminService.service";
import type { AdminService, AdminServicePayload } from "../../types/AdminService";
import type { ServiceGroup } from "../../types/Catalog";
import "./css/Services.css";
import { getAdminServiceCategories } from "../../services/adminServiceCategory.service";
import type { ServiceCategory } from "../../types/ServiceCategory";

const groups: Array<{ value: ServiceGroup; label: string }> = [
  { value: "HAIRCUT", label: "Cắt tóc" },
  { value: "BEARD", label: "Chăm sóc râu" },
  { value: "COLOR", label: "Nhuộm tóc" },
  { value: "CARE", label: "Chăm sóc" },
  { value: "OTHER", label: "Khác" },
];

const emptyForm: AdminServicePayload = {
  name: "", description: "", price: 0, priceFrom: false,
  durationMinutes: 30, group: "HAIRCUT", image: "", isActive: true, categoryId: "",
};

const money = (value: number) => new Intl.NumberFormat("vi-VN").format(value);
const errorMessage = (error: unknown) => axios.isAxiosError(error)
  ? (error.response?.data as { message?: string } | undefined)?.message || "Có lỗi xảy ra"
  : "Có lỗi xảy ra";

function Services() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth("ADMIN");
  const [items, setItems] = useState<AdminService[]>([]);
  const [keyword, setKeyword] = useState("");
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState<ServiceGroup | "ALL">("ALL");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE" | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<AdminService | null>(null);
  const [form, setForm] = useState<AdminServicePayload>(emptyForm);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);

  const load = useCallback(async () => {
    try {
      setLoading(true); setError("");
      const response = await getAdminServices({ keyword: search || undefined, group, status, page, limit: 8 });
      setItems(response.items); setTotalPages(response.pagination.totalPages);
    } catch (e) { setError(errorMessage(e)); }
    finally { setLoading(false); }
  }, [search, group, status, page]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user) { navigate("/admin/login", { replace: true }); return; }
    if (user.role !== "ADMIN") { navigate("/admin/login", { replace: true }); return; }
    void load();
    void getAdminServiceCategories()
      .then((response) => setCategories(response.items))
      .catch((error) => setError(errorMessage(error)));
  }, [authLoading, isAuthenticated, user, navigate, load]);

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm, categoryId: categories.find((item) => item.isActive)?._id ?? "" }); setError(""); setModal(true); };
  const openEdit = (item: AdminService) => {
    setEditing(item);
    setForm({ name: item.name, description: item.description, price: item.price, priceFrom: item.priceFrom,
      durationMinutes: item.durationMinutes, group: item.group, image: item.image, isActive: item.isActive, categoryId: item.category?.id ?? "" });
    setError(""); setModal(true);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) { setError("Vui lòng nhập tên dịch vụ"); return; }
    if (!form.categoryId) { setError("Vui lòng chọn danh mục dịch vụ"); return; }
    if (form.price < 0 || form.durationMinutes < 1) { setError("Giá hoặc thời lượng không hợp lệ"); return; }
    try {
      setSaving(true); setError(""); setMessage("");
      const response = editing
        ? await updateAdminService(editing.id, form)
        : await createAdminService(form);
      setMessage(response.message); setModal(false); await load();
    } catch (e) { setError(errorMessage(e)); }
    finally { setSaving(false); }
  };

  const toggleStatus = async (item: AdminService) => {
    if (!window.confirm(`${item.isActive ? "Tạm ngừng" : "Bật lại"} dịch vụ “${item.name}”?`)) return;
    try {
      setProcessingId(item.id); setError("");
      const response = await updateAdminServiceStatus(item.id, !item.isActive);
      setMessage(response.message); await load();
    } catch (e) { setError(errorMessage(e)); }
    finally { setProcessingId(null); }
  };

  const removeService = async (item: AdminService) => {
    if (!window.confirm(`Xóa vĩnh viễn dịch vụ “${item.name}”?`)) return;
    try {
      setProcessingId(item.id); setError("");
      const response = await deleteAdminService(item.id);
      setMessage(response.message); await load();
    } catch (e) { setError(errorMessage(e)); }
    finally { setProcessingId(null); }
  };

  if (authLoading || (loading && items.length === 0)) return <div className="admin-services-page"><p className="service-loading">Đang tải dịch vụ...</p></div>;
  if (user?.role !== "ADMIN") return null;

  return <div className="admin-services-page"><main className="admin-services-container">
    <header className="admin-services-header"><div><p>THADS BARBER</p><h1>Quản lý dịch vụ</h1><span>Cập nhật dịch vụ dùng trực tiếp trong trang đặt lịch.</span></div>
      <nav><Link to="/admin/dashboard">Dashboard</Link><Link to="/admin/barbers">Barber</Link><button onClick={openCreate}>+ Thêm dịch vụ</button></nav></header>
    {error && <div className="service-alert error">{error}</div>}
    {message && <div className="service-alert success">{message}</div>}
    <form className="service-filters" onSubmit={(e) => { e.preventDefault(); setPage(1); setSearch(keyword.trim()); }}>
      <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Tìm tên hoặc mô tả..." />
      <select value={group} onChange={(e) => { setGroup(e.target.value as ServiceGroup | "ALL"); setPage(1); }}><option value="ALL">Tất cả nhóm</option>{groups.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}</select>
      <select value={status} onChange={(e) => { setStatus(e.target.value as typeof status); setPage(1); }}><option value="ALL">Tất cả trạng thái</option><option value="ACTIVE">Đang hoạt động</option><option value="INACTIVE">Tạm ngừng</option></select>
      <button type="submit">Tìm kiếm</button>
    </form>
    <div className="service-table-wrap"><table><thead><tr><th>Dịch vụ</th><th>Danh mục</th><th>Nhóm nghiệp vụ</th><th>Giá</th><th>Thời lượng</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
      <tbody>{items.length === 0 ? <tr><td colSpan={7} className="empty">Không có dịch vụ phù hợp.</td></tr> : items.map((item) => <tr key={item.id}>
        <td><strong>{item.name}</strong><small>{item.description || "Chưa có mô tả"}</small></td>
        <td>{item.category?.name ?? "Chưa phân loại"}</td><td>{groups.find((g) => g.value === item.group)?.label}</td><td>{item.priceFrom && "Từ "}{money(item.price)}đ</td><td>{item.durationMinutes} phút</td>
        <td><span className={`status ${item.isActive ? "active" : "inactive"}`}>{item.isActive ? "Hoạt động" : "Tạm ngừng"}</span></td>
        <td><div className="row-actions"><button onClick={() => openEdit(item)}>Sửa</button><button disabled={processingId === item.id} className="toggle" onClick={() => void toggleStatus(item)}>{item.isActive ? "Tắt" : "Bật"}</button><button disabled={processingId === item.id} className="danger" onClick={() => void removeService(item)}>Xóa</button></div></td>
      </tr>)}</tbody></table></div>
    <div className="service-pagination"><button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Trước</button><span>Trang {page}/{totalPages}</span><button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Sau</button></div>
  </main>
  {modal && <div className="service-modal-backdrop" onMouseDown={() => !saving && setModal(false)}><section className="service-modal" onMouseDown={(e) => e.stopPropagation()}><h2>{editing ? "Sửa dịch vụ" : "Thêm dịch vụ"}</h2>
    <form onSubmit={(e) => void submit(e)}><label>Tên dịch vụ<input value={form.name} maxLength={150} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
      <label>Mô tả<textarea value={form.description} maxLength={1000} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
      <div className="form-grid"><label>Giá (VNĐ)<input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></label>
        <label>Thời lượng (phút)<input type="number" min="1" max="1440" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} /></label></div>
      <label>Danh mục dịch vụ<select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}><option value="">-- Chọn danh mục --</option>{categories.map((category) => <option key={category._id} value={category._id}>{category.name}{!category.isActive ? " (đã khóa)" : ""}</option>)}</select></label>
      <label>Nhóm<select value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value as ServiceGroup })}>{groups.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}</select></label>
      <label>Đường dẫn ảnh<input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="/img/services/... hoặc https://..." /></label>
      <div className="checks"><label><input type="checkbox" checked={form.priceFrom} onChange={(e) => setForm({ ...form, priceFrom: e.target.checked })} /> Hiển thị “Từ” trước giá</label><label><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Đang hoạt động</label></div>
      <p className="exclusive-note">Nhóm Cắt tóc và Nhuộm tóc tự động áp dụng quy tắc chỉ chọn một dịch vụ.</p>
      <div className="modal-actions"><button type="button" onClick={() => setModal(false)}>Hủy</button><button className="primary" disabled={saving}>{saving ? "Đang lưu..." : "Lưu dịch vụ"}</button></div>
    </form></section></div>}
  </div>;
}

export default Services;

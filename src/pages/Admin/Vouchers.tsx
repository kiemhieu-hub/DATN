import axios from "axios";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import {createAdminVoucher,deleteAdminVoucher,getAdminVouchers,updateAdminVoucher,updateAdminVoucherStatus,} from "../../services/adminVoucher.service";
import { getCatalogBarbers } from "../../services/catalog.service";
import type { CatalogBarber, ServiceGroup } from "../../types/Catalog";
import type { Voucher, VoucherPayload, VoucherType } from "../../types/Voucher";
import "./css/Vouchers.css";

const groupLabels: Record<ServiceGroup, string> = {
  HAIRCUT: "Cắt tóc",
  BEARD: "Chăm sóc râu",
  COLOR: "Nhuộm tóc",
  CARE: "Chăm sóc thư giãn",
  OTHER: "Uốn và tạo kiểu",
};

const emptyForm: VoucherPayload = {
  code: "",
  name: "",
  description: "",
  type: "PERCENT",
  value: 5,
  maxDiscount: 0,
  minOrder: 0,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
  usageLimit: 0,
  perUserLimit: 1,
  applicableServiceGroups: [],
  applicableBarbers: [],
  isActive: true,
};

const money = (value: number) => new Intl.NumberFormat("vi-VN").format(value);
const inputDate = (value: string) => value ? new Date(value).toISOString().slice(0, 10) : "";
const dateVN = (value: string) => value ? new Date(value).toLocaleDateString("vi-VN") : "—";
const errorMessage = (error: unknown) => axios.isAxiosError(error)
  ? (error.response?.data as { message?: string } | undefined)?.message ?? "Có lỗi xảy ra"
  : "Có lỗi xảy ra";

function Vouchers() {
  const [items, setItems] = useState<Voucher[]>([]);
  const [barbers, setBarbers] = useState<CatalogBarber[]>([]);
  const [form, setForm] = useState<VoucherPayload>(emptyForm);
  const [editing, setEditing] = useState<Voucher | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [voucherResponse, barberResponse] = await Promise.all([
        getAdminVouchers(),
        getCatalogBarbers(),
      ]);
      setItems(voucherResponse.items);
      setBarbers(barberResponse.barbers);
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setModalOpen(true);
  };

  const openEdit = (voucher: Voucher) => {
    setEditing(voucher);
    setForm({
      code: voucher.code,
      name: voucher.name,
      description: voucher.description,
      type: voucher.type,
      value: voucher.value,
      maxDiscount: voucher.maxDiscount,
      minOrder: voucher.minOrder,
      startDate: inputDate(voucher.startDate),
      endDate: inputDate(voucher.endDate),
      usageLimit: voucher.usageLimit,
      perUserLimit: voucher.perUserLimit,
      applicableServiceGroups: voucher.applicableServiceGroups,
      applicableBarbers: voucher.applicableBarbers.map((barber) => barber._id),
      isActive: voucher.isActive,
    });
    setModalOpen(true);
  };

  const setNumber = (field: keyof VoucherPayload, value: string) => {
    setForm((current) => ({ ...current, [field]: Number(value) }));
  };

  const toggleGroup = (group: ServiceGroup) => {
    setForm((current) => ({
      ...current,
      applicableServiceGroups: current.applicableServiceGroups.includes(group)
        ? current.applicableServiceGroups.filter((item) => item !== group)
        : [...current.applicableServiceGroups, group],
    }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setProcessingId(editing?._id ?? "CREATE");
      setError("");
      setMessage("");
      const response = editing
        ? await updateAdminVoucher(editing._id, form)
        : await createAdminVoucher(form);
      setMessage(response.message);
      setModalOpen(false);
      await load();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setProcessingId(null);
    }
  };

  const toggleStatus = async (voucher: Voucher) => {
    try {
      setProcessingId(voucher._id);
      setError("");
      const response = await updateAdminVoucherStatus(voucher._id, !voucher.isActive);
      setMessage(response.message);
      await load();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setProcessingId(null);
    }
  };

  const remove = async (voucher: Voucher) => {
    if (!window.confirm(`Xóa voucher “${voucher.code}”?`)) return;
    try {
      setProcessingId(voucher._id);
      setError("");
      const response = await deleteAdminVoucher(voucher._id);
      setMessage(response.message);
      setItems((current) => current.filter((item) => item._id !== voucher._id));
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <section className="admin-vouchers-page">
      <header className="voucher-header">
        <div><p>KHUYẾN MÃI</p><h1>Quản lý voucher</h1><span>Tạo mã giảm giá và thiết lập điều kiện sử dụng.</span></div>
        <button type="button" onClick={openCreate}>+ Thêm voucher</button>
      </header>

      {error && <div className="voucher-alert error">{error}</div>}
      {message && <div className="voucher-alert success">{message}</div>}

      <div className="voucher-table-wrap">
        <table>
          <thead><tr><th>Mã voucher</th><th>Giá trị</th><th>Điều kiện</th><th>Thời hạn</th><th>Lượt dùng</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} className="voucher-empty">Đang tải voucher...</td></tr>
              : items.length === 0 ? <tr><td colSpan={7} className="voucher-empty">Chưa có voucher.</td></tr>
              : items.map((voucher) => (
                <tr key={voucher._id}>
                  <td><strong>{voucher.code}</strong><small>{voucher.name}</small></td>
                  <td>{voucher.type === "PERCENT" ? `${voucher.value}%` : `${money(voucher.value)}đ`}<small>Trần: {voucher.maxDiscount ? `${money(voucher.maxDiscount)}đ` : "Không giới hạn"}</small></td>
                  <td>Từ {money(voucher.minOrder)}đ<small>{voucher.applicableServiceGroups.length ? voucher.applicableServiceGroups.map((group) => groupLabels[group]).join(", ") : "Tất cả dịch vụ"}</small></td>
                  <td>{dateVN(voucher.startDate)}<small>đến {dateVN(voucher.endDate)}</small></td>
                  <td>{voucher.usedCount}/{voucher.usageLimit || "∞"}<small>{voucher.perUserLimit} lượt/khách</small></td>
                  <td><span className={`voucher-status ${voucher.isActive ? "active" : "inactive"}`}>{voucher.isActive ? "Đang hoạt động" : "Đã khóa"}</span></td>
                  <td><div className="voucher-actions"><button onClick={() => openEdit(voucher)}>Sửa</button><button disabled={processingId === voucher._id} onClick={() => void toggleStatus(voucher)}>{voucher.isActive ? "Khóa" : "Mở"}</button><button className="danger" disabled={processingId === voucher._id} onClick={() => void remove(voucher)}>Xóa</button></div></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="voucher-modal-bg" onMouseDown={() => setModalOpen(false)}>
          <form className="voucher-modal" onSubmit={submit} onMouseDown={(event) => event.stopPropagation()}>
            <h2>{editing ? "Chỉnh sửa voucher" : "Thêm voucher"}</h2>
            <div className="voucher-form-grid">
              <label>Mã voucher<input required value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} /></label>
              <label>Tên voucher<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
              <label>Loại giảm<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as VoucherType })}><option value="PERCENT">Phần trăm</option><option value="FIXED">Số tiền cố định</option></select></label>
              <label>Giá trị<input required min="1" type="number" value={form.value} onChange={(event) => setNumber("value", event.target.value)} /></label>
              <label>Giảm tối đa (0 = không giới hạn)<input min="0" type="number" value={form.maxDiscount} onChange={(event) => setNumber("maxDiscount", event.target.value)} /></label>
              <label>Đơn tối thiểu<input min="0" type="number" value={form.minOrder} onChange={(event) => setNumber("minOrder", event.target.value)} /></label>
              <label>Ngày bắt đầu<input required type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} /></label>
              <label>Ngày kết thúc<input required type="date" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} /></label>
              <label>Tổng lượt sử dụng (0 = không giới hạn)<input min="0" type="number" value={form.usageLimit} onChange={(event) => setNumber("usageLimit", event.target.value)} /></label>
              <label>Lượt dùng mỗi khách<input min="1" type="number" value={form.perUserLimit} onChange={(event) => setNumber("perUserLimit", event.target.value)} /></label>
            </div>
            <label>Mô tả<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
            <fieldset><legend>Nhóm dịch vụ áp dụng (không chọn = tất cả)</legend><div className="voucher-checks">{(Object.keys(groupLabels) as ServiceGroup[]).map((group) => <label key={group}><input type="checkbox" checked={form.applicableServiceGroups.includes(group)} onChange={() => toggleGroup(group)} />{groupLabels[group]}</label>)}</div></fieldset>
            <label>Barber áp dụng (không chọn = tất cả)<select multiple value={form.applicableBarbers} onChange={(event) => setForm({ ...form, applicableBarbers: Array.from(event.target.selectedOptions, (option) => option.value) })}>{barbers.map((barber) => <option key={barber.id} value={barber.id}>{barber.fullName}</option>)}</select></label>
            <label className="voucher-active"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />Kích hoạt voucher</label>
            <div className="voucher-modal-actions"><button type="button" onClick={() => setModalOpen(false)}>Đóng</button><button className="primary" disabled={processingId !== null}>{processingId ? "Đang lưu..." : "Lưu voucher"}</button></div>
          </form>
        </div>
      )}
    </section>
  );
}

export default Vouchers;

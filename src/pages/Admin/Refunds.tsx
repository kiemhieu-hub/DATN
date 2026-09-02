import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getRefunds, processRefund } from "../../services/refund.service";
import type { Refund } from "../../types/Refund";
import "./css/Refunds.css";
import { queryKeys } from "../../lib/queryKeys";

const money = (value: number) => new Intl.NumberFormat("vi-VN").format(value);
const labels: Record<Refund["status"], string> = { PENDING: "Chờ xử lý", PROCESSING: "Đang xử lý", REFUNDED: "Đã hoàn qua cổng", REFUNDED_MANUAL: "Đã hoàn thủ công", FAILED: "Thất bại", REJECTED: "Từ chối" };

export default function Refunds() {
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Refund | null>(null);
  const [proofImage, setProofImage] = useState("");
  const [failureReason, setFailureReason] = useState("");
  const queryClient = useQueryClient();
  const refundsQuery = useQuery({
    queryKey: queryKeys.refunds,
    queryFn: async () => (await getRefunds()).refunds,
  });
  const items: Refund[] = refundsQuery.data ?? [];
  const processMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof processRefund>[1] }) =>
      processRefund(id, payload),
    onSuccess: () => { setSelected(null); setProofImage(""); setFailureReason(""); setError(""); return queryClient.invalidateQueries({ queryKey: queryKeys.refunds }); },
    onError: () => setError("Không thể cập nhật yêu cầu hoàn tiền."),
  });
  const submitRefund = async (status: "REFUNDED_MANUAL" | "FAILED") => {
    if (!selected) return;
    if (status === "FAILED" && !failureReason.trim()) { setError("Vui lòng nhập lý do giao dịch thất bại."); return; }
    await processMutation.mutateAsync({ id: selected._id, payload: { status, proofImage: proofImage.trim() || undefined, failureReason: failureReason.trim() || undefined } });
  };
  const chooseProof = (file?: File) => {
    if (!file) { setProofImage(""); return; }
    if (!file.type.startsWith("image/")) { setError("Biên lai phải là file ảnh."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Ảnh biên lai không được vượt quá 5MB."); return; }
    const reader = new FileReader();
    reader.onload = () => { setProofImage(String(reader.result || "")); setError(""); };
    reader.onerror = () => setError("Không thể đọc ảnh biên lai.");
    reader.readAsDataURL(file);
  };
  return <main className="refund-page">
    <header><p>THADS BARBER</p><h1>Quản lý hoàn tiền</h1><span>Chỉ công nhận đã hoàn khi có mã giao dịch hoặc xác nhận của nhà cung cấp.</span></header>
    {error && <p className="refund-error">{error}</p>}
    <section className="refund-list">
      {items.length === 0 ? <p className="empty">Chưa có yêu cầu hoàn tiền.</p> : items.map((item) => <article key={item._id}>
        <div><small>MÃ LỊCH</small><b>{item.appointment?.appointmentCode}</b><span>{item.appointment?.customer?.fullName}</span></div>
        <div><small>SỐ TIỀN</small><strong>{money(item.amount)}đ</strong><span>{item.reason}</span></div>
        <div><small>TÀI KHOẢN NHẬN</small><b>{item.appointment?.cancellation?.refundAccountName || "Chưa có"}</b><span>{item.appointment?.cancellation?.refundBankName} {item.appointment?.cancellation?.refundAccountNumber}</span></div>
        <div><small>TRẠNG THÁI</small><b className={`refund-status ${item.status.toLowerCase()}`}>{labels[item.status]}</b></div>
        <div>{["PENDING", "FAILED"].includes(item.status) && <button onClick={() => { setSelected(item); setError(""); }}>Xử lý hoàn tiền</button>}</div>
      </article>)}
    </section>
    {selected && <div className="refund-modal-backdrop" onMouseDown={() => setSelected(null)}>
      <form className="refund-modal" onMouseDown={(event) => event.stopPropagation()} onSubmit={(event) => { event.preventDefault(); void submitRefund("REFUNDED_MANUAL"); }}>
        <span>THADS BARBER</span><h2>Xử lý yêu cầu hoàn tiền</h2>
        <p>Lịch <b>{selected.appointment?.appointmentCode}</b> · Số tiền <strong>{money(selected.amount)}đ</strong></p>
        <div className="refund-bank-box"><small>TÀI KHOẢN NHẬN TIỀN</small><b>{selected.appointment?.cancellation?.refundAccountName || "Chưa có tên chủ tài khoản"}</b><p>{selected.appointment?.cancellation?.refundBankName} · {selected.appointment?.cancellation?.refundAccountNumber}</p></div>
        <label>Ảnh biên lai (không bắt buộc)<input type="file" accept="image/*" onChange={(event) => chooseProof(event.target.files?.[0])} /></label>
        {proofImage && <img src={proofImage} alt="Biên lai hoàn tiền" style={{ display: "block", maxWidth: "100%", maxHeight: 240, margin: "10px auto", objectFit: "contain" }} />}
        <label>Lý do thất bại (chỉ nhập khi giao dịch lỗi)<textarea value={failureReason} onChange={(event) => setFailureReason(event.target.value)} placeholder="Ví dụ: Sai số tài khoản, ngân hàng từ chối..." /></label>
        <p className="refund-confirm-note">Chỉ xác nhận sau khi đã đối chiếu giao dịch chuyển tiền trên ứng dụng ngân hàng.</p>
        <div className="refund-modal-actions"><button type="button" className="neutral" onClick={() => setSelected(null)}>Đóng</button><button type="button" className="failed" disabled={processMutation.isPending} onClick={() => void submitRefund("FAILED")}>Ghi nhận thất bại</button><button type="submit" disabled={processMutation.isPending}>Xác nhận đã hoàn</button></div>
      </form>
    </div>}
  </main>;
}

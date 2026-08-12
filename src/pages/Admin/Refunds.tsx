import { useCallback, useEffect, useState } from "react";
import { getRefunds, processRefund } from "../../services/refund.service";
import type { Refund } from "../../types/Refund";
import "./css/Refunds.css";

const money = (value: number) => new Intl.NumberFormat("vi-VN").format(value);
const labels: Record<Refund["status"], string> = { PENDING: "Chờ xử lý", PROCESSING: "Đang xử lý", REFUNDED: "Đã hoàn qua cổng", REFUNDED_MANUAL: "Đã hoàn thủ công", FAILED: "Thất bại", REJECTED: "Từ chối" };

export default function Refunds() {
  const [items, setItems] = useState<Refund[]>([]);
  const [error, setError] = useState("");
  const load = useCallback(() => getRefunds().then((response) => setItems(response.refunds)).catch(() => setError("Không thể tải yêu cầu hoàn tiền.")), []);
  useEffect(() => { void load(); }, [load]);
  const manualRefund = async (item: Refund) => {
    const bankReference = window.prompt("Nhập mã giao dịch ngân hàng:");
    if (!bankReference?.trim()) return;
    const proofImage = window.prompt("URL ảnh biên lai (khuyến nghị):") || undefined;
    await processRefund(item._id, { status: "REFUNDED_MANUAL", bankReference: bankReference.trim(), proofImage });
    await load();
  };
  return <main className="refund-page">
    <header><p>THADS BARBER</p><h1>Quản lý hoàn tiền</h1><span>Chỉ công nhận đã hoàn khi có mã giao dịch hoặc xác nhận của nhà cung cấp.</span></header>
    {error && <p className="refund-error">{error}</p>}
    <section className="refund-list">
      {items.length === 0 ? <p className="empty">Chưa có yêu cầu hoàn tiền.</p> : items.map((item) => <article key={item._id}>
        <div><small>MÃ LỊCH</small><b>{item.appointment?.appointmentCode}</b><span>{item.appointment?.customer?.fullName}</span></div>
        <div><small>SỐ TIỀN</small><strong>{money(item.amount)}đ</strong><span>{item.reason}</span></div>
        <div><small>TRẠNG THÁI</small><b className={`refund-status ${item.status.toLowerCase()}`}>{labels[item.status]}</b><span>{item.bankReference && `Mã GD: ${item.bankReference}`}</span></div>
        <div>{item.status === "PENDING" && <><button onClick={() => void manualRefund(item)}>Xác nhận hoàn thủ công</button><button className="reject" onClick={() => void processRefund(item._id, { status: "REJECTED", failureReason: "Admin từ chối yêu cầu" }).then(load)}>Từ chối</button></>}</div>
      </article>)}
    </section>
  </main>;
}

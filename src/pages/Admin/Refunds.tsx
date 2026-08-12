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
  const queryClient = useQueryClient();
  const refundsQuery = useQuery({
    queryKey: queryKeys.refunds,
    queryFn: async () => (await getRefunds()).refunds,
  });
  const items: Refund[] = refundsQuery.data ?? [];
  const processMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof processRefund>[1] }) =>
      processRefund(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.refunds }),
    onError: () => setError("Không thể cập nhật yêu cầu hoàn tiền."),
  });
  const manualRefund = async (item: Refund) => {
    const bankReference = window.prompt("Nhập mã giao dịch ngân hàng:");
    if (!bankReference?.trim()) return;
    const proofImage = window.prompt("URL ảnh biên lai (khuyến nghị):") || undefined;
    await processMutation.mutateAsync({ id: item._id, payload: { status: "REFUNDED_MANUAL", bankReference: bankReference.trim(), proofImage } });
  };
  return <main className="refund-page">
    <header><p>THADS BARBER</p><h1>Quản lý hoàn tiền</h1><span>Chỉ công nhận đã hoàn khi có mã giao dịch hoặc xác nhận của nhà cung cấp.</span></header>
    {error && <p className="refund-error">{error}</p>}
    <section className="refund-list">
      {items.length === 0 ? <p className="empty">Chưa có yêu cầu hoàn tiền.</p> : items.map((item) => <article key={item._id}>
        <div><small>MÃ LỊCH</small><b>{item.appointment?.appointmentCode}</b><span>{item.appointment?.customer?.fullName}</span></div>
        <div><small>SỐ TIỀN</small><strong>{money(item.amount)}đ</strong><span>{item.reason}</span></div>
        <div><small>TRẠNG THÁI</small><b className={`refund-status ${item.status.toLowerCase()}`}>{labels[item.status]}</b><span>{item.bankReference && `Mã GD: ${item.bankReference}`}</span></div>
        <div>{item.status === "PENDING" && <><button onClick={() => void manualRefund(item)}>Xác nhận hoàn thủ công</button><button className="reject" onClick={() => void processMutation.mutateAsync({ id: item._id, payload: { status: "REJECTED", failureReason: "Admin từ chối yêu cầu" } })}>Từ chối</button></>}</div>
      </article>)}
    </section>
  </main>;
}

import axios from "axios";
import {useCallback,useEffect,useState,type FormEvent,} from "react";
import {Link,useNavigate,} from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getAdminPayments } from "../../services/payment.service";
import type {
  Payment,
  PaymentMethod,
  PaymentPurpose,
  PaymentSummary,
  PaymentTransactionStatus,
} from "../../types/Payment";

import "./css/Payments.css";

const methodLabels: Record<PaymentMethod, string> = {
  CASH: "Tiền mặt",
  VNPAY: "VNPay",
  MOMO: "MoMo",
  BANK_TRANSFER: "Chuyển khoản",
};

const statusLabels: Record<PaymentTransactionStatus, string> = {
  PENDING: "Đang xử lý",
  PAID: "Đã thanh toán",
  FAILED: "Thất bại",
  CANCELLED: "Đã hủy",
  REFUNDED: "Đã hoàn tiền",
};

const purposeLabels: Record<PaymentPurpose, string> = {
  DEPOSIT: "Tiền đặt cọc",
  BALANCE: "Thanh toán còn lại",
  FULL: "Thanh toán toàn bộ",
};

const formatMoney = (value: number): string => {
  return new Intl.NumberFormat("vi-VN").format(value);
};

const formatDateTime = (value?: string): string => {
  if (!value) {
    return "Chưa có";
  }

  return new Date(value).toLocaleString("vi-VN");
};

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string }
      | undefined;

    return data?.message || "Không thể tải giao dịch";
  }

  return "Không thể tải giao dịch";
};

function Payments() {
  const navigate = useNavigate();

  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth("ADMIN");

  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] =
    useState<Payment | null>(null);

  const [keyword, setKeyword] = useState("");
  const [submittedKeyword, setSubmittedKeyword] =
    useState("");

  const [status, setStatus] =
    useState<PaymentTransactionStatus | "ALL">("ALL");

  const [method, setMethod] =
    useState<PaymentMethod | "ALL">("ALL");

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [summary, setSummary] = useState<PaymentSummary>({
    totalAmount: 0,
    paidCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminPayments({
        keyword: submittedKeyword || undefined,
        status,
        method,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page,
        limit: 10,
      });

      setPayments(response.items);
      setTotalPages(response.pagination.totalPages);
      setSummary(response.summary);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [submittedKeyword, status, method, dateFrom, dateTo, page]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated || !user) {
      navigate("/admin/login", { replace: true });
      return;
    }

    if (user.role !== "ADMIN") {
      navigate("/admin/login", { replace: true });
      return;
    }

    void loadPayments();
  }, [
    authLoading,
    isAuthenticated,
    user,
    navigate,
    loadPayments,
  ]);

  const handleSearch = (event: FormEvent): void => {
    event.preventDefault();
    setPage(1);
    setSubmittedKeyword(keyword.trim());
  };

  const handlePrint = (): void => {
    window.print();
  };

  if (authLoading || (loading && payments.length === 0)) {
    return (
      <div className="admin-payments-page">
        <p className="payments-loading">Đang tải giao dịch...</p>
      </div>
    );
  }

  if (user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="admin-payments-page">
      <main className="admin-payments-container">
        <header className="admin-payments-header">
          <div>
            <p className="admin-payments-brand">THADS BARBER</p>
            <h1>Thanh toán và hóa đơn</h1>
            <p>Tra cứu giao dịch và in hóa đơn cho khách hàng.</p>
          </div>

          <nav>
            <Link to="/admin/dashboard">Dashboard</Link>
            <Link to="/admin/appointments">Lịch hẹn</Link>
            <Link to="/admin/services">Dịch vụ</Link>
          </nav>
        </header>

        {error && (
          <div className="payments-error">{error}</div>
        )}

        {message && <div className="payments-success">{message}</div>}

        <section className="payments-summary">
          <article>
            <span>Số giao dịch đã thanh toán</span>
            <strong>{summary.paidCount}</strong>
          </article>

          <article>
            <span>Tổng tiền theo bộ lọc</span>
            <strong>{formatMoney(summary.totalAmount)}đ</strong>
          </article>
        </section>

        <form
          className="payments-filters"
          onSubmit={handleSearch}
        >
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Mã giao dịch, tên, email hoặc SĐT"
          />

          <select
            value={status}
            onChange={(event) => {
              setStatus(
                event.target.value as PaymentTransactionStatus | "ALL"
              );
              setPage(1);
            }}
          >
            <option value="ALL">Tất cả trạng thái</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={method}
            onChange={(event) => {
              setMethod(event.target.value as PaymentMethod | "ALL");
              setPage(1);
            }}
          >
            <option value="ALL">Tất cả phương thức</option>
            {Object.entries(methodLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={dateFrom}
            onChange={(event) => {
              setDateFrom(event.target.value);
              setPage(1);
            }}
          />

          <input
            type="date"
            value={dateTo}
            onChange={(event) => {
              setDateTo(event.target.value);
              setPage(1);
            }}
          />

          <button type="submit">Tìm kiếm</button>
        </form>

        <div className="payments-table-wrapper">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Mã giao dịch</th>
                <th>Khách hàng</th>
                <th>Phương thức</th>
                <th>Số tiền</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="payments-empty">
                    Chưa có giao dịch phù hợp.
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment._id}>
                    <td>{payment.transactionCode}</td>
                    <td>
                      {typeof payment.client === "string"
                        ? "Không xác định"
                        : payment.client.fullName}
                    </td>
                    <td>{methodLabels[payment.method]}</td>
                    <td className="payments-amount">
                      {formatMoney(payment.amount)}đ
                    </td>
                    <td>{formatDateTime(payment.paidAt)}</td>
                    <td>
                      <span className={`payment-badge ${payment.status.toLowerCase()}`}>
                        {statusLabels[payment.status]}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="payments-detail-button"
                        onClick={() => setSelectedPayment(payment)}
                      >
                        Xem hóa đơn
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="payments-pagination">
          <button
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
          >
            Trước
          </button>
          <span>Trang {page}/{totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Sau
          </button>
        </div>
      </main>

      {selectedPayment && (
        <div
          className="payment-invoice-backdrop"
          onMouseDown={() => setSelectedPayment(null)}
        >
          <section
            className="payment-invoice"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="payment-invoice-close"
              onClick={() => setSelectedPayment(null)}
            >
              ×
            </button>

            <div className="invoice-heading">
              <p>THADS BARBER</p>
              <h2>HÓA ĐƠN THANH TOÁN</h2>
            </div>

            <div className="invoice-info">
              <p><span>Mã giao dịch</span><strong>{selectedPayment.transactionCode}</strong></p>
              <p><span>Khách hàng</span><strong>{typeof selectedPayment.client === "string" ? "Không xác định" : selectedPayment.client.fullName}</strong></p>
              <p><span>Số điện thoại</span><strong>{typeof selectedPayment.client === "string" ? "" : selectedPayment.client.phone}</strong></p>
              <p><span>Thời gian thanh toán</span><strong>{formatDateTime(selectedPayment.paidAt)}</strong></p>
              <p><span>Phương thức</span><strong>{methodLabels[selectedPayment.method]}</strong></p>
              <p><span>Loại giao dịch</span><strong>{purposeLabels[selectedPayment.purpose]}</strong></p>
            </div>

            {typeof selectedPayment.appointment !== "string" && (
              <>
                <ul className="invoice-services">
                  {selectedPayment.appointment.services.map((service, index) => (
                    <li key={`${service.nameSnapshot}-${index}`}>
                      <span>{service.nameSnapshot}</span>
                      <strong>{formatMoney(service.priceSnapshot)}đ</strong>
                    </li>
                  ))}
                </ul>
                <div className="invoice-info invoice-breakdown">
                  <p>
                    <span>Tạm tính</span>
                    <strong>{formatMoney(selectedPayment.appointment.subtotal)}đ</strong>
                  </p>
                  {selectedPayment.appointment.discountAmount > 0 && (
                    <p>
                      <span>Giảm giá</span>
                      <strong>-{formatMoney(selectedPayment.appointment.discountAmount)}đ</strong>
                    </p>
                  )}
                  {selectedPayment.appointment.depositPaid && (
                    <p>
                      <span>Đã đặt cọc</span>
                      <strong>-{formatMoney(selectedPayment.appointment.depositAmount)}đ</strong>
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="invoice-total">
              <span>{purposeLabels[selectedPayment.purpose]}</span>
              <strong>{formatMoney(selectedPayment.amount)}đ</strong>
            </div>

            <p className="invoice-thanks">
              Cảm ơn quý khách đã sử dụng dịch vụ tại THADS Barber!
            </p>

            <button
              className="invoice-print-button"
              onClick={handlePrint}
            >
              In hóa đơn
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

export default Payments;

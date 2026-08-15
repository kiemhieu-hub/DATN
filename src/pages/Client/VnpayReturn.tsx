import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { verifyVnpayReturn } from "../../services/vnpay.service";
import "./css/VnpayReturn.css";

function VnpayReturn() {
  const location = useLocation();
  const [state, setState] = useState<"LOADING" | "SUCCESS" | "FAILED">("LOADING");
  const [message, setMessage] = useState("Đang xác minh giao dịch với VNPay...");

  useEffect(() => {
    let active = true;
    verifyVnpayReturn(location.search)
      .then((result) => {
        if (!active) return;
        setState(result.success ? "SUCCESS" : "FAILED");
        setMessage(result.message);
      })
      .catch((error: unknown) => {
        if (!active) return;
        const responseMessage = axios.isAxiosError(error)
          ? (error.response?.data as { message?: string } | undefined)?.message
          : undefined;
        setState("FAILED");
        setMessage(responseMessage || "Không thể xác minh giao dịch VNPay.");
      });
    return () => {
      active = false;
    };
  }, [location.search]);

  return (
    <main className="vnpay-return-page">
      <section className={`vnpay-return-card ${state.toLowerCase()}`}>
        <div className="vnpay-return-icon">
          {state === "LOADING" ? "…" : state === "SUCCESS" ? "✓" : "×"}
        </div>
        <p>THADS BARBER · VNPAY</p>
        <h1>
          {state === "LOADING"
            ? "Đang xác minh"
            : state === "SUCCESS"
              ? "Thanh toán thành công"
              : "Thanh toán chưa thành công"}
        </h1>
        <span>{message}</span>
        {state !== "LOADING" && (
          <div>
            <Link to="/booking-history">Xem lịch đã đặt</Link>
            {state === "FAILED" && <Link to="/booking">Quay lại đặt lịch</Link>}
          </div>
        )}
      </section>
    </main>
  );
}

export default VnpayReturn;

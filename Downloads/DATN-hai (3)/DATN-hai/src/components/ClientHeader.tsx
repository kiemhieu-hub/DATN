import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getMyAppointments } from "../services/appointment.service";
import "./ClientHeader.css";

export default function ClientHeader() {
  const { user, logout } = useAuth("CLIENT");
  const notifications = useQuery({
    queryKey: ["client-appointment-notifications", user?.id],
    queryFn: getMyAppointments,
    enabled: Boolean(user),
  });
  const notificationCount = notifications.data?.appointments.filter((item) =>
    ["PENDING", "CONFIRMED", "CHECKED_IN", "IN_PROGRESS"].includes(item.status)
  ).length ?? 0;
  return (
    <header className="client-site-header">
      <Link className="client-site-brand" to="/"><span>THADS</span><small>BARBER SHOP</small></Link>
      <nav aria-label="Menu khách hàng">
        <NavLink to="/">Trang chủ</NavLink><NavLink to="/services">Dịch vụ</NavLink>
        <NavLink to="/pricing">Bảng giá</NavLink><NavLink to="/booking">Đặt lịch</NavLink>
        <NavLink to="/booking-history">Lịch đã đặt</NavLink>
      </nav>
      <div className="client-site-account">
        {user ? (
          <>
          <Link className="client-notification-bell" to="/booking-history" title="Thông báo lịch hẹn">♢{notificationCount > 0 && <b>{notificationCount}</b>}</Link>
          <div className="client-account-menu">
            <button className="client-account-trigger" type="button">
              {user.avatar ? <img src={user.avatar} alt="" /> : <i className="ti-user" />}
              <span>{user.fullName}</span><i className="ti-angle-down" />
            </button>
            <div className="client-account-dropdown">
              <Link to="/profile">Thông tin cá nhân</Link>
              <Link to="/favorites">Kiểu tóc yêu thích</Link>
              <Link to="/booking-history">Lịch sử đặt lịch</Link>
              <button type="button" onClick={logout}>Đăng xuất</button>
            </div>
          </div>
          </>
        ) : <Link to="/login">Đăng nhập</Link>}
      </div>
    </header>
  );
}

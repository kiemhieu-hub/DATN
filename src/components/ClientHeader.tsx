import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./ClientHeader.css";

export default function ClientHeader() {
  const { user, logout } = useAuth("CLIENT");
  return (
    <header className="client-site-header">
      <Link className="client-site-brand" to="/"><span>THADS</span><small>BARBER SHOP</small></Link>
      <nav aria-label="Menu khách hàng">
        <NavLink to="/">Trang chủ</NavLink><NavLink to="/services">Dịch vụ</NavLink>
        <NavLink to="/pricing">Bảng giá</NavLink><NavLink to="/booking">Đặt lịch</NavLink>
        <NavLink to="/booking-history">Lịch đã đặt</NavLink>
      </nav>
      <div className="client-site-account">
        {user ? <><span>{user.fullName}</span><button type="button" onClick={logout}>Đăng xuất</button></> : <Link to="/login">Đăng nhập</Link>}
      </div>
    </header>
  );
}

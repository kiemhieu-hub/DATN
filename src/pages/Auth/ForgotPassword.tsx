import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { forgotPassword } from "../../services/authService";
import "./Login.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState(""); const [message, setMessage] = useState(""); const [loading, setLoading] = useState(false);
  const submit = async (event: FormEvent) => { event.preventDefault(); setLoading(true); setMessage(""); try { setMessage((await forgotPassword(email.trim().toLowerCase())).message); } catch (error) { setMessage(axios.isAxiosError(error) ? error.response?.data?.message || "Không thể gửi email" : "Không thể gửi email"); } finally { setLoading(false); } };
  return <div className="login-page"><div className="login-card"><h1 className="login-title">Quên mật khẩu</h1><p className="login-subtitle">Nhập email để nhận liên kết đặt lại mật khẩu.</p><form className="login-form" onSubmit={submit}><div className="login-field"><label>Email</label><input className="login-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>{message && <p className="login-success-message">{message}</p>}<button className="login-button" disabled={loading}>{loading ? "Đang gửi..." : "Gửi liên kết"}</button></form><Link className="login-back-home" to="/login">Quay lại đăng nhập</Link></div></div>;
}

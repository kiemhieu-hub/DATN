import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { resetPassword } from "../../services/authService";
import "./Login.css";

export default function ResetPassword() {
  const [params] = useSearchParams(); const token = params.get("token") || ""; const [password, setPassword] = useState(""); const [confirmPassword, setConfirmPassword] = useState(""); const [message, setMessage] = useState(""); const [success, setSuccess] = useState(false);
  const submit = async (event: FormEvent) => { event.preventDefault(); setMessage(""); try { const response = await resetPassword(token, password, confirmPassword); setMessage(response.message); setSuccess(true); } catch (error) { setMessage(axios.isAxiosError(error) ? error.response?.data?.message || "Không thể đặt lại mật khẩu" : "Không thể đặt lại mật khẩu"); } };
  return <div className="login-page"><div className="login-card"><h1 className="login-title">Đặt lại mật khẩu</h1><p className="login-subtitle">Mật khẩu mới có ít nhất 8 ký tự, gồm chữ và số.</p>{!success && <form className="login-form" onSubmit={submit}><div className="login-field"><label>Mật khẩu mới</label><input className="login-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} /></div><div className="login-field"><label>Nhập lại mật khẩu</label><input className="login-input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></div><button className="login-button">Đặt lại mật khẩu</button></form>}{message && <p className={success ? "login-success-message" : "login-error"}>{message}</p>}<Link className="login-back-home" to="/login">Đến trang đăng nhập</Link></div></div>;
}

import { useState, type FormEvent, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

import "./Login.css";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenError(true);
      setError("Liên kết đặt lại mật khẩu không hợp lệ. Vui lòng yêu cầu liên kết mới.");
    }
  }, [token]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError("Liên kết đặt lại mật khẩu không hợp lệ");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ mật khẩu");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        "http://localhost:5000/api/auth/reset-password",
        { token, password, confirmPassword }
      );

      setSuccess("Mật khẩu đã được đặt lại thành công!");
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || "Không thể đặt lại mật khẩu";
        setError(message);
        if (message.includes("không hợp lệ") || message.includes("hết hạn")) {
          setTokenError(true);
        }
      } else {
        setError("Không thể kết nối đến máy chủ");
      }
    } finally {
      setLoading(false);
    }
  };

  if (tokenError) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1 className="login-title">Liên kết không hợp lệ</h1>

          <p className="login-subtitle">
            {error}
          </p>

          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <Link
              to="/forgot-password"
              className="login-button"
              style={{ display: "inline-block", textDecoration: "none" }}
            >
              Yêu cầu liên kết mới
            </Link>
          </div>

          <p className="login-register-text" style={{ marginTop: "24px" }}>
            <Link className="login-register-link" to="/login">
              Quay về đăng nhập
            </Link>
          </p>

          <Link className="login-back-home" to="/">
            Quay về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Đặt lại mật khẩu</h1>

        <p className="login-subtitle">
          Nhập mật khẩu mới cho tài khoản của bạn
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="password">Mật khẩu mới</label>

            <div className="login-input-wrap">
              <input
                id="password"
                className="login-input"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu mới"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                required
              />

              <button
                className="login-password-toggle"
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>

            <div className="login-input-wrap">
              <input
                id="confirmPassword"
                className="login-input"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                minLength={6}
                required
              />

              <button
                className="login-password-toggle"
                type="button"
                onClick={() => setShowConfirmPassword((current) => !current)}
                aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showConfirmPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {error && <p className="login-error">{error}</p>}
          {success && <p className="login-success-message">{success}</p>}

          <button
            className="login-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
          </button>
        </form>

        <p className="login-register-text">
          <Link className="login-register-link" to="/login">
            Quay về đăng nhập
          </Link>
        </p>

        <Link className="login-back-home" to="/">
          Quay về trang chủ
        </Link>
      </div>
    </div>
  );
}

export default ResetPassword;

import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import "./Login.css";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Vui lòng nhập email");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email: email.trim().toLowerCase() }
      );

      setSuccess(response.data.message || "Vui lòng kiểm tra email để đặt lại mật khẩu.");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Không thể gửi yêu cầu đặt lại mật khẩu"
        );
      } else {
        setError("Không thể kết nối đến máy chủ");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Quên mật khẩu</h1>

        <p className="login-subtitle">
          Nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="email">Email</label>

            <div className="login-input-wrap">
              <input
                id="email"
                className="login-input"
                type="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {error && <p className="login-error">{error}</p>}
          {success && <p className="login-success-message">{success}</p>}

          <button
            className="login-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Đang gửi..." : "Gửi liên kết"}
          </button>
        </form>

        <p className="login-register-text">
          Nhớ mật khẩu?{" "}
          <Link className="login-register-link" to="/login">
            Đăng nhập
          </Link>
        </p>

        <Link className="login-back-home" to="/">
          Quay về trang chủ
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;

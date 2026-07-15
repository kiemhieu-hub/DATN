import axios from "axios";
import { useState, type FormEvent } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import "./Login.css";

interface LocationState {
  message?: string;
}

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const registerMessage = (
    location.state as LocationState | null
  )?.message;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    try {
      setLoading(true);

      const user = await login({
        email: email.trim().toLowerCase(),
        password,
      });

      if (user.role === "ADMIN") {
        navigate("/admin/dashboard", {
          replace: true,
        });
        return;
      }

      if (user.role === "BARBER") {
        navigate("/barber/schedule", {
          replace: true,
        });
        return;
      }

      navigate("/", {
        replace: true,
      });
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);

      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Email hoặc mật khẩu không chính xác"
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
        <h1 className="login-title">
          Đăng nhập
        </h1>

        <p className="login-subtitle">
          Chào mừng bạn quay lại THADS Barber
        </p>

        {registerMessage && (
          <p
            style={{
              margin: "0 0 20px",
              padding: "11px 13px",
              color: "#e4c28e",
              background:
                "rgba(183, 138, 71, 0.14)",
              borderLeft:
                "3px solid #b78a47",
              fontSize: "13px",
            }}
          >
            {registerMessage}
          </p>
        )}

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >
          <div className="login-field">
            <label htmlFor="email">
              Email
            </label>

            <div className="login-input-wrap">
              <input
                id="email"
                className="login-input"
                type="email"
                placeholder="Nhập email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="password">
              Mật khẩu
            </label>

            <div className="login-input-wrap">
              <input
                id="password"
                className="login-input"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="current-password"
                required
              />

              <button
                className="login-password-toggle"
                type="button"
                onClick={() =>
                  setShowPassword(
                    (current) => !current
                  )
                }
                aria-label={
                  showPassword
                    ? "Ẩn mật khẩu"
                    : "Hiện mật khẩu"
                }
                title={
                  showPassword
                    ? "Ẩn mật khẩu"
                    : "Hiện mật khẩu"
                }
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {error && (
            <p className="login-error">
              {error}
            </p>
          )}

          <button
            className="login-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Đang đăng nhập..."
              : "Đăng nhập"}
          </button>
        </form>

        <p className="login-register-text">
          Chưa có tài khoản?{" "}
          <Link
            className="login-register-link"
            to="/register"
          >
            Đăng ký
          </Link>
        </p>

        <Link
          className="login-back-home"
          to="/"
        >
          Quay về trang chủ
        </Link>
      </div>
    </div>
  );
}

export default Login;
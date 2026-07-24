import axios from "axios";
import {
  useState,
  type FormEvent,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import type { UserRole } from "../../types/Auth";

import "./Login.css";

interface LoginProps {
  role?: UserRole;
  title?: string;
  subtitle?: string;
  redirectTo?: string;
  showRegister?: boolean;
}

interface LocationState {
  message?: string;
}

function Login({
  role = "CLIENT",
  title = "Đăng nhập khách hàng",
  subtitle = "Đăng nhập để đặt lịch tại THADS Barber",
  redirectTo = "/",
  showRegister = true,
}: LoginProps) {
  const navigate = useNavigate();
  const location = useLocation();

  /*
   * role sẽ quyết định phiên đăng nhập:
   * CLIENT, BARBER hoặc ADMIN.
   */
  const { login } = useAuth(role);

  const registerMessage = (
    location.state as LocationState | null
  )?.message;

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError(
        "Vui lòng nhập đầy đủ email và mật khẩu"
      );

      return;
    }

    try {
      setLoading(true);

      await login({
        email: email
          .trim()
          .toLowerCase(),
        password,
      });

      /*
       * Client sẽ về "/".
       * Admin sẽ về "/admin/dashboard".
       * Barber sẽ về "/barber/dashboard".
       */
      navigate(redirectTo, {
        replace: true,
      });
    } catch (err) {
      console.error(
        "Lỗi đăng nhập:",
        err
      );

      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Email hoặc mật khẩu không chính xác"
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Không thể kết nối đến máy chủ"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">
          {title}
        </h1>

        <p className="login-subtitle">
          {subtitle}
        </p>

        {registerMessage && (
          <div className="login-success-message">
            {registerMessage}
          </div>
        )}

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >
          <div className="login-field">
            <label htmlFor={`${role}-email`}>
              Email
            </label>

            <div className="login-input-wrap">
              <input
                id={`${role}-email`}
                className="login-input"
                type="email"
                placeholder="Nhập email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor={`${role}-password`}>
              Mật khẩu
            </label>

            <div className="login-input-wrap">
              <input
                id={`${role}-password`}
                className="login-input"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
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
              >
                {showPassword
                  ? "Ẩn"
                  : "Hiện"}
              </button>
            </div>
          </div>

          {error && (
            <p className="login-error">
              {error}
            </p>
          )}

          <div className="login-options">
            {showRegister && (
              <p className="login-register-text" style={{ margin: 0 }}>
                Chưa có tài khoản?{" "}
                <Link
                  className="login-register-link"
                  to="/register"
                >
                  Đăng ký
                </Link>
              </p>
            )}

            <Link
              className="login-forgot"
              to="/forgot-password"
            >
              Quên mật khẩu?
            </Link>
          </div>

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
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { register } from "../../services/authService";

import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setLoading(true);

      await register({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          confirmPassword,
      });

      // Đăng ký thành công thì chuyển sang trang đăng nhập
      navigate("/login", {
        replace: true,
        state: {
          message: "Đăng ký thành công. Hãy đăng nhập.",
        },
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Đăng ký tài khoản thất bại"
        );
      } else {
        setError("Không thể kết nối đến máy chủ");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h1 className="register-title">Đăng ký</h1>

        <p className="register-subtitle">
          Tạo tài khoản khách hàng THADS Barber
        </p>

        <form
          className="register-form"
          onSubmit={handleSubmit}
        >
          <div className="register-field">
            <label htmlFor="fullName">Họ và tên</label>

            <input
              id="fullName"
              className="register-input"
              type="text"
              placeholder="Nhập họ và tên"
              value={fullName}
              onChange={(event) =>
                setFullName(event.target.value)
              }
              required
            />
          </div>

          <div className="register-field">
            <label htmlFor="email">Email</label>

            <input
              id="email"
              className="register-input"
              type="email"
              placeholder="Nhập email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
            />
          </div>

          <div className="register-field">
            <label htmlFor="phone">
              Số điện thoại
            </label>

            <input
              id="phone"
              className="register-input"
              type="tel"
              placeholder="Nhập số điện thoại"
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value)
              }
              required
            />
          </div>

          <div className="register-field">
            <label htmlFor="password">Mật khẩu</label>

            <div className="register-input-wrap">
              <input
                id="password"
                className="register-input"
                type={
                  showPassword ? "text" : "password"
                }
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                minLength={8}
                pattern="(?=.*[A-Za-z])(?=.*\d).{8,}"
                title="Ít nhất 8 ký tự, gồm chữ và số"
                required
              />

              <button
                className="register-password-toggle"
                type="button"
                onClick={() =>
                  setShowPassword((current) => !current)
                }
                aria-label={
                  showPassword
                    ? "Ẩn mật khẩu"
                    : "Hiện mật khẩu"
                }
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <div className="register-field">
            <label htmlFor="confirmPassword">
              Xác nhận mật khẩu
            </label>

            <div className="register-input-wrap">
              <input
                id="confirmPassword"
                className="register-input"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                minLength={8}
                required
              />

              <button
                className="register-password-toggle"
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    (current) => !current
                  )
                }
                aria-label={
                  showConfirmPassword
                    ? "Ẩn mật khẩu"
                    : "Hiện mật khẩu"
                }
              >
                {showConfirmPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {error && (
            <p className="register-error">{error}</p>
          )}

          <button
            className="register-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Đang đăng ký..."
              : "Đăng ký"}
          </button>
        </form>

        <p className="register-login-text">
          Đã có tài khoản?{" "}
          <Link
            className="register-login-link"
            to="/login"
          >
            Đăng nhập
          </Link>
        </p>

        <Link className="register-back-home" to="/">
          Quay về trang chủ
        </Link>
      </div>
    </div>
  );
}

export default Register;

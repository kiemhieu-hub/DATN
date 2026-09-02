import axios from "axios";
import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";

import ClientHeader from "../../components/ClientHeader";
import { useAuth } from "../../contexts/AuthContext";
import { changePassword, getMe, updateMyProfile } from "../../services/authService";
import "./css/Profile.css";

const getError = (error: unknown): string =>
  axios.isAxiosError(error)
    ? error.response?.data?.message ?? "Không thể cập nhật hồ sơ"
    : "Không thể cập nhật hồ sơ";

function ClientProfile() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, updateUser } = useAuth("CLIENT");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [message, setMessage] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/login", { replace: true });
  }, [isAuthenticated, isLoading, navigate]);

  const profileQuery = useQuery({
    queryKey: ["client", "profile"],
    queryFn: () => getMe(localStorage.getItem("clientAccessToken") ?? ""),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    const current = profileQuery.data ?? user;
    if (!current) return;
    setFullName(current.fullName);
    setPhone(current.phone);
    setAvatar(current.avatar ?? "");
  }, [profileQuery.data, user]);

  const updateMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (response) => {
      updateUser(response.user);
      setMessage(response.message);
    },
    onError: (error) => setMessage(getError(error)),
  });

  const submit = (event: FormEvent): void => {
    event.preventDefault();
    setMessage("");
    updateMutation.mutate({ fullName, phone, avatar });
  };

  const passwordMutation = useMutation({
    mutationFn: () => changePassword(currentPassword, newPassword, confirmPassword),
    onSuccess: (response) => { setMessage(response.message); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); },
    onError: (error) => setMessage(getError(error)),
  });

  if (isLoading || profileQuery.isLoading) {
    return <div className="client-account-loading">Đang tải thông tin cá nhân...</div>;
  }
  if (!user) return null;

  return (
    <>
      <ClientHeader />
      <main className="client-account-page">
        <section className="client-account-hero">
          <p>THADS BARBER</p>
          <h1>Thông tin cá nhân</h1>
          <span>Quản lý thông tin liên hệ dùng khi đặt lịch.</span>
        </section>

        <section className="client-profile-card">
          <aside>
            <div className="client-profile-avatar">
              {avatar ? <img src={avatar} alt={fullName} /> : fullName.charAt(0)}
            </div>
            <h2>{user.fullName}</h2>
            <p>{user.email}</p>
            <Link to="/favorites">Kiểu tóc yêu thích</Link>
            <Link to="/booking-history">Lịch sử đặt lịch</Link>
          </aside>

          <form onSubmit={submit}>
            <h2>Cập nhật hồ sơ</h2>
            {message && (
              <div className={updateMutation.isError ? "profile-message error" : "profile-message success"}>
                {message}
              </div>
            )}
            <label>
              Họ và tên
              <input value={fullName} onChange={(event) => setFullName(event.target.value)} required minLength={2} />
            </label>
            <label>
              Email
              <input value={user.email} disabled />
            </label>
            <label>
              Số điện thoại
              <input value={phone} onChange={(event) => setPhone(event.target.value)} required pattern="(0|\+84)[0-9]{9,10}" />
            </label>
            <label>
              Đường dẫn ảnh đại diện
              <input value={avatar} onChange={(event) => setAvatar(event.target.value)} placeholder="https://..." />
            </label>
            <button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </form>
        </section>
        <section className="client-profile-card">
          <aside><h2>Bảo mật tài khoản</h2><p>Đổi mật khẩu sẽ đăng xuất các phiên đang hoạt động.</p></aside>
          <form onSubmit={(event) => { event.preventDefault(); setMessage(""); passwordMutation.mutate(); }}>
            <h2>Đổi mật khẩu</h2>
            <label>Mật khẩu hiện tại<input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /></label>
            <label>Mật khẩu mới<input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required minLength={8} /></label>
            <label>Nhập lại mật khẩu mới<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></label>
            <button type="submit" disabled={passwordMutation.isPending}>{passwordMutation.isPending ? "Đang đổi..." : "Đổi mật khẩu"}</button>
          </form>
        </section>
      </main>
    </>
  );
}

export default ClientProfile;

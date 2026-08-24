import Login from "./Login";

function AdminLogin() {
  return (
    <Login
      role="ADMIN"
      title="Đăng nhập Admin"
      subtitle="Đăng nhập để quản trị hệ thống THADS Barber"
      redirectTo="/admin/dashboard"
      showRegister={false}
    />
  );
}

export default AdminLogin;
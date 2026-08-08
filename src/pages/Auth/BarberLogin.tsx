import Login from "./Login";

function BarberLogin() {
  return (
    <Login
      role="BARBER"
      title="Đăng nhập Barber"
      subtitle="Đăng nhập để quản lý công việc của bạn"
      redirectTo="/barber/dashboard"
      showRegister={false}
    />
  );
}

export default BarberLogin;
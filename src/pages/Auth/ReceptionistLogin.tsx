import Login from "./Login";

function ReceptionistLogin() {
  return <Login role="RECEPTIONIST" title="Đăng nhập lễ tân" subtitle="Quản lý vận hành và khách đến THADS Barber" redirectTo="/receptionist/dashboard" showRegister={false} />;
}

export default ReceptionistLogin;

import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import { lazy, Suspense } from "react";

const Index = lazy(() => import("./pages/Client/Index"));
const About = lazy(() => import("./pages/Client/About"));
const Services = lazy(() => import("./pages/Client/Services"));
const Pricing = lazy(() => import("./pages/Client/Pricing"));
const Contact = lazy(() => import("./pages/Client/Contact"));
const ServicesPage = lazy(() => import("./pages/Client/ServicesPage"));
const Team = lazy(() => import("./pages/Client/Team"));
const TeamDetails = lazy(() => import("./pages/Client/TeamDetail"));
const Portfolio = lazy(() => import("./pages/Client/Portfolio"));
const Faq = lazy(() => import("./pages/Client/Faq"));
const NotFound = lazy(() => import("./pages/Client/NotFound"));
const Post = lazy(() => import("./pages/Client/Post"));
const Blog = lazy(() => import("./pages/Client/Blog"));
const Blog2 = lazy(() => import("./pages/Client/Blog2"));
const Blog3 = lazy(() => import("./pages/Client/Blog3"));
const Booking = lazy(() => import("./pages/Client/Booking"));
const BookingHistory = lazy(() => import("./pages/Client/BookingHistory"));
const Favorites = lazy(() => import("./pages/Client/Favorites"));
const ClientProfile = lazy(() => import("./pages/Client/Profile"));
const Schedule = lazy(() => import("./pages/barber/Schedule"));
const WorkingSchedule = lazy(() => import("./pages/barber/WorkingSchedule"));
const Dashboard = lazy(() => import("./pages/barber/Dashboard"));
const Profile = lazy(() => import("./pages/barber/Profile"));
const Login = lazy(() => import("./pages/Auth/Login"));
const Register = lazy(() => import("./pages/Auth/Register"));
const ForgotPassword = lazy(() => import("./pages/Auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/Auth/ResetPassword"));
const AdminLogin = lazy(() => import("./pages/Auth/AdminLogin"));
const BarberLogin = lazy(() => import("./pages/Auth/BarberLogin"));
const ReceptionistLogin = lazy(() => import("./pages/Auth/ReceptionistLogin"));
const ReceptionistDashboard = lazy(() => import("./pages/Receptionist/Dashboard"));
const ReceptionistBarberSchedules = lazy(() => import("./pages/Receptionist/BarberSchedules"));
const BarberDaySchedule = lazy(() => import("./pages/Receptionist/BarberDaySchedule"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const ReceptionistLayout = lazy(() => import("./layouts/ReceptionistLayout"));
const AdminDashboard = lazy(() => import("./pages/Admin/Dashboard"));
const AdminRevenue = lazy(() => import("./pages/Admin/Revenue"));
const Barbers = lazy(() => import("./pages/Admin/Barbers"));
const AdminServices = lazy(() => import("./pages/Admin/Services"));
const AdminAppointments = lazy(() => import("./pages/Admin/Appointments"));
const AdminPayments = lazy(() => import("./pages/Admin/Payments"));
const AdminUsers = lazy(() => import("./pages/Admin/Users"));
const AdminVouchers = lazy(() => import("./pages/Admin/Vouchers"));
const AdminServiceCategories = lazy(() => import("./pages/Admin/ServiceCategories"));
const AdminHairstyleGallery = lazy(() => import("./pages/Admin/HairstyleGallery"));
const AdminReviews = lazy(() => import("./pages/Admin/Reviews"));
const AdminRefunds = lazy(() => import("./pages/Admin/Refunds"));
const StaffNotifications = lazy(() => import("./pages/Admin/StaffNotifications"));
const VnpayReturn = lazy(() => import("./pages/Client/VnpayReturn"));
const ChatWidget = lazy(() => import("./components/ChatWidget"));

// Theme dùng chung, luôn import sau CSS riêng của từng module.
import "./styles/ThadsTheme.css";
function App() {
  return (
    <Router>
      <Suspense fallback={<div className="route-loading">Đang tải trang...</div>}>
      <Routes>
        {/* ================= ADMIN ================= */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="invoices" element={<AdminPayments />} />
          <Route path="vouchers" element={<AdminVouchers />} />
          <Route
            path="service-categories"
            element={<AdminServiceCategories />}
          />
          <Route path="barbers" element={<Barbers />} />
          <Route
            path="barber-schedules"
            element={<ReceptionistBarberSchedules />}
          />
          <Route path="barber-day-schedule" element={<BarberDaySchedule />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="operations" element={<ReceptionistDashboard />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="hairstyle-gallery" element={<AdminHairstyleGallery />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="notifications" element={<StaffNotifications />} />
          <Route path="refunds" element={<AdminRefunds />} />
          <Route path="revenue" element={<AdminRevenue />} />
        </Route>

        {/* ================= AUTH ================= */}

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/receptionist/login" element={<ReceptionistLogin />} />
        <Route path="/receptionist" element={<ReceptionistLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ReceptionistDashboard />} />
          <Route path="barbers" element={<ReceptionistBarberSchedules />} />
          <Route path="barber-day-schedule" element={<BarberDaySchedule />} />
          <Route path="notifications" element={<StaffNotifications />} />
          <Route path="refunds" element={<AdminRefunds />} />
          <Route path="revenue" element={<AdminRevenue />} />
        </Route>

        {/* ================= CLIENT ================= */}

        <Route path="/" element={<Index />} />
        <Route path="/index" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/services-page" element={<ServicesPage />} />
        <Route path="/services-page/:id" element={<ServicesPage />} />
        <Route path="/team" element={<Team />} />
        <Route path="/team-details" element={<TeamDetails />} />
        <Route path="/team-details/:id" element={<TeamDetails />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="/post" element={<Post />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog2" element={<Blog2 />} />
        <Route path="/blog3" element={<Blog3 />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/booking-history" element={<BookingHistory />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/profile" element={<ClientProfile />} />
        <Route path="/index.html" element={<Navigate to="/" replace />} />
        <Route path="/about.html" element={<Navigate to="/about" replace />} />
        <Route
          path="/services.html"
          element={<Navigate to="/services" replace />}
        />
        <Route
          path="/pricing.html"
          element={<Navigate to="/pricing" replace />}
        />
        <Route
          path="/contact.html"
          element={<Navigate to="/contact" replace />}
        />
        <Route
          path="/portfolio.html"
          element={<Navigate to="/portfolio" replace />}
        />
        <Route path="/team.html" element={<Navigate to="/team" replace />} />
        <Route path="/faq.html" element={<Navigate to="/faq" replace />} />

        {/* ================= BARBER ================= */}
        <Route path="/barber/login" element={<BarberLogin />} />
        <Route path="/barber/schedule" element={<Schedule />} />
        <Route path="/barber/working-schedule" element={<WorkingSchedule />} />
        <Route path="/barber/dashboard" element={<Dashboard />} />
        <Route path="/barber/profile" element={<Profile />} />

        {/* ================= VNpay ================= */}
        <Route path="/payment/vnpay-return" element={<VnpayReturn />} />

        <Route
          path="*"
          element={
            <div
              style={{
                color: "#fff",
                padding: "50px",
                textAlign: "center",
              }}
            >
              <h2>404 - Không tìm thấy trang</h2>
            </div>
          }
        />
      </Routes>
      <ChatWidget />
      </Suspense>
    </Router>
  );
}

export default App;

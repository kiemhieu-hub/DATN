import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Index from "./pages/Client/Index";
import About from "./pages/Client/About";
import Services from "./pages/Client/Services";
import Pricing from "./pages/Client/Pricing";
import Contact from "./pages/Client/Contact";
import ServicesPage from "./pages/Client/ServicesPage";
import Team from "./pages/Client/Team";
import TeamDetails from "./pages/Client/TeamDetail";
import Portfolio from "./pages/Client/Portfolio";
import Faq from "./pages/Client/Faq";
import NotFound from "./pages/Client/NotFound";
import Post from "./pages/Client/Post";
import Blog from "./pages/Client/Blog";
import Blog2 from "./pages/Client/Blog2";
import Blog3 from "./pages/Client/Blog3";
import Booking from "./pages/Client/Booking";
import BookingHistory from "./pages/Client/BookingHistory";
import Favorites from "./pages/Client/Favorites";
import ClientProfile from "./pages/Client/Profile";
import Schedule from "./pages/barber/Schedule";
import WorkingSchedule from "./pages/barber/WorkingSchedule";
import Dashboard from "./pages/barber/Dashboard";
import Profile from "./pages/barber/Profile";

// Auth
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";

import AdminLogin from "./pages/Auth/AdminLogin";
import BarberLogin from "./pages/Auth/BarberLogin";
import ReceptionistLogin from "./pages/Auth/ReceptionistLogin";
import ReceptionistDashboard from "./pages/Receptionist/Dashboard";
import ReceptionistBarberSchedules from "./pages/Receptionist/BarberSchedules";
import BarberDaySchedule from "./pages/Receptionist/BarberDaySchedule";
import AdminLayout from "./layouts/AdminLayout";
import ReceptionistLayout from "./layouts/ReceptionistLayout";

//Admin
import AdminDashboard from "./pages/Admin/Dashboard";
import AdminRevenue from "./pages/Admin/Revenue";
import Barbers from "./pages/Admin/Barbers";
import AdminServices from "./pages/Admin/Services";
import AdminAppointments from "./pages/Admin/Appointments";
import AdminPayments from "./pages/Admin/Payments";
import AdminUsers from "./pages/Admin/Users";
import AdminVouchers from "./pages/Admin/Vouchers";
import AdminServiceCategories from "./pages/Admin/ServiceCategories";
import AdminHairstyleGallery from "./pages/Admin/HairstyleGallery";
import AdminReviews from "./pages/Admin/Reviews";
import AdminRefunds from "./pages/Admin/Refunds";
import StaffNotifications from "./pages/Admin/StaffNotifications";

//VNpay
import VnpayReturn from "./pages/Client/VnpayReturn";

// Theme dùng chung, luôn import sau CSS riêng của từng module.
import "./styles/ThadsTheme.css";
import ChatWidget from "./components/ChatWidget";

function App() {
  return (
    <Router>
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
    </Router>
  );
}

export default App;

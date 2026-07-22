import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Index from './pages/Client/Index';
import About from './pages/Client/About';
import Services from './pages/Client/Services';
import Pricing from './pages/Client/Pricing';
import Contact from './pages/Client/Contact';
import ServicesPage from './pages/Client/ServicesPage';
import Team from './pages/Client/Team';
import TeamDetails from './pages/Client/TeamDetail';
import Portfolio from './pages/Client/Portfolio';
import Faq from './pages/Client/Faq';
import NotFound from './pages/Client/NotFound';
import Post from './pages/Client/Post';
import Blog from './pages/Client/Blog';
import Blog2 from './pages/Client/Blog2';
import Blog3 from './pages/Client/Blog3';
import Booking from "./pages/Client/Booking";
import BookingHistory from "./pages/Client/BookingHistory";
import Schedule from "./pages/barber/Schedule";
import WorkingSchedule from "./pages/barber/WorkingSchedule";
import Dashboard from "./pages/barber/Dashboard";
import Profile from "./pages/barber/Profile";

// Auth
import Login from './pages/Auth/Login';
import Register from "./pages/Auth/Register";

import AdminLogin from "./pages/Auth/AdminLogin";
import BarberLogin from "./pages/Auth/BarberLogin";
import ReceptionistLogin from "./pages/Auth/ReceptionistLogin";
import ReceptionistDashboard from "./pages/Receptionist/Dashboard";
import ReceptionistBarberSchedules from "./pages/Receptionist/BarberSchedules";
import AdminLayout from "./layouts/AdminLayout";

//Admin
import AdminDashboard from "./pages/Admin/Dashboard";
import AdminRevenue from "./pages/Admin/Revenue";
import Barbers from "./pages/Admin/Barbers";
import AdminServices from "./pages/Admin/Services";
import AdminAppointments from "./pages/Admin/Appointments";
import AdminPayments from "./pages/Admin/Payments";
import AdminUsers from "./pages/Admin/Users";
import AdminContentManager from "./pages/Admin/AdminContentManager";
import AdminVouchers from "./pages/Admin/Vouchers";
import AdminServiceCategories from "./pages/Admin/ServiceCategories";

function App() {
  return (
    <Router>
      <Routes>
        {/* ================= ADMIN ================= */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="revenue" element={<AdminRevenue />} />
          <Route path="invoices" element={<AdminPayments />}/>
          <Route path="vouchers" element={<AdminVouchers />}/>
          <Route path="service-categories" element={<AdminServiceCategories />}/>
          <Route path="barbers" element={<Barbers />}/>
          <Route path="barber-schedules" element={<ReceptionistBarberSchedules />}/>
          <Route path="services" element={<AdminServices />}/>
          <Route path="appointments" element={<AdminAppointments />}/>
          <Route path="operations" element={<ReceptionistDashboard />}/>
          <Route path="payments" element={<AdminPayments />}/>
          <Route path="users" element={<AdminUsers />}/>
          <Route path="vouchers" element={
            <AdminContentManager
              eyebrow="KHUYẾN MÃI"
              title="Quản lý voucher"
              description="Quản lý mã giảm giá và điều kiện áp dụng cho đơn đặt lịch."
              kind="vouchers"
            />
          }/>
          <Route path="reviews" element={
            <AdminContentManager
              eyebrow="PHẢN HỒI KHÁCH HÀNG"
              title="Quản lý review"
              description="Theo dõi, duyệt và xử lý đánh giá của khách hàng."
              kind="reviews"
            />
          }/>
          
          <Route path="service-categories" element={
            <AdminContentManager
              eyebrow="DANH MỤC"
              title="Quản lý danh mục dịch vụ"
              description="Tổ chức các dịch vụ theo nhóm để quản lý và hiển thị thống nhất."
              kind="service-categories"
            />
          }/>
          
          <Route path="hairstyle-gallery" element={
            <AdminContentManager
              eyebrow="BỘ SƯU TẬP"
              title="Quản lý hairstyle gallery"
              description="Quản lý hình ảnh kiểu tóc được hiển thị cho khách hàng tham khảo."
              kind="hairstyle-gallery"
            />
          }/>
        </Route>

        {/* ================= AUTH ================= */}

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/receptionist/login" element={<ReceptionistLogin />} />
        <Route path="/receptionist/dashboard" element={<ReceptionistDashboard />} />
        <Route path="/receptionist/barbers" element={<ReceptionistBarberSchedules />} />

        {/* ================= CLIENT ================= */}

        <Route path="/" element={<Index />} />
        <Route path="/index.html" element={<Index />} />
        <Route path="/about.html" element={<About />} />
        <Route path="/services.html" element={<Services />} />
        <Route path="/pricing.html" element={<Pricing />} />
        <Route path="/contact.html" element={<Contact />} />
        <Route path="/services-page.html" element={<ServicesPage />} />
        <Route path="/team.html" element={<Team />} />
        <Route path="/team-details.html" element={<TeamDetails />} />
        <Route path="/portfolio.html" element={<Portfolio />} />
        <Route path="/faq.html" element={<Faq />} />
        <Route path="/404.html" element={<NotFound />} />
        <Route path="/post.html" element={<Post />} />
        <Route path="/blog.html" element={<Blog />} />
        <Route path="/blog2.html" element={<Blog2 />} />
        <Route path="/blog3.html" element={<Blog3 />} />
        <Route path="/booking"element={<Booking />}/>
        <Route path="/booking-history"element={<BookingHistory />}/>

        {/* ================= BARBER ================= */}
        <Route path="/barber/login" element={<BarberLogin />} />
        <Route path="/barber/schedule"element={<Schedule />}/>
        <Route path="/barber/working-schedule"element={<WorkingSchedule />}/>
        <Route path="/barber/dashboard" element={<Dashboard />}/>
        <Route path="/barber/profile"element={<Profile />}/>


        <Route path="*"element={
            <div
              style={{
                color: '#fff',
                padding: '50px',
                textAlign: 'center',
              }}
            >
              <h2>404 - Không tìm thấy trang</h2>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

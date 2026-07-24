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
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import AdminLayout from './layouts/AdminLayout';
import Booking from './pages/Client/Booking';
import BookingHistory from './pages/Client/BookingHistory';
import Dashboard from './pages/Barber/Dashnoard';
import Profile from './pages/Barber/Profile';
import Schedule from './pages/Barber/Schedule';
import WorkingSchedule from './pages/Barber/WorkingSchedule';
// Tạo tạm các component ảo để tránh lỗi nếu bạn chưa tạo file cho các trang khác

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        {/* Route cho trang chủ - trỏ vào file index.tsx của bạn */}
        <Route path="/" element={<Index />} />

        {/* Các Route phụ khớp với link href trong template gốc */}
        <Route path="/index" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/services-page" element={<ServicesPage />} />
        <Route path="/team" element={<Team />} />
        <Route path="/team-details" element={<TeamDetails />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="/post" element={<Post />} />
        <Route path="/blog2" element={<Blog2 />} />
        <Route path="/blog3" element={<Blog3 />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/services-page" element={<ServicesPage />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/booking-history" element={<BookingHistory />} />
       <Route path="/barber/dashboard" element={<Dashboard />} />
       <Route path="/barber/profile" element={<Profile />} />
       <Route path="/barber/schedule" element={<Schedule />} />
       <Route path="/barber/working-schedule" element={<WorkingSchedule />} />

        <Route element={<AdminLayout />}>
          
        </Route>
        {/* Route xử lý khi người dùng gõ sai đường dẫn (404 Not Found) */}
        <Route path="*" element={<div style={{ color: '#fff', padding: '50px', textAlign: 'center' }}><h2>404 - Không tìm thấy trang</h2></div>} />
      </Routes>
    </Router>
  );
}

export default App;
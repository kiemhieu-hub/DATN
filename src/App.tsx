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
// Tạo tạm các component ảo để tránh lỗi nếu bạn chưa tạo file cho các trang khác

function App() {
  return (
    <Router>
      <Routes>
        {/* Route cho trang chủ - trỏ vào file index.tsx của bạn */}
        <Route path="/" element={<Index />} />

        {/* Các Route phụ khớp với link href trong template gốc */}
        <Route path="/index.html" element={<Index />} />
        <Route path="/about.html" element={<About />} />
        <Route path="/services.html" element={<Services/>}/>
        <Route path="/pricing.html" element={<Pricing/>}/>
        <Route path="/contact.html" element={<Contact/>}/>
        <Route path="/services-page.html" element={<ServicesPage/>}/>
        <Route path="/team.html" element={<Team/>}/>
        <Route path="/team-details.html" element={<TeamDetails/>}/>
        <Route path="/portfolio.html" element={<Portfolio/>}/>
        <Route path="/faq.html" element={<Faq/>}/>
        <Route path="/404.html" element={<NotFound/>}/>
        <Route path="/post.html" element={<Post/>}/>
        <Route path="/blog2.html" element={<Blog2/>}/>
        <Route path="/blog3.html" element={<Blog3/>}/>
        <Route path="/blog.html" element={<Blog/>}/>
        <Route path="/services-page.html" element={<ServicesPage/>}/>
        {/* Route xử lý khi người dùng gõ sai đường dẫn (404 Not Found) */}
        <Route path="*" element={<div style={{ color: '#fff', padding: '50px', textAlign: 'center' }}><h2>404 - Không tìm thấy trang</h2></div>} />
      </Routes>
    </Router>
  );
}

export default App;
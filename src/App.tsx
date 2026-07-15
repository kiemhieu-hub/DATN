import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';
import BarberLayout from './layouts/BarberLayout';
import { ROUTES, ROLES } from './constants/role';

// Client Pages
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

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';

// Placeholder Pages (sẽ implement sau)
const PlaceholderPage = ({ title }: { title: string }) => (
    <div className="container py-5">
        <h1 className="text-center">{title}</h1>
        <p className="text-center text-muted">Trang này đang được phát triển...</p>
    </div>
);

function App() {
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);

    return (
        <Router>
            <Routes>
                {/* Auth Routes - Không cần đăng nhập */}
                <Route element={<AuthLayout />}>
                    <Route path={ROUTES.LOGIN} element={<Login />} />
                    <Route path={ROUTES.REGISTER} element={<Register />} />
                    <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
                </Route>

                {/* Client Routes - Ai cũng có thể xem */}
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
                <Route path="/post.html" element={<Post />} />
                <Route path="/blog.html" element={<Blog />} />
                <Route path="/blog2.html" element={<Blog2 />} />
                <Route path="/blog3.html" element={<Blog3 />} />

                {/* Admin Routes - Chỉ Admin được phép */}
                <Route
                    element={
                        <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path={ROUTES.ADMIN_DASHBOARD} element={<PlaceholderPage title="Admin Dashboard" />} />
                    <Route path={ROUTES.ADMIN_USERS} element={<PlaceholderPage title="Quản lý người dùng" />} />
                    <Route path={ROUTES.ADMIN_BARBERS} element={<PlaceholderPage title="Quản lý thợ cắt tóc" />} />
                    <Route path={ROUTES.ADMIN_SERVICES} element={<PlaceholderPage title="Quản lý dịch vụ" />} />
                    <Route path={ROUTES.ADMIN_BOOKINGS} element={<PlaceholderPage title="Quản lý lịch hẹn" />} />
                    <Route path={ROUTES.ADMIN_VOUCHERS} element={<PlaceholderPage title="Quản lý voucher" />} />
                    <Route path={ROUTES.ADMIN_REVIEWS} element={<PlaceholderPage title="Quản lý đánh giá" />} />
                </Route>

                {/* Barber Routes - Chỉ Barber được phép */}
                <Route
                    element={
                        <ProtectedRoute allowedRoles={[ROLES.BARBER]}>
                            <BarberLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path={ROUTES.BARBER_DASHBOARD} element={<PlaceholderPage title="Barber Dashboard" />} />
                    <Route path={ROUTES.BARBER_SCHEDULE} element={<PlaceholderPage title="Lịch làm việc" />} />
                    <Route path={ROUTES.BARBER_PROFILE} element={<PlaceholderPage title="Hồ sơ cá nhân" />} />
                    <Route path={ROUTES.BARBER_REVIEWS} element={<PlaceholderPage title="Đánh giá" />} />
                </Route>

                {/* Client Protected Routes - Khách hàng đã đăng nhập */}
                <Route
                    element={
                        <ProtectedRoute allowedRoles={[ROLES.CLIENT]}>
                            <PlaceholderPage title="Client Dashboard" />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/client/dashboard" element={<PlaceholderPage title="Khách hàng Dashboard" />} />
                    <Route path={ROUTES.BOOKING} element={<PlaceholderPage title="Đặt lịch hẹn" />} />
                    <Route path="/client/bookings" element={<PlaceholderPage title="Lịch sử đặt hẹn" />} />
                    <Route path="/client/profile" element={<PlaceholderPage title="Hồ sơ cá nhân" />} />
                </Route>

                {/* Redirect based on role */}
                <Route
                    path="/dashboard"
                    element={
                        isAuthenticated && user ? (
                            <Navigate
                                to={
                                    user.role === ROLES.ADMIN
                                        ? ROUTES.ADMIN_DASHBOARD
                                        : user.role === ROLES.BARBER
                                        ? ROUTES.BARBER_DASHBOARD
                                        : ROUTES.HOME
                                }
                                replace
                            />
                        ) : (
                            <Navigate to={ROUTES.LOGIN} replace />
                        )
                    }
                />

                {/* 404 */}
                <Route path="/404.html" element={<NotFound />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
}

export default App;

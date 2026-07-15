import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/role';

const Header = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate(ROUTES.LOGIN);
    };

    return (
        <nav className="navbar navbar-expand-lg">
            <div className="container">
                {/* Logo */}
                <div className="logo-wrapper">
                    <Link to="/" className="logo">
                        <img src="img/logo.png" className="logo-img" alt="Logo" />
                    </Link>
                </div>

                {/* Button */}
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar" aria-controls="navbar" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"><i className="ti-menu" /></span>
                </button>

                {/* Menu */}
                <div className="collapse navbar-collapse" id="navbar">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link className="nav-link active" to="/">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/about.html">About</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/services.html">Services</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/pricing.html">Pricing</Link>
                        </li>
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">Pages <i className="ti-angle-down" /></a>
                            <ul className="dropdown-menu">
                                <li><Link to="/portfolio.html" className="dropdown-item"><span>Portfolio</span></Link></li>
                                <li><Link to="/team.html" className="dropdown-item"><span>Team</span></Link></li>
                                <li><Link to="/faq.html" className="dropdown-item"><span>Faq</span></Link></li>
                                <li><Link to="/services-page.html" className="dropdown-item"><span>Services Page</span></Link></li>
                                <li><Link to="/team-details.html" className="dropdown-item"><span>Team Details</span></Link></li>
                                <li><Link to="/post.html" className="dropdown-item"><span>Post Single</span></Link></li>
                                <li><Link to="/404.html" className="dropdown-item"><span>NotFound</span></Link></li>
                            </ul>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/contact.html">Contact</Link>
                        </li>

                        {/* Auth Buttons */}
                        {isAuthenticated ? (
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    <span className="user-avatar me-2">
                                        {user?.avatar ? (
                                            <img src={user.avatar} alt="Avatar" className="rounded-circle" style={{ width: 32, height: 32, objectFit: 'cover' }} />
                                        ) : (
                                            <span className="avatar-placeholder">
                                                <i className="fa fa-user" />
                                            </span>
                                        )}
                                    </span>
                                    <span className="user-name">{user?.fullName || 'User'}</span>
                                </a>
                                <ul className="dropdown-menu dropdown-menu-end">
                                    <li>
                                        <div className="dropdown-item-text">
                                            <small className="text-muted">{user?.email}</small>
                                            <span className="badge bg-primary ms-2">{user?.role}</span>
                                        </div>
                                    </li>
                                    <li><hr className="dropdown-divider" /></li>
                                    {user?.role === 'admin' && (
                                        <li>
                                            <Link to={ROUTES.ADMIN_DASHBOARD} className="dropdown-item">
                                                <i className="fa fa-tachometer-alt me-2" />Dashboard
                                            </Link>
                                        </li>
                                    )}
                                    {user?.role === 'barber' && (
                                        <li>
                                            <Link to={ROUTES.BARBER_DASHBOARD} className="dropdown-item">
                                                <i className="fa fa-tachometer-alt me-2" />Dashboard
                                            </Link>
                                        </li>
                                    )}
                                    {user?.role === 'client' && (
                                        <li>
                                            <Link to="/client/dashboard" className="dropdown-item">
                                                <i className="fa fa-tachometer-alt me-2" />Dashboard
                                            </Link>
                                        </li>
                                    )}
                                    <li>
                                        <Link to="/client/profile" className="dropdown-item">
                                            <i className="fa fa-user me-2" />Hồ sơ
                                        </Link>
                                    </li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li>
                                        <button onClick={handleLogout} className="dropdown-item text-danger">
                                            <i className="fa fa-sign-out-alt me-2" />Đăng xuất
                                        </button>
                                    </li>
                                </ul>
                            </li>
                        ) : (
                            <li className="nav-item auth-buttons">
                                <Link to={ROUTES.LOGIN} className="btn btn-outline-light me-2">
                                    <i className="fa fa-sign-in-alt me-1" /> Đăng nhập
                                </Link>
                                <Link to={ROUTES.REGISTER} className="btn btn-primary">
                                    <i className="fa fa-user-plus me-1" /> Đăng ký
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>
            </div>

            <style>{`
                .navbar {
                    position: absolute;
                    width: 100%;
                    z-index: 1000;
                    padding: 20px 0;
                }

                .logo-img {
                    height: 50px;
                }

                .navbar .nav-link {
                    color: #fff !important;
                    font-weight: 500;
                    padding: 10px 18px !important;
                    transition: color 0.3s;
                }

                .navbar .nav-link:hover {
                    color: #d4a574 !important;
                }

                .navbar .nav-link.active {
                    color: #d4a574 !important;
                }

                .dropdown-menu {
                    border: none;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                    border-radius: 8px;
                    padding: 10px;
                }

                .dropdown-item {
                    border-radius: 6px;
                    padding: 10px 16px;
                    transition: all 0.2s;
                }

                .dropdown-item:hover {
                    background: #f8f9fa;
                    color: #d4a574;
                }

                .dropdown-item-text {
                    padding: 8px 16px;
                }

                .avatar-placeholder {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    background: #d4a574;
                    color: white;
                    border-radius: 50%;
                    font-size: 14px;
                }

                .auth-buttons {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-left: 10px;
                }

                .auth-buttons .btn {
                    padding: 8px 16px;
                    border-radius: 6px;
                    font-weight: 500;
                    transition: all 0.3s;
                }

                .auth-buttons .btn-outline-light {
                    border-color: rgba(255, 255, 255, 0.5);
                    color: #fff;
                }

                .auth-buttons .btn-outline-light:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: #fff;
                    color: #fff;
                }

                .auth-buttons .btn-primary {
                    background: #d4a574;
                    border-color: #d4a574;
                }

                .auth-buttons .btn-primary:hover {
                    background: #c49464;
                    border-color: #c49464;
                }

                .user-avatar img {
                    border: 2px solid #d4a574;
                }

                .user-name {
                    max-width: 120px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            `}</style>
        </nav>
    );
};

export default Header;

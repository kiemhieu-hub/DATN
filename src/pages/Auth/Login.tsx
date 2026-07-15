import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useAuth';
import { login, clearError } from '../../store/slices/authSlice';
import { ROUTES } from '../../constants/role';

const Login = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { isLoading, error } = useAppSelector((state) => state.auth);

    const [loginData, setLoginData] = useState({
        phone: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLoginData((prev) => ({ ...prev, [name]: value }));
        if (error) dispatch(clearError());
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await dispatch(login(loginData));
        if (login.fulfilled.match(result)) {
            const user = result.payload.user;
            if (user.role === 'admin') {
                navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
            } else if (user.role === 'barber') {
                navigate(ROUTES.BARBER_DASHBOARD, { replace: true });
            } else {
                navigate(ROUTES.HOME, { replace: true });
            }
        }
    };

    return (
        <div className="auth-page-wrapper">
            <div className="auth-card login-card">
                <div className="auth-card-header">
                    <h2>Đăng nhập</h2>
                    <p>Chào mừng bạn quay trở lại!</p>
                </div>

                {error && <div className="alert-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Số điện thoại hoặc Email</label>
                        <input
                            type="text"
                            name="phone"
                            value={loginData.phone}
                            onChange={handleChange}
                            placeholder="Nhập số điện thoại hoặc email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Mật khẩu</label>
                        <div className="password-input">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={loginData.password}
                                onChange={handleChange}
                                placeholder="Nhập mật khẩu"
                                required
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}>
                                <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={isLoading}>
                        {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>

                    <div className="auth-footer">
                        <span>Chưa có tài khoản? </span>
                        <Link to={ROUTES.REGISTER}>Đăng ký</Link>
                    </div>

                    <div className="forgot-password-link">
                        <Link to={ROUTES.FORGOT_PASSWORD}>Quên mật khẩu?</Link>
                    </div>
                </form>
            </div>

            <style>{`
                .auth-page-wrapper {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                    padding: 40px 20px;
                    position: relative;
                    overflow: hidden;
                }

                .auth-page-wrapper::before {
                    content: '';
                    position: absolute;
                    width: 600px;
                    height: 600px;
                    background: radial-gradient(circle, rgba(212, 165, 116, 0.15) 0%, transparent 70%);
                    top: -150px;
                    right: -150px;
                    animation: pulse 8s ease-in-out infinite;
                }

                .auth-page-wrapper::after {
                    content: '';
                    position: absolute;
                    width: 500px;
                    height: 500px;
                    background: radial-gradient(circle, rgba(212, 165, 116, 0.1) 0%, transparent 70%);
                    bottom: -150px;
                    left: -150px;
                    animation: pulse 10s ease-in-out infinite reverse;
                }

                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                }

                .auth-card {
                    background: #fff;
                    border-radius: 24px;
                    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
                    padding: 60px 70px;
                    width: 95%;
                    max-width: 1600px;
                    position: relative;
                    z-index: 1;
                }

                .auth-card-header {
                    text-align: center;
                    margin-bottom: 45px;
                }

                .auth-card-header h2 {
                    font-size: 42px;
                    font-weight: 800;
                    color: #333;
                    margin-bottom: 14px;
                    letter-spacing: -0.5px;
                }

                .auth-card-header p {
                    color: #666;
                    font-size: 18px;
                }

                .auth-form .form-group {
                    margin-bottom: 28px;
                }

                .auth-form label {
                    display: block;
                    font-weight: 600;
                    color: #444;
                    font-size: 17px;
                    margin-bottom: 10px;
                }

                .auth-form input[type="text"],
                .auth-form input[type="tel"],
                .auth-form input[type="email"],
                .auth-form input[type="password"] {
                    width: 100%;
                    padding: 18px 22px;
                    border: 2px solid #e0e0e0;
                    border-radius: 14px;
                    font-size: 17px;
                    transition: all 0.3s;
                    box-sizing: border-box;
                }

                .auth-form input:focus {
                    outline: none;
                    border-color: #d4a574;
                    box-shadow: 0 0 0 4px rgba(212, 165, 116, 0.2);
                }

                .password-input {
                    position: relative;
                    display: flex;
                }

                .password-input input {
                    flex: 1;
                    border: 2px solid #e0e0e0;
                    border-radius: 14px;
                    padding-right: 60px;
                    font-size: 17px;
                    padding: 18px 60px 18px 22px;
                }

                .password-input input:focus {
                    border-color: #d4a574;
                    box-shadow: 0 0 0 4px rgba(212, 165, 116, 0.2);
                }

                .password-input button {
                    position: absolute;
                    right: 0;
                    top: 0;
                    height: 100%;
                    padding: 0 20px;
                    border: none;
                    background: transparent;
                    color: #888;
                    cursor: pointer;
                    border-radius: 0 14px 14px 0;
                    font-size: 20px;
                }

                .password-input button:hover {
                    color: #d4a574;
                }

                .forgot-password {
                    text-align: right;
                    margin-bottom: 20px;
                    display: none;
                }

                .forgot-password a {
                    color: #d4a574;
                    text-decoration: none;
                    font-size: 16px;
                    font-weight: 500;
                }

                .forgot-password a:hover {
                    text-decoration: underline;
                }

                .forgot-password-link {
                    text-align: center;
                    margin-top: 20px;
                }

                .forgot-password-link a {
                    color: #d4a574;
                    text-decoration: none;
                    font-size: 15px;
                    transition: color 0.3s;
                }

                .forgot-password-link a:hover {
                    color: #d4a574;
                    text-decoration: underline;
                }

                .btn-primary {
                    width: 100%;
                    padding: 20px;
                    background: linear-gradient(135deg, #d4a574 0%, #c49464 100%);
                    border: none;
                    border-radius: 14px;
                    color: #fff;
                    font-size: 20px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s;
                    margin-top: 20px;
                    white-space: nowrap;
                }

                .btn-primary:hover {
                    background: linear-gradient(135deg, #c49464 0%, #b38454 100%);
                    transform: translateY(-3px);
                    box-shadow: 0 8px 25px rgba(212, 165, 116, 0.5);
                }

                .btn-primary:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }

                .auth-footer {
                    text-align: center;
                    margin-top: 32px;
                    font-size: 17px;
                    color: #555;
                }

                .auth-footer a {
                    color: #d4a574;
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 17px;
                }

                .auth-footer a:hover {
                    text-decoration: underline;
                }

                .alert-error {
                    background: linear-gradient(135deg, #fff5f5 0%, #ffe0e0 100%);
                    border: 1px solid #fcc;
                    color: #c33;
                    border-radius: 14px;
                    padding: 18px 22px;
                    font-size: 16px;
                    margin-bottom: 28px;
                }
            `}</style>
        </div>
    );
};

export default Login;

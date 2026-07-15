import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useAuth';
import { registerClient, clearError } from '../../store/slices/authSlice';
import { ROUTES } from '../../constants/role';

const Register = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { isLoading, error } = useAppSelector((state) => state.auth);

    const [registerData, setRegisterData] = useState({
        fullName: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false,
    });
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

        setRegisterData((prev) => ({ ...prev, [name]: newValue }));

        if (validationErrors[name]) {
            setValidationErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
        if (error) dispatch(clearError());
    };

    const validate = (): boolean => {
        const errors: Record<string, string> = {};

        if (!registerData.fullName.trim()) errors.fullName = 'Vui lòng nhập họ tên';
        if (!registerData.phone.trim()) {
            errors.phone = 'Vui lòng nhập số điện thoại';
        } else if (!/^[0-9]{10,11}$/.test(registerData.phone)) {
            errors.phone = 'Số điện thoại không hợp lệ';
        }
        if (!registerData.email.trim()) {
            errors.email = 'Vui lòng nhập email';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
            errors.email = 'Email không hợp lệ';
        }
        if (!registerData.password) {
            errors.password = 'Vui lòng nhập mật khẩu';
        } else if (registerData.password.length < 6) {
            errors.password = 'Mật khẩu ít nhất 6 ký tự';
        }
        if (registerData.password !== registerData.confirmPassword) {
            errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }
        if (!registerData.agreeTerms) {
            errors.agreeTerms = 'Bạn cần đồng ý với điều khoản';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        const result = await dispatch(registerClient({
            fullName: registerData.fullName,
            phone: registerData.phone,
            email: registerData.email,
            password: registerData.password,
            confirmPassword: registerData.confirmPassword,
        }));

        if (registerClient.fulfilled.match(result)) {
            navigate(ROUTES.HOME, { replace: true });
        }
    };

    return (
        <div className="auth-page-wrapper">
            <div className="auth-card">
                <div className="auth-card-header">
                    <h2>Đăng ký</h2>
                    <p>Tạo tài khoản mới để trải nghiệm dịch vụ</p>
                </div>

                {error && <div className="alert-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Họ và tên <span className="text-danger">*</span></label>
                        <input
                            type="text"
                            name="fullName"
                            value={registerData.fullName}
                            onChange={handleChange}
                            placeholder="Nhập họ và tên"
                            className={validationErrors.fullName ? 'error' : ''}
                        />
                        {validationErrors.fullName && <span className="error-text">{validationErrors.fullName}</span>}
                    </div>

                    <div className="form-group">
                        <label>Số điện thoại <span className="text-danger">*</span></label>
                        <input
                            type="tel"
                            name="phone"
                            value={registerData.phone}
                            onChange={handleChange}
                            placeholder="Nhập số điện thoại"
                            className={validationErrors.phone ? 'error' : ''}
                        />
                        {validationErrors.phone && <span className="error-text">{validationErrors.phone}</span>}
                    </div>

                    <div className="form-group">
                        <label>Email <span className="text-danger">*</span></label>
                        <input
                            type="email"
                            name="email"
                            value={registerData.email}
                            onChange={handleChange}
                            placeholder="Nhập địa chỉ email"
                            className={validationErrors.email ? 'error' : ''}
                        />
                        {validationErrors.email && <span className="error-text">{validationErrors.email}</span>}
                    </div>

                    <div className="form-row-2">
                        <div className="form-group">
                            <label>Mật khẩu <span className="text-danger">*</span></label>
                            <input
                                type="password"
                                name="password"
                                value={registerData.password}
                                onChange={handleChange}
                                placeholder="Mật khẩu"
                                className={validationErrors.password ? 'error' : ''}
                            />
                            {validationErrors.password && <span className="error-text">{validationErrors.password}</span>}
                        </div>

                        <div className="form-group">
                            <label>Xác nhận <span className="text-danger">*</span></label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={registerData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Xác nhận mật khẩu"
                                className={validationErrors.confirmPassword ? 'error' : ''}
                            />
                            {validationErrors.confirmPassword && <span className="error-text">{validationErrors.confirmPassword}</span>}
                        </div>
                    </div>

                    <label className="checkbox-label terms-label">
                        <input
                            type="checkbox"
                            name="agreeTerms"
                            checked={registerData.agreeTerms}
                            onChange={handleChange}
                        />
                        <span>Tôi đồng ý với <a href="#">Điều khoản</a> và <a href="#">Chính sách bảo mật</a></span>
                    </label>
                    {validationErrors.agreeTerms && <span className="error-text">{validationErrors.agreeTerms}</span>}

                    <button type="submit" className="btn-primary" disabled={isLoading}>
                        {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
                    </button>

                    <div className="auth-footer">
                        <span>Đã có tài khoản? </span>
                        <Link to={ROUTES.LOGIN}>Đăng nhập</Link>
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
                    padding: 55px 65px;
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

                .auth-form input.error {
                    border-color: #dc3545;
                }

                .error-text {
                    color: #dc3545;
                    font-size: 14px;
                    margin-top: 6px;
                    display: block;
                }

                .form-row-2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                }

                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                    font-size: 16px;
                    color: #333;
                    margin-bottom: 14px;
                }

                .checkbox-label input[type="checkbox"] {
                    width: 22px;
                    height: 22px;
                    accent-color: #d4a574;
                }

                .terms-label a {
                    color: #d4a574;
                    text-decoration: none;
                    font-weight: 500;
                }

                .terms-label a:hover {
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

                .text-danger {
                    color: #dc3545;
                }

                @media (max-width: 500px) {
                    .form-row-2 {
                        grid-template-columns: 1fr;
                    }
                    }
                }
            `}</style>
        </div>
    );
};

export default Register;

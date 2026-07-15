import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/role';
import { authService } from '../../services/auth.service';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<'request' | 'verify' | 'reset'>('request');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const handleRequestOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await authService.forgotPassword({ phone });
            setSuccess('Mã OTP đã được gửi đến số điện thoại của bạn');
            setStep('verify');
            setCountdown(60);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Không thể gửi mã OTP. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const result = await authService.verifyOtp(phone, otp);
            if (result.valid) {
                setStep('reset');
            } else {
                setError('Mã OTP không hợp lệ hoặc đã hết hạn');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Mã OTP không hợp lệ');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        if (newPassword.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setIsLoading(true);

        try {
            await authService.resetPassword({
                phone,
                otp,
                newPassword,
                confirmPassword,
            });
            setSuccess('Mật khẩu đã được đặt lại thành công!');
            setTimeout(() => {
                navigate(ROUTES.LOGIN);
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Không thể đặt lại mật khẩu');
        } finally {
            setIsLoading(false);
        }
    };

    const resendOTP = async () => {
        if (countdown > 0) return;
        setError(null);
        setIsLoading(true);
        try {
            await authService.forgotPassword({ phone });
            setSuccess('Mã OTP mới đã được gửi');
            setCountdown(60);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Không thể gửi lại mã OTP');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <div className="auth-header">
                    <h2>Quên mật khẩu</h2>
                    <p>
                        {step === 'request' && 'Nhập số điện thoại để lấy lại mật khẩu'}
                        {step === 'verify' && 'Nhập mã OTP đã được gửi đến số điện thoại'}
                        {step === 'reset' && 'Nhập mật khẩu mới'}
                    </p>
                </div>

                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="alert alert-success" role="alert">
                        {success}
                    </div>
                )}

                {/* Step 1: Request OTP */}
                {step === 'request' && (
                    <form onSubmit={handleRequestOTP} className="auth-form">
                        <div className="mb-4">
                            <label htmlFor="phone" className="form-label">
                                Số điện thoại
                            </label>
                            <input
                                type="tel"
                                className="form-control"
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Nhập số điện thoại đã đăng ký"
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Đang gửi...
                                </>
                            ) : (
                                'Gửi mã OTP'
                            )}
                        </button>
                    </form>
                )}

                {/* Step 2: Verify OTP */}
                {step === 'verify' && (
                    <form onSubmit={handleVerifyOTP} className="auth-form">
                        <div className="mb-3">
                            <label htmlFor="phone" className="form-label">
                                Số điện thoại
                            </label>
                            <input
                                type="tel"
                                className="form-control"
                                id="phone"
                                value={phone}
                                disabled
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="otp" className="form-label">
                                Mã OTP
                            </label>
                            <input
                                type="text"
                                className="form-control otp-input"
                                id="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="Nhập 6 chữ số"
                                maxLength={6}
                                required
                            />
                        </div>

                        <div className="resend-section mb-4">
                            <span className="text-muted">Không nhận được mã?</span>
                            <button
                                type="button"
                                className="btn btn-link p-0 text-decoration-none"
                                onClick={resendOTP}
                                disabled={countdown > 0 || isLoading}
                            >
                                {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại mã'}
                            </button>
                        </div>

                        <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Đang xác thực...
                                </>
                            ) : (
                                'Xác nhận'
                            )}
                        </button>
                    </form>
                )}

                {/* Step 3: Reset Password */}
                {step === 'reset' && (
                    <form onSubmit={handleResetPassword} className="auth-form">
                        <div className="mb-3">
                            <label htmlFor="newPassword" className="form-label">
                                Mật khẩu mới
                            </label>
                            <div className="input-group">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-control"
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu mới"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                </button>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="confirmPassword" className="form-label">
                                Xác nhận mật khẩu mới
                            </label>
                            <input
                                type="password"
                                className="form-control"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Nhập lại mật khẩu mới"
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Đang đặt lại...
                                </>
                            ) : (
                                'Đặt lại mật khẩu'
                            )}
                        </button>
                    </form>
                )}

                <div className="auth-footer">
                    <p>
                        <Link to={ROUTES.LOGIN} className="text-decoration-none">
                            <i className="fa fa-arrow-left me-2"></i>
                            Quay lại đăng nhập
                        </Link>
                    </p>
                </div>
            </div>

            <style>{`
                .auth-container {
                    width: 100%;
                    max-width: 420px;
                    padding: 20px;
                }

                .auth-box {
                    background: #fff;
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
                    padding: 40px;
                }

                .auth-header {
                    text-align: center;
                    margin-bottom: 30px;
                }

                .auth-header h2 {
                    font-size: 24px;
                    font-weight: 700;
                    color: #333;
                    margin-bottom: 8px;
                }

                .auth-header p {
                    color: #666;
                    font-size: 14px;
                }

                .auth-form .form-label {
                    font-weight: 500;
                    color: #333;
                    font-size: 14px;
                }

                .auth-form .form-control {
                    border-radius: 8px;
                    padding: 12px 16px;
                    border: 1px solid #ddd;
                    font-size: 14px;
                }

                .auth-form .form-control:focus {
                    border-color: #d4a574;
                    box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.2);
                }

                .otp-input {
                    text-align: center;
                    font-size: 24px;
                    letter-spacing: 8px;
                    font-weight: 600;
                }

                .resend-section {
                    text-align: center;
                    font-size: 13px;
                }

                .resend-section .btn-link {
                    color: #d4a574;
                    font-weight: 500;
                }

                .resend-section .btn-link:disabled {
                    color: #999;
                }

                .auth-form .btn-primary {
                    background: #d4a574;
                    border-color: #d4a574;
                    padding: 12px;
                    font-weight: 600;
                    border-radius: 8px;
                    font-size: 16px;
                }

                .auth-form .btn-primary:hover {
                    background: #c49464;
                    border-color: #c49464;
                }

                .auth-form .btn-primary:disabled {
                    opacity: 0.7;
                }

                .auth-footer {
                    text-align: center;
                    margin-top: 24px;
                }

                .auth-footer p {
                    color: #666;
                    font-size: 14px;
                }

                .auth-footer a {
                    color: #d4a574;
                    font-weight: 500;
                }

                .alert {
                    border-radius: 8px;
                    padding: 12px 16px;
                    font-size: 14px;
                    margin-bottom: 20px;
                }

                .alert-danger {
                    background: #fee;
                    border: 1px solid #fcc;
                    color: #c33;
                }

                .alert-success {
                    background: #efe;
                    border: 1px solid #cfc;
                    color: #3c3;
                }
            `}</style>
        </div>
    );
};

export default ForgotPassword;

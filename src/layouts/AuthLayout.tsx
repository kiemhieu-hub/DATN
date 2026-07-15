import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
    return (
        <div className="auth-layout">
            <div className="auth-background">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
            </div>
            <div className="auth-content">
                <Outlet />
            </div>
            <style>{`
                .auth-layout {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                    position: relative;
                    overflow: hidden;
                }

                .auth-background {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    overflow: hidden;
                }

                .shape {
                    position: absolute;
                    border-radius: 50%;
                    background: linear-gradient(45deg, rgba(212, 165, 116, 0.1), rgba(212, 165, 116, 0.05));
                }

                .shape-1 {
                    width: 400px;
                    height: 400px;
                    top: -100px;
                    right: -100px;
                    animation: float 15s ease-in-out infinite;
                }

                .shape-2 {
                    width: 300px;
                    height: 300px;
                    bottom: -50px;
                    left: -50px;
                    animation: float 12s ease-in-out infinite reverse;
                }

                .shape-3 {
                    width: 200px;
                    height: 200px;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    animation: pulse 8s ease-in-out infinite;
                }

                @keyframes float {
                    0%, 100% {
                        transform: translateY(0) rotate(0deg);
                    }
                    50% {
                        transform: translateY(-30px) rotate(10deg);
                    }
                }

                @keyframes pulse {
                    0%, 100% {
                        transform: translate(-50%, -50%) scale(1);
                        opacity: 0.3;
                    }
                    50% {
                        transform: translate(-50%, -50%) scale(1.2);
                        opacity: 0.5;
                    }
                }

                .auth-content {
                    position: relative;
                    z-index: 1;
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    min-height: 100vh;
                    padding: 60px 20px;
                }
            `}</style>
        </div>
    );
};

export default AuthLayout;

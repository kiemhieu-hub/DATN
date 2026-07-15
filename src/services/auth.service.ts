import axios from 'axios';
import type {
    AuthResponse,
    LoginCredentials,
    RegisterClientData,
    ForgotPasswordData,
    ResetPasswordData,
    User,
} from '../types/User';

// Tạo axios instance với base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || true; // Mặc định bật mock

// Mock data cho development
const MOCK_USERS_KEY = 'mock_users';

const loadMockUsers = (): (User & { password: string })[] => {
    const stored = localStorage.getItem(MOCK_USERS_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            return [];
        }
    }
    const defaultUsers: (User & { password: string })[] = [
        {
            id: '1',
            fullName: 'Admin Perukar',
            phone: '0123456789',
            email: 'admin@perukar.com',
            password: 'admin123',
            role: 'admin',
            avatar: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: '2',
            fullName: 'Nguyễn Văn Barber',
            phone: '0987654321',
            email: 'barber@perukar.com',
            password: 'barber123',
            role: 'barber',
            avatar: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: '3',
            fullName: 'Khách Hàng Demo',
            phone: '0909123456',
            email: 'customer@test.com',
            password: 'customer123',
            role: 'client',
            avatar: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ];
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
};

const saveMockUsers = (users: (User & { password: string })[]) => {
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
};

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 5000,
});

// Interceptor để thêm token vào request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor để xử lý response và refresh token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
                    refreshToken,
                });

                const { accessToken, refreshToken: newRefreshToken } = response.data;
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Mock functions
const mockLogin = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const mockUsers = loadMockUsers();
    const identifier = credentials.phone.trim().toLowerCase();
    const user = mockUsers.find(
        (u) =>
            (u.phone === credentials.phone || u.email.toLowerCase() === identifier) &&
            u.password === credentials.password
    );
    if (!user) {
        throw { response: { data: { message: 'Số điện thoại, email hoặc mật khẩu không đúng' } } };
    }
    const { password, ...userData } = user;
    return {
        user: userData,
        accessToken: 'mock_access_token_' + user.id,
        refreshToken: 'mock_refresh_token_' + user.id,
    };
};

const mockRegisterClient = async (data: RegisterClientData): Promise<AuthResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const mockUsers = loadMockUsers();
    const existingUser = mockUsers.find((u) => u.phone === data.phone || u.email === data.email);
    if (existingUser) {
        throw { response: { data: { message: 'Số điện thoại hoặc email đã được sử dụng' } } };
    }
    const newUser: User & { password: string } = {
        id: String(Date.now()),
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        password: data.password,
        role: 'client',
        avatar: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    mockUsers.push(newUser);
    saveMockUsers(mockUsers);
    const { password, ...userData } = newUser;
    return {
        user: userData,
        accessToken: 'mock_access_token_' + newUser.id,
        refreshToken: 'mock_refresh_token_' + newUser.id,
    };
};

// Auth Service
export const authService = {
    // Đăng nhập
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        if (USE_MOCK) return mockLogin(credentials);
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        return response.data;
    },

    // Đăng ký khách hàng
    registerClient: async (data: RegisterClientData): Promise<AuthResponse> => {
        if (USE_MOCK) return mockRegisterClient(data);
        const response = await api.post<AuthResponse>('/auth/register/client', data);
        return response.data;
    },

    // Đăng xuất
    logout: async (): Promise<void> => {
        if (USE_MOCK) return;
        await api.post('/auth/logout');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    },

    // Quên mật khẩu - gửi OTP
    forgotPassword: async (data: ForgotPasswordData): Promise<{ message: string }> => {
        if (USE_MOCK) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            return { message: 'Mã OTP đã được gửi đến số điện thoại của bạn' };
        }
        const response = await api.post<{ message: string }>('/auth/forgot-password', data);
        return response.data;
    },

    // Xác thực OTP
    verifyOtp: async (phone: string, otp: string): Promise<{ valid: boolean }> => {
        if (USE_MOCK) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            return { valid: otp === '123456' };
        }
        const response = await api.post<{ valid: boolean }>('/auth/verify-otp', { phone, otp });
        return response.data;
    },

    // Reset mật khẩu
    resetPassword: async (data: ResetPasswordData): Promise<AuthResponse> => {
        if (USE_MOCK) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            return { message: 'Mật khẩu đã được đặt lại thành công' } as any;
        }
        const response = await api.post<AuthResponse>('/auth/reset-password', data);
        return response.data;
    },

    // Lấy thông tin user hiện tại
    getCurrentUser: async (): Promise<User> => {
        if (USE_MOCK) {
            const token = localStorage.getItem('accessToken');
            if (!token) throw new Error('No token');
            const userId = token.replace('mock_access_token_', '');
            const mockUsers = loadMockUsers();
            const user = mockUsers.find((u) => u.id === userId);
            if (!user) throw new Error('User not found');
            const { password, ...userData } = user;
            return userData;
        }
        const response = await api.get<User>('/auth/me');
        return response.data;
    },

    // Cập nhật profile
    updateProfile: async (data: Partial<User>): Promise<User> => {
        if (USE_MOCK) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            return data as User;
        }
        const response = await api.patch<User>('/auth/profile', data);
        return response.data;
    },

    // Đổi mật khẩu
    changePassword: async (oldPassword: string, newPassword: string): Promise<{ message: string }> => {
        if (USE_MOCK) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            return { message: 'Đổi mật khẩu thành công' };
        }
        const response = await api.post<{ message: string }>('/auth/change-password', {
            oldPassword,
            newPassword,
        });
        return response.data;
    },
};

export default api;

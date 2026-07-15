// User Role Types
export type UserRole = 'admin' | 'barber' | 'client';

// Base User Interface
export interface User {
    id: string;
    email: string;
    phone: string;
    fullName: string;
    avatar?: string;
    role: UserRole;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// Barber Profile Interface
export interface BarberProfile extends User {
    specialty: string;
    experience: number;
    bio?: string;
    rating: number;
    isVerified: boolean;
    barberLicense?: string;
    workingHours?: WorkingHours;
}

export interface WorkingHours {
    monday: { start: string; end: string; isOff: boolean };
    tuesday: { start: string; end: string; isOff: boolean };
    wednesday: { start: string; end: string; isOff: boolean };
    thursday: { start: string; end: string; isOff: boolean };
    friday: { start: string; end: string; isOff: boolean };
    saturday: { start: string; end: string; isOff: boolean };
    sunday: { start: string; end: string; isOff: boolean };
}

// Auth Response Interface
export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

// Login Credentials
export interface LoginCredentials {
    phone: string;
    password: string;
}

// Register Data for Client
export interface RegisterClientData {
    fullName: string;
    phone: string;
    email: string;
    password: string;
    confirmPassword: string;
}

// Register Data for Barber
export interface RegisterBarberData extends RegisterClientData {
    specialty: string;
    experience: number;
    bio?: string;
}

// Forgot Password
export interface ForgotPasswordData {
    phone: string;
}

export interface ResetPasswordData {
    phone: string;
    otp: string;
    newPassword: string;
    confirmPassword: string;
}

// API Error Response
export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
    statusCode: number;
}

// Auth State for Redux
export interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

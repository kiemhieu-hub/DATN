export const ROLES = {
    ADMIN: 'admin',
    BARBER: 'barber',
    CLIENT: 'client',
} as const;

export type RoleType = typeof ROLES.ADMIN | typeof ROLES.BARBER | typeof ROLES.CLIENT;

export const ROLE_LABELS: Record<RoleType, string> = {
    [ROLES.ADMIN]: 'Quản trị viên',
    [ROLES.BARBER]: 'Thợ cắt tóc',
    [ROLES.CLIENT]: 'Khách hàng',
};

export const ROUTES = {
    // Auth Routes
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',

    // Client Routes
    HOME: '/',
    ABOUT: '/about.html',
    SERVICES: '/services.html',
    PRICING: '/pricing.html',
    CONTACT: '/contact.html',
    TEAM: '/team.html',
    BOOKING: '/booking',

    // Admin Routes
    ADMIN_DASHBOARD: '/admin',
    ADMIN_USERS: '/admin/users',
    ADMIN_BARBERS: '/admin/barbers',
    ADMIN_SERVICES: '/admin/services',
    ADMIN_BOOKINGS: '/admin/bookings',
    ADMIN_VOUCHERS: '/admin/vouchers',
    ADMIN_REVIEWS: '/admin/reviews',

    // Barber Routes
    BARBER_DASHBOARD: '/barber',
    BARBER_SCHEDULE: '/barber/schedule',
    BARBER_PROFILE: '/barber/profile',
    BARBER_REVIEWS: '/barber/reviews',
} as const;

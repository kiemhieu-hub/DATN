export const queryKeys = {
  all: ["thads"] as const,
  auth: (scope = "client") => ["thads", "auth", scope] as const,
  catalog: ["thads", "catalog"] as const,
  appointments: (scope: string, filters?: unknown) =>
    ["thads", "appointments", scope, filters ?? {}] as const,
  adminDashboard: (filters?: unknown) =>
    ["thads", "admin-dashboard", filters ?? {}] as const,
  barberDashboard: (filters?: unknown) =>
    ["thads", "barber-dashboard", filters ?? {}] as const,
  adminServices: (filters?: unknown) =>
    ["thads", "admin-services", filters ?? {}] as const,
  serviceCategories: ["thads", "service-categories"] as const,
  vouchers: ["thads", "vouchers"] as const,
  payments: (filters?: unknown) => ["thads", "payments", filters ?? {}] as const,
  refunds: ["thads", "refunds"] as const,
  reviews: (filters?: unknown) => ["thads", "reviews", filters ?? {}] as const,
  users: (filters?: unknown) => ["thads", "users", filters ?? {}] as const,
  barbers: (filters?: unknown) => ["thads", "barbers", filters ?? {}] as const,
  favorites: (userId?: string) => ["thads", "favorites", userId ?? "guest"] as const,
  hairstyleGallery: ["thads", "hairstyle-gallery"] as const,
  staffNotifications: (scope: string) => ["thads", "notifications", scope] as const,
  barberSchedules: (filters?: unknown) => ["thads", "barber-schedules", filters ?? {}] as const,
  profile: (scope: string) => ["thads", "profile", scope] as const,
  bookingCatalog: ["thads", "booking", "catalog"] as const,
  bookingSlots: (barberId: string, serviceIds: string[], date: string) =>
    ["thads", "booking", "slots", barberId, serviceIds, date] as const,
  availableVouchers: (total: number, serviceIds: string[]) =>
    ["thads", "booking", "vouchers", total, serviceIds] as const,
  authSessions: ["thads", "auth", "sessions"] as const,
  publicHairstyles: ["thads", "hairstyles", "public"] as const,
  barberProfile: ["thads", "barber", "profile"] as const,
  barberWorkingSchedule: ["thads", "barber", "working-schedule"] as const,
};

export const invalidateBusinessData = async (): Promise<void> => {
  await queryClient.invalidateQueries({ queryKey: queryKeys.all });
};
import { queryClient } from "./queryClient";

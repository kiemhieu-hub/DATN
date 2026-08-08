import api from "./api";
import type {
  AvailableVoucher,
  VoucherCalculation,
} from "../types/Voucher";

export const validateVoucher = async (
  code: string,
  serviceIds: string[],
  barberIds: string[]
) => {
  const response = await api.post<{
    success: boolean;
    message: string;
    calculation: VoucherCalculation;
  }>("/vouchers/validate", { code, serviceIds, barberIds });

  return response.data;
};

export const getAvailableVouchers = async (
  serviceIds: string[],
  barberIds: string[]
) => {
  const response = await api.post<{
    success: boolean;
    vouchers: AvailableVoucher[];
  }>("/vouchers/available", {
    serviceIds,
    barberIds,
  });

  return response.data;
};

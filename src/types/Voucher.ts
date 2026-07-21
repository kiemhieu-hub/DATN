import type { ServiceGroup } from "./Catalog";

export type VoucherType = "PERCENT" | "FIXED";

export interface VoucherBarber {
  _id: string;
  fullName: string;
  email: string;
}

export interface Voucher {
  _id: string;
  code: string;
  name: string;
  description: string;
  type: VoucherType;
  value: number;
  maxDiscount: number;
  minOrder: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  applicableServiceGroups: ServiceGroup[];
  applicableBarbers: VoucherBarber[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VoucherPayload {
  code: string;
  name: string;
  description: string;
  type: VoucherType;
  value: number;
  maxDiscount: number;
  minOrder: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  perUserLimit: number;
  applicableServiceGroups: ServiceGroup[];
  applicableBarbers: string[];
  isActive: boolean;
}

export interface VoucherCalculation {
  code: string;
  type: VoucherType;
  value: number;
  discountPercent: number;
  discountAmount: number;
  subtotal: number;
  total: number;
  depositRequired: boolean;
  depositAmount: number;
}

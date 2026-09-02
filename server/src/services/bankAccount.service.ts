import AppError from "../utils/AppError";

export interface BankOption { code: string; bin: string; name: string; shortName: string }

export const listBanks = async (): Promise<BankOption[]> => {
  const response = await fetch("https://api.vietqr.io/v2/banks");
  if (!response.ok) throw new AppError("Không thể tải danh sách ngân hàng", 502);
  const body = await response.json() as { data?: Array<{ code: string; bin: string; name: string; shortName: string }> };
  return (body.data ?? []).map(({ code, bin, name, shortName }) => ({ code, bin: String(bin), name, shortName }));
};

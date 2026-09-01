import AppError from "../utils/AppError";

export interface BankOption { code: string; name: string; shortName: string }

export const listBanks = async (): Promise<BankOption[]> => {
  const response = await fetch("https://api.vietqr.io/v2/banks");
  if (!response.ok) throw new AppError("Không thể tải danh sách ngân hàng", 502);
  const body = await response.json() as { data?: Array<{ code: string; name: string; shortName: string }> };
  return (body.data ?? []).map(({ code, name, shortName }) => ({ code, name, shortName }));
};

export const lookupBankAccount = async (bankCode: string, accountNumber: string) => {
  const clientId = process.env.VIETQR_CLIENT_ID?.trim();
  const apiKey = process.env.VIETQR_API_KEY?.trim();
  if (!clientId || !apiKey) {
    throw new AppError("Chưa cấu hình VIETQR_CLIENT_ID và VIETQR_API_KEY để kiểm tra tài khoản", 503);
  }
  if (!/^[A-Z0-9]{2,20}$/.test(bankCode) || !/^\d{6,20}$/.test(accountNumber)) {
    throw new AppError("Ngân hàng hoặc số tài khoản không hợp lệ", 400);
  }
  const response = await fetch("https://api.vietqr.io/v2/lookup", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-client-id": clientId, "x-api-key": apiKey },
    body: JSON.stringify({ bin: bankCode, accountNumber }),
  });
  const body = await response.json() as { code?: string; desc?: string; data?: { accountName?: string } };
  if (!response.ok || body.code !== "00" || !body.data?.accountName) {
    throw new AppError(body.desc || "Không tìm thấy tài khoản ngân hàng", 400);
  }
  return { accountName: body.data.accountName.trim().toUpperCase() };
};

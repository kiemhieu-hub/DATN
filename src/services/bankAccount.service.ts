import api from "./api";

export interface BankOption { code: string; name: string; shortName: string }
export const getBanks = async () => (await api.get<{ success: boolean; banks: BankOption[] }>("/banks")).data;
export const verifyBankAccount = async (bankCode: string, accountNumber: string) =>
  (await api.post<{ success: boolean; accountName: string }>("/banks/lookup", { bankCode, accountNumber })).data;

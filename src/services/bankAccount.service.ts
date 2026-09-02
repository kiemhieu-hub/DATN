import api from "./api";

export interface BankOption { code: string; bin: string; name: string; shortName: string }
export const getBanks = async () => (await api.get<{ success: boolean; banks: BankOption[] }>("/banks")).data;

export const parseVietnamDateTime = (date: string, time = "00:00"): Date => new Date(`${date}T${time}:00+07:00`);
export const getVietnamDateString = (date = new Date()): string => date.toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
export const getDateDayOfWeek = (date: string): number => new Date(`${date}T00:00:00Z`).getUTCDay();

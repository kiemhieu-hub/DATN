export interface SlotAssignment { barber: string; startTime: string; endTime: string }

const minutes = (value: string): number => {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
};

export const buildAppointmentSlotKeys = (date: string, assignments: SlotAssignment[]): string[] => {
  const keys = new Set<string>();
  for (const assignment of assignments) {
    const start = Math.floor(minutes(assignment.startTime) / 5);
    const end = Math.ceil(minutes(assignment.endTime) / 5);
    for (let slot = start; slot < end; slot += 1) keys.add(`${assignment.barber}:${date}:${slot}`);
  }
  return [...keys];
};

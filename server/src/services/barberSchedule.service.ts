import mongoose from "mongoose";

import BarberSchedule, {
  type IScheduleBreak,
} from "../models/BarberSchedule";
import BarberScheduleOverride from "../models/BarberScheduleOverride";
import BarberLeaveRequest from "../models/BarberLeaveRequest";

import User from "../models/User";
import AppError from "../utils/AppError";

interface UpdateScheduleDayInput {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breaks?: IScheduleBreak[];
  isWorking: boolean;
}

interface UpdateWeeklyScheduleInput {
  schedules: UpdateScheduleDayInput[];
}

export interface RegisterLeaveInput {
  staffId: string;
  startDate: string;
  endDate: string;
  reasonType: string;
  note?: string;
  createdBy: string;
}

const TIME_PATTERN =
  /^([01]\d|2[0-3]):([0-5]\d)$/;

const assertObjectId = (
  value: string,
  message: string
): void => {
  if (
    typeof value !== "string" ||
    !mongoose.Types.ObjectId.isValid(value)
  ) {
    throw new AppError(message, 400);
  }
};

const timeToMinutes = (
  time: string
): number => {
  if (!TIME_PATTERN.test(time)) {
    throw new AppError(
      "Thời gian phải có định dạng HH:mm",
      400
    );
  }

  const [hourText, minuteText] =
    time.split(":");

  return (
    Number(hourText) * 60 +
    Number(minuteText)
  );
};

const validateBreaks = (
  breaks: IScheduleBreak[],
  startTime: string,
  endTime: string
): void => {
  const workingStart =
    timeToMinutes(startTime);

  const workingEnd =
    timeToMinutes(endTime);

  const normalizedBreaks = [...breaks]
    .map((breakItem) => ({
      startTime: breakItem.startTime,
      endTime: breakItem.endTime,
      startMinutes: timeToMinutes(
        breakItem.startTime
      ),
      endMinutes: timeToMinutes(
        breakItem.endTime
      ),
    }))
    .sort(
      (first, second) =>
        first.startMinutes -
        second.startMinutes
    );

  for (const breakItem of normalizedBreaks) {
    if (
      breakItem.startMinutes >=
      breakItem.endMinutes
    ) {
      throw new AppError(
        "Giờ bắt đầu nghỉ phải nhỏ hơn giờ kết thúc nghỉ",
        400
      );
    }

    if (
      breakItem.startMinutes <
        workingStart ||
      breakItem.endMinutes >
        workingEnd
    ) {
      throw new AppError(
        "Giờ nghỉ phải nằm trong giờ làm việc",
        400
      );
    }
  }

  for (
    let index = 1;
    index < normalizedBreaks.length;
    index += 1
  ) {
    const previous =
      normalizedBreaks[index - 1];

    const current =
      normalizedBreaks[index];

    if (
      previous &&
      current &&
      current.startMinutes <
        previous.endMinutes
    ) {
      throw new AppError(
        "Các khoảng nghỉ không được trùng nhau",
        400
      );
    }
  }
};

const validateScheduleDay = (
  schedule: UpdateScheduleDayInput
): void => {
  if (
    !Number.isInteger(
      schedule.dayOfWeek
    ) ||
    schedule.dayOfWeek < 0 ||
    schedule.dayOfWeek > 6
  ) {
    throw new AppError(
      "Ngày trong tuần không hợp lệ",
      400
    );
  }

  if (!schedule.isWorking) {
    return;
  }

  if (
    !TIME_PATTERN.test(
      schedule.startTime
    ) ||
    !TIME_PATTERN.test(
      schedule.endTime
    )
  ) {
    throw new AppError(
      "Giờ làm việc không hợp lệ",
      400
    );
  }

  const startMinutes =
    timeToMinutes(
      schedule.startTime
    );

  const endMinutes =
    timeToMinutes(
      schedule.endTime
    );

  if (
    startMinutes >= endMinutes
  ) {
    throw new AppError(
      "Giờ bắt đầu làm phải nhỏ hơn giờ kết thúc làm",
      400
    );
  }

  const breaks =
    Array.isArray(schedule.breaks)
      ? schedule.breaks
      : [];

  validateBreaks(
    breaks,
    schedule.startTime,
    schedule.endTime
  );
};

const validateBarberAccount = async (
  barberId: string
): Promise<void> => {
  assertObjectId(
    barberId,
    "Tài khoản Barber không hợp lệ"
  );

  const barber = await User.findOne({
    _id: barberId,
    role: "BARBER",
    status: "ACTIVE",
  }).select("_id");

  if (!barber) {
    throw new AppError(
      "Không tìm thấy tài khoản Barber đang hoạt động",
      404
    );
  }
};

/**
 * Lấy lịch làm việc 7 ngày của Barber.
 */
export const getMyWeeklySchedule =
  async (barberId: string) => {
    await validateBarberAccount(
      barberId
    );

    const schedules =
      await BarberSchedule.find({
        barber: barberId,
      })
        .sort({
          dayOfWeek: 1,
        })
        .lean();

    const scheduleMap = new Map(
      schedules.map((schedule) => [
        schedule.dayOfWeek,
        schedule,
      ])
    );

    /*
     * Luôn trả đủ 7 ngày để frontend
     * không phải tự bổ sung ngày còn thiếu.
     */
    return Array.from(
      {
        length: 7,
      },
      (_, dayOfWeek) => {
        const existingSchedule =
          scheduleMap.get(dayOfWeek);

        if (existingSchedule) {
          return existingSchedule;
        }

        return {
          barber: barberId,
          dayOfWeek,
          startTime: "09:00",
          endTime: "21:00",
          breaks: [
            {
              startTime: "12:00",
              endTime: "13:00",
            },
          ],
          isWorking:
            dayOfWeek !== 0,
        };
      }
    );
  };

/** Lịch thực tế 14 ngày từ hôm nay, ưu tiên lịch điều chỉnh theo ngày. */
export const getMyUpcomingSchedule = async (barberId: string) => {
  const weeklySchedules = await getMyWeeklySchedule(barberId);
  const weeklyMap = new Map(weeklySchedules.map((schedule) => [schedule.dayOfWeek, schedule]));
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
  const start = new Date(`${today}T00:00:00Z`);
  const dates = Array.from({ length: 14 }, (_, index) => {
    const value = new Date(start);
    value.setUTCDate(value.getUTCDate() + index);
    return value.toISOString().slice(0, 10);
  });
  const overrides = await BarberScheduleOverride.find({
    barber: barberId,
    date: { $gte: dates[0], $lte: dates[dates.length - 1] },
  }).lean();
  const overrideMap = new Map(overrides.map((override) => [override.date, override]));

  return dates.map((date) => {
    const dayOfWeek = new Date(`${date}T00:00:00Z`).getUTCDay();
    const weekly = weeklyMap.get(dayOfWeek) ?? {
      barber: barberId,
      dayOfWeek,
      startTime: "09:00",
      endTime: "21:00",
      breaks: [],
      isWorking: false,
    };
    const override = overrideMap.get(date);
    return {
      barber: barberId,
      date,
      dayOfWeek,
      startTime: override?.startTime ?? weekly.startTime,
      endTime: override?.endTime ?? weekly.endTime,
      breaks: override ? [] : weekly.breaks,
      isWorking: override?.isWorking ?? weekly.isWorking,
      note: override?.note ?? "",
      source: override ? "OVERRIDE" as const : "WEEKLY" as const,
    };
  });
};

/**
 * Cập nhật toàn bộ lịch làm việc trong tuần.
 */
export const updateMyWeeklySchedule =
  async (
    barberId: string,
    input: UpdateWeeklyScheduleInput
  ) => {
    await validateBarberAccount(
      barberId
    );

    if (
      !Array.isArray(input.schedules) ||
      input.schedules.length !== 7
    ) {
      throw new AppError(
        "Phải gửi đầy đủ lịch làm việc của 7 ngày",
        400
      );
    }

    const dayValues =
      input.schedules.map(
        (schedule) =>
          schedule.dayOfWeek
      );

    const uniqueDays =
      new Set(dayValues);

    if (uniqueDays.size !== 7) {
      throw new AppError(
        "Danh sách lịch làm việc đang bị trùng hoặc thiếu ngày",
        400
      );
    }

    input.schedules.forEach(
      validateScheduleDay
    );

    const operations =
      input.schedules.map(
        (schedule) => ({
          updateOne: {
            filter: {
              barber: barberId,
              dayOfWeek:
                schedule.dayOfWeek,
            },

            update: {
              $set: {
                startTime:
                  schedule.startTime,

                endTime:
                  schedule.endTime,

                breaks:
                  schedule.isWorking
                    ? schedule.breaks ?? []
                    : [],

                isWorking:
                  schedule.isWorking,
              },
            },

            upsert: true,
          },
        })
      );

    await BarberSchedule.bulkWrite(
      operations
    );

    return getMyWeeklySchedule(
      barberId
    );
  };

/**
 * Cập nhật một ngày làm việc.
 */
export const updateMyScheduleDay =
  async (
    barberId: string,
    input: UpdateScheduleDayInput
  ) => {
    await validateBarberAccount(
      barberId
    );

    validateScheduleDay(input);

    await BarberSchedule.findOneAndUpdate(
      {
        barber: barberId,
        dayOfWeek:
          input.dayOfWeek,
      },
      {
        $set: {
          startTime:
            input.startTime,

          endTime:
            input.endTime,

          breaks:
            input.isWorking
              ? input.breaks ?? []
              : [],

          isWorking:
            input.isWorking,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
        setDefaultsOnInsert: true,
      }
    );

    return BarberSchedule.findOne({
      barber: barberId,
      dayOfWeek:
        input.dayOfWeek,
    }).lean();
  };

/**
 * Đăng ký ngày nghỉ / ghi đè lịch nghỉ của Barber.
 */
export const registerLeaveSchedule = async ({
  staffId,
  startDate,
  endDate,
  reasonType,
  note,
  createdBy,
}: RegisterLeaveInput) => {
  await validateBarberAccount(staffId);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate) || startDate > endDate) {
    throw new AppError("Khoảng ngày nghỉ không hợp lệ", 400);
  }
  const duplicated = await BarberLeaveRequest.exists({
    barber: staffId,
    status: "PENDING",
    startDate: { $lte: endDate },
    endDate: { $gte: startDate },
  });
  if (duplicated) throw new AppError("Đã có yêu cầu nghỉ chờ duyệt trùng khoảng ngày này", 409);

  const normalizedReason = (["SICK", "PERSONAL", "VACATION", "OTHER"] as const).find((value) => value === reasonType) ?? "OTHER";
  const request = await BarberLeaveRequest.create({
    barber: staffId,
    startDate,
    endDate,
    reasonType: normalizedReason,
    note: note?.trim() || "",
  });
  const totalDays = Math.floor((new Date(`${endDate}T00:00:00Z`).getTime() - new Date(`${startDate}T00:00:00Z`).getTime()) / 86400000) + 1;
  return { totalDays, request, createdBy };
};

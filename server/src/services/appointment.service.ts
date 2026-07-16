import mongoose from "mongoose";

import Appointment from "../models/Appointment";
import AppError from "../utils/AppError";

type ServiceGroup =
  | "HAIRCUT"
  | "BEARD"
  | "COLOR"
  | null;

interface AppointmentServiceInput {
  name: string;
  price: number;
}

interface AllowedService {
  name: string;
  price: number;
  durationMinutes: number;
  exclusiveGroup: ServiceGroup;
}

interface NormalizedService extends AllowedService {}

interface CreateAppointmentInput {
  services: AppointmentServiceInput[];
  barberName: string;
  appointmentDate: string;
  timeSlot: string;
  note?: string;
}

interface CancelAppointmentInput {
  appointmentId: string;
  clientId: string;
  cancelReason?: string;
}

const OPENING_TIME = "09:00";
const CLOSING_TIME = "21:00";

const allowedTimeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
];

const allowedServices: AllowedService[] = [
  {
    name: "Cắt tóc cơ bản",
    price: 100000,
    durationMinutes: 45,
    exclusiveGroup: "HAIRCUT",
  },
  {
    name: "Cắt Fade chuyên nghiệp",
    price: 130000,
    durationMinutes: 60,
    exclusiveGroup: "HAIRCUT",
  },
  {
    name: "Combo cắt tóc cao cấp",
    price: 180000,
    durationMinutes: 90,
    exclusiveGroup: "HAIRCUT",
  },
  {
    name: "Tỉa râu cơ bản",
    price: 50000,
    durationMinutes: 30,
    exclusiveGroup: "BEARD",
  },
  {
    name: "Tạo kiểu và viền râu",
    price: 80000,
    durationMinutes: 45,
    exclusiveGroup: "BEARD",
  },
  {
    name: "Combo chăm sóc râu",
    price: 120000,
    durationMinutes: 60,
    exclusiveGroup: "BEARD",
  },
  {
    name: "Cạo mặt khăn nóng",
    price: 70000,
    durationMinutes: 30,
    exclusiveGroup: null,
  },
  {
    name: "Gội đầu và massage",
    price: 60000,
    durationMinutes: 30,
    exclusiveGroup: null,
  },
  {
    name: "Chăm sóc da mặt cơ bản",
    price: 150000,
    durationMinutes: 60,
    exclusiveGroup: null,
  },
  {
    name: "Uốn tạo kiểu",
    price: 400000,
    durationMinutes: 120,
    exclusiveGroup: null,
  },
  {
    name: "Nhuộm tóc nam",
    price: 350000,
    durationMinutes: 90,
    exclusiveGroup: "COLOR",
  },
  {
    name: "Tẩy và nhuộm thời trang",
    price: 650000,
    durationMinutes: 180,
    exclusiveGroup: "COLOR",
  },
];

const timeToMinutes = (time: string): number => {
  const [hourText, minuteText] = time.split(":");

  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    throw new AppError(
      "Khung giờ không hợp lệ",
      400
    );
  }

  return hour * 60 + minute;
};

const minutesToTime = (
  totalMinutes: number
): string => {
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;

  return `${String(hour).padStart(
    2,
    "0"
  )}:${String(minute).padStart(2, "0")}`;
};

const isTimeOverlap = (
  firstStart: number,
  firstEnd: number,
  secondStart: number,
  secondEnd: number
): boolean => {
  return (
    firstStart < secondEnd &&
    firstEnd > secondStart
  );
};

const isPastAppointment = (
  appointmentDate: string,
  timeSlot: string
): boolean => {
  const appointmentDateTime = new Date(
    `${appointmentDate}T${timeSlot}:00`
  );

  return (
    Number.isNaN(
      appointmentDateTime.getTime()
    ) ||
    appointmentDateTime.getTime() <=
      Date.now()
  );
};

const normalizeServices = (
  services: AppointmentServiceInput[]
): NormalizedService[] => {
  if (
    !Array.isArray(services) ||
    services.length === 0
  ) {
    throw new AppError(
      "Bạn phải chọn ít nhất một dịch vụ",
      400
    );
  }

  const selectedServiceNames =
    new Set<string>();

  const selectedGroups =
    new Set<Exclude<ServiceGroup, null>>();

  return services.map((service) => {
    if (
      !service ||
      typeof service.name !== "string" ||
      !service.name.trim()
    ) {
      throw new AppError(
        "Tên dịch vụ không hợp lệ",
        400
      );
    }

    const normalizedName =
      service.name.trim();

    if (
      selectedServiceNames.has(
        normalizedName
      )
    ) {
      throw new AppError(
        `Dịch vụ "${normalizedName}" đang bị chọn trùng`,
        400
      );
    }

    const validService =
      allowedServices.find(
        (allowedService) =>
          allowedService.name ===
          normalizedName
      );

    if (!validService) {
      throw new AppError(
        `Dịch vụ "${normalizedName}" không tồn tại`,
        400
      );
    }

    if (
      validService.exclusiveGroup &&
      selectedGroups.has(
        validService.exclusiveGroup
      )
    ) {
      if (
        validService.exclusiveGroup ===
        "HAIRCUT"
      ) {
        throw new AppError(
          "Chỉ được chọn một dịch vụ cắt tóc trong cùng một lịch hẹn",
          400
        );
      }

      if (
        validService.exclusiveGroup ===
        "BEARD"
      ) {
        throw new AppError(
          "Chỉ được chọn một dịch vụ chăm sóc râu trong cùng một lịch hẹn",
          400
        );
      }

      if (
        validService.exclusiveGroup ===
        "COLOR"
      ) {
        throw new AppError(
          "Không thể chọn đồng thời nhuộm tóc nam và tẩy nhuộm thời trang",
          400
        );
      }
    }

    selectedServiceNames.add(
      normalizedName
    );

    if (validService.exclusiveGroup) {
      selectedGroups.add(
        validService.exclusiveGroup
      );
    }

    return {
      name: validService.name,
      price: validService.price,
      durationMinutes:
        validService.durationMinutes,
      exclusiveGroup:
        validService.exclusiveGroup,
    };
  });
};

const calculateTotalPrice = (
  services: NormalizedService[]
): number => {
  return services.reduce(
    (total, service) =>
      total + service.price,
    0
  );
};

const calculateTotalDuration = (
  services: NormalizedService[]
): number => {
  return services.reduce(
    (total, service) =>
      total + service.durationMinutes,
    0
  );
};

export const createAppointment = async (
  clientId: string,
  input: CreateAppointmentInput
) => {
  const {
    services,
    barberName,
    appointmentDate,
    timeSlot,
    note,
  } = input;

  if (
    typeof barberName !== "string" ||
    !barberName.trim() ||
    typeof appointmentDate !== "string" ||
    !appointmentDate.trim() ||
    typeof timeSlot !== "string" ||
    !timeSlot.trim()
  ) {
    throw new AppError(
      "Vui lòng nhập đầy đủ thông tin đặt lịch",
      400
    );
  }

  if (
    !mongoose.Types.ObjectId.isValid(
      clientId
    )
  ) {
    throw new AppError(
      "Tài khoản không hợp lệ",
      400
    );
  }

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      appointmentDate
    )
  ) {
    throw new AppError(
      "Ngày đặt lịch không hợp lệ",
      400
    );
  }

  if (
    !allowedTimeSlots.includes(timeSlot)
  ) {
    throw new AppError(
      "Khung giờ đặt lịch không hợp lệ",
      400
    );
  }

  if (
    isPastAppointment(
      appointmentDate,
      timeSlot
    )
  ) {
    throw new AppError(
      "Không thể đặt lịch trong quá khứ",
      400
    );
  }

  const normalizedServices =
    normalizeServices(services);

  const totalPrice =
    calculateTotalPrice(
      normalizedServices
    );

  const durationMinutes =
    calculateTotalDuration(
      normalizedServices
    );

  const startMinutes =
    timeToMinutes(timeSlot);

  const endMinutes =
    startMinutes + durationMinutes;

  const openingMinutes =
    timeToMinutes(OPENING_TIME);

  const closingMinutes =
    timeToMinutes(CLOSING_TIME);

  if (startMinutes < openingMinutes) {
    throw new AppError(
      `Salon mở cửa từ ${OPENING_TIME}`,
      400
    );
  }

  if (endMinutes > closingMinutes) {
    throw new AppError(
      `Tổng thời gian dịch vụ kết thúc sau giờ đóng cửa ${CLOSING_TIME}`,
      400
    );
  }

  const endTime =
    minutesToTime(endMinutes);

  const activeAppointments =
    await Appointment.find({
      barberName: barberName.trim(),
      appointmentDate,
      status: {
        $in: [
          "PENDING",
          "CONFIRMED",
          "IN_PROGRESS",
        ],
      },
    }).lean();

  const conflictingAppointment =
    activeAppointments.find(
      (existingAppointment) => {
        const existingStart =
          timeToMinutes(
            existingAppointment.timeSlot
          );

        /*
         * Hỗ trợ appointment cũ chưa có endTime
         * hoặc durationMinutes.
         */
        const existingDuration =
          typeof existingAppointment.durationMinutes ===
            "number" &&
          existingAppointment.durationMinutes >
            0
            ? existingAppointment.durationMinutes
            : 60;

        const existingEnd =
          typeof existingAppointment.endTime ===
            "string" &&
          existingAppointment.endTime
            ? timeToMinutes(
                existingAppointment.endTime
              )
            : existingStart +
              existingDuration;

        return isTimeOverlap(
          startMinutes,
          endMinutes,
          existingStart,
          existingEnd
        );
      }
    );

  if (conflictingAppointment) {
    const conflictStart =
      conflictingAppointment.timeSlot;

    const conflictEnd =
      typeof conflictingAppointment.endTime ===
        "string" &&
      conflictingAppointment.endTime
        ? conflictingAppointment.endTime
        : minutesToTime(
            timeToMinutes(
              conflictingAppointment.timeSlot
            ) +
              (typeof conflictingAppointment.durationMinutes ===
                "number"
                ? conflictingAppointment.durationMinutes
                : 60)
          );

    throw new AppError(
      `Barber đã có lịch từ ${conflictStart} đến ${conflictEnd}. Vui lòng chọn khung giờ khác`,
      409
    );
  }

  const appointment =
    await Appointment.create({
      client: clientId,

      services:
        normalizedServices.map(
          (service) => ({
            name: service.name,
            price: service.price,
          })
        ),

      totalPrice,
      barberName:
        barberName.trim(),
      appointmentDate,
      timeSlot,
      durationMinutes,
      endTime,
      note: note?.trim() || "",
      status: "PENDING",
    });

  return appointment;
};

export const getMyAppointments = async (
  clientId: string
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      clientId
    )
  ) {
    throw new AppError(
      "Tài khoản không hợp lệ",
      400
    );
  }

  return Appointment.find({
    client: clientId,
  })
    .sort({
      appointmentDate: -1,
      timeSlot: -1,
      createdAt: -1,
    })
    .lean();
};

export const cancelMyAppointment = async ({
  appointmentId,
  clientId,
  cancelReason,
}: CancelAppointmentInput) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      appointmentId
    )
  ) {
    throw new AppError(
      "Mã lịch hẹn không hợp lệ",
      400
    );
  }

  if (
    !mongoose.Types.ObjectId.isValid(
      clientId
    )
  ) {
    throw new AppError(
      "Tài khoản không hợp lệ",
      400
    );
  }

  const appointment =
    await Appointment.findOne({
      _id: appointmentId,
      client: clientId,
    });

  if (!appointment) {
    throw new AppError(
      "Không tìm thấy lịch hẹn",
      404
    );
  }

  if (
    !["PENDING", "CONFIRMED"].includes(
      appointment.status
    )
  ) {
    throw new AppError(
      "Không thể hủy lịch ở trạng thái hiện tại",
      400
    );
  }

  if (
    isPastAppointment(
      appointment.appointmentDate,
      appointment.timeSlot
    )
  ) {
    throw new AppError(
      "Không thể hủy lịch đã qua",
      400
    );
  }

  appointment.status = "CANCELLED";

  appointment.cancelReason =
    cancelReason?.trim() ||
    "Khách hàng hủy lịch";

  await appointment.save();

  return appointment;
};
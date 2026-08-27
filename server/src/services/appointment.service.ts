import mongoose from "mongoose";

import Appointment, {
  type AppointmentStatus,
  type CancellationRole,
} from "../models/Appointment";

import BarberProfile from "../models/BarberProfile";
import BarberSchedule from "../models/BarberSchedule";
import BarberScheduleOverride from "../models/BarberScheduleOverride";

import Service, {
  type IService,
  type ServiceGroup,
  type ServiceStaffType,
} from "../models/Service";

import User from "../models/User";
import AppError from "../utils/AppError";
import {
  sendAppointmentLifecycleEmail,
  sendBookingConfirmationEmail,
  type AppointmentEmailEvent,
} from "./email.service";
import {
  evaluateVoucher,
  type VoucherCalculation,
} from "./voucher.service";
import {
  recordAppointmentActivity,
  recordSystemActivities,
} from "./appointmentActivity.service";
import { createStaffNotification } from "./staffNotification.service";
import { createRefundRequestForAppointment } from "./refund.service";

interface LifecycleEmailAppointment {
  appointmentCode: string;
  customer: {
    fullName: string;
    email: string;
  };
  appointmentDate: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  services: Array<{
    nameSnapshot: string;
  }>;
  barber?: {
    fullName?: string;
  } | mongoose.Types.ObjectId;
}

const queueAppointmentLifecycleEmail = (
  appointment: LifecycleEmailAppointment,
  event: AppointmentEmailEvent,
  message: string
) => {
  const barberName =
    appointment.barber &&
    !(appointment.barber instanceof mongoose.Types.ObjectId) &&
    appointment.barber.fullName
      ? appointment.barber.fullName
      : undefined;

  void sendAppointmentLifecycleEmail({
    event,
    to: appointment.customer.email,
    customerName: appointment.customer.fullName,
    appointmentCode: appointment.appointmentCode,
    appointmentDate: appointment.appointmentDate,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    barberName,
    services: appointment.services.map(
      (service) => service.nameSnapshot
    ),
    totalPrice: appointment.totalPrice,
    message,
  }).catch((error: unknown) => {
    console.error(
      `Không thể gửi email ${event}:`,
      error
    );
  });
};

interface CreateAppointmentInput {
  barberId: string;
  careBarberId?: string;
  serviceIds: string[];
  appointmentDate: string;
  startTime: string;
  note?: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
  };
  voucherCode?: string;
}

interface CancelAppointmentInput {
  appointmentId: string;
  userId: string;
  role: CancellationRole;
  reason?: string;
  refundBankName?: string;
  refundAccountNumber?: string;
  refundAccountName?: string;
}

interface GetAppointmentsOptions {
  status?: AppointmentStatus;
  appointmentDate?: string;
  dateFrom?: string;
  dateTo?: string;
  barberId?: string;
  clientId?: string;
}

interface UpdateAppointmentStatusInput {
  appointmentId: string;
  actorId: string;
  actorRole: "RECEPTIONIST" | "ADMIN";
  status: AppointmentStatus;
  reason?: string;
}

interface AvailableSlotsInput {
  barberId?: string;
  serviceIds: string[];
  appointmentDate: string;
}

interface NormalizedService {
  service: mongoose.Types.ObjectId;
  nameSnapshot: string;
  priceSnapshot: number;
  durationSnapshot: number;
  group: ServiceGroup;
  isExclusiveInGroup: boolean;
  staffType: ServiceStaffType;
}

interface DateRangeQuery {
  $gte?: string;
  $lte?: string;
}

interface AppointmentQuery {
  _id?: {
    $ne?: string;
  };

  barber?: string;
  client?: string;

  status?:
    | AppointmentStatus
    | {
        $in: AppointmentStatus[];
      };

  appointmentDate?: string | DateRangeQuery;
}

const SLOT_INTERVAL_MINUTES = 30;

const ACTIVE_APPOINTMENT_STATUSES: AppointmentStatus[] = [
  "PENDING",
  "CONFIRMED",
  "CHECKED_IN",
  "IN_PROGRESS",
];

const TIME_PATTERN =
  /^([01]\d|2[0-3]):([0-5]\d)$/;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const STATUS_TRANSITIONS: Record<
  AppointmentStatus,
  AppointmentStatus[]
> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["CHECKED_IN", "NO_SHOW", "CANCELLED"],
  CHECKED_IN: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED"],
  COMPLETED: [],
  NO_SHOW: ["CONFIRMED", "IN_PROGRESS"],
  CANCELLED: [],
};

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

  const hours = Number(hourText);
  const minutes = Number(minuteText);

  return hours * 60 + minutes;
};

const minutesToTime = (
  totalMinutes: number
): string => {
  const hours = Math.floor(
    totalMinutes / 60
  );

  const minutes =
    totalMinutes % 60;

  return `${String(hours).padStart(
    2,
    "0"
  )}:${String(minutes).padStart(2, "0")}`;
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

const isDateFormatValid = (
  date: string
): boolean => {
  if (!DATE_PATTERN.test(date)) {
    return false;
  }

  const parsedDate = new Date(
    `${date}T00:00:00`
  );

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return false;
  }

  const [yearText, monthText, dayText] =
    date.split("-");

  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  return (
    parsedDate.getFullYear() === year &&
    parsedDate.getMonth() + 1 === month &&
    parsedDate.getDate() === day
  );
};

const getDayOfWeek = (
  appointmentDate: string
): number => {
  const date = new Date(
    `${appointmentDate}T00:00:00`
  );

  return date.getDay();
};

const isPastAppointment = (
  appointmentDate: string,
  startTime: string
): boolean => {
  const appointmentDateTime =
    new Date(
      `${appointmentDate}T${startTime}:00`
    );

  return (
    Number.isNaN(
      appointmentDateTime.getTime()
    ) ||
    appointmentDateTime.getTime() <=
      Date.now()
  );
};

const buildDateRange = (
  dateFrom?: string,
  dateTo?: string
): DateRangeQuery | undefined => {
  if (!dateFrom && !dateTo) {
    return undefined;
  }

  const dateRange: DateRangeQuery = {};

  if (dateFrom) {
    if (!isDateFormatValid(dateFrom)) {
      throw new AppError(
        "Ngày bắt đầu không hợp lệ",
        400
      );
    }

    dateRange.$gte = dateFrom;
  }

  if (dateTo) {
    if (!isDateFormatValid(dateTo)) {
      throw new AppError(
        "Ngày kết thúc không hợp lệ",
        400
      );
    }

    dateRange.$lte = dateTo;
  }

  if (
    dateFrom &&
    dateTo &&
    dateFrom > dateTo
  ) {
    throw new AppError(
      "Ngày bắt đầu không được lớn hơn ngày kết thúc",
      400
    );
  }

  return dateRange;
};

const validateExclusiveGroups = (
  services: IService[]
): void => {
  const selectedGroups =
    new Map<ServiceGroup, string>();

  for (const service of services) {
    if (!service.isExclusiveInGroup) {
      continue;
    }

    const previousServiceName =
      selectedGroups.get(service.group);

    if (previousServiceName) {
      throw new AppError(
        `Không thể chọn đồng thời "${previousServiceName}" và "${service.name}" vì hai dịch vụ thuộc cùng một nhóm`,
        400
      );
    }

    selectedGroups.set(
      service.group,
      service.name
    );
  }
};

const normalizeServices = async (
  serviceIds: string[]
): Promise<NormalizedService[]> => {
  if (
    !Array.isArray(serviceIds) ||
    serviceIds.length === 0
  ) {
    throw new AppError(
      "Bạn phải chọn ít nhất một dịch vụ",
      400
    );
  }

  const uniqueServiceIds = [
    ...new Set(serviceIds),
  ];

  if (
    uniqueServiceIds.length !==
    serviceIds.length
  ) {
    throw new AppError(
      "Danh sách dịch vụ đang bị trùng",
      400
    );
  }

  uniqueServiceIds.forEach(
    (serviceId) => {
      assertObjectId(
        serviceId,
        "Mã dịch vụ không hợp lệ"
      );
    }
  );

  const services: IService[] =
    await Service.find({
      _id: {
        $in: uniqueServiceIds,
      },
      isActive: true,
    }).exec();

  if (
    services.length !==
    uniqueServiceIds.length
  ) {
    throw new AppError(
      "Một hoặc nhiều dịch vụ không tồn tại hoặc đã ngừng hoạt động",
      404
    );
  }

  validateExclusiveGroups(services);

  const serviceMap =
    new Map<string, IService>();

  for (const service of services) {
    serviceMap.set(
      String(service._id),
      service
    );
  }

  return uniqueServiceIds.map(
    (serviceId) => {
      const service =
        serviceMap.get(serviceId);

      if (!service) {
        throw new AppError(
          "Không tìm thấy dịch vụ",
          404
        );
      }

      return {
        service:
          service._id as mongoose.Types.ObjectId,

        nameSnapshot:
          service.name,

        priceSnapshot:
          service.price,

        durationSnapshot:
          service.durationMinutes,

        group:
          service.group,

        isExclusiveInGroup:
          service.isExclusiveInGroup,
        staffType: service.staffType ?? (service.group === "CARE" ? "CARE" : "HAIR"),
      };
    }
  );
};

const validateBarber = async (
  barberId: string
) => {
  assertObjectId(
    barberId,
    "Mã Barber không hợp lệ"
  );

  const barber = await User.findOne({
    _id: barberId,
    role: "BARBER",
    status: "ACTIVE",
  }).select(
    "_id fullName email phone role status"
  );

  if (!barber) {
    throw new AppError(
      "Barber không tồn tại hoặc đã ngừng hoạt động",
      404
    );
  }

  const barberProfile =
    await BarberProfile.findOne({
      user: barberId,
      isActive: true,
    });

  if (!barberProfile) {
    throw new AppError(
      "Hồ sơ Barber chưa được kích hoạt",
      400
    );
  }

  return barber;
};

const validateBarberSchedule = async (
  barberId: string,
  appointmentDate: string,
  startTime: string,
  endTime: string
): Promise<void> => {
  const dayOfWeek =
    getDayOfWeek(appointmentDate);

  const [weeklySchedule, dateOverride] = await Promise.all([
    BarberSchedule.findOne({ barber: barberId, dayOfWeek }).lean(),
    BarberScheduleOverride.findOne({ barber: barberId, date: appointmentDate }).lean(),
  ]);
  const schedule = dateOverride || weeklySchedule;

  if (
    !schedule ||
    !schedule.isWorking
  ) {
    throw new AppError(
      "Barber không làm việc trong ngày đã chọn",
      400
    );
  }

  const appointmentStart =
    timeToMinutes(startTime);

  const appointmentEnd =
    timeToMinutes(endTime);

  const workingStart =
    timeToMinutes(
      schedule.startTime
    );

  const workingEnd =
    timeToMinutes(
      schedule.endTime
    );

  if (
    appointmentStart < workingStart ||
    appointmentEnd > workingEnd
  ) {
    throw new AppError(
      `Lịch hẹn phải nằm trong giờ làm việc ${schedule.startTime} - ${schedule.endTime}`,
      400
    );
  }

  // THADS Barber hoạt động xuyên trưa, không chặn giờ nghỉ giữa ca.
};

const validateAppointmentConflict =
  async (
    barberId: string,
    appointmentDate: string,
    startTime: string,
    endTime: string,
    excludedAppointmentId?: string
  ): Promise<void> => {
    const query: AppointmentQuery & { $or?: Array<Record<string, string>> } = {
      $or: [
        { barber: barberId },
        { "staffAssignments.barber": barberId },
      ],
      appointmentDate,
      status: {
        $in:
          ACTIVE_APPOINTMENT_STATUSES,
      },
    };

    if (excludedAppointmentId) {
      assertObjectId(
        excludedAppointmentId,
        "Mã lịch hẹn cần loại trừ không hợp lệ"
      );

      query._id = {
        $ne: excludedAppointmentId,
      };
    }

    const appointments =
      await Appointment.find(query)
        .select(
          "barber startTime endTime staffAssignments"
        )
        .lean();

    const requestedStart =
      timeToMinutes(startTime);

    const requestedEnd =
      timeToMinutes(endTime);

    const conflictingAppointment = appointments.find((appointment) => {
      const assignments = appointment.staffAssignments?.filter(
        (assignment) => String(assignment.barber) === barberId
      ) ?? [];
      const intervals = assignments.length > 0
        ? assignments.map((assignment) => ({
            startTime: assignment.startTime,
            endTime: assignment.endTime,
          }))
        : String(appointment.barber) === barberId
          ? [{ startTime: appointment.startTime, endTime: appointment.endTime }]
          : [];

      return intervals.some((interval) =>
        isTimeOverlap(
          requestedStart,
          requestedEnd,
          timeToMinutes(interval.startTime),
          timeToMinutes(interval.endTime)
        )
      );
    });

    if (conflictingAppointment) {
      throw new AppError(
        "Nhân viên đã có lịch trong khung giờ được chọn",
        409
      );
    }
  };

const selectRandomCareBarber = async (
  serviceIds: mongoose.Types.ObjectId[],
  appointmentDate: string,
  startTime: string,
  endTime: string,
  excludedBarberId?: string
): Promise<string> => {
  const profiles = await BarberProfile.find({
    isActive: true,
    staffType: "CARE",
    specialties: { $all: serviceIds },
    ...(excludedBarberId
      ? { user: { $ne: excludedBarberId } }
      : {}),
  })
    .select("user")
    .lean();

  const shuffledProfiles = [...profiles].sort(() => Math.random() - 0.5);

  for (const profile of shuffledProfiles) {
    const barberId = String(profile.user);
    const barber = await User.exists({
      _id: barberId,
      role: "BARBER",
      status: "ACTIVE",
    });

    if (!barber) continue;

    try {
      await validateBarberSchedule(
        barberId,
        appointmentDate,
        startTime,
        endTime
      );
      await validateAppointmentConflict(
        barberId,
        appointmentDate,
        startTime,
        endTime
      );
      return barberId;
    } catch {
      // Thử nhân viên chăm sóc phù hợp tiếp theo.
    }
  }

  throw new AppError(
    "Không còn nhân viên chăm sóc phù hợp trong khung giờ đã chọn",
    409
  );
};

const populateAppointment = async (
  appointmentId: string
) => {
  const appointment =
    await Appointment.findById(
      appointmentId
    )
      .populate(
        "client",
        "fullName email phone role status"
      )
      .populate(
        "barber",
        "fullName email phone role status"
      )
      .populate(
        "services.service",
        "name description image group isActive price durationMinutes"
      )
      .populate(
        "staffAssignments.barber",
        "fullName email phone role status"
      );

  if (!appointment) {
    throw new AppError(
      "Không tìm thấy lịch hẹn",
      404
    );
  }

  return appointment;
};

/**
 * CLIENT tạo lịch hẹn.
 */
export const createAppointment =
  async (
    clientId: string,
    input: CreateAppointmentInput
  ) => {
    assertObjectId(
      clientId,
      "Tài khoản khách hàng không hợp lệ"
    );

    const client =
      await User.findOne({
        _id: clientId,
        role: "CLIENT",
        status: "ACTIVE",
      }).select("_id fullName email phone");

    if (!client) {
      throw new AppError(
        "Tài khoản khách hàng không tồn tại hoặc đã bị khóa",
        404
      );
    }

    const {
      barberId,
      serviceIds,
      appointmentDate,
      startTime,
      note,
      customer,
      voucherCode,
    } = input;

    if (!customer?.fullName?.trim() || !customer?.email?.trim() || !customer?.phone?.trim()) {
      throw new AppError("Vui lòng nhập đầy đủ thông tin khách sử dụng dịch vụ", 400);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) {
      throw new AppError("Email khách hàng không hợp lệ", 400);
    }

    if (
      typeof appointmentDate !==
        "string" ||
      !isDateFormatValid(
        appointmentDate
      )
    ) {
      throw new AppError(
        "Ngày đặt lịch không hợp lệ",
        400
      );
    }

    if (
      typeof startTime !==
        "string" ||
      !TIME_PATTERN.test(startTime)
    ) {
      throw new AppError(
        "Giờ bắt đầu không hợp lệ",
        400
      );
    }

    if (
      isPastAppointment(
        appointmentDate,
        startTime
      )
    ) {
      throw new AppError(
        "Không thể đặt lịch trong quá khứ",
        400
      );
    }

    const latestDate = new Date();
    latestDate.setHours(23, 59, 59, 999);
    latestDate.setDate(latestDate.getDate() + 14);
    if (new Date(`${appointmentDate}T${startTime}:00`) > latestDate) {
      throw new AppError("Chỉ được đặt lịch trong vòng 14 ngày tới", 400);
    }

    const normalizedServices =
      await normalizeServices(
        serviceIds
      );

    const hairServices = normalizedServices.filter((service) => service.staffType === "HAIR");
    const careServices = normalizedServices.filter((service) => service.staffType === "CARE");
    if (hairServices.length > 0) {
      await validateBarber(barberId);
    }

    const durationMinutes = normalizedServices.reduce(
      (total, service) => total + service.durationSnapshot,
      0
    );
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = startMinutes + durationMinutes;

    if (endMinutes >= 24 * 60) {
      throw new AppError(
        "Thời gian kết thúc lịch hẹn không hợp lệ",
        400
      );
    }

    const endTime = minutesToTime(endMinutes);
    const hairDuration = hairServices.reduce(
      (sum, service) => sum + service.durationSnapshot,
      0
    );
    const hairEndTime = minutesToTime(startMinutes + hairDuration);
    const careStartTime = hairServices.length > 0 ? hairEndTime : startTime;

    if (hairServices.length > 0) {
      await validateBarberSchedule(
        barberId,
        appointmentDate,
        startTime,
        hairEndTime
      );
      await validateAppointmentConflict(
        barberId,
        appointmentDate,
        startTime,
        hairEndTime
      );
    }

    const assignedCareBarberId = careServices.length > 0
      ? await selectRandomCareBarber(
          careServices.map((service) => service.service),
          appointmentDate,
          careStartTime,
          endTime,
          hairServices.length > 0 ? barberId : undefined
        )
      : "";

    const primaryBarberId =
      hairServices.length > 0 ? barberId : assignedCareBarberId;

    const subtotal =
      normalizedServices.reduce(
        (total, service) =>
          total +
          service.priceSnapshot,
        0
      );

    const normalizedVoucher = typeof voucherCode === "string"
      ? voucherCode.trim().toUpperCase()
      : "";
    let voucherCalculation: VoucherCalculation | null = null;

    if (normalizedVoucher) {
      voucherCalculation = await evaluateVoucher({
        code: normalizedVoucher,
        clientId,
        barberIds: [barberId, assignedCareBarberId].filter(
          (id): id is string => typeof id === "string" && Boolean(id)
        ),
        items: normalizedServices.map((service) => ({
          price: service.priceSnapshot,
          group: service.group,
        })),
      });
    }

    const discountPercent = voucherCalculation?.discountPercent ?? 0;
    const discountAmount = voucherCalculation?.discountAmount ?? 0;
    // Lưu mức giảm tạm tính ngay khi đặt lịch. Khi chốt dịch vụ, hệ thống vẫn
    // tính lại trên hóa đơn thực tế để không làm sai số tiền thanh toán.
    const totalPrice = Math.max(0, subtotal - discountAmount);
    const depositRequired = totalPrice > 200000;
    const depositAmount = depositRequired ? Math.round(totalPrice * 0.3) : 0;

    const appointment =
      await Appointment.create({
        client: clientId,
        barber: primaryBarberId,
        appointmentCode: `THADS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        customer: {
          fullName: customer.fullName.trim(),
          email: customer.email.trim().toLowerCase(),
          phone: customer.phone.trim(),
        },
        staffAssignments: [
          ...(hairServices.length ? [{
            barber: barberId,
            staffType: "HAIR" as const,
            serviceIds: hairServices.map((service) => service.service),
            startTime,
            endTime: hairEndTime,
          }] : []),
          ...(careServices.length ? [{
            barber: assignedCareBarberId,
            staffType: "CARE" as const,
            serviceIds: careServices.map((service) => service.service),
            startTime: careStartTime,
            endTime,
          }] : []),
        ],

        services:
          normalizedServices.map(
            (service) => ({
              service:
                service.service,

              nameSnapshot:
                service.nameSnapshot,

              priceSnapshot:
                service.priceSnapshot,

              durationSnapshot:
                service.durationSnapshot,
            })
          ),

        subtotal,
        voucherCode: normalizedVoucher,
        discountPercent,
        discountAmount,
        totalPrice,
        depositRequired,
        depositAmount,
        depositPaid: false,
        durationMinutes,

        appointmentDate,
        startTime,
        endTime,

        status: "PENDING",
        paymentStatus: "UNPAID",

        workProgress: {
          hair: hairServices.length > 0 ? "PENDING" : "NOT_REQUIRED",
          care: careServices.length > 0 ? "PENDING" : "NOT_REQUIRED",
        },
        cancellationPolicySnapshot: {
          fullRefundHours: Number(process.env.CANCELLATION_FULL_REFUND_HOURS) || 24,
          shopCancellationRefundPercent: 100,
          lateCancellationRefundPercent: 0,
          noShowRefundPercent: 0,
          capturedAt: new Date(),
        },

        note:
          typeof note === "string"
            ? note.trim()
            : "",
      });

    await recordAppointmentActivity({
      appointmentId: appointment._id,
      action: "APPOINTMENT_CREATED",
      description: "Khách hàng đã tạo lịch hẹn",
      actorId: clientId,
      actorRole: "CLIENT",
      metadata: {
        appointmentDate,
        startTime,
        endTime,
        totalPrice,
        voucherCode: normalizedVoucher || undefined,
      },
    });

    void createStaffNotification({
      title: "Có lịch hẹn mới",
      message: `${appointment.customer.fullName} vừa đặt lịch ${appointment.appointmentCode} vào ${appointmentDate} lúc ${startTime}.`,
      kind: "NEW_APPOINTMENT",
      appointmentId: appointment._id,
      dedupeKey: `NEW_APPOINTMENT:${appointment._id}`,
    }).catch((error: unknown) => {
      console.error(
        "Không thể tạo thông báo lịch mới:",
        error
      );
    });

    void sendBookingConfirmationEmail({
      to: appointment.customer.email,
      customerName: appointment.customer.fullName,
      appointmentCode: appointment.appointmentCode,
      bookedAt: appointment.createdAt,
      appointmentDate,
      startTime,
      endTime,
    }).catch((error) => console.error("Không thể gửi email xác nhận:", error));

    return populateAppointment(String(appointment._id));
  };

/**
 * CLIENT xem lịch của mình.
 */
export const getMyAppointments =
  async (clientId: string) => {
    assertObjectId(
      clientId,
      "Tài khoản khách hàng không hợp lệ"
    );

    return Appointment.find({
      client: clientId,
    })
      .populate(
        "barber",
        "fullName email phone role status"
      )
      .populate(
        "services.service",
        "name image group isActive"
      )
      .populate(
        "staffAssignments.barber",
        "fullName email phone role status"
      )
      .sort({
        appointmentDate: -1,
        startTime: -1,
        createdAt: -1,
      })
      .lean();
  };

/**
 * CLIENT hủy lịch của mình.
 */
export const cancelMyAppointment =
  async ({
    appointmentId,
    userId,
    role,
    reason,
    refundBankName,
    refundAccountNumber,
    refundAccountName,
  }: CancelAppointmentInput) => {
    assertObjectId(
      appointmentId,
      "Mã lịch hẹn không hợp lệ"
    );

    assertObjectId(
      userId,
      "Tài khoản không hợp lệ"
    );

    if (role !== "CLIENT") {
      throw new AppError(
        "Vai trò không được phép sử dụng chức năng này",
        403
      );
    }

    const appointment =
      await Appointment.findOne({
        _id: appointmentId,
        client: userId,
      });

    if (!appointment) {
      throw new AppError(
        "Không tìm thấy lịch hẹn",
        404
      );
    }

    const previousStatus =
      appointment.status;

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
        appointment.startTime
      )
    ) {
      throw new AppError(
        "Không thể hủy lịch đã qua",
        400
      );
    }

    const appointmentStart = new Date(`${appointment.appointmentDate}T${appointment.startTime}:00`);
    const leadTime = appointmentStart.getTime() - Date.now();
    const policyHours = appointment.cancellationPolicySnapshot?.fullRefundHours ?? 24;
    const fullRefundWindow = policyHours * 60 * 60 * 1000;

    if (!reason?.trim()) {
      throw new AppError("Vui lòng nhập lý do hủy lịch", 400);
    }

    appointment.status =
      "CANCELLED";

    const refundEligible = appointment.depositPaid && leadTime >= fullRefundWindow;
    if (refundEligible && (!refundBankName?.trim() || !refundAccountNumber?.trim() || !refundAccountName?.trim())) {
      throw new AppError("Vui lòng nhập đủ thông tin tài khoản nhận hoàn cọc", 400);
    }

    appointment.cancellation = {
      cancelledBy:
        new mongoose.Types.ObjectId(
          userId
        ),

      cancelledByRole: role,

      reason:
        reason?.trim() ||
        "Khách hàng hủy lịch",

      cancelledAt: new Date(),
      depositRefundStatus: !appointment.depositPaid
        ? "NOT_APPLICABLE"
        : refundEligible
          ? "ELIGIBLE"
          : "NOT_ELIGIBLE",
      depositRefundAmount: refundEligible ? appointment.depositAmount : 0,
      refundBankName: refundBankName?.trim() ?? "",
      refundAccountNumber: refundAccountNumber?.trim() ?? "",
      refundAccountName: refundAccountName?.trim() ?? "",
      refundEligible,
      refundAmount: refundEligible ? appointment.depositAmount : 0,
      policyApplied: refundEligible
        ? `Khách hủy trước ít nhất ${policyHours} giờ: hoàn 100% tiền cọc`
        : `Khách hủy dưới ${policyHours} giờ: không hoàn tiền cọc`,
      refundStatus: refundEligible ? "PENDING" : "NOT_REQUIRED",
    };

    await appointment.save();

    if (refundEligible) {
      await createRefundRequestForAppointment(
        String(appointment._id),
        userId,
        role
      );
    }

    await recordAppointmentActivity({
      appointmentId: appointment._id,
      action: "STATUS_CHANGED",
      description: "Khách hàng đã hủy lịch hẹn",
      actorId: userId,
      actorRole: role,
      metadata: {
        previousStatus,
        newStatus: "CANCELLED",
        reason: reason?.trim() || undefined,
      },
    });

    queueAppointmentLifecycleEmail(
      appointment,
      "CANCELLED",
      `Bạn đã hủy lịch hẹn. Lý do: ${reason.trim()}`
    );

    void createStaffNotification({
      title: "Khách hàng đã hủy lịch",
      message: `${appointment.customer.fullName} đã hủy lịch ${appointment.appointmentCode}.`,
      kind: "APPOINTMENT_CHANGED",
      appointmentId: appointment._id,
    }).catch((error: unknown) => {
      console.error(
        "Không thể tạo thông báo hủy lịch:",
        error
      );
    });

    return populateAppointment(
      String(appointment._id)
    );
  };

/**
 * BARBER xem lịch được giao.
 */
export const getBarberAppointments =
  async (
    barberId: string,
    options: GetAppointmentsOptions = {}
  ) => {
    assertObjectId(
      barberId,
      "Tài khoản Barber không hợp lệ"
    );

    const filter: AppointmentQuery & { $or?: Array<Record<string, string>> } = {
      $or: [
        { barber: barberId },
        { "staffAssignments.barber": barberId },
      ],
    };

    if (options.status) {
      filter.status =
        options.status;
    }

    if (options.appointmentDate) {
      if (
        !isDateFormatValid(
          options.appointmentDate
        )
      ) {
        throw new AppError(
          "Ngày đặt lịch không hợp lệ",
          400
        );
      }

      filter.appointmentDate =
        options.appointmentDate;
    } else {
      const dateRange =
        buildDateRange(
          options.dateFrom,
          options.dateTo
        );

      if (dateRange) {
        filter.appointmentDate =
          dateRange;
      }
    }

    const appointments = await Appointment.find(filter)
      .populate(
        "client",
        "fullName email phone role status"
      )
      .populate(
        "services.service",
        "name image group isActive"
      )
      .populate(
        "staffAssignments.barber",
        "fullName email phone role status"
      )
      .lean();

    const now = Date.now();
    return appointments.sort((first, second) => {
      const firstUnread = !first.barberViewedAt;
      const secondUnread = !second.barberViewedAt;
      if (firstUnread !== secondUnread) return firstUnread ? -1 : 1;

      const firstTime = new Date(`${first.appointmentDate}T${first.startTime}:00`).getTime();
      const secondTime = new Date(`${second.appointmentDate}T${second.startTime}:00`).getTime();
      const firstFuture = firstTime >= now;
      const secondFuture = secondTime >= now;
      if (firstFuture !== secondFuture) return firstFuture ? -1 : 1;
      return firstFuture ? firstTime - secondTime : secondTime - firstTime;
    });
  };

export const markBarberAppointmentViewed = async (
  appointmentId: string,
  barberId: string
) => {
  assertObjectId(appointmentId, "Mã lịch hẹn không hợp lệ");
  assertObjectId(barberId, "Tài khoản Barber không hợp lệ");

  const appointment = await Appointment.findOneAndUpdate(
    {
      _id: appointmentId,
      $or: [{ barber: barberId }, { "staffAssignments.barber": barberId }],
    },
    { $set: { barberViewedAt: new Date() } },
    { new: true }
  ).lean();

  if (!appointment) throw new AppError("Không tìm thấy lịch được phân công", 404);
  return appointment;
};

/**
 * LỄ TÂN hoặc ADMIN cập nhật trạng thái.
 */
export const updateAppointmentStatus =
  async ({
    appointmentId,
    actorId,
    actorRole,
    status,
    reason,
  }: UpdateAppointmentStatusInput) => {
    assertObjectId(
      appointmentId,
      "Mã lịch hẹn không hợp lệ"
    );

    assertObjectId(
      actorId,
      "Tài khoản không hợp lệ"
    );

    const appointment =
      await Appointment.findById(
        appointmentId
      );

    if (!appointment) {
      throw new AppError(
        "Không tìm thấy lịch hẹn",
        404
      );
    }

    const previousStatus =
      appointment.status;

    const allowedStatuses =
      STATUS_TRANSITIONS[
        appointment.status
      ];

    if (
      !allowedStatuses.includes(
        status
      )
    ) {
      throw new AppError(
        `Không thể chuyển trạng thái từ ${appointment.status} sang ${status}`,
        400
      );
    }

    appointment.status = status;

    if (status === "CONFIRMED") {
      appointment.confirmedAt =
        new Date();
    }

    if (status === "IN_PROGRESS") {
      appointment.startedAt =
        new Date();
    }

    if (status === "CHECKED_IN") {
      const startsAt = new Date(`${appointment.appointmentDate}T${appointment.startTime}:00`);
      // Cho phép check-in sớm tối đa 24 giờ để thuận tiện kiểm thử/demo.
      const earliest = startsAt.getTime() - 24 * 60 * 60 * 1000;
      if (Date.now() < earliest) {
        throw new AppError("Chỉ được check-in sớm nhất 1 ngày trước giờ hẹn", 400);
      }
      appointment.checkedInAt = new Date();
    }

    if (status === "NO_SHOW") {
      const startsAt = new Date(`${appointment.appointmentDate}T${appointment.startTime}:00`);
      if (Date.now() < startsAt.getTime() + 15 * 60 * 1000) {
        throw new AppError("Chỉ chuyển vắng mặt sau giờ hẹn 15 phút", 400);
      }
      appointment.noShowAt = new Date();
    }

    if (status === "COMPLETED") {
      // Chỉ có lịch đang thực hiện mới chuyển được sang COMPLETED theo
      // STATUS_TRANSITIONS. Cho phép kết thúc sớm khi khách đã làm xong,
      // không khóa thao tác theo giờ kết thúc dự kiến.
      appointment.completedAt =
        new Date();
    }

    if (status === "CANCELLED") {
      appointment.cancellation = {
        cancelledBy:
          new mongoose.Types.ObjectId(
            actorId
          ),

        cancelledByRole:
          actorRole,

        reason:
          reason?.trim() ||
          `${
            actorRole === "ADMIN"
              ? "Admin"
              : "Lễ tân"
          } hủy lịch`,

        cancelledAt:
          new Date(),
        // Hủy bởi cửa hàng luôn hoàn phần cọc đã thu cho khách.
        depositRefundStatus: appointment.depositPaid ? "ELIGIBLE" : "NOT_APPLICABLE",
        depositRefundAmount: appointment.depositPaid ? appointment.depositAmount : 0,
        refundEligible: appointment.depositPaid,
        refundAmount: appointment.depositPaid ? appointment.depositAmount : 0,
        policyApplied: "Cửa hàng chủ động hủy: hoàn 100% tiền cọc",
        refundStatus: appointment.depositPaid ? "PENDING" : "NOT_REQUIRED",
};

    }

    await appointment.save();

    if (status === "CANCELLED" && appointment.depositPaid) {
      await createRefundRequestForAppointment(
        String(appointment._id),
        actorId,
        actorRole
      );
    }

    await recordAppointmentActivity({
      appointmentId: appointment._id,
      action: "STATUS_CHANGED",
      description: `Chuyển trạng thái từ ${previousStatus} sang ${status}`,
      actorId,
      actorRole,
      metadata: {
        previousStatus,
        newStatus: status,
        reason: reason?.trim() || undefined,
      },
    });
    if (status === "CANCELLED") {
      queueAppointmentLifecycleEmail(
        appointment as any,
        "CANCELLED",
        `Lịch hẹn của bạn đã được hủy bởi ${actorRole === "ADMIN" ? "Admin" : "Lễ tân"}. Lý do: ${reason?.trim() || "Không có lý do cụ thể"}`
      );
    }

    return populateAppointment(
      String(appointment._id)
    );
  };

/**
 * ADMIN xem toàn bộ lịch.
 */
export const getAdminAppointments =
  async (
    options: GetAppointmentsOptions = {}
  ) => {
    const filter: AppointmentQuery = {};

    if (options.status) {
      filter.status =
        options.status;
    }

    if (options.barberId) {
      assertObjectId(
        options.barberId,
        "Mã Barber không hợp lệ"
      );

      filter.barber =
        options.barberId;
    }

    if (options.clientId) {
      assertObjectId(
        options.clientId,
        "Mã khách hàng không hợp lệ"
      );

      filter.client =
        options.clientId;
    }

    if (options.appointmentDate) {
      if (
        !isDateFormatValid(
          options.appointmentDate
        )
      ) {
        throw new AppError(
          "Ngày đặt lịch không hợp lệ",
          400
        );
      }

      filter.appointmentDate =
        options.appointmentDate;
    } else {
      const dateRange =
        buildDateRange(
          options.dateFrom,
          options.dateTo
        );

      if (dateRange) {
        filter.appointmentDate =
          dateRange;
      }
    }

    return Appointment.find(filter)
      .populate(
        "client",
        "fullName email phone role status"
      )
      .populate(
        "barber",
        "fullName email phone role status"
      )
      .populate(
        "services.service",
        "name image group isActive"
      )
      .sort({
        appointmentDate: -1,
        startTime: -1,
      })
      .lean();
  };

/**
 * Lấy các khung giờ còn trống.
 */
export const getAvailableSlots =
  async ({
    barberId,
    serviceIds,
    appointmentDate,
  }: AvailableSlotsInput) => {
    if (
      !isDateFormatValid(
        appointmentDate
      )
    ) {
      throw new AppError(
        "Ngày đặt lịch không hợp lệ",
        400
      );
    }

    const services =
      await normalizeServices(
        serviceIds
      );

    const hairServices = services.filter((service) => service.staffType === "HAIR");
    const careServices = services.filter((service) => service.staffType === "CARE");
    const hairDuration = hairServices.reduce(
      (total, service) => total + service.durationSnapshot,
      0
    );
    const careDuration = careServices.reduce(
      (total, service) => total + service.durationSnapshot,
      0
    );
    const durationMinutes = hairDuration + careDuration;

    if (hairServices.length > 0) {
      if (!barberId) {
        throw new AppError("Vui lòng chọn nhân viên làm tóc", 400);
      }
      await validateBarber(barberId);
    }

    const dayOfWeek =
      getDayOfWeek(
        appointmentDate
      );

    const careProfiles = careServices.length > 0
      ? await BarberProfile.find({
          isActive: true,
          staffType: "CARE",
          specialties: {
            $all: careServices.map((service) => service.service),
          },
        }).select("user").lean()
      : [];
    const careProfileIds = careProfiles.map((profile) => String(profile.user));
    const activeCareUsers = careProfileIds.length > 0
      ? await User.find({
          _id: { $in: careProfileIds },
          role: "BARBER",
          status: "ACTIVE",
        }).select("_id").lean()
      : [];
    const careBarberIds = activeCareUsers.map((user) => String(user._id));

    if (careServices.length > 0 && careBarberIds.length === 0) {
      return [];
    }

    const relevantBarberIds = [barberId, ...careBarberIds].filter(
      (id): id is string => Boolean(id)
    );
    const [weeklySchedules, dateOverrides] = await Promise.all([
      BarberSchedule.find({ barber: { $in: relevantBarberIds }, dayOfWeek }).lean(),
      BarberScheduleOverride.find({ barber: { $in: relevantBarberIds }, date: appointmentDate }).lean(),
    ]);
    const overridesByBarber = new Map(dateOverrides.map((item) => [String(item.barber), item]));
    const schedules = relevantBarberIds.map((id) =>
      overridesByBarber.get(id) || weeklySchedules.find((item) => String(item.barber) === id)
    ).filter((item): item is NonNullable<typeof item> => Boolean(item?.isWorking));
    const scheduleByBarber = new Map(
      schedules.map((schedule) => [String(schedule.barber), schedule])
    );
    const hairSchedule = barberId ? scheduleByBarber.get(barberId) : undefined;

    if (hairServices.length > 0 && !hairSchedule) {
      return [];
    }

    const careSchedules = schedules.filter((schedule) =>
      careBarberIds.includes(String(schedule.barber))
    );
    if (careServices.length > 0 && careSchedules.length === 0) {
      return [];
    }

    const activeAppointments = await Appointment.find({
      $or: [
        { barber: { $in: relevantBarberIds } },
        { "staffAssignments.barber": { $in: relevantBarberIds } },
      ],
      appointmentDate,
      status: { $in: ACTIVE_APPOINTMENT_STATUSES },
    }).select("barber startTime endTime staffAssignments").lean();

    const isEmployeeAvailable = (
      employeeId: string,
      rangeStart: number,
      rangeEnd: number
    ): boolean => {
      const schedule = scheduleByBarber.get(employeeId);
      if (
        !schedule ||
        rangeStart < timeToMinutes(schedule.startTime) ||
        rangeEnd > timeToMinutes(schedule.endTime)
      ) {
        return false;
      }

      return !activeAppointments.some((appointment) => {
        const assignments = appointment.staffAssignments?.filter(
          (assignment) => String(assignment.barber) === employeeId
        ) ?? [];
        const intervals = assignments.length > 0
          ? assignments
          : String(appointment.barber) === employeeId
            ? [{ startTime: appointment.startTime, endTime: appointment.endTime }]
            : [];
        return intervals.some((interval) =>
          isTimeOverlap(
            rangeStart,
            rangeEnd,
            timeToMinutes(interval.startTime),
            timeToMinutes(interval.endTime)
          )
        );
      });
    };

    const candidateSchedules = hairSchedule ? [hairSchedule] : careSchedules;
    const workingStart = Math.min(
      ...candidateSchedules.map((schedule) => timeToMinutes(schedule.startTime))
    );
    const workingEnd = Math.max(
      ...candidateSchedules.map((schedule) => timeToMinutes(schedule.endTime))
    );

    const slots: Array<{
      startTime: string;
      endTime: string;
      available: boolean;
      reason?: string;
    }> = [];

    for (
      let slotStart = workingStart;
      slotStart +
        durationMinutes <=
      workingEnd;
      slotStart +=
        SLOT_INTERVAL_MINUTES
    ) {
      const slotEnd =
        slotStart +
        durationMinutes;

      const hairEnd = slotStart + hairDuration;
      const hairAvailable = hairServices.length === 0 || Boolean(
        barberId && isEmployeeAvailable(barberId, slotStart, hairEnd)
      );
      const careAvailable = careServices.length === 0 || careBarberIds.some(
        (id) => isEmployeeAvailable(id, hairEnd, slotEnd)
      );
      const available = hairAvailable && careAvailable;

      const startTime =
        minutesToTime(
          slotStart
        );

      if (
        isPastAppointment(
          appointmentDate,
          startTime
        )
      ) {
        continue;
      }

      slots.push({
        startTime,
        endTime:
          minutesToTime(
            slotEnd
          ),
        available,
        reason: available
          ? undefined
          : "Không đủ nhân viên phù hợp trong khung giờ này",
      });
    }

    return slots;
  };

/** Tự động cập nhật vắng mặt sau 15 phút và hoàn thành khi hết giờ. */
export const processAutomaticAppointmentStatuses = async () => {
  const now = new Date();
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  const candidates = await Appointment.find({
    status: { $in: ["PENDING", "CONFIRMED"] },
    appointmentDate: { $lte: today },
  }).select("appointmentDate startTime");

  const overdueIds = candidates
    .filter((appointment) => {
      const startsAt = new Date(
        `${appointment.appointmentDate}T${appointment.startTime}:00`
      );
      return now.getTime() >= startsAt.getTime() + 15 * 60 * 1000;
    })
    .map((appointment) => appointment._id);

  const result = overdueIds.length
    ? await Appointment.updateMany(
        { _id: { $in: overdueIds }, status: { $in: ["PENDING", "CONFIRMED"] } },
        { $set: { status: "NO_SHOW", noShowAt: now } }
      )
    : { modifiedCount: 0 };
  const running = await Appointment.find({
    status: "IN_PROGRESS",
    appointmentDate: { $lte: today },
  }).select("appointmentDate endTime");
  const completedIds = running.filter((appointment) => {
    const endsAt = new Date(`${appointment.appointmentDate}T${appointment.endTime}:00`);
    return now.getTime() >= endsAt.getTime();
  }).map((appointment) => appointment._id);
  const completedResult = completedIds.length
    ? await Appointment.updateMany(
        { _id: { $in: completedIds }, status: "IN_PROGRESS" },
        {
          $set: {
            status: "COMPLETED",
            completedAt: now,
            "workProgress.hair": "COMPLETED",
            "workProgress.care": "COMPLETED",
          },
        }
      )
    : { modifiedCount: 0 };

  await Promise.all([
    recordSystemActivities(
      overdueIds,
      "AUTO_NO_SHOW",
      "Hệ thống tự động chuyển lịch sang vắng mặt sau 15 phút",
      { previousStatus: "PENDING_OR_CONFIRMED", newStatus: "NO_SHOW" }
    ),
    recordSystemActivities(
      completedIds,
      "AUTO_COMPLETED",
      "Hệ thống tự động hoàn thành lịch khi hết khung giờ",
      { previousStatus: "IN_PROGRESS", newStatus: "COMPLETED" }
    ),
  ]);

  const automaticEmailAppointments =
    await Appointment.find({
      _id: {
        $in: [
          ...overdueIds,
          ...completedIds,
        ],
      },
    })
      .populate("barber", "fullName")
      .lean();

  automaticEmailAppointments.forEach(
    (appointment) => {
      const wasNoShow = overdueIds.some(
        (id) =>
          String(id) ===
          String(appointment._id)
      );

      queueAppointmentLifecycleEmail(
        appointment,
        wasNoShow
          ? "NO_SHOW"
          : "COMPLETED",
        wasNoShow
          ? "Khách hàng chưa check-in sau giờ hẹn 15 phút nên lịch đã được ghi nhận vắng mặt."
          : "Khung giờ dịch vụ đã kết thúc và lịch hẹn được hệ thống chuyển sang hoàn thành."
      );

      void createStaffNotification({
        title: wasNoShow
          ? "Khách hàng vắng mặt"
          : "Lịch chờ thanh toán",
        message: wasNoShow
          ? `${appointment.customer.fullName} chưa check-in cho lịch ${appointment.appointmentCode}.`
          : `Lịch ${appointment.appointmentCode} đã hoàn thành và cần kiểm tra thanh toán.`,
        kind: wasNoShow
          ? "NO_SHOW"
          : "WAITING_PAYMENT",
        appointmentId: appointment._id,
        dedupeKey: `${wasNoShow ? "NO_SHOW" : "WAITING_PAYMENT"}:${appointment._id}`,
      }).catch((error: unknown) => {
        console.error(
          "Không thể tạo thông báo tự động:",
          error
        );
      });
    }
  );

  return { noShow: result.modifiedCount, completed: completedResult.modifiedCount };
};

export const markOverdueAppointmentsAsNoShow = async (): Promise<number> =>
  (await processAutomaticAppointmentStatuses()).noShow;

import mongoose from "mongoose";

import Appointment, {
  type AppointmentStatus,
  type CancellationRole,
} from "../models/Appointment";

import BarberProfile from "../models/BarberProfile";
import BarberSchedule from "../models/BarberSchedule";

import Service, {
  type IService,
  type ServiceGroup,
} from "../models/Service";

import User from "../models/User";
import AppError from "../utils/AppError";

interface CreateAppointmentInput {
  barberId: string;
  serviceIds: string[];
  appointmentDate: string;
  startTime: string;
  note?: string;
}

interface CancelAppointmentInput {
  appointmentId: string;
  userId: string;
  role: CancellationRole;
  reason?: string;
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
  actorRole: "BARBER" | "ADMIN";
  status: AppointmentStatus;
  reason?: string;
}

interface AvailableSlotsInput {
  barberId: string;
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
  CONFIRMED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
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

  const schedule =
    await BarberSchedule.findOne({
      barber: barberId,
      dayOfWeek,
    }).lean();

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

  const breaks = Array.isArray(
    schedule.breaks
  )
    ? schedule.breaks
    : [];

  const overlapsBreak =
    breaks.some((breakTime) => {
      const breakStart =
        timeToMinutes(
          breakTime.startTime
        );

      const breakEnd =
        timeToMinutes(
          breakTime.endTime
        );

      return isTimeOverlap(
        appointmentStart,
        appointmentEnd,
        breakStart,
        breakEnd
      );
    });

  if (overlapsBreak) {
    throw new AppError(
      "Khoảng thời gian đã chọn trùng với giờ nghỉ của Barber",
      409
    );
  }
};

const validateAppointmentConflict =
  async (
    barberId: string,
    appointmentDate: string,
    startTime: string,
    endTime: string,
    excludedAppointmentId?: string
  ): Promise<void> => {
    const query: AppointmentQuery = {
      barber: barberId,
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
          "startTime endTime"
        )
        .lean();

    const requestedStart =
      timeToMinutes(startTime);

    const requestedEnd =
      timeToMinutes(endTime);

    const conflictingAppointment =
      appointments.find(
        (appointment) => {
          const existingStart =
            timeToMinutes(
              appointment.startTime
            );

          const existingEnd =
            timeToMinutes(
              appointment.endTime
            );

          return isTimeOverlap(
            requestedStart,
            requestedEnd,
            existingStart,
            existingEnd
          );
        }
      );

    if (conflictingAppointment) {
      throw new AppError(
        `Barber đã có lịch từ ${conflictingAppointment.startTime} đến ${conflictingAppointment.endTime}`,
        409
      );
    }
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
      }).select("_id");

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
    } = input;

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

    await validateBarber(barberId);

    const normalizedServices =
      await normalizeServices(
        serviceIds
      );

    const totalPrice =
      normalizedServices.reduce(
        (total, service) =>
          total +
          service.priceSnapshot,
        0
      );

    const durationMinutes =
      normalizedServices.reduce(
        (total, service) =>
          total +
          service.durationSnapshot,
        0
      );

    const startMinutes =
      timeToMinutes(startTime);

    const endMinutes =
      startMinutes +
      durationMinutes;

    if (endMinutes >= 24 * 60) {
      throw new AppError(
        "Thời gian kết thúc lịch hẹn không hợp lệ",
        400
      );
    }

    const endTime =
      minutesToTime(endMinutes);

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

    const appointment =
      await Appointment.create({
        client: clientId,
        barber: barberId,

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

        totalPrice,
        durationMinutes,

        appointmentDate,
        startTime,
        endTime,

        status: "PENDING",
        paymentStatus: "UNPAID",

        note:
          typeof note === "string"
            ? note.trim()
            : "",
      });

    return populateAppointment(
      String(appointment._id)
    );
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

    appointment.status =
      "CANCELLED";

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
    };

    await appointment.save();

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

    const filter: AppointmentQuery = {
      barber: barberId,
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

    return Appointment.find(filter)
      .populate(
        "client",
        "fullName email phone role status"
      )
      .populate(
        "services.service",
        "name image group isActive"
      )
      .sort({
        appointmentDate: 1,
        startTime: 1,
      })
      .lean();
  };

/**
 * BARBER hoặc ADMIN cập nhật trạng thái.
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

    if (
      actorRole === "BARBER" &&
      String(
        appointment.barber
      ) !== actorId
    ) {
      throw new AppError(
        "Bạn không có quyền cập nhật lịch hẹn này",
        403
      );
    }

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

    if (status === "COMPLETED") {
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
              : "Barber"
          } hủy lịch`,

        cancelledAt:
          new Date(),
      };
    }

    await appointment.save();

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

    await validateBarber(
      barberId
    );

    const services =
      await normalizeServices(
        serviceIds
      );

    const durationMinutes =
      services.reduce(
        (total, service) =>
          total +
          service.durationSnapshot,
        0
      );

    const dayOfWeek =
      getDayOfWeek(
        appointmentDate
      );

    const schedule =
      await BarberSchedule.findOne({
        barber: barberId,
        dayOfWeek,
        isWorking: true,
      }).lean();

    if (!schedule) {
      return [];
    }

    const activeAppointments =
      await Appointment.find({
        barber: barberId,
        appointmentDate,
        status: {
          $in:
            ACTIVE_APPOINTMENT_STATUSES,
        },
      })
        .select(
          "startTime endTime"
        )
        .lean();

    const workingStart =
      timeToMinutes(
        schedule.startTime
      );

    const workingEnd =
      timeToMinutes(
        schedule.endTime
      );

    const breaks =
      Array.isArray(
        schedule.breaks
      )
        ? schedule.breaks
        : [];

    const slots: Array<{
      startTime: string;
      endTime: string;
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

      const overlapsBreak =
        breaks.some(
          (breakTime) =>
            isTimeOverlap(
              slotStart,
              slotEnd,
              timeToMinutes(
                breakTime.startTime
              ),
              timeToMinutes(
                breakTime.endTime
              )
            )
        );

      if (overlapsBreak) {
        continue;
      }

      const overlapsAppointment =
        activeAppointments.some(
          (appointment) =>
            isTimeOverlap(
              slotStart,
              slotEnd,
              timeToMinutes(
                appointment.startTime
              ),
              timeToMinutes(
                appointment.endTime
              )
            )
        );

      if (overlapsAppointment) {
        continue;
      }

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
      });
    }

    return slots;
  };
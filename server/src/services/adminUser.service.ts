import mongoose from "mongoose";

import Appointment from "../models/Appointment";
import Payment from "../models/Payment";
import User, {
  type UserStatus,
} from "../models/User";
import AppError from "../utils/AppError";
import BarberProfile from "../models/BarberProfile";
import BarberSchedule from "../models/BarberSchedule";
import type { UserRole } from "../models/User";

interface GetClientsInput {
  keyword?: string;
  status?: UserStatus | "ALL";
  role?: UserRole | "ALL";
  page?: number;
  limit?: number;
}

const statuses: UserStatus[] = [
  "ACTIVE",
  "INACTIVE",
  "BLOCKED",
];

const roles: UserRole[] = [
  "CLIENT",
  "BARBER",
  "RECEPTIONIST",
  "ADMIN",
];

const assertObjectId = (value: string): void => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new AppError("Mã khách hàng không hợp lệ", 400);
  }
};

export const getAdminClients = async (
  input: GetClientsInput
) => {
  const page = Math.max(1, Number(input.page) || 1);
  const limit = Math.min(
    50,
    Math.max(1, Number(input.limit) || 10)
  );

  const filter: Record<string, unknown> = {};

  if (input.role && input.role !== "ALL") {
    if (!roles.includes(input.role)) {
      throw new AppError("Vai trò không hợp lệ", 400);
    }

    filter.role = input.role;
  }

  if (input.status && input.status !== "ALL") {
    if (!statuses.includes(input.status)) {
      throw new AppError("Trạng thái không hợp lệ", 400);
    }

    filter.status = input.status;
  }

  if (input.keyword?.trim()) {
    const regex = new RegExp(input.keyword.trim(), "i");

    filter.$or = [
      { fullName: regex },
      { email: regex },
      { phone: regex },
    ];
  }

  const [clients, totalItems, statusSummary] =
    await Promise.all([
      User.find(filter)
        .select(
          "fullName email phone avatar role status lastLoginAt createdAt updatedAt"
        )
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      User.countDocuments(filter),

      User.aggregate([
        {
          $match: {},
        },
        {
          $group: {
            _id: {
              role: "$role",
              status: "$status",
            },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

  const clientIds = clients.map((client) => client._id);

  const [clientAppointmentStats, barberAppointmentStats, paymentStats] =
    await Promise.all([
      Appointment.aggregate([
        {
          $match: {
            client: { $in: clientIds },
          },
        },
        {
          $group: {
            _id: "$client",
            totalAppointments: { $sum: 1 },
            completedAppointments: {
              $sum: {
                $cond: [
                  { $eq: ["$status", "COMPLETED"] },
                  1,
                  0,
                ],
              },
            },
            lastAppointmentDate: {
              $max: "$appointmentDate",
            },
          },
        },
      ]),

      Appointment.aggregate([
        {
          $match: {
            barber: { $in: clientIds },
          },
        },
        {
          $group: {
            _id: "$barber",
            totalAppointments: { $sum: 1 },
            completedAppointments: {
              $sum: {
                $cond: [
                  { $eq: ["$status", "COMPLETED"] },
                  1,
                  0,
                ],
              },
            },
            lastAppointmentDate: {
              $max: "$appointmentDate",
            },
          },
        },
      ]),

      Payment.aggregate([
        {
          $match: {
            client: { $in: clientIds },
            status: "PAID",
          },
        },
        {
          $group: {
            _id: "$client",
            totalSpent: { $sum: "$amount" },
          },
        },
      ]),
    ]);

  const clientAppointmentMap = new Map(
    clientAppointmentStats.map((item) => [
      String(item._id),
      item,
    ])
  );

  const barberAppointmentMap = new Map(
    barberAppointmentStats.map((item) => [
      String(item._id),
      item,
    ])
  );

  const paymentMap = new Map(
    paymentStats.map((item) => [
      String(item._id),
      item.totalSpent,
    ])
  );

  const summaryMap = new Map(
    statusSummary.map((item) => [
      `${item._id.role}:${item._id.status}`,
      item.count,
    ])
  );

  return {
    items: clients.map((client) => {
      const stats =
        client.role === "BARBER"
          ? barberAppointmentMap.get(String(client._id))
          : clientAppointmentMap.get(String(client._id));

      return {
        id: String(client._id),
        fullName: client.fullName,
        email: client.email,
        phone: client.phone,
        avatar: client.avatar,
        role: client.role,
        status: client.status,
        lastLoginAt: client.lastLoginAt ?? null,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
        totalAppointments:
          stats?.totalAppointments ?? 0,
        completedAppointments:
          stats?.completedAppointments ?? 0,
        lastAppointmentDate:
          stats?.lastAppointmentDate ?? null,
        totalSpent:
          paymentMap.get(String(client._id)) ?? 0,
      };
    }),
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.max(
        1,
        Math.ceil(totalItems / limit)
      ),
    },
    summary: {
      totalUsers:
        statusSummary.reduce(
          (total, item) => total + item.count,
          0
        ),
      totalClients:
        roles.reduce(
          (total, role) =>
            role === "CLIENT"
              ? total + statuses.reduce(
                  (sum, status) =>
                    sum + (summaryMap.get(`${role}:${status}`) ?? 0),
                  0
                )
              : total,
          0
        ),
      totalBarbers:
        statuses.reduce(
          (sum, status) =>
            sum + (summaryMap.get(`BARBER:${status}`) ?? 0),
          0
        ),
      totalReceptionists:
        statuses.reduce(
          (sum, status) =>
            sum + (summaryMap.get(`RECEPTIONIST:${status}`) ?? 0),
          0
        ),
      totalAdmins:
        statuses.reduce(
          (sum, status) =>
            sum + (summaryMap.get(`ADMIN:${status}`) ?? 0),
          0
        ),
      activeUsers:
        roles.reduce(
          (sum, role) =>
            sum + (summaryMap.get(`${role}:ACTIVE`) ?? 0),
          0
        ),
      blockedUsers:
        roles.reduce(
          (sum, role) =>
            sum + (summaryMap.get(`${role}:BLOCKED`) ?? 0),
          0
        ),
    },
  };
};

export const getAdminClientById = async (
  clientId: string
) => {
  assertObjectId(clientId);

  const client = await User.findById(clientId)
    .select(
      "fullName email phone avatar role status lastLoginAt createdAt updatedAt"
    )
    .lean();

  if (!client) {
    throw new AppError("Không tìm thấy khách hàng", 404);
  }

  const appointmentFilter =
    client.role === "BARBER"
      ? { barber: clientId }
      : client.role === "CLIENT"
        ? { client: clientId }
        : { _id: { $exists: false } };

  const [appointments, totalSpent, barberProfile] = await Promise.all([
    Appointment.find(appointmentFilter)
      .populate(
        "barber",
        "fullName email phone"
      )
      .select(
        "barber services totalPrice appointmentDate startTime endTime status paymentStatus createdAt"
      )
      .sort({ appointmentDate: -1, startTime: -1 })
      .limit(10)
      .lean(),

    Payment.aggregate([
      {
        $match: {
          client: new mongoose.Types.ObjectId(clientId),
          status: "PAID",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]),

    client.role === "BARBER"
      ? BarberProfile.findOne({ user: clientId })
          .populate(
            "specialties",
            "name price durationMinutes group isActive"
          )
          .lean()
      : null,
  ]);

  return {
    id: String(client._id),
    fullName: client.fullName,
    email: client.email,
    phone: client.phone,
    avatar: client.avatar,
    role: client.role,
    status: client.status,
    lastLoginAt: client.lastLoginAt ?? null,
    createdAt: client.createdAt,
    updatedAt: client.updatedAt,
    totalAppointments:
      await Appointment.countDocuments(appointmentFilter),
    totalSpent: totalSpent[0]?.total ?? 0,
    recentAppointments: appointments,
    barberProfile,
  };
};

export const updateAdminClientStatus = async (
  clientId: string,
  status: UserStatus,
  actorId: string
) => {
  assertObjectId(clientId);

  if (clientId === actorId) {
    throw new AppError(
      "Admin không thể tự thay đổi trạng thái tài khoản của mình",
      400
    );
  }

  if (!statuses.includes(status)) {
    throw new AppError("Trạng thái không hợp lệ", 400);
  }

  const client = await User.findByIdAndUpdate(
    clientId,
    {
      status,
    },
    {
      new: true,
      runValidators: true,
    }
  )
    .select(
      "fullName email phone avatar role status lastLoginAt createdAt updatedAt"
    )
    .lean();

  if (!client) {
    throw new AppError("Không tìm thấy khách hàng", 404);
  }

  return client;
};

export const deleteAdminUser = async (userId: string, actorId: string) => {
  assertObjectId(userId);

  if (userId === actorId) {
    throw new AppError("Admin không thể tự xóa tài khoản của mình", 400);
  }

  const user = await User.findById(userId);
  if (!user) throw new AppError("Không tìm thấy người dùng", 404);

  if (user.role === "ADMIN" || user.role === "RECEPTIONIST") {
    throw new AppError("Không thể xóa tài khoản Admin hoặc Lễ tân", 403);
  }

  if (user.role === "BARBER") {
    await Promise.all([
      BarberProfile.deleteOne({ user: user._id }),
      BarberSchedule.deleteMany({ barber: user._id }),
    ]);
  }

  await user.deleteOne();
  return { id: userId, fullName: user.fullName, role: user.role };
};

import bcrypt from "bcrypt";
import mongoose from "mongoose";

import BarberProfile from "../models/BarberProfile";
import BarberSchedule from "../models/BarberSchedule";
import Service from "../models/Service";
import User, {
  type UserStatus,
} from "../models/User";

import AppError from "../utils/AppError";

interface GetBarbersQuery {
  keyword?: string;
  status?: UserStatus | "ALL";
  page?: number;
  limit?: number;
}

interface CreateBarberInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;

  avatar?: string;
  bio?: string;
  experienceYears?: number;
  specialtyIds?: string[];
  staffType?: "HAIR" | "CARE";
}

interface UpdateBarberInput {
  fullName?: string;
  phone?: string;
  avatar?: string;

  bio?: string;
  experienceYears?: number;
  specialtyIds?: string[];
  staffType?: "HAIR" | "CARE";
}

interface UpdateBarberStatusInput {
  status: UserStatus;
}

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PHONE_PATTERN =
  /^(0|\+84)[0-9]{9,10}$/;

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

const normalizePage = (
  value?: number
): number => {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < 1
  ) {
    return 1;
  }

  return value;
};

const normalizeLimit = (
  value?: number
): number => {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < 1
  ) {
    return 10;
  }

  return Math.min(value, 50);
};

const normalizeEmail = (
  email: string
): string =>
  email.toLowerCase().trim();

const validateFullName = (
  fullName: string
): string => {
  const normalized =
    fullName.trim();

  if (normalized.length < 2) {
    throw new AppError(
      "Họ tên phải có ít nhất 2 ký tự",
      400
    );
  }

  if (normalized.length > 100) {
    throw new AppError(
      "Họ tên không được quá 100 ký tự",
      400
    );
  }

  return normalized;
};

const validateEmail = (
  email: string
): string => {
  const normalized =
    normalizeEmail(email);

  if (
    !EMAIL_PATTERN.test(normalized)
  ) {
    throw new AppError(
      "Email không hợp lệ",
      400
    );
  }

  return normalized;
};

const validatePhone = (
  phone: string
): string => {
  const normalized =
    phone.trim();

  if (
    !PHONE_PATTERN.test(normalized)
  ) {
    throw new AppError(
      "Số điện thoại không hợp lệ",
      400
    );
  }

  return normalized;
};

const validateExperienceYears = (
  experienceYears: number
): number => {
  if (
    !Number.isInteger(
      experienceYears
    ) ||
    experienceYears < 0 ||
    experienceYears > 60
  ) {
    throw new AppError(
      "Số năm kinh nghiệm không hợp lệ",
      400
    );
  }

  return experienceYears;
};

const normalizeSpecialtyIds = async (
  specialtyIds: string[]
): Promise<mongoose.Types.ObjectId[]> => {
  if (!Array.isArray(specialtyIds)) {
    throw new AppError(
      "Danh sách chuyên môn không hợp lệ",
      400
    );
  }

  const uniqueIds = [
    ...new Set(
      specialtyIds
        .map((id) => id.trim())
        .filter(Boolean)
    ),
  ];

  uniqueIds.forEach((serviceId) => {
    assertObjectId(
      serviceId,
      "Mã dịch vụ chuyên môn không hợp lệ"
    );
  });

  if (uniqueIds.length === 0) {
    return [];
  }

  const services =
    await Service.find({
      _id: {
        $in: uniqueIds,
      },
      isActive: true,
    }).select("_id");

  if (
    services.length !==
    uniqueIds.length
  ) {
    throw new AppError(
      "Một hoặc nhiều dịch vụ không tồn tại hoặc đã ngừng hoạt động",
      404
    );
  }

  return services.map(
    (service) =>
      service._id as mongoose.Types.ObjectId
  );
};

const createDefaultSchedules = async (
  barberId: mongoose.Types.ObjectId
): Promise<void> => {
  const operations = Array.from(
    {
      length: 7,
    },
    (_, dayOfWeek) => {
      const isSunday =
        dayOfWeek === 0;

      return {
        updateOne: {
          filter: {
            barber: barberId,
            dayOfWeek,
          },

          update: {
            $setOnInsert: {
              barber: barberId,
              dayOfWeek,
              startTime: "09:00",
              endTime: "21:00",
              breaks: isSunday
                ? []
                : [
                    {
                      startTime:
                        "12:00",
                      endTime:
                        "13:00",
                    },
                  ],
              isWorking:
                !isSunday,
            },
          },

          upsert: true,
        },
      };
    }
  );

  await BarberSchedule.bulkWrite(
    operations
  );
};

const getBarberByIdOrFail =
  async (barberId: string) => {
    assertObjectId(
      barberId,
      "Mã Barber không hợp lệ"
    );

    const barber =
      await User.findOne({
        _id: barberId,
        role: "BARBER",
      });

    if (!barber) {
      throw new AppError(
        "Không tìm thấy Barber",
        404
      );
    }

    return barber;
  };

const getPopulatedBarberProfile =
  async (barberId: string) => {
    const barber =
      await User.findOne({
        _id: barberId,
        role: "BARBER",
      })
        .select(
          "_id fullName email phone avatar role status lastLoginAt createdAt updatedAt"
        )
        .lean();

    if (!barber) {
      throw new AppError(
        "Không tìm thấy Barber",
        404
      );
    }

    const profile =
      await BarberProfile.findOne({
        user: barber._id,
      })
        .populate(
          "specialties",
          [
            "name",
            "description",
            "price",
            "priceFrom",
            "durationMinutes",
            "group",
            "image",
            "isActive",
          ].join(" ")
        )
        .lean();

    return {
      id: String(barber._id),

      fullName:
        barber.fullName,

      email:
        barber.email,

      phone:
        barber.phone,

      avatar:
        barber.avatar,

      role:
        barber.role,

      status:
        barber.status,

      lastLoginAt:
        barber.lastLoginAt,

      createdAt:
        barber.createdAt,

      updatedAt:
        barber.updatedAt,

      profile: profile
        ? {
            id: String(
              profile._id
            ),

            bio:
              profile.bio,

            avatar:
              profile.avatar,

            experienceYears:
              profile.experienceYears,

            averageRating:
              profile.averageRating,

            reviewCount:
              profile.reviewCount,

            staffType:
              profile.staffType,

            specialties:
              profile.specialties,

            isActive:
              profile.isActive,

            createdAt:
              profile.createdAt,

            updatedAt:
              profile.updatedAt,
          }
        : null,
    };
  };

/**
 * Admin lấy danh sách Barber.
 */
export const getAdminBarbers =
  async (
    query: GetBarbersQuery
  ) => {
    const page =
      normalizePage(query.page);

    const limit =
      normalizeLimit(query.limit);

    const skip =
      (page - 1) * limit;

    const filter: Record<
      string,
      unknown
    > = {
      role: "BARBER",
    };

    if (
      query.status &&
      query.status !== "ALL"
    ) {
      filter.status =
        query.status;
    }

    const keyword =
      query.keyword?.trim();

    if (keyword) {
      filter.$or = [
        {
          fullName: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          email: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          phone: {
            $regex: keyword,
            $options: "i",
          },
        },
      ];
    }

    const [
      users,
      totalItems,
    ] = await Promise.all([
      User.find(filter)
        .select(
          "_id fullName email phone avatar role status lastLoginAt createdAt updatedAt"
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      User.countDocuments(filter),
    ]);

    const userIds =
      users.map(
        (user) => user._id
      );

    const profiles =
      await BarberProfile.find({
        user: {
          $in: userIds,
        },
      })
        .populate(
          "specialties",
          "name price durationMinutes group image isActive"
        )
        .lean();

    const profileMap =
      new Map(
        profiles.map(
          (profile) => [
            String(profile.user),
            profile,
          ]
        )
      );

    const items =
      users.map((user) => {
        const profile =
          profileMap.get(
            String(user._id)
          );

        return {
          id: String(user._id),

          fullName:
            user.fullName,

          email:
            user.email,

          phone:
            user.phone,

          avatar:
            user.avatar,

          status:
            user.status,

          lastLoginAt:
            user.lastLoginAt,

          createdAt:
            user.createdAt,

          updatedAt:
            user.updatedAt,

          profile: profile
            ? {
                id: String(
                  profile._id
                ),

                bio:
                  profile.bio,

                avatar:
                  profile.avatar,

                experienceYears:
                  profile.experienceYears,

                averageRating:
                  profile.averageRating,

                reviewCount:
                  profile.reviewCount,

                staffType:
                  profile.staffType,

                specialties:
                  profile.specialties,

                isActive:
                  profile.isActive,
              }
            : null,
        };
      });

    const totalPages =
      Math.max(
        1,
        Math.ceil(
          totalItems / limit
        )
      );

    return {
      items,

      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    };
  };

/**
 * Admin xem chi tiết Barber.
 */
export const getAdminBarberById =
  async (barberId: string) => {
    return getPopulatedBarberProfile(
      barberId
    );
  };

/**
 * Admin tạo Barber mới.
 */
export const createAdminBarber =
  async (
    input: CreateBarberInput
  ) => {
    const fullName =
      validateFullName(
        input.fullName
      );

    const email =
      validateEmail(
        input.email
      );

    const phone =
      validatePhone(
        input.phone
      );

    if (
      typeof input.password !==
        "string" ||
      input.password.length < 6
    ) {
      throw new AppError(
        "Mật khẩu phải có ít nhất 6 ký tự",
        400
      );
    }

    const existingEmail =
      await User.findOne({
        email,
      }).select("_id");

    if (existingEmail) {
      throw new AppError(
        "Email đã tồn tại",
        409
      );
    }

    const specialtyIds =
      input.specialtyIds
        ? await normalizeSpecialtyIds(
            input.specialtyIds
          )
        : [];

    const hashedPassword =
      await bcrypt.hash(
        input.password,
        10
      );

    const barber =
      await User.create({
        fullName,
        email,
        phone,
        password:
          hashedPassword,
        avatar:
          input.avatar?.trim() ??
          "",
        role: "BARBER",
        status: "ACTIVE",
      });

    await BarberProfile.create({
      user: barber._id,

      bio:
        input.bio?.trim() ??
        "",

      avatar:
        input.avatar?.trim() ??
        "",

      experienceYears:
        input.experienceYears !==
        undefined
          ? validateExperienceYears(
              input.experienceYears
            )
          : 0,

      specialties:
        specialtyIds,

      staffType:
        input.staffType === "CARE" ? "CARE" : "HAIR",

      averageRating: 0,
      reviewCount: 0,
      isActive: true,
    });

    await createDefaultSchedules(
      barber._id as mongoose.Types.ObjectId
    );

    return getPopulatedBarberProfile(
      String(barber._id)
    );
  };

/**
 * Admin cập nhật thông tin Barber.
 */
export const updateAdminBarber =
  async (
    barberId: string,
    input: UpdateBarberInput
  ) => {
    const barber =
      await getBarberByIdOrFail(
        barberId
      );

    if (
      input.fullName !== undefined
    ) {
      barber.fullName =
        validateFullName(
          input.fullName
        );
    }

    if (
      input.phone !== undefined
    ) {
      barber.phone =
        validatePhone(
          input.phone
        );
    }

    if (
      input.avatar !== undefined
    ) {
      barber.avatar =
        input.avatar.trim();
    }

    await barber.save();

    const profileUpdate: {
      bio?: string;
      avatar?: string;
      experienceYears?: number;
      specialties?: mongoose.Types.ObjectId[];
      staffType?: "HAIR" | "CARE";
      isActive?: boolean;
    } = {};

    if (input.bio !== undefined) {
      const bio =
        input.bio.trim();

      if (bio.length > 1000) {
        throw new AppError(
          "Mô tả không được quá 1000 ký tự",
          400
        );
      }

      profileUpdate.bio = bio;
    }

    if (
      input.avatar !== undefined
    ) {
      profileUpdate.avatar =
        input.avatar.trim();
    }

    if (
      input.experienceYears !==
      undefined
    ) {
      profileUpdate.experienceYears =
        validateExperienceYears(
          input.experienceYears
        );
    }

    if (
      input.specialtyIds !==
      undefined
    ) {
      profileUpdate.specialties =
        await normalizeSpecialtyIds(
          input.specialtyIds
        );
    }

    if (input.staffType !== undefined) {
      profileUpdate.staffType =
        input.staffType === "CARE" ? "CARE" : "HAIR";
    }

    await BarberProfile.findOneAndUpdate(
      {
        user: barber._id,
      },
      {
        $set: profileUpdate,

        $setOnInsert: {
          user: barber._id,
          averageRating: 0,
          reviewCount: 0,
          isActive: true,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
        setDefaultsOnInsert: true,
      }
    );

    return getPopulatedBarberProfile(
      barberId
    );
  };

/**
 * Admin khóa, mở khóa hoặc vô hiệu hóa Barber.
 */
export const updateAdminBarberStatus =
  async (
    barberId: string,
    input: UpdateBarberStatusInput
  ) => {
    const allowedStatuses: UserStatus[] =
      [
        "ACTIVE",
        "INACTIVE",
        "BLOCKED",
      ];

    if (
      !allowedStatuses.includes(
        input.status
      )
    ) {
      throw new AppError(
        "Trạng thái Barber không hợp lệ",
        400
      );
    }

    const barber =
      await getBarberByIdOrFail(
        barberId
      );

    barber.status =
      input.status;

    await barber.save();

    await BarberProfile.findOneAndUpdate(
      {
        user: barber._id,
      },
      {
        $set: {
          isActive:
            input.status ===
            "ACTIVE",
        },
      }
    );

    return getPopulatedBarberProfile(
      barberId
    );
  };

/**
 * Admin đặt lại mật khẩu Barber.
 */
export const resetAdminBarberPassword =
  async (
    barberId: string,
    newPassword: string
  ) => {
    if (
      typeof newPassword !==
        "string" ||
      newPassword.length < 6
    ) {
      throw new AppError(
        "Mật khẩu mới phải có ít nhất 6 ký tự",
        400
      );
    }

    const barber =
      await getBarberByIdOrFail(
        barberId
      );

    barber.password =
      await bcrypt.hash(
        newPassword,
        10
      );

    barber.passwordChangedAt =
      new Date();

    await barber.save();

    return {
      id: String(barber._id),

      fullName:
        barber.fullName,

      email:
        barber.email,
    };
  };

/** Xóa tài khoản Barber và toàn bộ dữ liệu vận hành trực thuộc Barber. */
export const deleteAdminBarber = async (barberId: string) => {
  const barber = await getBarberByIdOrFail(barberId);

  await Promise.all([
    BarberProfile.deleteOne({ user: barber._id }),
    BarberSchedule.deleteMany({ barber: barber._id }),
  ]);

  await barber.deleteOne();

  return {
    id: barberId,
    fullName: barber.fullName,
  };
};

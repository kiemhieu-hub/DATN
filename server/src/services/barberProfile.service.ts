import mongoose from "mongoose";

import BarberProfile from "../models/BarberProfile";
import Service from "../models/Service";
import User from "../models/User";
import AppError from "../utils/AppError";

interface UpdateBarberProfileInput {
  fullName?: string;
  phone?: string;
  avatar?: string;

  bio?: string;
  experienceYears?: number;
  specialtyIds?: string[];
}

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

const validateBarberAccount = async (
  barberId: string
) => {
  assertObjectId(
    barberId,
    "Tài khoản Barber không hợp lệ"
  );

  const barber = await User.findOne({
    _id: barberId,
    role: "BARBER",
    status: "ACTIVE",
  }).select(
    "_id fullName email phone avatar role status createdAt updatedAt"
  );

  if (!barber) {
    throw new AppError(
      "Không tìm thấy tài khoản Barber đang hoạt động",
      404
    );
  }

  return barber;
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
      specialtyIds.map((id) => id.trim())
    ),
  ].filter(Boolean);

  uniqueIds.forEach((serviceId) => {
    assertObjectId(
      serviceId,
      "Mã dịch vụ chuyên môn không hợp lệ"
    );
  });

  if (uniqueIds.length === 0) {
    return [];
  }

  const services = await Service.find({
    _id: {
      $in: uniqueIds,
    },
    isActive: true,
  }).select("_id");

  if (services.length !== uniqueIds.length) {
    throw new AppError(
      "Một hoặc nhiều dịch vụ chuyên môn không tồn tại hoặc đã ngừng hoạt động",
      404
    );
  }

  return services.map(
    (service) =>
      service._id as mongoose.Types.ObjectId
  );
};

/**
 * Lấy hồ sơ của Barber đang đăng nhập.
 */
export const getMyBarberProfile = async (
  barberId: string
) => {
  const barber =
    await validateBarberAccount(barberId);

  const profile =
    await BarberProfile.findOne({
      user: barberId,
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

  if (!profile) {
    throw new AppError(
      "Không tìm thấy hồ sơ Barber",
      404
    );
  }

  return {
    account: {
      id: String(barber._id),
      fullName: barber.fullName,
      email: barber.email,
      phone: barber.phone,
      avatar: barber.avatar,
      role: barber.role,
      status: barber.status,
      createdAt: barber.createdAt,
      updatedAt: barber.updatedAt,
    },

    profile: {
      id: String(profile._id),
      bio: profile.bio,
      avatar: profile.avatar,
      experienceYears:
        profile.experienceYears,
      averageRating:
        profile.averageRating,
      reviewCount:
        profile.reviewCount,
      specialties:
        profile.specialties,
      isActive: profile.isActive,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    },
  };
};

/**
 * Barber cập nhật hồ sơ của chính mình.
 */
export const updateMyBarberProfile = async (
  barberId: string,
  input: UpdateBarberProfileInput
) => {
  const barber =
    await validateBarberAccount(barberId);

  if (
    input.fullName !== undefined
  ) {
    const fullName =
      input.fullName.trim();

    if (fullName.length < 2) {
      throw new AppError(
        "Họ tên phải có ít nhất 2 ký tự",
        400
      );
    }

    barber.fullName = fullName;
  }

  if (input.phone !== undefined) {
    const phone = input.phone.trim();

    if (
      !/^(0|\+84)[0-9]{9,10}$/.test(
        phone
      )
    ) {
      throw new AppError(
        "Số điện thoại không hợp lệ",
        400
      );
    }

    barber.phone = phone;
  }

  if (input.avatar !== undefined) {
    barber.avatar =
      input.avatar.trim();
  }

  await barber.save();

  const profileUpdate: {
    bio?: string;
    avatar?: string;
    experienceYears?: number;
    specialties?: mongoose.Types.ObjectId[];
  } = {};

  if (input.bio !== undefined) {
    const bio = input.bio.trim();

    if (bio.length > 1000) {
      throw new AppError(
        "Mô tả không được quá 1000 ký tự",
        400
      );
    }

    profileUpdate.bio = bio;
  }

  if (input.avatar !== undefined) {
    profileUpdate.avatar =
      input.avatar.trim();
  }

  if (
    input.experienceYears !== undefined
  ) {
    if (
      !Number.isInteger(
        input.experienceYears
      ) ||
      input.experienceYears < 0 ||
      input.experienceYears > 60
    ) {
      throw new AppError(
        "Số năm kinh nghiệm không hợp lệ",
        400
      );
    }

    profileUpdate.experienceYears =
      input.experienceYears;
  }

  if (input.specialtyIds !== undefined) {
    profileUpdate.specialties =
      await normalizeSpecialtyIds(
        input.specialtyIds
      );
  }

  await BarberProfile.findOneAndUpdate(
    {
      user: barberId,
    },
    {
      $set: profileUpdate,
    },
    {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
    }
  );

  return getMyBarberProfile(barberId);
};
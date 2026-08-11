import bcrypt from "bcrypt";
import dotenv from "dotenv";
import mongoose from "mongoose";

import BarberProfile from "../models/BarberProfile";
import BarberSchedule from "../models/BarberSchedule";
import HairstyleGallery from "../models/HairstyleGallery";
import Service from "../models/Service";
import User from "../models/User";

dotenv.config();

interface SeedService {
  name: string;
  description: string;
  price: number;
  priceFrom: boolean;
  durationMinutes: number;
  group:
    | "HAIRCUT"
    | "BEARD"
    | "COLOR"
    | "CARE"
    | "OTHER";
  isExclusiveInGroup: boolean;
  staffType: "HAIR" | "CARE";
  image: string;
  isActive: boolean;
}

interface SeedAdmin {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

interface SeedBarber {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  bio: string;
  experienceYears: number;
  staffType: "HAIR" | "CARE";
}

const services: SeedService[] = [
  {
    name: "Cắt tóc cơ bản",
    description:
      "Dịch vụ cắt tóc nam cơ bản, phù hợp với nhiều kiểu tóc.",
    price: 100000,
    priceFrom: false,
    durationMinutes: 45,
    group: "HAIRCUT",
    isExclusiveInGroup: true,
    staffType: "HAIR",
    image: "/img/services/1.jpg",
    isActive: true,
  },
  {
    name: "Cắt Fade chuyên nghiệp",
    description:
      "Cắt Fade với kỹ thuật chuyển tầng và tạo form chuyên nghiệp.",
    price: 130000,
    priceFrom: false,
    durationMinutes: 60,
    group: "HAIRCUT",
    isExclusiveInGroup: true,
    staffType: "HAIR",
    image: "/img/services/2.jpg",
    isActive: true,
  },
  {
    name: "Combo cắt tóc cao cấp",
    description:
      "Combo cắt tóc, gội đầu và tạo kiểu hoàn chỉnh.",
    price: 180000,
    priceFrom: false,
    durationMinutes: 90,
    group: "HAIRCUT",
    isExclusiveInGroup: true,
    staffType: "HAIR",
    image: "/img/services/3.jpg",
    isActive: true,
  },
  {
    name: "Tỉa râu cơ bản",
    description:
      "Tỉa gọn và định hình râu cơ bản.",
    price: 50000,
    priceFrom: false,
    durationMinutes: 30,
    group: "BEARD",
    isExclusiveInGroup: true,
    staffType: "HAIR",
    image: "/img/services/1.jpg",
    isActive: true,
  },
  {
    name: "Tạo kiểu và viền râu",
    description:
      "Tạo kiểu, viền và làm gọn đường nét râu.",
    price: 80000,
    priceFrom: false,
    durationMinutes: 45,
    group: "BEARD",
    isExclusiveInGroup: true,
    staffType: "HAIR",
    image: "/img/services/2.jpg",
    isActive: true,
  },
  {
    name: "Combo chăm sóc râu",
    description:
      "Tỉa, tạo kiểu và chăm sóc râu toàn diện.",
    price: 120000,
    priceFrom: false,
    durationMinutes: 60,
    group: "BEARD",
    isExclusiveInGroup: true,
    staffType: "HAIR",
    image: "/img/services/3.jpg",
    isActive: true,
  },
  {
    name: "Cạo mặt khăn nóng",
    description:
      "Cạo mặt kết hợp khăn nóng giúp da thư giãn.",
    price: 70000,
    priceFrom: false,
    durationMinutes: 30,
    group: "CARE",
    isExclusiveInGroup: false,
    staffType: "CARE",
    image: "/img/services/1.jpg",
    isActive: true,
  },
  {
    name: "Gội đầu và massage",
    description:
      "Gội đầu thư giãn kết hợp massage đầu.",
    price: 60000,
    priceFrom: false,
    durationMinutes: 30,
    group: "CARE",
    isExclusiveInGroup: false,
    staffType: "CARE",
    image: "/img/services/2.jpg",
    isActive: true,
  },
  {
    name: "Chăm sóc da mặt cơ bản",
    description:
      "Làm sạch và chăm sóc da mặt cơ bản dành cho nam.",
    price: 150000,
    priceFrom: false,
    durationMinutes: 60,
    group: "CARE",
    isExclusiveInGroup: false,
    staffType: "CARE",
    image: "/img/services/3.jpg",
    isActive: true,
  },
  {
    name: "Uốn tạo kiểu",
    description:
      "Uốn tóc nam và tạo kiểu theo tình trạng tóc.",
    price: 400000,
    priceFrom: true,
    durationMinutes: 120,
    group: "OTHER",
    isExclusiveInGroup: false,
    staffType: "HAIR",
    image: "/img/services/1.jpg",
    isActive: true,
  },
  {
    name: "Nhuộm tóc nam",
    description:
      "Nhuộm tóc nam không tẩy, thời gian dự kiến 90 phút.",
    price: 350000,
    priceFrom: true,
    durationMinutes: 90,
    group: "COLOR",
    isExclusiveInGroup: true,
    staffType: "HAIR",
    image: "/img/services/2.jpg",
    isActive: true,
  },
  {
    name: "Tẩy và nhuộm thời trang",
    description:
      "Tẩy tóc và nhuộm màu thời trang.",
    price: 650000,
    priceFrom: true,
    durationMinutes: 180,
    group: "COLOR",
    isExclusiveInGroup: true,
    staffType: "HAIR",
    image: "/img/services/3.jpg",
    isActive: true,
  },
];

const admins: SeedAdmin[] = [
  {
    fullName: "Administrator",
    email: "admin@thads.com",
    phone: "0900000000",
    password: "123456",
  },
];

const receptionists: SeedAdmin[] = [{
  fullName: "Lễ tân THADS",
  email: "letan@thads.com",
  phone: "0900000099",
  password: "123456",
}];

const barbers: SeedBarber[] = [
  {
    fullName: "Nguyễn Minh",
    email: "minh@thads.com",
    phone: "0900000001",
    password: "123456",
    bio: "Chuyên Fade, cắt tóc nam hiện đại và tạo kiểu.",
    experienceYears: 5,
    staffType: "HAIR",
  },
  {
    fullName: "Đức Anh",
    email: "ducanh@thads.com",
    phone: "0900000002",
    password: "123456",
    bio: "Chuyên tóc cổ điển, chăm sóc râu và cạo mặt.",
    experienceYears: 4,
    staffType: "HAIR",
  },
  {
    fullName: "Thành Nam",
    email: "thanhnam@thads.com",
    phone: "0900000003",
    password: "123456",
    bio: "Chuyên uốn, nhuộm và tư vấn kiểu tóc.",
    experienceYears: 6,
    staffType: "HAIR",
  },
  {
    fullName: "Hoàng Sơn",
    email: "hoangson@thads.com",
    phone: "0900000004",
    password: "123456",
    bio: "Chuyên combo cắt tóc cao cấp và chăm sóc tóc.",
    experienceYears: 3,
    staffType: "CARE",
  },
];

const hairstyles: { title: string; image: string; category: string; description: string; sortOrder: number; isFeatured: boolean }[] = [
  { title: "Layer Uốn Xoăn 1", image: "/img/hairstyles/1.jpg", category: "Layer Uốn Xoăn", description: "Kiểu layer uốn xoăn tự nhiên, phù hợp mọi khuôn mặt", sortOrder: 1, isFeatured: true },
  { title: "Layer Uốn Xoăn 2", image: "/img/hairstyles/2.jpg", category: "Layer Uốn Xoăn", description: "Layer uốn xoăn nhẹ, lãng tử", sortOrder: 2, isFeatured: true },
  { title: "Layer 1", image: "/img/hairstyles/3.jpg", category: "Layer", description: "Tóc layer classic, thanh lịch", sortOrder: 3, isFeatured: true },
  { title: "Layer 2", image: "/img/hairstyles/4.jpg", category: "Layer", description: "Layer hiện đại, trẻ trung", sortOrder: 4, isFeatured: true },
  { title: "Side Part 1", image: "/img/hairstyles/5.jpg", category: "Side Part", description: "Side part lịch sự, sang trọng", sortOrder: 5, isFeatured: true },
  { title: "Side Part 2", image: "/img/hairstyles/6.jpg", category: "Side Part", description: "Side part gọn gàng, chuyên nghiệp", sortOrder: 6, isFeatured: true },
  { title: "Side Part 3", image: "/img/hairstyles/7.jpg", category: "Side Part", description: "Side part thời trang, cá tính", sortOrder: 7, isFeatured: false },
  { title: "Middle Part Mullet 1", image: "/img/hairstyles/8.jpg", category: "Middle Part Mullet", description: "Mullet phá cách, thời thượng", sortOrder: 8, isFeatured: true },
  { title: "Middle Part Mullet 2", image: "/img/hairstyles/9.jpg", category: "Middle Part Mullet", description: "Mullet hiện đại, nổi bật", sortOrder: 9, isFeatured: false },
  { title: "Burst Fade", image: "/img/hairstyles/10.jpg", category: "Burst Fade", description: "Burst fade táo bạo, mạnh mẽ", sortOrder: 10, isFeatured: true },
  { title: "Combo Style 1", image: "/img/hairstyles/11.jpg", category: "Combo", description: "Kiểu kết hợp độc đáo", sortOrder: 11, isFeatured: false },
  { title: "Messy Fringe 1", image: "/img/hairstyles/12.jpg", category: "Messy Fringe", description: "Messy fringe phong cách, trẻ trung", sortOrder: 12, isFeatured: true },
  { title: "Messy Fringe 2", image: "/img/hairstyles/13.jpg", category: "Messy Fringe", description: "Messy fringe năng động, cá tính", sortOrder: 13, isFeatured: true },
  { title: "Messy Fringe 3", image: "/img/hairstyles/14.jpg", category: "Messy Fringe", description: "Messy fringe hiện đại, thời trang", sortOrder: 14, isFeatured: false },
  { title: "Bowl Cut 1", image: "/img/hairstyles/15.jpg", category: "Bowl Cut", description: "Bowl cut retro, độc đáo", sortOrder: 15, isFeatured: true },
  { title: "Bowl Cut 2", image: "/img/hairstyles/16.jpg", category: "Bowl Cut", description: "Bowl cut phá cách, nổi bật", sortOrder: 16, isFeatured: true },
  { title: "Bowl Cut 3", image: "/img/hairstyles/17.jpg", category: "Bowl Cut", description: "Bowl cut thời trang, lạ mắt", sortOrder: 17, isFeatured: false },
];

const hashPassword = async (
  password: string
): Promise<string> => {
  return bcrypt.hash(password, 10);
};

const createDefaultSchedules = async (
  barberId: mongoose.Types.ObjectId
): Promise<void> => {
  for (
    let dayOfWeek = 0;
    dayOfWeek <= 6;
    dayOfWeek += 1
  ) {
    const isSunday =
      dayOfWeek === 0;

    await BarberSchedule.findOneAndUpdate(
      {
        barber: barberId,
        dayOfWeek,
      },
      {
        $set: {
          barber: barberId,
          dayOfWeek,
          startTime: "09:00",
          endTime: "21:00",
          breaks: [],
          isWorking: !isSunday,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
        setDefaultsOnInsert: true,
      }
    );
  }
};

const seedServices = async () => {
  const serviceDocuments = [];

  for (const serviceData of services) {
    const service =
      await Service.findOneAndUpdate(
        {
          name: serviceData.name,
        },
        {
          $set: serviceData,
        },
        {
          upsert: true,
          returnDocument: "after",
          setDefaultsOnInsert: true,
        }
      );

    if (service) {
      serviceDocuments.push(service);
    }
  }

  console.log(
    `Đã tạo hoặc cập nhật ${serviceDocuments.length} dịch vụ`
  );

  return serviceDocuments;
};

const seedAdmins =
  async (): Promise<void> => {
    for (const adminData of admins) {
      const normalizedEmail =
        adminData.email
          .toLowerCase()
          .trim();

      let admin =
        await User.findOne({
          email: normalizedEmail,
        }).select("+password");

      if (!admin) {
        const hashedPassword =
          await hashPassword(
            adminData.password
          );

        admin = await User.create({
          fullName:
            adminData.fullName,
          email:
            normalizedEmail,
          phone:
            adminData.phone,
          password:
            hashedPassword,
          avatar: "",
          role: "ADMIN",
          status: "ACTIVE",
        });
      } else {
        admin.fullName =
          adminData.fullName;

        admin.phone =
          adminData.phone;

        admin.avatar =
          admin.avatar ?? "";

        admin.role =
          "ADMIN";

        admin.status =
          "ACTIVE";

        await admin.save();
      }

      console.log(
        `Đã tạo hoặc cập nhật Admin: ${admin.fullName}`
      );
    }
  };

const seedReceptionists = async (): Promise<void> => {
  for (const data of receptionists) {
    const email = data.email.toLowerCase().trim();
    const existing = await User.findOne({ email }).select("+password");
    if (existing) {
      existing.fullName = data.fullName; existing.phone = data.phone; existing.role = "RECEPTIONIST"; existing.status = "ACTIVE"; await existing.save();
    } else {
      await User.create({ ...data, email, password: await hashPassword(data.password), avatar: "", role: "RECEPTIONIST", status: "ACTIVE" });
    }
  }
};

const seedBarbers = async (
  serviceDocuments: Awaited<
    ReturnType<typeof seedServices>
  >
): Promise<void> => {
  for (const barberData of barbers) {
    const normalizedEmail =
      barberData.email
        .toLowerCase()
        .trim();

    let barber =
      await User.findOne({
        email: normalizedEmail,
      }).select("+password");

    if (!barber) {
      const hashedPassword =
        await hashPassword(
          barberData.password
        );

      barber = await User.create({
        fullName:
          barberData.fullName,
        email:
          normalizedEmail,
        phone:
          barberData.phone,
        password:
          hashedPassword,
        avatar: "",
        role: "BARBER",
        status: "ACTIVE",
      });
    } else {
      barber.fullName =
        barberData.fullName;

      barber.phone =
        barberData.phone;

      barber.avatar =
        barber.avatar ?? "";

      barber.role =
        "BARBER";

      barber.status =
        "ACTIVE";

      await barber.save();
    }

    await BarberProfile.findOneAndUpdate(
      {
        user: barber._id,
      },
      {
        $set: {
          user: barber._id,
          bio: barberData.bio,
          avatar:
            barber.avatar ?? "",
          experienceYears:
            barberData.experienceYears,
          specialties:
            serviceDocuments.filter((service) => (service.staffType ?? (service.group === "CARE" ? "CARE" : "HAIR")) === barberData.staffType).map((service) => service._id),
          staffType: barberData.staffType,
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

    await createDefaultSchedules(
      barber._id as mongoose.Types.ObjectId
    );

    console.log(
      `Đã tạo hoặc cập nhật Barber: ${barber.fullName}`
    );
  }
};

const runSeed =
  async (): Promise<void> => {
    const mongodbUri =
      process.env.MONGO_URI;

    if (!mongodbUri) {
      throw new Error(
        "Thiếu MONGO_URI trong file .env"
      );
    }

    try {
      await mongoose.connect(
        mongodbUri
      );

      console.log(
        "MongoDB Atlas connected successfully"
      );

      const serviceDocuments =
        await seedServices();

      await seedAdmins();

      await seedReceptionists();

      await seedBarbers(
        serviceDocuments
      );

      await seedHairstyles();

      console.log(
        "Seed dữ liệu thành công"
      );

      console.log(
        "Tài khoản Admin: admin@thads.com / 123456"
      );

      console.log(
        "Mật khẩu Barber mặc định: 123456"
      );
      console.log("Tài khoản Lễ tân: letan@thads.com / 123456");
    } catch (error) {
      console.error(
        "Seed dữ liệu thất bại:",
        error
      );

      process.exitCode = 1;
    } finally {
      await mongoose.disconnect();
    }
  };

const seedHairstyles = async (): Promise<void> => {
  await HairstyleGallery.deleteMany({});
  let count = 0;
  for (const hs of hairstyles) {
    await HairstyleGallery.create(hs);
    count++;
  }
  console.log(`Đã tạo ${count} mẫu tóc`);
};

void runSeed();

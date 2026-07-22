import BarberProfile from "../models/BarberProfile";

import Service from "../models/Service";
import ServiceCategory from "../models/ServiceCategory";

import User from "../models/User";


export const getActiveServices = async () => {

  const activeCategoryIds = await ServiceCategory.find({ isActive: true }).distinct("_id");

  const services = await Service.find({

    isActive: true,

    $or: [
      { category: null },
      { category: { $exists: false } },
      { category: { $in: activeCategoryIds } },
    ],

  })

    .select(

      [

        "name",

        "description",

        "price",

        "priceFrom",

        "durationMinutes",

        "group",

        "isExclusiveInGroup",

        "staffType",

        "image",

        "isActive",

        "category",

      ].join(" ")

    )

    .populate("category", "name slug sortOrder isActive")

    .sort({

      group: 1,

      price: 1,

      name: 1,

    })

    .lean();



  return services.map((service) => ({

    id: String(service._id),



    name: service.name,

    description: service.description,



    price: service.price,

    priceFrom: service.priceFrom,



    durationMinutes:

      service.durationMinutes,



    group: service.group,



    isExclusiveInGroup:

      service.isExclusiveInGroup,

    staffType: service.staffType ?? (service.group === "CARE" ? "CARE" : "HAIR"),



    image: service.image,

    isActive: service.isActive,

    category: service.category && typeof service.category === "object" && "name" in service.category
      ? {
          id: String(service.category._id),
          name: String(service.category.name),
          slug: String((service.category as unknown as { slug: string }).slug),
          sortOrder: Number((service.category as unknown as { sortOrder: number }).sortOrder),
        }
      : null,

  }));

};





export const getActiveBarbers = async () => {

  const barberUsers = await User.find({

    role: "BARBER",

    status: "ACTIVE",

  })

    .select(

      "_id fullName email phone role status"

    )

    .sort({

      fullName: 1,

    })

    .lean();



  if (barberUsers.length === 0) {

    return [];

  }



  const barberUserIds = barberUsers.map(

    (barber) => barber._id

  );



  const profiles =

    await BarberProfile.find({

      user: {

        $in: barberUserIds,

      },

      isActive: true,

    })

      .populate(

        "specialties",

        [

          "name",

          "price",

          "durationMinutes",

          "group",

          "image",

        ].join(" ")

      )

      .lean();



  const profileMap = new Map(

    profiles.map((profile) => [

      String(profile.user),

      profile,

    ])

  );



  return barberUsers

    .map((barber) => {

      const profile = profileMap.get(

        String(barber._id)

      );



      if (!profile) {

        return null;

      }



      return {

        id: String(barber._id),



        fullName: barber.fullName,

        email: barber.email,

        phone: barber.phone,



        role: barber.role,

        status: barber.status,



        profile: {

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

          staffType: profile.staffType ?? "HAIR",

        },

      };

    })

    .filter(

      (

        barber

      ): barber is NonNullable<

        typeof barber

      > => barber !== null

    );

};





 

export const getActiveBarberById =

  async (barberId: string) => {

    const barber = await User.findOne({

      _id: barberId,

      role: "BARBER",

      status: "ACTIVE",

    })

      .select(

        "_id fullName email phone role status"

      )

      .lean();



    if (!barber) {

      return null;

    }



    const profile =

      await BarberProfile.findOne({

        user: barber._id,

        isActive: true,

      })

        .populate(

          "specialties",

          [

            "name",

            "price",

            "durationMinutes",

            "group",

            "image",

          ].join(" ")

        )

        .lean();



    if (!profile) {

      return null;

    }



    return {

      id: String(barber._id),



      fullName: barber.fullName,

      email: barber.email,

      phone: barber.phone,



      role: barber.role,

      status: barber.status,



      profile: {

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

        staffType: profile.staffType ?? "HAIR",

      },

    };

  };

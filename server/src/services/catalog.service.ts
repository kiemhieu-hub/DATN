import BarberProfile from "../models/BarberProfile";

import Service from "../models/Service";

import User from "../models/User";


export const getActiveServices = async () => {

  const services = await Service.find({

    isActive: true,

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

      ].join(" ")

    )

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

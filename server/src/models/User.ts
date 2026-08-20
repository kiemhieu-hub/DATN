import mongoose, {
<<<<<<< HEAD
  Schema,
  type Document,
  type Model,
} from "mongoose";

export type UserRole =
  | "CLIENT"
  | "BARBER"
  | "RECEPTIONIST"
  | "ADMIN";

export type UserStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "BLOCKED";

export interface IUser extends Document {
  fullName: string;
  email: string;
  phone: string;
  password: string;

  avatar: string;

  role: UserRole;
  status: UserStatus;

  passwordChangedAt?: Date;
  lastLoginAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [
        true,
        "Họ tên là bắt buộc",
      ],
      trim: true,
      minlength: [
        2,
        "Họ tên phải có ít nhất 2 ký tự",
      ],
      maxlength: [
        100,
        "Họ tên không được quá 100 ký tự",
      ],
    },

    email: {
      type: String,
      required: [
        true,
        "Email là bắt buộc",
      ],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [
        150,
        "Email không được quá 150 ký tự",
      ],
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Email không hợp lệ",
      ],
    },

    phone: {
      type: String,
      required: [
        true,
        "Số điện thoại là bắt buộc",
      ],
      trim: true,
      match: [
        /^(0|\+84)[0-9]{9,10}$/,
        "Số điện thoại không hợp lệ",
      ],
    },

    password: {
      type: String,
      required: [
        true,
        "Mật khẩu là bắt buộc",
      ],
      minlength: [
        6,
        "Mật khẩu phải có ít nhất 6 ký tự",
      ],
      select: false,
    },

    avatar: {
      type: String,
      trim: true,
      default: "",
    },

    role: {
      type: String,
      enum: [
        "CLIENT",
        "BARBER",
        "RECEPTIONIST",
        "ADMIN",
      ],
      default: "CLIENT",
      index: true,
    },

    status: {
      type: String,
      enum: [
        "ACTIVE",
        "INACTIVE",
        "BLOCKED",
      ],
      default: "ACTIVE",
      index: true,
    },

    passwordChangedAt: {
      type: Date,
      default: null,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.index({
  role: 1,
  status: 1,
});

userSchema.index({
  fullName: "text",
  email: "text",
  phone: "text",
});

const User: Model<IUser> =
  (mongoose.models.User as
    | Model<IUser>
    | undefined) ??
  mongoose.model<IUser>(
    "User",
    userSchema
  );

export default User;
=======

  Schema,

  type Document,

  type Model,

} from "mongoose";



export type UserRole =

  | "CLIENT"

  | "BARBER"

  | "RECEPTIONIST"

  | "ADMIN";



export type UserStatus =

  | "ACTIVE"

  | "INACTIVE"

  | "BLOCKED";



export interface IUser extends Document {

  fullName: string;

  email: string;

  phone: string;

  password: string;



  avatar: string;



  role: UserRole;

  status: UserStatus;



  passwordChangedAt?: Date;

  lastLoginAt?: Date;



  createdAt: Date;

  updatedAt: Date;

}



const userSchema = new Schema<IUser>(

  {

    fullName: {

      type: String,

      required: [

        true,

        "Họ tên là bắt buộc",

      ],

      trim: true,

      minlength: [

        2,

        "Họ tên phải có ít nhất 2 ký tự",

      ],

      maxlength: [

        100,

        "Họ tên không được quá 100 ký tự",

      ],

    },



    email: {

      type: String,

      required: [

        true,

        "Email là bắt buộc",

      ],

      unique: true,

      lowercase: true,

      trim: true,

      maxlength: [

        150,

        "Email không được quá 150 ký tự",

      ],

      match: [

        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

        "Email không hợp lệ",

      ],

    },



    phone: {

      type: String,

      required: [

        true,

        "Số điện thoại là bắt buộc",

      ],

      trim: true,

      match: [

        /^(0|\+84)[0-9]{9,10}$/,

        "Số điện thoại không hợp lệ",

      ],

    },



    password: {

      type: String,

      required: [

        true,

        "Mật khẩu là bắt buộc",

      ],

      minlength: [

        6,

        "Mật khẩu phải có ít nhất 6 ký tự",

      ],

      select: false,

    },



    avatar: {

      type: String,

      trim: true,

      default: "",

    },



    role: {

      type: String,

      enum: [

        "CLIENT",

        "BARBER",

        "RECEPTIONIST",

        "ADMIN",

      ],

      default: "CLIENT",

      index: true,

    },



    status: {

      type: String,

      enum: [

        "ACTIVE",

        "INACTIVE",

        "BLOCKED",

      ],

      default: "ACTIVE",

      index: true,

    },



    passwordChangedAt: {

      type: Date,

      default: null,

    },



    lastLoginAt: {

      type: Date,

      default: null,

    },

  },

  {

    timestamps: true,

    versionKey: false,

  }

);



userSchema.index({

  role: 1,

  status: 1,

});



userSchema.index({

  fullName: "text",

  email: "text",

  phone: "text",

});



const User: Model<IUser> =

  (mongoose.models.User as

    | Model<IUser>

    | undefined) ??

  mongoose.model<IUser>(

    "User",

    userSchema

  );



export default User; 

>>>>>>> 5dbeb45 (fix: team,team detail)

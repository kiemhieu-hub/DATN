import mongoose, { Schema } from "mongoose";

const bookingSchema = new Schema(
  {
    booking_code: String,
    customer_id: Number,
    barber_id: Number,
    voucher_id: Number,

    customer_name: String,
    customer_phone: String,

    booking_date: String,
    start_time: String,
    end_time: String,

    total_duration: Number,
    total_amount: Number,
    deposit_amount: Number,

    note: String,

    status: String,
    payment_status: String,

    created_at: String,
    updated_at: String,
  },
  {
    versionKey: false,
  }
);

export default mongoose.model(
  "Booking",
  bookingSchema,
  "Bookings"
);
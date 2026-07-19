export interface Booking {
    _id: string;

    booking_code: string;

    customer_id: number;
    barber_id: number;
    voucher_id?: number | null;

    customer_name: string;
    customer_phone: string;

    booking_date: string;
    start_time: string;
    end_time: string;

    total_duration: number;
    total_amount: number;
    deposit_amount: number;

    note: string;

    status:
        | "PENDING"
        | "CONFIRMED"
        | "CHECKED_IN"
        | "SERVING"
        | "CUTTING"
        | "COMPLETED"
        | "CANCELLED";

    payment_status:
        | "UNPAID"
        | "DEPOSITED"
        | "PAID"
        | "REFUNDING"
        | "REFUNDED";

    created_at: string;
    updated_at: string;
}
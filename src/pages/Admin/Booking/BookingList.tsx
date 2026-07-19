import { useEffect, useState } from "react";
import { Booking } from "../../../types/booking";
import { getAllBookings } from "../../../services/booking.service";
import "../Booking/css/Booking.css";;

const BookingList = () => {

    const [bookings, setBookings] = useState<Booking[]>([]);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const data = await getAllBookings();
            setBookings(data);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="booking-container">

            <div className="booking-header">

                <h2>Quản lý đơn đặt lịch</h2>

                <button className="btn-add">
                    + Thêm lịch
                </button>

            </div>

            <div className="booking-toolbar">

                <input
                    type="text"
                    placeholder="Tìm kiếm khách hàng..."
                />

                <select>

                    <option>Tất cả trạng thái</option>

                    <option>PENDING</option>

                    <option>CONFIRMED</option>

                    <option>CHECKED_IN</option>

                    <option>COMPLETED</option>

                    <option>CANCELLED</option>

                </select>

            </div>

            <table className="booking-table">

                <thead>

                    <tr>

                        <th>Mã</th>

                        <th>Khách hàng</th>

                        <th>SĐT</th>

                        <th>Ngày</th>

                        <th>Giờ</th>

                        <th>Tổng tiền</th>

                        <th>Tiền cọc</th>

                        <th>Thanh toán</th>

                        <th>Trạng thái</th>

                        <th>Thao tác</th>

                    </tr>

                </thead>

                <tbody>

                    {bookings.map((booking) => (

                        <tr key={booking.booking_code}>

                            <td>{booking.booking_code}</td>

                            <td>{booking.customer_name}</td>

                            <td>{booking.customer_phone}</td>

                            <td>{booking.booking_date}</td>

                            <td>
                                {booking.start_time} - {booking.end_time}
                            </td>

                            <td>
                                {booking.total_amount.toLocaleString()} đ
                            </td>

                            <td>
                                {booking.deposit_amount.toLocaleString()} đ
                            </td>

                            <td>{booking.payment_status}</td>

                            <td>{booking.status}</td>

                            <td>

                                <button>Xem</button>

                                <button>Xác nhận</button>

                                <button>Đổi Stylist</button>

                                <button>Hủy</button>

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>
    );
};

export default BookingList;
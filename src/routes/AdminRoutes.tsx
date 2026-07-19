import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Admin/Dashboard";
import BookingList from "../pages/Admin/Booking/BookingList";

const AdminRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />

            <Route
                path="/bookings"
                element={<BookingList />}
            />
        </Routes>
    );
};

export default AdminRoutes;
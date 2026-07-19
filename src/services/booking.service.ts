import axios from "axios";
import { Booking } from "../types/booking";

const API_URL = "http://localhost:5000/api/appointments";

export const getAllBookings = async (): Promise<Booking[]> => {
    const response = await axios.get(API_URL);

    return response.data.data;
};

export const getBookingById = async (id: string) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data.data;
};

export const confirmBooking = async (id: string) => {
    const response = await axios.patch(`${API_URL}/${id}/confirm`);
    return response.data;
};

export const changeBarber = async (
    bookingId: string,
    barberId: number
) => {
    const response = await axios.patch(
        `${API_URL}/${bookingId}/change-barber`,
        { barberId }
    );

    return response.data;
};

export const cancelBooking = async (
    bookingId: string,
    reason: string
) => {
    const response = await axios.patch(
        `${API_URL}/${bookingId}/cancel`,
        { reason }
    );

    return response.data;
};
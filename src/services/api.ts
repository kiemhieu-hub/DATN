import axios from "axios";
import { invalidateBusinessData } from "../lib/queryKeys";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const currentPath = window.location.pathname;
  const tokenKey = currentPath.startsWith("/admin")
    ? "adminAccessToken"
    : currentPath.startsWith("/receptionist")
      ? "receptionistAccessToken"
    : currentPath.startsWith("/barber")
      ? "barberAccessToken"
      : "clientAccessToken";
  const token = localStorage.getItem(tokenKey);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toUpperCase();
    const isChatRequest = response.config.url?.startsWith("/chat");
    if (method && !isChatRequest && !["GET", "HEAD", "OPTIONS"].includes(method)) {
      void invalidateBusinessData();
    }
    return response;
  },
  (error) => Promise.reject(error)
);

export default api;

import axios from "axios";

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

export default api;

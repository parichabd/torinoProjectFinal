import axios from "axios";
import Cookies from "js-cookie";

const getCookie = Cookies.get;

const setCookie = (name, value, days) => {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const removeCookie = (name) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const accessToken = getCookie("accessToken");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getCookie("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_URL}/auth/refresh-token`,
          { refreshToken },
        );

        if (response.data?.accessToken) {
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          setCookie("accessToken", accessToken, 1 / 24);
          setCookie("refreshToken", newRefreshToken, 7);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (e) {
        removeCookie("accessToken");
        removeCookie("refreshToken");
        setTimeout(() => (window.location.href = "/"), 1500);
      }
    }
    return Promise.reject(error.response?.data ?? error);
  },
);

export const profileApi = {
  getProfile: async () => {
    const response = await api.get("/user/profile");
    return response.data;
  },
  updateProfile: async (data) => {
    const response = await api.put("/user/profile", data);
    return response.data;
  },
};
export default api;

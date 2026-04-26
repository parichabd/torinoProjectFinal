// src/lib/api.js
import axios from "axios";
import { toast } from "react-hot-toast";

// ✅ تابع getCookie را خودمان تعریف می‌کنیم تا مطمئن باشیم کار می‌کند
const getCookie = (name) => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

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

// ✅ Interceptor برای اضافه کردن توکن به درخواست‌ها
api.interceptors.request.use(
  (config) => {
    const accessToken = getCookie("accessToken");
    console.log("🔑 Token found:", accessToken ? "YES" : "NO"); // برای دیباگ
    
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Interceptor برای مدیریت خطای 401 و رفرش توکن
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
          { refreshToken }
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
        toast.error("جلسه منقضی شده، لطفاً دوباره وارد شوید.");
        setTimeout(() => (window.location.href = "/login"), 1500);
      }
    }
    return Promise.reject(error.response?.data ?? error);
  }
);

// ✅ توابع API برای پروفایل
export const profileApi = {
  // دریافت اطلاعات پروفایل
  getProfile: async () => {
    const response = await api.get("/user/profile");
    return response.data;
  },

  // بروزرسانی پروفایل
  updateProfile: async (data) => {
    const response = await api.put("/user/profile", data);
    return response.data;
  },
};

export default api;
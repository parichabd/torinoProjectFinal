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

// ============================================
// Profile API
// ============================================
export const profileApi = {
  getProfile: async () => {
    const response = await api.get("/user/profile");
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put("/user/profile", data);
    return response.data;
  },

  getMyTours: async () => {
    try {
      const response = await api.get("/user/tours");
      const tours = response.data;

      // تبدیل ساختار داده به فرمت مورد نیاز کامپوننت
      return tours.map((tour) => ({
        id: tour.id,
        fullName: tour.fullName || tour.passengerName || "-",
        nationalCode: tour.nationalCode || "-",
        gender: tour.gender || "-",
        birthDate: tour.birthDate || "-",
        tourDetails: {
          name: tour.title || "نام تور",
          origin: tour.origin?.name || tour.origin || "-",
          destination: tour.destination?.name || tour.destination || "-",
          departureDate: tour.startDate?.split("T")[0] || "-",
          departureTime: tour.startTime || "-",
          returnDate: tour.endDate?.split("T")[0] || "-",
          returnTime: tour.endTime || "-",
          price: tour.price || 0,
          vehicleType: tour.fleetVehicle || "-",
          image: tour.image || "",
          insurance: tour.insurance || false,
          options: tour.options || [],
        },
      }));
    } catch (error) {
      console.error("Error in getMyTours:", error);
      throw error;
    }
  },
};

// ============================================
// Auth API
// ============================================
export const authApi = {
  sendOtp: async (phone) => {
    const response = await api.post("/auth/send-otp", { phone });
    return response.data;
  },

  checkOtp: async (phone, code) => {
    const response = await api.post("/auth/check-otp", { phone, code });
    return response.data;
  },

  refreshToken: async (refreshToken) => {
    const response = await api.post("/auth/refresh-token", { refreshToken });
    return response.data;
  },
};

// ============================================
// Tour API
// ============================================
export const tourApi = {
  getTours: async (filters = {}) => {
    const response = await api.get("/tour", { params: filters });
    return response.data;
  },

  getTourById: async (tourId) => {
    const response = await api.get(`/tour/${tourId}`);
    return response.data;
  },
};

// ============================================
// Basket API
// ============================================
export const basketApi = {
  getBasket: async () => {
    const response = await api.get("/basket");
    return response.data;
  },

  addToBasket: async (tourId) => {
    const response = await api.put(`/basket/${tourId}`);
    return response.data;
  },

  removeFromBasket: async (tourId) => {
    const response = await api.delete(`/basket/${tourId}`);
    return response.data;
  },

  clearBasket: async () => {
    const response = await api.delete("/basket");
    return response.data;
  },
};

// ============================================
// Order API
// ============================================
export const orderApi = {
  createOrder: async (data) => {
    const response = await api.post("/order", data);
    return response.data;
  },

  getOrders: async () => {
    const response = await api.get("/orders");
    return response.data;
  },

  getOrderById: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },
};

// ============================================
// Transaction API
// ============================================
export const transactionApi = {
  getTransactions: async () => {
    const response = await api.get("/user/transactions");
    return response.data;
  },
};

export default api;
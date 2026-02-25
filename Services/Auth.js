import api from "@/lib/api";
import { setCookie } from "@/utils/cookie";

export const registerUser = ({ name, mobile }) =>
  api.post("/auth/register", { name, mobile }).then((res) => res.data);

export const sendOtp = (mobile) =>
  api.post("/auth/send-otp", { mobile }).then((res) => res.data);

export const verifyOtp = ({ mobile, otp }) =>
  api.post("/auth/check-otp", { mobile, code: otp }).then((res) => {
    const { accessToken, refreshToken, user } = res.data;

    setCookie("accessToken", accessToken, 30);
    setCookie("refreshToken", refreshToken, 360);
    localStorage.setItem("mobile", mobile);

    return { user, accessToken, refreshToken };
  });

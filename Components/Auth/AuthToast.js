"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSendOtp } from "@/Hooks/useSendOtp";
import { useVerifyOtp } from "@/Hooks/useVerifyOtp";
import { registerUser } from "@/Services/Auth";
import { useRouter } from "next/navigation";
import { FaArrowLeftLong } from "react-icons/fa6";

import OtpInput from "react-otp-input";
import toast, { Toaster } from "react-hot-toast";
import Cookies from "js-cookie";

import styles from "./AuthToast.module.css";

export default function AuthToast({ onClose, mode = "login" }) {
  const router = useRouter();

  const [step, setStep] = useState("PHONE");
  const [isRegister, setIsRegister] = useState(mode === "register");

  const [timeLeft, setTimeLeft] = useState(120);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [mobileShake, setMobileShake] = useState(false);
  const [otpShake, setOtpShake] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const sendOtpMutation = useSendOtp();
  const verifyOtpMutation = useVerifyOtp();

  useEffect(() => {
    const syncMobile = () => setMobile(localStorage.getItem("mobile"));
    window.addEventListener("storage", syncMobile);
    return () => window.removeEventListener("storage", syncMobile);
  }, []);

  useEffect(() => {
    if (isRegister) {
      toast.error(
        "ثبت نام با نام فعلاً در دسترس نیست. لطفاً با شماره تلفن در بخش ورود وارد شوید.",
        { position: "top-center", duration: 4000 },
      );
    }
  }, [isRegister]);

  useEffect(() => {
    if (step !== "OTP" || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const persianToEnglish = (str) =>
    str.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));
  const validateMobile = (number) => /^09\d{9}$/.test(persianToEnglish(number));
  const formatTime = (t) =>
    `${Math.floor(t / 60)}:${(t % 60).toString().padStart(2, "0")}`;

  const submitPhone = async (data) => {
    const cleanedMobile = persianToEnglish(data.mobile);
    if (!validateMobile(cleanedMobile)) {
      setMobileError("شماره موبایل معتبر نیست. باید با ۰۹ شروع و ۱۱ رقم باشد.");
      setMobileShake(true);
      setTimeout(() => setMobileShake(false), 400);
      return;
    }
    setMobileError("");
    setMobile(cleanedMobile);

    if (isRegister) {
      try {
        await registerUser(data);
      } catch (err) {
        alert(err.response?.data?.message || err.message || "خطای ثبت نام");
        return;
      }
    }

    sendOtpMutation.mutate(cleanedMobile, {
      onSuccess: () => {
        setStep("OTP");
        setTimeLeft(120);
        setOtp("");
        toast.success("کد تایید ارسال شد و تا ۲ دقیقه معتبر است", {
          position: "top-left",
          duration: 4000,
        });
      },
      onError: (err) => {
        alert(err.response?.data?.message || err.message || "خطا در ارسال کد");
      },
    });
  };

  const resendHandler = () => {
    sendOtpMutation.mutate(mobile, {
      onSuccess: () => {
        setTimeLeft(120);
        setOtp("");
        toast.success("کد تایید ارسال شد و تا ۲ دقیقه معتبر است", {
          position: "top-right",
          duration: 4000,
        });
      },
    });
  };

  const submitOtp = () => {
    if (otp.length !== 6) {
      setOtpError("کد تایید را کامل وارد کنید");
      setOtpShake(true);
      setTimeout(() => setOtpShake(false), 400);
      return;
    }

    setIsLoggingIn(true);

    verifyOtpMutation.mutate(
      { mobile, otp },
      {
        onSuccess: (res) => {
          Cookies.set("accessToken", res.accessToken, { expires: 1 / 24 });
          Cookies.set("refreshToken", res.refreshToken, { expires: 7 });
          localStorage.setItem("mobile", mobile);
          localStorage.setItem("userName", res.user?.firstName || "");
          window.dispatchEvent(new Event("auth:login-success"));

          toast.success("ورود موفق بود! خوش آمدید 🎉", {
            position: "top-right",
            duration: 4000,
          });

          setTimeout(() => {
            setIsLoggingIn(false);
            onClose();
            router.push("/");
          }, 1000);
        },
        onError: () => {
          setOtpError("کد وارد شده اشتباه است!");
          setOtpShake(true);
          setTimeout(() => setOtpShake(false), 400);
          setIsLoggingIn(false);
        },
      },
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") submitOtp();
  };

  return (
    <>
      <Toaster />
      <div className={styles.toast_overlay}>
        <div className={styles.toast_box}>
          {/* دکمه‌ها */}
          {step === "PHONE" ? (
            isRegister ? (
              <button
                className={styles.back_btn}
                onClick={() => {
                  setIsRegister(false);
                  reset();
                }}
              >
                <FaArrowLeftLong />
              </button>
            ) : (
              <button className={styles.close_btn} onClick={onClose}>
                ✕
              </button>
            )
          ) : (
            <button
              className={styles.back_btn}
              onClick={() => {
                setStep("PHONE");
                setIsRegister(false);
                setOtp("");
                setOtpError("");
                setTimeLeft(120);
              }}
            >
              <FaArrowLeftLong />
            </button>
          )}

          {/* فرم شماره */}
          {step === "PHONE" && (
            <>
              <h2 className={styles.title}>
                {isRegister ? "ثبت نام" : "ورود به تورینو"}
              </h2>
              <form
                className={styles.form}
                onSubmit={handleSubmit(submitPhone)}
              >
                {isRegister && (
                  <>
                    <input
                      placeholder="نام"
                      {...register("name", { required: "نام الزامی است" })}
                    />
                    <span className={styles.error}>{errors.name?.message}</span>
                  </>
                )}

                <input
                  type="tel"
                  placeholder="۰۹۱۲***۶۶۰۶"
                  {...register("mobile", {
                    required: "شماره موبایل الزامی است",
                  })}
                  className={`${mobileShake ? styles.shake : ""} ${mobileError ? styles.errorInput : ""}`}
                />
                <span className={styles.error}>
                  {errors.mobile?.message || mobileError}
                </span>

                {!isRegister && (
                  <div className={styles.loginPage}>
                    حساب کاربری ندارید؟
                    <button type="button" onClick={() => setIsRegister(true)}>
                      ثبت نام
                    </button>
                  </div>
                )}

                {isRegister && (
                  <div className={styles.loginPage}>
                    قبلاً ثبت نام کرده‌اید؟
                    <button type="button" onClick={() => setIsRegister(false)}>
                      ورود
                    </button>
                  </div>
                )}

                <button
                  className={styles.submit}
                  disabled={sendOtpMutation.isPending}
                >
                  {sendOtpMutation.isPending
                    ? "در حال ارسال..."
                    : isRegister
                      ? "ثبت‌نام و ارسال کد"
                      : "ارسال کد تایید"}
                </button>
              </form>
            </>
          )}

          {/* فرم OTP */}
          {step === "OTP" && (
            <>
              <h2 className={styles.title}>کد تایید را وارد کنید</h2>
              <p className={styles.mobileHint}>
                کد به شماره <span>{mobile}</span> ارسال شد
              </p>

              <div
                className={`${styles.otpWrapper} ${otpShake ? styles.shake : ""}`}
                onKeyDown={handleKeyDown}
              >
                <OtpInput
                  value={otp}
                  onChange={(v) => {
                    const clean = v
                      .split("")
                      .map((c) =>
                        "۰۱۲۳۴۵۶۷۸۹".includes(c) ? "۰۱۲۳۴۵۶۷۸۹".indexOf(c) : c,
                      )
                      .join("")
                      .replace(/[^0-9]/g, "");
                    setOtp(clean);
                    setOtpError(clean.length === 0 ? "فقط عدد مجاز است" : "");
                  }}
                  numInputs={6}
                  shouldAutoFocus
                  inputType="text"
                  renderSeparator={<span style={{ width: "16px" }} />}
                  renderInput={(props) => (
                    <input
                      {...props}
                      maxLength={1}
                      className={otpError ? styles.errorInput : ""}
                      style={{
                        width: "40px",
                        height: "45px",
                        fontSize: "20px",
                        textAlign: "center",
                        borderRadius: "8px",
                        border: "1px solid #00000040",
                      }}
                    />
                  )}
                />
              </div>

              {otpError && <div className={styles.errorBox}>{otpError}</div>}

              {timeLeft > 0 ? (
                <p className={styles.timer}>
                  {formatTime(timeLeft)} تا ارسال مجدد کد
                </p>
              ) : (
                <button className={styles.resend} onClick={resendHandler}>
                  ارسال مجدد کد
                </button>
              )}

              <button
                className={styles.submit}
                onClick={submitOtp}
                disabled={verifyOtpMutation.isPending || isLoggingIn}
              >
                {isLoggingIn ? "در حال بررسی..." : "ورود به تورینو"}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

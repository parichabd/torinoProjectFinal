// app/bookTour/page.jsx
"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./bookTour.module.css";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import toast, { Toaster } from "react-hot-toast";
import { getCookie } from "../../../utils/cookie";
import PaymentLoadingModal from "../../../Components/Spinner/PaymentLoadingModal";

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:6500";

// ✅ کلمات غیرمجاز فارسی
const INVALID_PERSIAN_WORDS = [
  "نام",
  "نام خانوادگی",
  "نام و نام خانوادگی",
  "نام ونام خانوادگی",
  "test",
  "asdf",
  "qwerty",
  "abc",
  "test123",
  "name",
  "username",
  "کاربر",
  "مسافر",
  "مشتری",
  "خریدار",
  "ثبت نام",
  "ثبت",
  "آزمایشی",
  "فیک",
  "نامشخص",
  "نامحدود",
];

// ✅ کلمات غیرمجاز انگلیسی
const INVALID_ENGLISH_WORDS = [
  "test",
  "asdf",
  "qwerty",
  "abc",
  "name",
  "username",
  "user",
  "fake",
  "dummy",
  "sample",
  "example",
  "demo",
  "temp",
];

// ✅ تبدیل اعداد فارسی به انگلیسی
const persianToEnglish = (str) => {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  const englishDigits = "0123456789";
  return str.replace(/[۰-۹]/g, (d) => englishDigits[persianDigits.indexOf(d)]);
};

// ✅ کامپوننت پیام خطا
const ErrorMessage = ({ message }) => {
  if (!message) return null;
  return <small className={styles.errorMessage}>⚠️ {message}</small>;
};

export default function BookingForm({ initialTourId }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const source = searchParams.get("source");

  // بررسی موفقیت پرداخت از URL
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    if (paymentStatus === "success") {
      toast.success(
        "تور شما با موفقیت ثبت شد! برای بررسی اطلاعات بیشتر به پروفایل مراجعه کنید.",
      );
      router.replace("/bookTour");
    }
  }, [searchParams, router]);

  // استخراج tourId
  let tourId = initialTourId;
  if (!tourId && pathname) {
    const cleanPathname = pathname.replace(/^\/|\/$/g, "");
    const parts = cleanPathname.split("/");
    if (parts[0] === "bookTour" && parts[1]) {
      tourId = parts[1];
    } else if (parts[1] === "bookTour" && parts[2]) {
      tourId = parts[2];
    }
  }
  if (!tourId) {
    tourId = searchParams.get("id");
  }

  const [tourData, setTourData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [birthDateError, setBirthDateError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  // ✅ اعتبارسنجی نام فارسی کامل
  const validatePersianName = (value) => {
    if (!value) return true;
    const trimmedValue = value.trim();
    if (trimmedValue.length < 5)
      return "نام و نام خانوادگی باید حداقل ۵ کاراکتر باشد";
    if (trimmedValue.length > 100)
      return "نام و نام خانوادگی نباید بیشتر از ۱۰۰ کاراکتر باشد";
    const parts = trimmedValue.split(/\s+/);
    if (parts.length < 2)
      return "لطفاً نام و نام خانوادگی را با فاصله جدا کنید";
    if (parts.length > 4)
      return "نام و نام خانوادگی نباید بیشتر از ۴ کلمه باشد";
    for (const part of parts) {
      if (part.length < 2) return "هر بخش از نام باید حداقل ۲ کاراکتر باشد";
    }
    const persianPattern = /^[\u0600-\u06FF\s]+$/;
    if (!persianPattern.test(trimmedValue)) return "فقط حروف فارسی مجاز است";
    const repeatedPattern = /^(.)\1+$/;
    if (repeatedPattern.test(trimmedValue.replace(/\s/g, "")))
      return "کاراکترهای تکراری مجاز نیست";
    const lowerValue = trimmedValue.toLowerCase();
    for (const word of INVALID_PERSIAN_WORDS) {
      if (lowerValue.includes(word.toLowerCase())) return "این نام معتبر نیست";
    }
    for (const word of INVALID_ENGLISH_WORDS) {
      if (lowerValue.includes(word.toLowerCase())) return "این نام معتبر نیست";
    }
    if (/\d/.test(trimmedValue)) return "استفاده از اعداد مجاز نیست";
    const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?0-9]/;
    if (specialChars.test(trimmedValue)) return "کاراکترهای خاص مجاز نیست";
    return true;
  };

  // ✅ اعتبارسنجی کد ملی ایران
  const validateNationalId = (value) => {
    if (!value) return true;
    const englishValue = persianToEnglish(value);
    if (!/^\d{10}$/.test(englishValue)) return "کد ملی باید ۱۰ رقم باشد";
    const digits = englishValue.split("").map(Number);
    const checkDigit = digits[9];
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += digits[i] * (10 - i);
    }
    const remainder = sum % 11;
    const calculatedCheck = remainder < 2 ? remainder : 11 - remainder;
    if (calculatedCheck !== checkDigit) return "کد ملی معتبر نیست";
    return true;
  };

  // ✅ هندلر تغییر تاریخ
  const handleBirthDateChange = (date, onChange) => {
    if (date) {
      const year = date.year;
      const month = date.month;
      const day = date.day;
      if (year > 1400) {
        setBirthDateError("سن مجاز برای خرید بلیط نیست");
        return;
      }
      if (year < 1280) {
        setBirthDateError("تاریخ تولد معتبر نیست");
        return;
      }
      setBirthDateError("");
      const shamsiDate = `${year}/${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}`;
      onChange(shamsiDate);
    } else {
      setBirthDateError("تاریخ تولد الزامی است");
      onChange("");
    }
  };

  // ✅ تبدیل تاریخ شمسی به میلادی
  const convertShamsiToGregorian = (shamsiDate) => {
    if (!shamsiDate) return null;
    const parts = shamsiDate.split("/");
    if (parts.length !== 3) return null;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    const d = new Date();
    d.setFullYear(year + 621);
    d.setMonth(month - 1);
    d.setDate(day);
    const gregorianDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return gregorianDate;
  };

  // ✅ افزودن تور به سبد خرید
  const addToBasket = async (tourId, token) => {
    const response = await fetch(`${BACKEND_BASE_URL}/basket/${tourId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "خطا در افزودن به سبد خرید");
    }
    return true;
  };

  // ✅ ارسال فرم و ریدایرکت به درگاه شبیه‌سازی
  const onSubmit = async (data) => {
    const refreshToken = getCookie("refreshToken");

    if (!refreshToken) {
      toast.error(
        " 📋 ابتدا برای احراز هویت وارد سایت شوید و سپس میتوانید خرید کنید",
        {
          position: "top-center",
          duration: 5000,
        },
      );

      return;
    }
    if (birthDateError) {
      toast.error("لطفاً خطاهای فرم را برطرف کنید");
      return;
    }
    if (Object.keys(errors).length > 0) {
      toast.error("لطفاً تمام فیلدها را به درستی پر کنید");
      return;
    }

    try {
      setIsSubmitting(true);
      await addToBasket(tourId, refreshToken);
      const gregorianBirthDate = convertShamsiToGregorian(data.birthDate);
      const orderData = {
        nationalCode: persianToEnglish(data.nationalId),
        fullName: data.fullName,
        gender: data.gender,
        birthDate: gregorianBirthDate,
      };
      const response = await fetch(`${BACKEND_BASE_URL}/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshToken}`,
        },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "خطا در ثبت سفارش");
      }
      const result = await response.json();
      console.log("نتیجه ثبت سفارش:", result);
      setShowLoadingModal(true);
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setShowLoadingModal(false);
      const orderId = result.orderId || `ORD-${Date.now()}`;
      const amount = (tourData?.price || 0) * 10;
      router.push(
        `/payment-simulator?orderId=${orderId}&amount=${amount}&tourTitle=${encodeURIComponent(tourData?.title || "تور")}`,
      );
    } catch (error) {
      console.error("خطا در ثبت سفارش:", error);
      toast.error(error.message || "مشکلی در ثبت سفارش پیش آمد");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!tourId) {
      setError("شناسه تور در آدرس URL پیدا نشد.");
      setIsLoading(false);
      return;
    }
    const fetchTourDetails = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${BACKEND_BASE_URL}/tour/${tourId}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error(`خطا در دریافت اطلاعات تور: ${res.status}`);
        }
        const data = await res.json();
        setTourData(data);
      } catch (err) {
        console.error(err);
        setError("مشکلی در بارگذاری اطلاعات تور پیش آمد.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTourDetails();
  }, [tourId]);

  const calculateDuration = (startStr, endStr) => {
    if (!startStr || !endStr) return { days: 0, nights: 0 };
    const startDate = new Date(startStr);
    const endDate = new Date(endStr);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(endDate - startDate);
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const nights = days > 0 ? days - 1 : 0;
    return { days, nights };
  };

  const toPersianNumberLocal = (num) => {
    if (num === undefined || num === null) return "—";
    return num.toLocaleString("fa-IR");
  };

  if (isLoading) {
    return (
      <div className={styles.mainContainer}>
        <p style={{ textAlign: "center", marginTop: "50px" }}>
          در حال دریافت اطلاعات تور...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.mainContainer}>
        <p style={{ textAlign: "center", marginTop: "50px", color: "red" }}>
          {error}
        </p>
      </div>
    );
  }

  const { days: durationInDays, nights: durationInNights } = calculateDuration(
    tourData?.startDate,
    tourData?.endDate,
  );
  const formattedPrice = tourData?.price
    ? Number(tourData.price).toLocaleString("fa-IR")
    : "0";

  return (
    <div className={styles.mainContainer}>
      <Toaster />
      <PaymentLoadingModal isOpen={showLoadingModal} />
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className={styles.deskfORM}
      >
        <div className={styles.formSection}>
          <div className={styles.formInfo}>
            <Image
              width={24}
              height={24}
              alt="user"
              src="/SVG/profile/psrofile.svg"
            />
            <h1>مشخصات مسافر</h1>
            {source && (
              <span style={{ fontSize: "12px", color: "#666" }}>
                ورود از: {source === "details" ? "جزئیات تور" : "لیست تورها"}
              </span>
            )}
          </div>
          <div className={styles.formDesign}>
            <div>
              <input
                placeholder="نام و نام خانوادگی"
                className={styles.formInput}
                {...register("fullName", {
                  required: "نام و نام خانوادگی الزامی است",
                  validate: validatePersianName,
                })}
              />
              <ErrorMessage message={errors.fullName?.message} />
            </div>
            <div>
              <select
                className={`${styles.formInput} ${styles.secoundInput}`}
                {...register("gender", {
                  required: "انتخاب جنسیت الزامی است",
                  validate: (value) =>
                    value !== "default" || "لطفاً جنسیت را انتخاب کنید",
                })}
              >
                <option value="default" disabled>
                  جنسیت
                </option>
                <option value="male">مرد</option>
                <option value="female">زن</option>
                <option value="other">سایر</option>
              </select>
              <ErrorMessage message={errors.gender?.message} />
            </div>
            <div>
              <input
                placeholder="کد ملی"
                className={styles.formInput}
                maxLength={10}
                {...register("nationalId", {
                  required: "کد ملی الزامی است",
                  validate: validateNationalId,
                  onChange: (e) => {
                    const clean = e.target.value
                      .split("")
                      .map((c) =>
                        "0123456789".includes(c)
                          ? "۰۱۲۳۴۵۶۷۸۹"["0123456789".indexOf(c)]
                          : c,
                      )
                      .join("")
                      .replace(/[^۰-۹]/g, "");
                    e.target.value = clean;
                  },
                })}
              />
              <ErrorMessage message={errors.nationalId?.message} />
            </div>
            <div>
              <Controller
                name="birthDate"
                control={control}
                rules={{ required: "تاریخ تولد الزامی است" }}
                render={({ field }) => (
                  <DatePicker
                    value={field.value || null}
                    onChange={(date) =>
                      handleBirthDateChange(date, field.onChange)
                    }
                    calendar={persian}
                    locale={persian_fa}
                    calendarPosition="bottom-right"
                    placeholder="تاریخ تولد"
                    inputClass={styles.datePickerInput}
                    containerClassName={styles.datePickerContainer}
                    format="YYYY/MM/DD"
                    maxDate={new Date()}
                    minDate={new Date().setFullYear(
                      new Date().getFullYear() - 120,
                    )}
                    editable={false}
                  />
                )}
              />
              <ErrorMessage
                message={birthDateError || errors.birthDate?.message}
              />
            </div>
          </div>
        </div>
        <div className={styles.summarySection}>
          <div className={styles.tourSummaryContent}>
            <div className={styles.formFooterInfo}>
              <p className={styles.tourTitle}>{tourData?.title || "نامشخص"}</p>
              {durationInDays > 0 && (
                <p className={styles.tourDuration}>
                  {toPersianNumberLocal(durationInDays)} روز و{" "}
                  {toPersianNumberLocal(durationInNights)} شب
                </p>
              )}
            </div>
            <div className={styles.divider_two}></div>
            <div className={styles.priceBoxFooter}>
              <div className={styles.priceFooter}>
                <p>قیمت نهایی :</p>
                <p className={styles.two}>
                  {formattedPrice}
                  <span>تومان</span>
                </p>
              </div>
              <div className={styles.bookBtn}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    opacity: isSubmitting ? 0.7 : 1,
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                  }}
                >
                  {isSubmitting ? "در حال ثبت..." : "ثبت و خرید نهایی"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

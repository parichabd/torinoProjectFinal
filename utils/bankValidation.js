// app/payment-simulator/page.jsx
"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import Image from "next/image";
import { setCookie } from "@/utils/cookie";
import { toPersianNumber } from "@/utils/number";
import { validateCardNumber } from "@/utils/bankValidation";  // ✅ اضافه شد
import styles from "./paymentSimulator.module.css";

const PROCESSING_DELAY = 2000;
const COOKIE_EXPIRY_DAYS = 30;

const toEnglishDigits = (str) => {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
  return str?.replace(/[۰-۹٠-٩]/g, (d) => {
    let index = persianDigits.indexOf(d);
    if (index === -1) index = arabicDigits.indexOf(d);
    return index !== -1 ? index : d;
  });
};

const formatCardNumber = (value) => {
  const englishValue = toEnglishDigits(value);
  const cleaned = englishValue.replace(/\s/g, "").replace(/\D/g, "");
  const chunks = cleaned.match(/.{1,4}/g) || [];
  return chunks.join(" ").substring(0, 19);
};

const formatExpiry = (value) => {
  const englishValue = toEnglishDigits(value);
  const cleaned = englishValue.replace(/\D/g, "");
  if (cleaned.length >= 2) {
    return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
  }
  return cleaned;
};

export default function PaymentSimulator() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const amount = searchParams.get("amount") || "0";
  const tourTitle = searchParams.get("tourTitle") || "تور";

  const [orderId] = useState(() => {
    const urlOrderId = searchParams.get("orderId");
    return urlOrderId || `ORD-${Date.now()}`;
  });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      cardNumber: "",
      expiry: "",
      cvv: "",
      otp: "",
    },
  });

  const cardNumber = useWatch({ control, name: "cardNumber" });

  const displayCardNumber = (value) => {
    const formatted = formatCardNumber(value || "");
    return toPersianNumber(formatted);
  };

  const onSubmit = async (data) => {
    const englishCard = toEnglishDigits(data.cardNumber);

    // ✅ اعتبارسنجی با الگوریتم Luhn
    const validation = validateCardNumber(englishCard);
    if (!validation.valid) {
      // میتونی اینجا toast نشون بدی به جای alert
      return;
    }

    setIsProcessing(true);

    const cleanCard = englishCard.replace(/\s/g, "");
    const lastFourDigits = cleanCard.slice(-4);

    setCookie("lastUsedCard", lastFourDigits, COOKIE_EXPIRY_DAYS);
    setCookie("fullCardNumber", data.cardNumber, COOKIE_EXPIRY_DAYS);
    setCookie("hasNewOrder", "true", COOKIE_EXPIRY_DAYS);
    setCookie("newOrderCount", "1", COOKIE_EXPIRY_DAYS);

    await new Promise((resolve) => setTimeout(resolve, PROCESSING_DELAY));

    setIsProcessing(false);
    setShowResult(true);

    setTimeout(() => {
      router.push("/?payment=success");
    }, PROCESSING_DELAY);
  };

  const handleCancel = () => {
    router.push("/");
  };

  return (
    <div className={styles.container}>
      {/* هدر */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <Image
              src="/SVG/static/download.png"
              alt="شاپرک"
              width={50}
              height={50}
            />
          </div>
          <div className={styles.headerText}>
            <h1>درگاه پرداخت اینترنتی شاپرک</h1>
            <p>پرداخت امن با کارت‌های شتاب</p>
          </div>
        </div>
      </div>

      {/* محتوای اصلی */}
      <div className={styles.content}>
        <div className={styles.paymentBox}>
          {/* اطلاعات پرداخت */}
          <div className={styles.merchantInfo}>
            <h2>اطلاعات پرداخت</h2>
            <div className={styles.infoRow}>
              <span>فروشگاه:</span>
              <span>آژانس مسافرتی آنلاین</span>
            </div>
            <div className={styles.infoRow}>
              <span>کالا:</span>
              <span>{decodeURIComponent(tourTitle)}</span>
            </div>
            <div className={styles.infoRow}>
              <span>شماره سفارش:</span>
              <span dir="ltr">{orderId}</span>
            </div>
            <div className={`${styles.infoRow} ${styles.amountRow}`}>
              <span>مبلغ قابل پرداخت:</span>
              <span className={styles.amount}>
                {toPersianNumber(Number(amount).toLocaleString())}
                <small>ریال</small>
              </span>
            </div>
          </div>

          <div className={styles.divider}></div>

          {/* فرم کارت بانکی */}
          <form onSubmit={handleSubmit(onSubmit)} className={styles.cardForm}>
            <h3>اطلاعات کارت بانکی</h3>

            {/* شماره کارت */}
            <div className={styles.inputGroup}>
              <label>شماره کارت</label>
              <input
                type="text"
                placeholder="XXXX XXXX XXXX XXXX"
                className={`${styles.cardInput} ${errors.cardNumber ? styles.inputError : ""}`}
                dir="ltr"
                value={displayCardNumber(cardNumber)}
                {...register("cardNumber", {
                  required: "شماره کارت الزامی است",
                  minLength: { value: 19, message: "شماره کارت باید ۱۶ رقم باشد" },
                  maxLength: { value: 19, message: "شماره کارت باید ۱۶ رقم باشد" },
                  onChange: (e) => {
                    const formatted = formatCardNumber(e.target.value);
                    setValue("cardNumber", formatted);
                  },
                })}
              />
              {errors.cardNumber && (
                <span className={styles.errorText}>{errors.cardNumber.message}</span>
              )}
            </div>

            <div className={styles.inputRow}>
              {/* تاریخ انقضا */}
              <div className={styles.inputGroup}>
                <label>تاریخ انقضا</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className={`${styles.cardInput} ${errors.expiry ? styles.inputError : ""}`}
                  dir="ltr"
                  {...register("expiry", {
                    required: "تاریخ انقضا الزامی است",
                    pattern: {
                      value: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
                      message: "فرمت: MM/YY",
                    },
                    onChange: (e) => {
                      const formatted = formatExpiry(e.target.value);
                      setValue("expiry", formatted);
                    },
                  })}
                />
                {errors.expiry && (
                  <span className={styles.errorText}>{errors.expiry.message}</span>
                )}
              </div>

              {/* CVV2 */}
              <div className={styles.inputGroup}>
                <label>CVV2</label>
                <input
                  type="password"
                  placeholder="***"
                  maxLength={4}
                  className={`${styles.cardInput} ${errors.cvv ? styles.inputError : ""}`}
                  dir="ltr"
                  {...register("cvv", {
                    required: "CVV2 الزامی است",
                    pattern: {
                      value: /^[0-9]{3,4}$/,
                      message: "۳ یا ۴ رقم",
                    },
                  })}
                />
                {errors.cvv && (
                  <span className={styles.errorText}>{errors.cvv.message}</span>
                )}
              </div>
            </div>

            {/* رمز پویا */}
            <div className={styles.inputGroup}>
              <label>رمز پویا (OTP)</label>
              <input
                type="text"
                placeholder="کد پیامک شده"
                maxLength={6}
                className={`${styles.cardInput} ${errors.otp ? styles.inputError : ""}`}
                dir="ltr"
                {...register("otp", {
                  required: "رمز پویا الزامی است",
                  pattern: {
                    value: /^[0-9]{6}$/,
                    message: "۶ رقم",
                  },
                })}
              />
              {errors.otp && (
                <span className={styles.errorText}>{errors.otp.message}</span>
              )}
            </div>

            <p className={styles.hint}>
              ⚠️ برای تست، هر مقداری وارد کنید - شبیه‌سازی است
            </p>

            {/* دکمه‌ها */}
            <div className={styles.actions}>
              <button
                type="submit"
                disabled={isProcessing}
                className={styles.payButton}
              >
                {isProcessing ? (
                  <span className={styles.processing}>
                    <span className={styles.btnSpinner}></span>
                    در حال پرداخش...
                  </span>
                ) : (
                  "پرداخت"
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className={styles.cancelButton}
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* نتیجه پرداخت */}
      {showResult && (
        <div className={styles.resultOverlay}>
          <div className={styles.resultBox}>
            <div className={styles.successIcon}>✓</div>
            <h2>پرداخت با موفقیت انجام شد</h2>
            <p>در حال انتقال به صفحه اصلی...</p>
          </div>
        </div>
      )}
    </div>
  );
}
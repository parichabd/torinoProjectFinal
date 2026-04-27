// app/payment-simulator/page.jsx
"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { setCookie } from "@/utils/cookie"; // ✅ ایمپورت اضافه شد
import styles from "./paymentSimulator.module.css";

export default function PaymentSimulator() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [cardNumber, setCardNumber] = useState("");

  const amount = searchParams.get("amount") || "0";
  const tourTitle = searchParams.get("tourTitle") || "تور";
  const [orderId] = useState(() => {
    const urlOrderId = searchParams.get("orderId");
    return urlOrderId || `ORD-${Date.now()}`;
  });

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, "").replace(/\D/g, "");
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(" ").substring(0, 19);
  };

  const handlePayment = async () => {
    if (!cardNumber || cardNumber.replace(/\s/g, "").length < 16) {
      alert("لطفاً شماره کارت معتبر وارد کنید");
      return;
    }

    setIsProcessing(true);

    // ✅ ذخیره در کوکی به جای localStorage
    const cleanCard = cardNumber.replace(/\s/g, "");
    const lastFourDigits = cleanCard.slice(-4);
    setCookie("lastUsedCard", lastFourDigits, 30);
    setCookie("fullCardNumber", cardNumber, 30);
    setCookie("hasNewOrder", "true", 30);
    setCookie("newOrderCount", "1", 30);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsProcessing(false);
    setShowResult(true);

    setTimeout(() => {
      router.push("/?payment=success");
    }, 2000);
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
                {Number(amount).toLocaleString("fa-IR")}
                <small>ریال</small>
              </span>
            </div>
          </div>

          <div className={styles.divider}></div>

          {/* فرم کارت بانکی */}
          <div className={styles.cardForm}>
            <h3>اطلاعات کارت بانکی</h3>

            <div className={styles.inputGroup}>
              <label>شماره کارت</label>
              <input
                type="text"
                placeholder="XXXX XXXX XXXX XXXX"
                className={styles.cardInput}
                dir="ltr"
                value={cardNumber}
                onChange={(e) =>
                  setCardNumber(formatCardNumber(e.target.value))
                }
                maxLength={19}
              />
            </div>

            <div className={styles.inputRow}>
              <div className={styles.inputGroup}>
                <label>تاریخ انقضا</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  maxLength={5}
                  className={styles.cardInput}
                  dir="ltr"
                />
              </div>
              <div className={styles.inputGroup}>
                <label>CVV2</label>
                <input
                  type="password"
                  placeholder="***"
                  maxLength={4}
                  className={styles.cardInput}
                  dir="ltr"
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>رمز پویا (OTP)</label>
              <input
                type="text"
                placeholder="کد پیامک شده"
                maxLength={6}
                className={styles.cardInput}
                dir="ltr"
              />
            </div>

            <p className={styles.hint}>
              ⚠️ برای تست، هر مقداری وارد کنید - شبیه‌سازی است
            </p>
          </div>

          {/* دکمه‌ها */}
          <div className={styles.actions}>
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className={styles.payButton}
            >
              {isProcessing ? (
                <span className={styles.processing}>
                  <span className={styles.btnSpinner}></span>
                  در حال پردازش...
                </span>
              ) : (
                "پرداخت"
              )}
            </button>
            <button onClick={handleCancel} className={styles.cancelButton}>
              انصراف
            </button>
          </div>
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

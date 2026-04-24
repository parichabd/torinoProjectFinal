// app/payment-simulator/page.jsx
"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import styles from "./paymentSimulator.module.css";

export default function PaymentSimulator() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // دریافت اطلاعات از URL
  const amount = searchParams.get("amount") || "0";
  const tourTitle = searchParams.get("tourTitle") || "تور";
  const orderId = searchParams.get("orderId") || `ORD-${Date.now()}`;

  // شبیه‌سازی پرداخت
  const handlePayment = async () => {
    setIsProcessing(true);

    // شبیه‌سازی تاخیر پرداخت
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsProcessing(false);
    setShowResult(true);

    // برگشت به صفحه اصلی بعد از ۲ ثانیه
    setTimeout(() => {
      router.push("/?payment=success");
    }, 2000);
  };

  // انصراف و برگشت
  const handleCancel = () => {
    router.push("/");
  };

  return (
    <div className={styles.container}>
      {/* هدر شبیه‌سازی */}
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
        {/* باکس پرداخت */}
        <div className={styles.paymentBox}>
          <div className={styles.merchantInfo}>
            <h2>اطلاعات پرداخت</h2>
            <div className={styles.infoRow}>
              <span>فروشگاه:</span>
              <span>آژانس مسافرتی تورینو</span>
            </div>
            <div className={styles.infoRow}>
              <span>کالا:</span>
              <span>{tourTitle}</span>
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
                placeholder="XXXX-XXXX-XXXX-XXXX"
                maxLength={19}
                className={styles.cardInput}
                dir="ltr"
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

        {/* لوگوهای بانک‌ها */}
        <div className={styles.bankLogos}>
          <p>پشتیبانی از کلیه کارت‌های بانکی عضو شتاب</p>
          <div className={styles.logos}>
            <span>بانک ملی</span>
            <span>بانک سامان</span>
            <span>بانک پارسیان</span>
            <span>بانک ملت</span>
            <span>بانک مسکن</span>
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
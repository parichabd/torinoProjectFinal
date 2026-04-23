"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./bookTour.module.css";
import { useSearchParams, usePathname } from "next/navigation";

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:6500";

export default function BookingForm({ initialTourId }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const source = searchParams.get("source");

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

  useEffect(() => {
    if (!tourId) {
      setError(
        "شناسه تور در آدرس URL پیدا نشد. لطفاً از صفحه تور به اینجا مراجعه کنید.",
      );
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

  const toPersianNumber = (num) => {
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

  const GATEWAY_URL = "https://bpm.shaparak.ir/pgwchannel/startpay.mellat";

  return (
    <div className={styles.mainContainer}>
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

        <input placeholder="نام و نام خانوادگی" className={styles.formInput} />

        <select className={`${styles.formInput} ${styles.secoundInput}`}>
          <option value="default" disabled selected>
            جنسیت
          </option>
          <option value="male">مرد</option>
          <option value="female">زن</option>
          <option value="other">سایر</option>
        </select>

        <input placeholder="کد ملی" className={styles.formInput} />
        <input type="date" className={styles.formInput} />
      </div>

      <div className={styles.summarySection}>
        <div className={styles.tourSummaryContent}>
          <div className={styles.formFooterInfo}>
            <p className={styles.tourTitle}>
               {tourData?.title || "نامشخص"}
            </p>
            {durationInDays > 0 && (
              <p className={styles.tourDuration}>
                {toPersianNumber(durationInDays)} روز و{" "}
                {toPersianNumber(durationInNights)} شب
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
              <a href={GATEWAY_URL} target="_blank" rel="noopener noreferrer">
                ثبت و خرید نهایی
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

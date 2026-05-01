"use client";
import React, { useState, useEffect } from "react";
import styles from "./MyTour.module.css";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import { toPersianNumber, formatNumber } from "@/utils/number";
import { profileApi } from "@/lib/api";

const MyTour = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyTours();
  }, []);

  const fetchMyTours = async () => {
    try {
      setLoading(true);
      const data = await profileApi.getMyTours();
      setTours(data || []);
    } catch (error) {
      toast.error("خطا در دریافت اطلاعات تور");
    } finally {
      setLoading(false);
    }
  };

  // تابع بررسی وضعیت تور
  const getTourStatus = (tour) => {
    const details = tour.tourDetails || {};
    const now = new Date();
    
    // تاریخ شروع و پایان تور
    const startDate = details.departureDate ? new Date(details.departureDate) : null;
    const endDate = details.returnDate ? new Date(details.returnDate) : null;

    if (!startDate || !endDate) {
      return { status: "نامشخص", isCompleted: false };
    }

    if (now > endDate) {
      return { status: "به اتمام رسیده", isCompleted: true };
    } else if (now >= startDate && now <= endDate) {
      return { status: "در حال برگزاری", isCompleted: false };
    } else {
      return { status: "در حال برگزاری", isCompleted: false };
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  if (tours.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <Image
          src="/SVG/profile/empty-tour.svg"
          width={80}
          height={80}
          alt="empty"
        />
        <p>هنوز توری رزرو نکرده‌اید</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: "#ffffff",
            color: "#419027",
            fontFamily: "Vazirmatn, sans-serif",
            direction: "rtl",
          },
        }}
      />
      <div className={styles.toursList}>
        {tours.map((tour, index) => {
          const details = tour.tourDetails || {};
          const { status, isCompleted } = getTourStatus(tour);

          return (
            <div
              key={`${tour.id}-${index}`}
              className={`${styles.tourCard} ${isCompleted ? styles.completedCard : ""}`}
            >
              {/* نشانگر وضعیت */}
              <div className={styles.statusIndicator}>
                <div className={`${styles.statusDot} ${isCompleted ? styles.completedDot : styles.activeDot}`}></div>
                <span className={`${styles.statusText} ${isCompleted ? styles.completedText : styles.activeText}`}>
                  {status}
                </span>
              </div>

              {/* هدر کارت */}
              <div className={styles.cardHeader}>
                <div className={styles.tourInfo}>
                  <h3 className={styles.tourName}>
                    {details.name || "نام تور"}
                  </h3>
                  <div className={styles.vehicleBadge}>
                    <Image
                      src="/SVG/profile/vehicle.svg"
                      width={14}
                      height={14}
                      alt="vehicle"
                    />
                    <span>{details.vehicleType || "وسیله نقلیه"}</span>
                  </div>
                </div>
                <span className={styles.tourNumber}>
                  شماره تور: {toPersianNumber(tour.id?.slice(-6) || "")}
                </span>
              </div>

              {/* مسیر */}
              <div className={styles.routeSection}>
                <div className={styles.routePoint}>
                  <div className={styles.pointDot}></div>
                  <div className={styles.pointInfo}>
                    <span className={styles.pointLabel}>مبدا</span>
                    <span className={styles.pointValue}>
                      {details.origin || "-"}
                    </span>
                  </div>
                </div>
                <div className={styles.routeLine}>
                  <Image
                    src="/SVG/profile/route-arrow.svg"
                    width={20}
                    height={20}
                    alt="arrow"
                  />
                </div>
                <div className={styles.routePoint}>
                  <div
                    className={`${styles.pointDot} ${styles.destinationDot}`}
                  ></div>
                  <div className={styles.pointInfo}>
                    <span className={styles.pointLabel}>مقصد</span>
                    <span className={styles.pointValue}>
                      {details.destination || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* زمان‌ها */}
              <div className={styles.timeSection}>
                <div className={styles.timeBox}>
                  <div className={styles.timeRow}>
                    <span className={styles.timeLabel}>تاریخ رفت</span>
                    <span className={styles.timeValue}>
                      {toPersianNumber(details.departureDate || "-")}
                    </span>
                  </div>
                  <div className={styles.timeRow}>
                    <span className={styles.timeLabel}>زمان رفت</span>
                    <span className={styles.timeValue}>
                      {toPersianNumber(details.departureTime || "-")}
                    </span>
                  </div>
                </div>
                <div className={styles.timeDivider}></div>
                <div className={styles.timeBox}>
                  <div className={styles.timeRow}>
                    <span className={styles.timeLabel}>تاریخ برگشت</span>
                    <span className={styles.timeValue}>
                      {toPersianNumber(details.returnDate || "-")}
                    </span>
                  </div>
                  <div className={styles.timeRow}>
                    <span className={styles.timeLabel}>زمان برگشت</span>
                    <span className={styles.timeValue}>
                      {toPersianNumber(details.returnTime || "-")}
                    </span>
                  </div>
                </div>
              </div>

              {/* مبلغ */}
              <div className={styles.priceSection}>
                <span className={styles.priceLabel}>مبلغ قابل پرداخت:</span>
                <span className={styles.priceValue}>
                  {formatNumber(details.price || 0)}
                  <span className={styles.currency}>تومان</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyTour;
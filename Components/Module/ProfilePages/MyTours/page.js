"use client";
import React, { useState, useEffect } from "react";
import styles from "./MyTour.module.css";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import { toPersianNumber, formatNumber } from "@/utils/number";
import { formatShamsiDate } from "@/utils/dateUtils";
import { originTranslations, vehicleMap } from "@/utils/translations";
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

    const startDate = details.departureDate
      ? new Date(details.departureDate)
      : null;
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

  // تابع ترجمه مبدا و مقصد
  const translateLocation = (location) => {
    if (!location) return "-";
    return originTranslations[location] || location;
  };

  // تابع ترجمه وسیله نقلیه
  const translateVehicle = (vehicle) => {
    if (!vehicle) return "وسیله نقلیه";
    const translated = vehicleMap[vehicle.toLowerCase()] || vehicleMap[vehicle];
    return translated || vehicle;
  };

  // تابع انتخاب آیکون وسیله نقلیه
  const getVehicleIcon = (vehicle) => {
    if (!vehicle) return "car.svg";

    const vehicleLower = vehicle.toLowerCase();

    if (vehicleLower.includes("airplane") || vehicleLower.includes("flight") || vehicleLower.includes("پرواز")) {
      return "airplane.svg";
    }
    if (vehicleLower.includes("bus") || vehicleLower.includes("اتوبوس")) {
      return "bus.svg";
    }
    if (vehicleLower.includes("train") || vehicleLower.includes("قطار")) {
      return "train.svg";
    }
    if (vehicleLower.includes("ship") || vehicleLower.includes("کشتی")) {
      return "ship.svg";
    }
    if (vehicleLower.includes("suv") || vehicleLower.includes("offroad") || vehicleLower.includes("آفرود") || vehicleLower.includes("شاسی")) {
      return "car.svg";
    }

    return "car.svg";
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
          const vehicleIcon = getVehicleIcon(details.vehicleType);

          return (
            <div
              key={`${tour.id}-${index}`}
              className={`${styles.tourCard} ${isCompleted ? styles.completedCard : ""}`}
            >
              {/* نشانگر وضعیت - سمت چپ بالا */}
              <div className={styles.statusIndicator}>
                <div className={`${styles.statusDot} ${isCompleted ? styles.completedDot : styles.activeDot}`}></div>
                <span className={`${styles.statusText} ${isCompleted ? styles.completedText : styles.activeText}`}>
                  {status}
                </span>
              </div>

              {/* ردیف ۱: نام تور + وسیله نقلیه */}
              <div className={styles.headerRow}>
                <div className={styles.tourNameSection}>
                  <Image
                    src="SVG/profile/icons/mytour-black.svg"
                    width={16}
                    height={16}
                    alt="tour icon"
                  />
                  <h3 className={styles.tourName}>
                    {details.name || "نام تور"}
                  </h3>
                </div>
                <div className={styles.vehicleSection}>
                  <span className={styles.vehicleLabel}>سفر با</span>
                  <Image
                    src={`SVG/profile/icons/${vehicleIcon}`}
                    width={18}
                    height={18}
                    alt={translateVehicle(details.vehicleType)}
                  />
                  <span className={styles.vehicleName}>
                    {translateVehicle(details.vehicleType)}
                  </span>
                </div>
              </div>

              {/* ردیف ۲: مسیر + تاریخ رفت */}
              <div className={styles.routeRow}>
                <div className={styles.routeInfo}>
                  <span className={styles.routeText}>
                    {translateLocation(details.origin)} به {translateLocation(details.destination)}
                  </span>
                </div>
                <div className={styles.departureInfo}>
                  <span className={styles.dotSeparator}>·</span>
                  <span className={styles.dateText}>
                    {formatShamsiDate(details.departureDate)}
                  </span>
                </div>
              </div>

              {/* ردیف ۳: تاریخ برگشت */}
              <div className={styles.returnRow}>
                <span className={styles.returnLabel}>تاریخ برگشت</span>
                <span className={styles.dotSeparator}>·</span>
                <span className={styles.dateText}>
                  {formatShamsiDate(details.returnDate)}
                </span>
              </div>

              {/* خط جداکننده */}
              <div className={styles.divider}></div>

              {/* ردیف ۴: شماره تور + مبلغ */}
              <div className={styles.footerRow}>
                <div className={styles.tourNumberSection}>
                  <span className={styles.footerLabel}>شماره تور:</span>
                  <span className={styles.footerValue}>
                    {toPersianNumber(tour.id?.slice(-6) || "")}
                  </span>
                </div>
                <div className={styles.priceSection}>
                  <span className={styles.footerLabel}>مبلغ پرداخت شده:</span>
                  <span className={styles.priceValue}>
                    {formatNumber(details.price || 0)}
                  </span>
                  <span className={styles.currency}>تومان</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyTour;
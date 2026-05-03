"use client";

import Link from "next/link";

import { useState, useEffect, useMemo } from "react";
import { TbMapSearch } from "react-icons/tb";
import { IoIosArrowDown } from "react-icons/io";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import Image from "next/image";
import styles from "./ShowTours.module.css";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";
const SKELETON_COUNT = 3;
const INITIAL_VISIBLE_COUNT = 4;
const LARGE_SCREEN_COUNT = 6;
const LARGE_SCREEN_BREAKPOINT = 1024;

const formatPrice = (price) => {
  if (!price && price !== 0) return "—";
  return new Intl.NumberFormat("fa-IR").format(price);
};

const getVehicleName = (vehicleType) => {
  if (!vehicleType) return "ناشناس";
  const map = {
    bus: "اتوبوس",
    train: "قطار",
    flight: "پرواز",
    airplane: "پرواز",
    suv: "SUV",
    private: "ویژه",
  };
  return map[vehicleType.toLowerCase()] || "پرواز";
};

const getImageUrl = (imagePath) => {
  if (!imagePath) return "/default-tour.jpg";
  if (imagePath.startsWith("http")) return imagePath;
  const cleanBaseUrl = BACKEND_BASE_URL.replace(/\/$/, "");
  const cleanImagePath = imagePath.startsWith("/")
    ? imagePath
    : `/${imagePath}`;
  return `${cleanBaseUrl}${cleanImagePath}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("fa-IR", { month: "long" }).format(date);
  } catch (e) {
    return "";
  }
};

const calculateDays = (start, end) => {
  if (!start || !end) return 0;
  try {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 0;

    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 1;
  } catch (e) {
    return 0;
  }
};

export default function ShowTours({ tours, isLoading, hasError }) {
  const [showAll, setShowAll] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  useEffect(() => {
    const updateCount = () => {
      setVisibleCount(
        window.innerWidth >= LARGE_SCREEN_BREAKPOINT
          ? LARGE_SCREEN_COUNT
          : INITIAL_VISIBLE_COUNT,
      );
    };

    updateCount();
    window.addEventListener("resize", updateCount);
    return () => window.removeEventListener("resize", updateCount);
  }, []);

  if (isLoading) {
    return (
      <div className={styles.tourInfo_Mbobile}>
        <div className={styles.headerTours}>
          <h1>همه تور ها</h1>
        </div>
        <div className={styles.skeletonGrid}>
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <Skeleton height={180} style={{ display: "block" }} />
              <div className={styles.skeletonContent}>
                <Skeleton width="60%" height={20} />
                <Skeleton width="40%" height={16} />
                <div className={styles.skeletonRow}>
                  <Skeleton width="30%" height={14} />
                  <Skeleton width="25%" height={14} />
                </div>
                <Skeleton width="50%" height={24} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={styles.tourInfo_Mbobile}>
        <div className={styles.headerTours}>
          <h1>همه تور ها</h1>
        </div>
        <p className={styles.emptyMessage}>
          مشکل در اتصال به سرور. لطفاً بعداً تلاش کنید.
        </p>
      </div>
    );
  }

  if (!tours || tours.length === 0) {
    return (
      <div className={styles.tourInfo_Mbobile}>
        <div className={styles.headerTours}>
          <h1>همه تور ها</h1>
        </div>
        <p className={styles.emptyMessage}>هیچ توری در حال حاضر موجود نیست.</p>
      </div>
    );
  }

  const displayedTours = showAll ? tours : tours.slice(0, visibleCount);
  const shouldShowMore = tours.length > visibleCount && !showAll;

  return (
    <div className={styles.tourInfo_Mbobile}>
      <div className={styles.headerTours}>
        <h1>همه تور ها</h1>
      </div>

      <ul className={styles.results}>
        {displayedTours.map((tour) => {
          const monthName = formatDate(tour.startDate);
          const days = calculateDays(tour.startDate, tour.endDate);
          const vehicleFa = getVehicleName(tour.fleetVehicle);
          const priceFa = formatPrice(tour.price);
          const imageSrc = getImageUrl(tour.image);

          return (
            <li key={tour.id} className={styles.tourCard}>
              <Link href={`/tours/${tour.id}`} className={styles.imageWrapper}>
                <Image
                  src={imageSrc}
                  alt={tour.title || "تور"}
                  width={400}
                  height={220}
                  className={styles.tourImage}
                  unoptimized={true}
                />
                <div className={styles.overlay}>
                  <span className={styles.zoomIcon}>
                    <TbMapSearch />
                  </span>
                  <span className={styles.overlayText}>جزئیات تور</span>
                </div>
              </Link>

              <h2 className={styles.tourTitle}>{tour.title}</h2>

              <p className={styles.tourMeta}>
                {monthName && (
                  <span className={styles.metaItem}>{monthName} ماه</span>
                )}
                {days > 0 && (
                  <>
                    <span className={styles.metaSeparator}>·</span>
                    <span className={styles.metaItem}>{days} روزه</span>
                  </>
                )}
                {vehicleFa !== "ناشناس" && (
                  <>
                    <span className={styles.metaSeparator}>·</span>
                    <span className={styles.metaItem}>{vehicleFa}</span>
                  </>
                )}
              </p>

              <div className={styles.divider}></div>

              <div className={styles.bottomRow}>
                <Link href={`/bookTour/${tour.id}`} passHref>
                  <button className={styles.bookBtn}>رزرو</button>
                </Link>
                <p className={styles.price}>
                  <span>{priceFa}</span> تومان
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      {shouldShowMore && (
        <div className={styles.showMoreWrapper}>
          <button
            className={styles.showMoreBtn}
            onClick={() => setShowAll(true)}
          >
            جزئیات بیشتر <IoIosArrowDown />
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import { TbMapSearch } from "react-icons/tb";
import { IoIosArrowDown } from "react-icons/io";
import Image from "next/image";
import Link from "next/link";
import "react-loading-skeleton/dist/skeleton.css";
import styles from "./ShowTours.module.css";

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:6500";

export default function ShowTours({ tours, isLoading }) {
  const [showAll, setShowAll] = useState(false);
  const [visibleCount, setVisibleCount] = useState(4); // پیش‌فرض موبایل/تبلت

  // کنترل تعداد پیش‌فرض تورها بر اساس عرض صفحه
  useEffect(() => {
    function updateVisibleCount() {
      const width = window.innerWidth;
      if (width >= 1024 && width <= 2860) {
        setVisibleCount(6); // ویندوز
      } else {
        setVisibleCount(4); // موبایل و تبلت
      }
    }

    updateVisibleCount(); // بار اول
    window.addEventListener("resize", updateVisibleCount);

    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  if (isLoading) {
    return (
      <div className={styles.tourInfo_Mbobile}>
        <div className={styles.headerTours}>
          <h1>همه تور ها</h1>
        </div>
        <div className={styles.skeletonWrapper}>
          <Skeleton height={200} count={3} style={{ marginBottom: 20 }} />
        </div>
      </div>
    );
  }

  if (!tours || tours.length === 0) {
    return (
      <div className={styles.tourInfo_Mbobile}>
        <div className={styles.headerTours}>
          <h1>همه تور ها</h1>
        </div>
        <p style={{ textAlign: "center", marginTop: 20 }}>
          هیچ توری موجود نیست
        </p>
      </div>
    );
  }

  // slice با توجه به تعداد پیش‌فرض
  const visibleTours = showAll ? tours : tours.slice(0, visibleCount);

  return (
    <div className={styles.tourInfo_Mbobile}>
      <div className={styles.headerTours}>
        <h1>همه تور ها</h1>
      </div>

      <ul className={styles.results}>
        {visibleTours.map((tour, index) => {
          const startDate = new Date(tour.startDate);
          const endDate = new Date(tour.endDate);
          const monthName = startDate.toLocaleString("fa-IR", { month: "long" });
          const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

          const vehicleMap = {
            bus: "اتوبوس",
            train: "قطار",
            flight: "پرواز",
            airplane: "پرواز",
            suv: "SUV",
          };
          const vehicleFa = vehicleMap[tour.fleetVehicle?.toLowerCase()] || "پرواز";
          const priceFa = tour.price ? tour.price.toLocaleString("fa-IR") : "—";

          let imageSrc = "/default-tour.jpg";
          if (tour?.image) {
            imageSrc = tour.image.startsWith("http")
              ? tour.image
              : `${BACKEND_BASE_URL}${tour.image.startsWith("/") ? tour.image : `/${tour.image}`}`;
          }

          return (
            <li key={index} className={styles.tourCard}>
              <Link href={`/tours/${tour.id}`} className={styles.imageWrapper}>
                <Image
                  src={imageSrc}
                  alt={tour.title || "تور"}
                  width={400}
                  height={220}
                  unoptimized={process.env.NODE_ENV === "development"}
                />
                <div className={styles.overlay}>
                  <span className={styles.zoomIcon}><TbMapSearch /></span>
                  <span className={styles.overlayText}>جزئیات تور</span>
                </div>
              </Link>

              <h2 className={styles.tourTitle}>{tour.title}</h2>

              <p className={styles.tourMeta}>
                <span className={styles.metaItem}>{monthName} ماه</span>
                <span className={styles.metaSeparator}>·</span>
                <span className={styles.metaItem}>{days} روزه</span>
                <span className={styles.metaSeparator}>·</span>
                <span className={styles.metaItem}>{vehicleFa}</span>
              </p>

              <div className={styles.divider}></div>

              <div className={styles.bottomRow}>
                <Link href={`/bookTour/${tour.id}`}>
                  <button className={styles.bookBtn}>رزرو</button>
                </Link>
                <p className={styles.price}><span>{priceFa}</span> تومان</p>
              </div>
            </li>
          );
        })}
      </ul>

      {/* دکمه جزئیات بیشتر فقط زمانی که تورهای بیشتر از visibleCount داریم */}
      {tours.length > visibleCount && !showAll && (
        <div style={{ textAlign: "center", marginTop: 20 }}>
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
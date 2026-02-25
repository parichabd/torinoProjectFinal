"use client";

import { useState } from "react";
import Skeleton from "react-loading-skeleton";
import { TbMapSearch } from "react-icons/tb";
import "react-loading-skeleton/dist/skeleton.css";
import { IoIosArrowDown } from "react-icons/io";
import Image from "next/image";
import styles from "./ShowTours.module.css";

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:6500";

export default function ShowTours({ tours, isLoading }) {
  const [showAll, setShowAll] = useState(false); // کنترل نمایش همه تورها

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

  // نمایش ۴ اول یا همه بسته به استیت
  const visibleTours = showAll ? tours : tours.slice(0, 4);

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
          };
          const vehicleFa = vehicleMap[tour.fleetVehicle?.toLowerCase()] || "پرواز";

          const hotelText = tour.hotel
            ? tour.hotel.length > 14
              ? tour.hotel.slice(0, 14) + "..."
              : tour.hotel
            : "هتل....";

          const priceFa = tour.price ? tour.price.toLocaleString("fa-IR") : "—";

          let imageSrc = "/default-tour.jpg";
          if (tour?.image) {
            if (tour.image.startsWith("http")) {
              imageSrc = tour.image;
            } else {
              const path = tour.image.startsWith("/") ? tour.image : `/${tour.image}`;
              imageSrc = `${BACKEND_BASE_URL}${path}`;
            }
          }

          return (
            <li key={index} className={styles.tourCard}>
              <div className={styles.imageWrapper}>
                <Image
                  src={imageSrc}
                  alt={tour.title || "تور"}
                  width={400}
                  height={220}
                  unoptimized={process.env.NODE_ENV === "development"}
                />
                <div className={styles.overlay}>
                  <span className={styles.zoomIcon}>
                    <TbMapSearch />
                  </span>
                  <span className={styles.overlayText}>جزئیات تور</span>
                </div>
              </div>

              <h2 className={styles.tourTitle}>{tour.title}</h2>

              <p className={styles.tourMeta}>
                <span className={styles.metaItem}>{monthName} ماه</span>
                <span className={styles.metaSeparator}>·</span>
                <span className={styles.metaItem}>{days} روزه</span>
                <span className={styles.metaSeparator}>·</span>
                <span className={styles.metaItem}>{vehicleFa}</span>
                <span className={styles.metaSeparator}>·</span>
                <span className={styles.metaItem}>{hotelText}</span>
              </p>

              <div className={styles.divider}></div>

              <div className={styles.bottomRow}>
                <button className={styles.bookBtn}>رزرو</button>
                <p className={styles.price}>
                  <span>{priceFa}</span> تومان
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      {/* دکمه جزئیات بیشتر */}
      {tours.length > 4 && !showAll && (
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
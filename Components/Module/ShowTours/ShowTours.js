"use client";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import styles from "./ShowTours.module.css";

export default function ShowTours({ tours, isLoading }) {
  return (
    <div className={styles.tourInfo_Mbobile}>
      {/* عنوان همیشه نمایش داده شود */}
      <div className={styles.headerTours}>
        <h1>همه تور ها</h1>
      </div>

      {/* لودینگ */}
      {isLoading && (
        <div className={styles.skeletonWrapper}>
          <Skeleton height={50} count={3} style={{ marginBottom: 10 }} />
        </div>
      )}

      {/* لیست تورها */}
      {!isLoading && tours && tours.length > 0 && (
        <div className={styles.eachTourInfo}>
          <ul className={styles.results}>
            {tours.map((t, i) => (
              <li key={i}>
                {t.origin.name} → {t.destination.name} |{" "}
                {t.startDate.split("T")[0]} تا {t.endDate.split("T")[0]}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* پیام خالی بودن لیست */}
      {!isLoading && (!tours || tours.length === 0) && (
        <p style={{ textAlign: "center" }}>هیچ توری موجود نیست</p>
      )}
    </div>
  );
}
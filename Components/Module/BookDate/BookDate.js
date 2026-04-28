"use client";
import { useState, useEffect, useRef } from "react";

import DatePicker from "react-multi-date-picker";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

import Image from "next/image";
import styles from "./BookDate.module.css";

const TOAST_DURATION = 3000;
const SEARCH_DELAY = 2000;
const SKELETON_COUNT = 3;

const translateToFa = {
  Tehran: "تهران",
  Isfahan: "اصفهان",
  Sanandaj: "سنندج",
  Sananndaj: "سنندج",
  Madrid: "مادرید",
  Hewler: "هولر",
  Mazandaran: "مازندران",
  Gilan: "گیلان",
  Sulaymaniyah: "سلیمانیه",
  Italy: "ایتالیا",
  Offroad: "آفرود",
  "offRoad Center": "آفرود",
  sulaymaniyahTour: "سلیمانیه",
};

function BookDate({ setFoundTours, setIsLoading, setHasError }) {
  const [tours, setTours] = useState([]);
  const [origins, setOrigins] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [startLoc, setStartLoc] = useState("مبدا");
  const [endLoc, setEndLoc] = useState("مقصد");
  const [selectedDate, setSelectedDate] = useState([null, null]);
  const [toast, setToast] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);

  const startRef = useRef(null);
  const endRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  const showToastMessage = (msg) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast(msg);
    setShowToast(true);
    toastTimeoutRef.current = setTimeout(
      () => setShowToast(false),
      TOAST_DURATION,
    );
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_BASE_URL;
    fetch(`${apiUrl}/tour`)
      .then((res) => res.json())
      .then((data) => {
        const normalizedTours = data.map((tour) => ({
          ...tour,
          origin: {
            ...tour.origin,
            name: translateToFa[tour.origin.name.trim()] || tour.origin.name,
          },
          destination: {
            ...tour.destination,
            name:
              translateToFa[tour.destination.name.trim()] ||
              tour.destination.name,
          },
        }));
        setTours(normalizedTours);
        const uniqueOrigins = [
          ...new Set(normalizedTours.map((t) => t.origin.name)),
        ].sort();
        const uniqueDestinations = [
          ...new Set(normalizedTours.map((t) => t.destination.name)),
        ].sort();
        setOrigins(uniqueOrigins);
        setDestinations(uniqueDestinations);
        setFoundTours(normalizedTours);
      })
      .catch(() => {
        showToastMessage("مشکل در اتصال به سرور!");
        setHasError(true);
      });
  }, [setFoundTours, setHasError]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (startRef.current && !startRef.current.contains(event.target))
        setStartOpen(false);
      if (endRef.current && !endRef.current.contains(event.target))
        setEndOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const normalizeDate = (date) => {
    if (!date) return null;
    const d = new Date(date.toDate?.() || date);
    if (isNaN(d.getTime())) return null;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  const handleSearch = () => {
    const [startSelected, endSelected] = selectedDate;
    if (!startSelected || !endSelected) {
      showToastMessage("لطفاً تاریخ شروع و پایان را انتخاب کنید!");
      return;
    }
    if (startLoc === "مبدا" || endLoc === "مقصد") {
      showToastMessage("لطفاً مبدا و مقصد را انتخاب کنید!");
      setFoundTours(tours);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setShowSkeleton(true);
    setTimeout(() => {
      const userStartDate = normalizeDate(startSelected);
      const userEndDate = normalizeDate(endSelected);
      const results = tours.filter((t) => {
        const originMatch = t.origin.name === startLoc;
        const destMatch = t.destination.name === endLoc;
        let dateMatch = true;
        if (userStartDate && userEndDate) {
          const tourStartDate = normalizeDate(t.startDate);
          if (tourStartDate) {
            dateMatch =
              tourStartDate >= userStartDate && tourStartDate <= userEndDate;
          }
        }
        return originMatch && destMatch && dateMatch;
      });
      setFoundTours(results);
      setIsLoading(false);
      setShowSkeleton(false);
      if (results.length === 0) {
        showToastMessage("هیچ توری با این مشخصات یافت نشد");
      }
    }, SEARCH_DELAY);
  };

  return (
    <div className={styles.date_info}>
      <h1>
        <span style={{ color: "#28A745" }}>تورینو </span>
        برگزار کننده بهترین تور های داخلی و خارجی
      </h1>
      <div className={styles.searchBar_desktop}>
        <div className={styles.booktour}>
          <div className={styles.dropdown} ref={startRef}>
            <button
              className={`${styles.startLoc} ${styles.locations}`}
              onClick={() => {
                setStartOpen(!startOpen);
                setEndOpen(false);
              }}
            >
              <Image
                src="/SVG/location/location.svg"
                alt="location"
                width={18}
                height={18}
              />
              <p>{startLoc}</p>
            </button>
            {startOpen && (
              <ul className={styles.dropdownMenu}>
                <li className={styles.frequentHeader}>پرتردد</li>
                {origins.map((loc) => (
                  <li
                    key={loc}
                    onClick={() => {
                      setStartLoc(loc);
                      setStartOpen(false);
                    }}
                  >
                    <Image
                      src="/SVG/location/location.svg"
                      alt="location"
                      width={18}
                      height={18}
                    />
                    <span>{loc}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className={styles.divider} />
          <div className={styles.dropdown} ref={endRef}>
            <button
              className={`${styles.endLoc} ${styles.locations}`}
              onClick={() => {
                setEndOpen(!endOpen);
                setStartOpen(false);
              }}
            >
              <Image
                src="/SVG/location/global-search.svg"
                alt="location"
                width={18}
                height={18}
              />
              <p>{endLoc}</p>
            </button>
            {endOpen && (
              <ul className={styles.dropdownMenu}>
                {destinations.map((loc) => (
                  <li
                    key={loc}
                    onClick={() => {
                      setEndLoc(loc);
                      setEndOpen(false);
                    }}
                  >
                    <Image
                      src="/SVG/location/global-search.svg"
                      alt="location"
                      width={18}
                      height={18}
                    />
                    <span>{loc}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className={styles.divider} />
        </div>
        <div className={styles.dateBox}>
          <DatePicker
            calendar={persian}
            locale={persian_fa}
            value={selectedDate}
            onChange={(dates) => setSelectedDate(dates)}
            placeholder="تاریخ"
            calendarPosition="bottom-center"
            className={styles.myCustomPicker}
            range
          />
          <Image
            src="/SVG/location/calendar.svg"
            alt="calendar"
            width={18}
            height={18}
            className={`${styles.dateIcon} ${
              selectedDate[0] ? styles.iconSelected : ""
            }`}
          />
        </div>
        <button className={styles.searchButton} onClick={handleSearch}>
          جست‌وجو
        </button>
      </div>
      {showSkeleton && (
        <div className={styles.skeletonGrid}>
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <Skeleton
                height={180}
                borderRadius="12px 12px 0 0"
                style={{ display: "block" }}
              />
              <div className={styles.skeletonContent}>
                <Skeleton width="60%" height={20} borderRadius="8px" />
                <Skeleton width="40%" height={16} borderRadius="8px" />
                <div className={styles.skeletonRow}>
                  <Skeleton width="30%" height={14} borderRadius="8px" />
                  <Skeleton width="25%" height={14} borderRadius="8px" />
                </div>
                <Skeleton width="50%" height={24} borderRadius="8px" />
              </div>
            </div>
          ))}
        </div>
      )}
      <div className={`${styles.toast} ${showToast ? styles.show : ""}`}>
        {toast}
      </div>
    </div>
  );
}

export default BookDate;

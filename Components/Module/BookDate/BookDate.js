"use client";
import { useState, useEffect, useRef } from "react";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import Image from "next/image";
import styles from "./BookDate.module.css";

function BookDate({ setFoundTours, setIsLoading }) {
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
  const startRef = useRef(null);
  const endRef = useRef(null);
  const dateRef = useRef(null);

  const showToastMessage = (msg) => {
    setToast(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

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
    "sulaymaniyahTour": "سلیمانیه",
  };

  useEffect(() => {
    fetch("http://localhost:6500/tour")
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
            name: translateToFa[tour.destination.name.trim()] || tour.destination.name,
          },
        }));
        setTours(normalizedTours);
        const uniqueOrigins = [...new Set(normalizedTours.map((t) => t.origin.name))].sort();
        const uniqueDestinations = [...new Set(normalizedTours.map((t) => t.destination.name))].sort();
        setOrigins(uniqueOrigins);
        setDestinations(uniqueDestinations);
        setFoundTours(normalizedTours);
      })
      .catch(() => showToastMessage("مشکل در اتصال به سرور!"));
  }, [setFoundTours]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (startRef.current && !startRef.current.contains(event.target)) setStartOpen(false);
      if (endRef.current && !endRef.current.contains(event.target)) setEndOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ تابع تبدیل تاریخ شمسی به میلادی
  const shamsiToGregorian = (shamsiDate) => {
    if (!shamsiDate) return null;
    const date = new Date(shamsiDate.toDate?.() || shamsiDate);
    if (isNaN(date.getTime())) return null;
    return date;
  };

  // ✅ تابع تبدیل string تاریخ به Date
  const parseTourDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
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

    const originFa = startLoc;
    const destFa = endLoc;

    setIsLoading(true);

    setTimeout(() => {
      const results = tours.filter((t) => {
        const originMatch = t.origin.name === originFa;
        const destMatch = t.destination.name === destFa;

        // ✅ تبدیل صحیح تاریخ‌ها
        const userStartDate = shamsiToGregorian(startSelected);
        const tourStartDate = parseTourDate(t.startDate);

        let dateMatch = true;
        if (userStartDate && tourStartDate) {
          // فقط تورهایی که تاریخ شروعشان بعد یا همزمان با تاریخ انتخابی کاربر است
          const userStartNormalized = new Date(userStartDate.getFullYear(), userStartDate.getMonth(), userStartDate.getDate());
          const tourStartNormalized = new Date(tourStartDate.getFullYear(), tourStartDate.getMonth(), tourStartDate.getDate());
          dateMatch = userStartNormalized >= tourStartNormalized;
        }

        return originMatch && destMatch && dateMatch;
      });

      setFoundTours(results);
      setIsLoading(false);

      if (results.length === 0) {
        showToastMessage("هیچ توری با این مشخصات یافت نشد");
      }
    }, 200);
  };

  return (
    <div className={styles.date_info}>
      <h1>
        <span style={{ color: "#28A745" }}>تورینو </span>
        برگزار کننده بهترین تور های داخلی و خارجی
      </h1>
      <div className={styles.searchBar_desktop}>
        <div className={styles.booktour}>
          {/* مبدا */}
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
                {origins.map((loc, i) => (
                  <li
                    key={i}
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
          {/* مقصد */}
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
                {destinations.map((loc, i) => (
                  <li
                    key={i}
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
        {/* تاریخ */}
        <div className={styles.dateBox} ref={dateRef}>
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
      <div className={`${styles.toast} ${showToast ? styles.show : ""}`}>
        {toast}
      </div>
    </div>
  );
}

export default BookDate;
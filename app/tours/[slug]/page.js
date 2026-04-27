import Image from "next/image";
import Styles from "./tourDetails.module.css";
import Link from "next/link";
import { notFound } from 'next/navigation';
import { toPersianNumber } from "../../../utils/number";
import { formatShamsiDate } from "../../../utils/dateUtils";
import { originTranslations, vehicleMap } from "../../../utils/translations";

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:6500";

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

export default async function TourPage({ params }) {
  // ✅ اصلاح: await params برای Next.js 15
  const resolvedParams = await params;
  const id = resolvedParams.slug || resolvedParams.id;

  let tour = null;
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/tour/${id}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      if (res.status === 404) {
        notFound();
      }
      throw new Error(`خطا در دریافت اطلاعات: ${res.status}`);
    }
    tour = await res.json();
  } catch (err) {
    throw err;
  }

  const { days: durationInDays, nights: durationInNights } = calculateDuration(
    tour.startDate,
    tour.endDate,
  );

  const getOriginName = (englishName) => {
    if (!englishName) return "—";
    return originTranslations[englishName] || englishName;
  };

  const getVehicleType = (vehicleKey) => {
    if (!vehicleKey) return "—";
    return vehicleMap[vehicleKey] || vehicleKey;
  };

  return (
    <div className={Styles.mainPageInfo}>
      <div className={Styles.windowTourDetails}>
        <div className={Styles.image}>
          <div className="imageBox">
            <Image
              src={
                tour.image?.startsWith("http")
                  ? tour.image
                  : `${BACKEND_BASE_URL}${tour.image}`
              }
              alt={tour.title || "تصویر تور"}
              width={450}
              height={260}
              layout="responsive"
              style={{ borderRadius: "12px", objectFit: "cover" }}
              className={Styles.responsiveImage}
              priority
              unoptimized
            />
          </div>
        </div>
        <div className={Styles.windowDetailsHead}>
          <div className={Styles.headers}>
            <h1>{tour.title || "بدون عنوان"}</h1>
            {durationInDays > 0 && (
              <p>
                {toPersianNumber(durationInDays)} روز و{" "}
                {toPersianNumber(durationInNights)} شب
              </p>
            )}
          </div>
          <div className={Styles.details}>
            <div className={Styles.details_icons}>
              <Image
                src="/SVG/Tour/user-tick.svg"
                alt="ایکون"
                width={14}
                height={14}
              />
              <p>تورلیدر از مبدا</p>
            </div>
            <div className={Styles.details_icons}>
              <Image
                src="/SVG/Tour/map.svg"
                alt="ایکون"
                width={14}
                height={14}
              />
              <p>برنامه سفر</p>
            </div>
            <div className={Styles.details_icons}>
              <Image
                src="/SVG/Tour/medal-star.svg"
                alt="ایکون"
                width={14}
                height={14}
              />
              <p>تضمین کیفیت</p>
            </div>
          </div>
          <div className={`${Styles.windowsBuy}`}>
            <div className={Styles.price}>
              <p>
                <span>{Number(tour.price).toLocaleString("fa-IR")}</span> تومان
              </p>
            </div>
            <div className={Styles.bookBtn}>
              <Link href={`/bookTour/${tour.id}`}>
                <button className={Styles.bookBtn}>رزرو و خرید</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="tourMainDetailsWrapper">
        <div className="scrollHint"></div>
        <div className={Styles.tourMainDetails}>
          <div className={Styles.tourInfoDetails}>
            <div className={Styles.headerThings}>
              <Image
                src="/SVG/Tour/routing-2.svg"
                alt=""
                width={18}
                height={18}
              />
              <span>مبدا</span>
            </div>
            <div className={Styles.headerParagraph}>
              <p>{getOriginName(tour.origin?.name) || "—"}</p>
            </div>
          </div>
          <div className={Styles.divider}></div>
          <div className={Styles.tourInfoDetails}>
            <div className={Styles.headerThings}>
              <Image
                src="/SVG/Tour/calendar.svg"
                alt=""
                width={18}
                height={18}
              />
              <span>تاریخ رفت </span>
            </div>
            <div className={Styles.headerParagraph}>
              <p>{formatShamsiDate(tour.startDate)}</p>
            </div>
          </div>
          <div className={Styles.divider}></div>
          <div className={Styles.tourInfoDetails}>
            <div className={Styles.headerThings}>
              <Image
                src="/SVG/Tour/calendar-2.svg"
                alt=""
                width={18}
                height={18}
              />
              <span>تاریخ برگشت</span>
            </div>
            <div className={Styles.headerParagraph}>
              <p>{formatShamsiDate(tour.endDate)}</p>
            </div>
          </div>
          <div className={Styles.divider}></div>
          <div className={Styles.tourInfoDetails}>
            <div className={Styles.headerThings}>
              <Image src="/SVG/Tour/bus.svg" alt="" width={18} height={18} />
              <span>حمل و نقل</span>
            </div>
            <div className={Styles.headerParagraph}>
              <p>{getVehicleType(tour.fleetVehicle)}</p>
            </div>
          </div>
          <div className={Styles.divider}></div>
          <div className={Styles.tourInfoDetails}>
            <div className={Styles.headerThings}>
              <Image
                src="/SVG/Tour/profile-2user.svg"
                alt=""
                width={18}
                height={18}
              />
              <span>ظرفیت</span>
            </div>
            <div className={Styles.headerParagraph}>
              <p>حداکثر {toPersianNumber(tour.availableSeats)} نفر</p>
            </div>
          </div>
          <div className={Styles.divider}></div>
          <div className={Styles.tourInfoDetails}>
            <div className={Styles.headerThings}>
              <Image
                src="/SVG/Tour/security.svg"
                alt=""
                width={18}
                height={18}
              />
              <span>بیمه</span>
            </div>
            <div className={Styles.headerParagraph}>
              <p> {tour.insurance ? "دارد" : "ندارد"}</p>
            </div>
          </div>
        </div>
      </div>
      <div className={Styles.priceAndbook}>
        <div className={Styles.bookBtn}>
          <Link href={`/bookTour/${tour.id}`}>
            <button className={Styles.bookBtn}>رزرو و خرید</button>
          </Link>
        </div>
        <div className={Styles.price}>
          <p>
            <span>{Number(tour.price).toLocaleString("fa-IR")}</span> تومان
          </p>
        </div>
      </div>
    </div>
  );
}
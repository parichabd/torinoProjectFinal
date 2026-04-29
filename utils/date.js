/**
 * تبدیل تاریخ میلادی به شمسی و نمایش با اعداد فارسی
 * مثال: "2025-04-29" → "۱۴۰۴/۰۲/۰۹"
 */

/**
 * تبدیل اعداد انگلیسی به فارسی
 */
const toPersianNumber = (num) => {
  if (num === undefined || num === null) return "";
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  const englishDigits = "0123456789";
  return String(num).replace(/[0-9]/g, (d) => persianDigits[englishDigits.indexOf(d)]);
};

/**
 * تبدیل تاریخ میلادی به شمسی
 * @param {string|Date} dateValue - تاریخ میلادی
 * @returns {object} - آبجکت با year, month, day
 */
export function gregorianToJalali(gy, gm, gd) {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = gy <= 1600 ? 0 : 979;
  gy -= gy <= 1600 ? 621 : 1600;
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) -
    80 +
    gd +
    g_d_m[gm - 1];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  jy += Math.floor((days - 1) / 365);
  if (days > 365) days = (days - 1) % 365;
  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = days < 186 ? (days % 31) + 1 : ((days - 186) % 30) + 1;
  return { year: jy, month: jm, day: jd };
}

/**
 * فرمت تاریخ شمسی با اعداد فارسی
 * مثال: "2025-04-29" → "۱۴۰۴/۰۲/۰۹"
 * @param {string|Date} dateValue - تاریخ ورودی
 * @param {string} separator - جداکننده (پیش‌فرض: "/")
 */
export function formatToJalali(dateValue, separator = "/") {
  if (!dateValue) return "";

  let year, month, day;

  // اگر آبجکت Date باشد
  if (dateValue instanceof Date) {
    year = dateValue.getFullYear();
    month = dateValue.getMonth() + 1;
    day = dateValue.getDate();
  } else {
    // اگر رشته باشد
    const dateStr = String(dateValue);
    
    // پشتیبانی از فرمت‌های مختلف
    let parts;
    if (dateStr.includes("/")) {
      parts = dateStr.split("/");
    } else if (dateStr.includes("-")) {
      parts = dateStr.split("-");
    } else if (dateStr.includes("T")) {
      // ISO format: 2025-04-29T00:00:00.000Z
      const isoDate = new Date(dateStr);
      if (!isNaN(isoDate.getTime())) {
        return formatToJalali(isoDate, separator);
      }
      return "";
    } else {
      return toPersianNumber(dateStr);
    }

    if (parts.length !== 3) return toPersianNumber(dateStr);

    // تشخیص اینکه کدام بخش کدام است
    // معمولاً فرمت YYYY/MM/DD یا YYYY-MM-DD
    year = parseInt(parts[0]);
    month = parseInt(parts[1]);
    day = parseInt(parts[2]);

    // اگر سال کمتر از 100 باشد (احتمالاً فرمت YY/MM/DD)
    if (year < 100) {
      year = year < 50 ? 2000 + year : 1900 + year;
    }
  }

  // تبدیل به شمسی
  const jalali = gregorianToJalali(year, month, day);

  // فرمت با اعداد فارسی و صفر اضافی
  const pYear = toPersianNumber(jalali.year);
  const pMonth = toPersianNumber(String(jalali.month).padStart(2, "0"));
  const pDay = toPersianNumber(String(jalali.day).padStart(2, "0"));

  return `${pYear}${separator}${pMonth}${separator}${pDay}`;
}

/**
 * فرمت تاریخ شمسی با نام ماه
 * مثال: "2025-04-29" → "۱۴۰۴ اردیبهشت ۰۹"
 */
export function formatToJalaliWithMonthName(dateValue) {
  if (!dateValue) return "-";

  const monthNames = [
    "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
    "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
  ];

  let year, month, day;

  if (dateValue instanceof Date) {
    year = dateValue.getFullYear();
    month = dateValue.getMonth() + 1;
    day = dateValue.getDate();
  } else {
    const dateStr = String(dateValue);
    let parts;

    if (dateStr.includes("/")) {
      parts = dateStr.split("/");
    } else if (dateStr.includes("-")) {
      parts = dateStr.split("-");
    } else if (dateStr.includes("T")) {
      const isoDate = new Date(dateStr);
      if (!isNaN(isoDate.getTime())) {
        return formatToJalaliWithMonthName(isoDate);
      }
      return "-";
    } else {
      return toPersianNumber(dateStr);
    }

    if (parts.length !== 3) return toPersianNumber(dateStr);

    year = parseInt(parts[0]);
    month = parseInt(parts[1]);
    day = parseInt(parts[2]);

    if (year < 100) {
      year = year < 50 ? 2000 + year : 1900 + year;
    }
  }

  const jalali = gregorianToJalali(year, month, day);
  const pYear = toPersianNumber(jalali.year);
  const pDay = toPersianNumber(jalali.day);
  const monthName = monthNames[jalali.month - 1] || "";

  return `${pYear} ${monthName} ${pDay}`;
}
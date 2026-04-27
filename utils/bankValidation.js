// src/utils/bankValidation.js

/**
 * تبدیل اعداد فارسی/عربی به انگلیسی
 */
export const toEnglishDigits = (str) => {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
  let result = str;
  
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(persianDigits[i], "g"), i);
    result = result.replace(new RegExp(arabicDigits[i], "g"), i);
  }
  return result;
};

/**
 * فرمت کردن شماره کارت (هر ۴ رقم فاصله)
 */
export const formatCardNumber = (value) => {
  const cleaned = value.replace(/\D/g, "").slice(0, 16);
  const chunks = cleaned.match(/.{1,4}/g) || [];
  return chunks.join(" ");
};

/**
 * الگوریتم Luhn برای اعتبارسنجی شماره کارت
 */
export const validateCardNumber = (cardNumber) => {
  const cleaned = cardNumber.replace(/\s/g, "");
  
  if (!/^\d{16}$/.test(cleaned)) {
    return { valid: false, message: "شماره کارت باید ۱۶ رقم باشد" };
  }

  // الگوریتم Luhn
  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  if (sum % 10 !== 0) {
    return { valid: false, message: "شماره کارت معتبر نیست" };
  }

  return { valid: true, message: "" };
};

/**
 * اعتبارسنجی شماره شبا (IBAN ایران)
 */
export const validateSheba = (sheba) => {
  const cleaned = toEnglishDigits(sheba).toUpperCase().replace(/\s/g, "");

  // بررسی فرمت IR
  if (!cleaned.startsWith("IR")) {
    return { valid: false, message: "شماره شبا با IR شروع می‌شود" };
  }

  const iban = cleaned.slice(2);
  
  if (!/^\d{24}$/.test(iban)) {
    return { valid: false, message: "شماره شبا باید ۲۴ رقم باشد" };
  }

  // اعتبارسنجی IBAN با الگوریتم MOD-97
  const rearranged = iban + "1827"; // IR = 18, 27
  const numericIban = BigInt(rearranged);
  
  if (numericIban % 97n !== 1n) {
    return { valid: false, message: "شماره شبا معتبر نیست" };
  }

  return { valid: true, message: "" };
};

/**
 * اعتبارسنجی شماره حساب
 */
export const validateAccountNumber = (accountNumber) => {
  const cleaned = toEnglishDigits(accountNumber);
  
  if (!/^\d{10,13}$/.test(cleaned)) {
    return { valid: false, message: "شماره حساب ۱۰ تا ۱۳ رقم است" };
  }

  return { valid: true, message: "" };
};

/**
 * تشخیص نوع کارت بانکی از روی پیشوند
 */
export const getCardType = (cardNumber) => {
  const cleaned = cardNumber.replace(/\s/g, "");
  
  if (/^6037/.test(cleaned)) return { name: "بانک ملی", color: "#1E3A5F" };
  if (/^6219/.test(cleaned)) return { name: "بانک سامان", color: "#0066B3" };
  if (/^5892/.test(cleaned)) return { name: "بانک سپه", color: "#1E3A5F" };
  if (/^6274/.test(cleaned)) return { name: "بانک مهر", color: "#8B0000" };
  if (/^6278/.test(cleaned)) return { name: "بانک اقتصاد نوین", color: "#2E7D32" };
  if (/^6362/.test(cleaned)) return { name: "بانک آینده", color: "#FF6F00" };
  if (/^5054/.test(cleaned)) return { name: "بانک ایران زمین", color: "#4A148C" };
  if (/^6280/.test(cleaned)) return { name: "بانک قرض الحسنه مهر", color: "#C62828" };
  if (/^6276/.test(cleaned)) return { name: "بانک مسکن", color: "#1565C0" };
  if (/^6393/.test(cleaned)) return { name: "بانک پارسیان", color: "#2E7D32" };
  if (/^6395/.test(cleaned)) return { name: "بانک پاسارگاد", color: "#D84315" };
  if (/^5022/.test(cleaned)) return { name: "بانک پاسارگاد", color: "#D84315" };
  if (/^6104/.test(cleaned)) return { name: "بانک ملت", color: "#1A237E" };
  if (/^6277/.test(cleaned)) return { name: "بانک پست", color: "#E65100" };
  if (/^5041/.test(cleaned)) return { name: "بانک قرض الحسنه رسالت", color: "#00838F" };
  
  return null;
};

/**
 * فرمت شماره شبا برای نمایش
 */
export const formatSheba = (sheba) => {
  const cleaned = toEnglishDigits(sheba).toUpperCase().replace(/\s/g, "");
  
  if (cleaned.length <= 4) return cleaned;
  
  // IR + بقیه با فاصله هر ۴ رقم
  const iban = cleaned.slice(2);
  const chunks = iban.match(/.{1,4}/g) || [];
  
  return "IR" + chunks.join(" ");
};
// src/components/profile/Profile.jsx
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { toPersianNumber } from "@/utils/number";
import { profileApi } from "@/lib/api";
import {
  toEnglishDigits,
  formatCardNumber,
  validateCardNumber,
  validateSheba,
  validateAccountNumber,
  getCardType,
  formatSheba,
} from "@/utils/bankValidation";
import { getCookie, setCookie } from "@/utils/cookie"; // ✅ اضافه شد
import styles from "./Profile.module.css";
import Image from "next/image";

// ============================================
// 🔐 توابع امنیتی
// ============================================
const sanitizeInput = (input) => {
  if (typeof input !== "string") return "";
  return input
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim();
};

// ============================================
// کمکی‌ها
// ============================================
const truncateEmail = (email, maxLength = 25) => {
  if (!email) return "";
  if (email.length <= maxLength) return email;
  return email.substring(0, maxLength) + "...";
};

// ============================================
// کامپوننت اصلی
// ============================================
export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSection, setEditingSection] = useState(null);

  // داده‌های فرم
  const [accountData, setAccountData] = useState({ mobile: "", email: "" });
  const [personalData, setPersonalData] = useState({
    fullName: "",
    gender: "",
    nationalId: "",
    birthDate: "",
  });
  const [bankData, setBankData] = useState({
    cardNumber: "",
    sheba: "",
    accountNumber: "",
  });

  // اعتبارسنجی real-time برای بانک
  const [cardValidation, setCardValidation] = useState({
    valid: null,
    message: "",
    cardType: null,
  });
  const [shebaValidation, setShebaValidation] = useState({
    valid: null,
    message: "",
  });
  const [accountValidation, setAccountValidation] = useState({
    valid: null,
    message: "",
  });
  // ============================================
  // useForm با custom validation
  // ============================================
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  // Watch برای فیلدهای بانکی
  const watchedCard = watch("cardNumber", "");
  const watchedSheba = watch("sheba", "");
  const watchedAccount = watch("accountNumber", "");

  // ============================================
  // اعتبارسنجی real-time شماره کارت
  // ============================================
  useEffect(() => {
    if (editingSection !== "bank" || !watchedCard) {
      setCardValidation({ valid: null, message: "", cardType: null });
      return;
    }
    const cleaned = watchedCard.replace(/\s/g, "");
    if (cleaned.length > 0 && cleaned.length < 16) {
      setCardValidation({
        valid: false,
        message: `${toPersianNumber(16 - cleaned.length)} رقم باقیمانده`,
        cardType: null,
      });
      return;
    }
    if (cleaned.length === 16) {
      const result = validateCardNumber(cleaned);
      const cardType = getCardType(cleaned);
      setCardValidation({
        valid: result.valid,
        message: result.message,
        cardType,
      });
    } else if (cleaned.length === 0) {
      setCardValidation({ valid: null, message: "", cardType: null });
    }
  }, [watchedCard, editingSection]);

  // ============================================
  // اعتبارسنجی real-time شبا
  // ============================================
  useEffect(() => {
    if (editingSection !== "bank" || !watchedSheba) {
      setShebaValidation({ valid: null, message: "" });
      return;
    }
    const cleaned = toEnglishDigits(watchedSheba)
      .toUpperCase()
      .replace(/\s/g, "");
    if (cleaned.length > 0 && !cleaned.startsWith("IR")) {
      setShebaValidation({ valid: false, message: "با IR شروع شود" });
      return;
    }
    if (cleaned.startsWith("IR") && cleaned.length < 26) {
      setShebaValidation({
        valid: false,
        message: `${toPersianNumber(26 - cleaned.length)} رقم باقیمانده`,
      });
      return;
    }
    if (cleaned.length === 26) {
      const result = validateSheba(cleaned);
      setShebaValidation({ valid: result.valid, message: result.message });
    } else if (cleaned.length === 0) {
      setShebaValidation({ valid: null, message: "" });
    }
  }, [watchedSheba, editingSection]);

  // ============================================
  // اعتبارسنجی real-time شماره حساب
  // ============================================
  useEffect(() => {
    if (editingSection !== "bank" || !watchedAccount) {
      setAccountValidation({ valid: null, message: "" });
      return;
    }
    const cleaned = toEnglishDigits(watchedAccount);
    if (cleaned.length > 0 && (cleaned.length < 10 || cleaned.length > 13)) {
      setAccountValidation({ valid: false, message: "۱۰ تا ۱۳ رقم" });
      return;
    }
    if (cleaned.length >= 10 && cleaned.length <= 13) {
      const result = validateAccountNumber(cleaned);
      setAccountValidation({ valid: result.valid, message: result.message });
    } else if (cleaned.length === 0) {
      setAccountValidation({ valid: null, message: "" });
    }
  }, [watchedAccount, editingSection]);

  // ============================================
  // 📦 بارگذاری اولیه داده‌ها از کوکی
  // ============================================
  useEffect(() => {
    // ✅ خواندن از کوکی (همانند سایر کامپوننت‌ها)
    const mobile = localStorage.getItem("mobile") || ""; // mobile از localStorage
    const fullName =
      getCookie("passengerFullName") || getCookie("userName") || "";
    const gender = getCookie("passengerGender") || "";
    const nationalId = getCookie("passengerNationalId") || "";
    const birthDate = getCookie("passengerBirthDate") || "";

    // ✅ فقط ۴ رقم آخر کارت
    const lastFour = getCookie("lastUsedCard") || "";
    const cardToShow = lastFour ? `**** **** **** ${lastFour}` : "";

    setAccountData({ mobile, email: "" });
    setPersonalData({ fullName, gender, nationalId, birthDate });
    setBankData({ cardNumber: cardToShow, sheba: "", accountNumber: "" });

    fetchServerData();
    setLoading(false);
  }, []);

  // ============================================
  // دریافت داده از سرور
  // ============================================
  const fetchServerData = async () => {
    try {
      const data = await profileApi.getProfile();

      if (data.email) {
        setAccountData((prev) => ({ ...prev, email: data.email }));
      }

      if (data.firstName || data.lastName) {
        const fullName =
          `${data.firstName || ""} ${data.lastName || ""}`.trim();
        setPersonalData((prev) => ({ ...prev, fullName }));
        // ✅ ذخیره در کوکی
        setCookie("passengerFullName", fullName, 30);
      }

      if (data.gender) {
        setPersonalData((prev) => ({ ...prev, gender: data.gender }));
        setCookie("passengerGender", data.gender, 30);
      }

      if (data.nationalCode) {
        const nationalCodeStr = String(data.nationalCode);
        setPersonalData((prev) => ({ ...prev, nationalId: nationalCodeStr }));
        setCookie("passengerNationalId", nationalCodeStr, 30);
      }

      if (data.birthDate) {
        setPersonalData((prev) => ({ ...prev, birthDate: data.birthDate }));
        setCookie("passengerBirthDate", data.birthDate, 30);
      }

      if (data.payment) {
        // ✅ فقط ۴ رقم آخر کارت
        if (data.payment.debitCard_code) {
          const lastFour = data.payment.debitCard_code.slice(-4);
          setCookie("lastUsedCard", lastFour, 30);
        }

        setBankData({
          cardNumber: data.payment.debitCard_code
            ? `**** **** **** ${data.payment.debitCard_code.slice(-4)}`
            : "",
          sheba: data.payment.shaba_code || "",
          accountNumber: data.payment.accountIdentifier || "",
        });
      }
    } catch (error) {
      console.log("Could not fetch server data:", error);
    }
  };

  // ============================================
  // تبدیل اعداد فارسی به انگلیسی
  // ============================================
  const handlePersianInput = (e, fieldName) => {
    const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
    let value = e.target.value;
    let persianValue = "";
    for (let i = 0; i < value.length; i++) {
      const char = value[i];
      if (char >= "0" && char <= "9") {
        persianValue += persianDigits[parseInt(char)];
      } else {
        persianValue += char;
      }
    }
    setValue(fieldName, persianValue);
  };

  // ============================================
  // مدیریت ورودی شماره کارت
  // ============================================
  const handleCardInput = useCallback(
    (e) => {
      const formatted = formatCardNumber(e.target.value);
      setValue("cardNumber", formatted);
    },
    [setValue],
  );

  // ============================================
  // ورود به حالت ویرایش
  // ============================================
  const handleEditClick = (section) => {
    setEditingSection(section);
    if (section === "account") {
      reset({ mobile: accountData.mobile, email: accountData.email });
    } else if (section === "personal") {
      reset({
        fullName: personalData.fullName,
        gender: personalData.gender,
        nationalId: toPersianNumber(personalData.nationalId),
        birthDate: toPersianNumber(personalData.birthDate),
      });
    } else if (section === "bank") {
      reset({
        cardNumber: "",
        accountNumber: "",
        sheba: "",
      });
      setCardValidation({ valid: null, message: "", cardType: null });
      setShebaValidation({ valid: null, message: "" });
      setAccountValidation({ valid: null, message: "" });
    }
  };

  // ============================================
  // انصراف از ویرایش
  // ============================================
  const handleCancel = () => {
    setEditingSection(null);
    setCardValidation({ valid: null, message: "", cardType: null });
    setShebaValidation({ valid: null, message: "" });
    setAccountValidation({ valid: null, message: "" });
    reset();
  };

  // ============================================
  // اعتبارسنجی نهایی
  // ============================================
  const validateBankData = (data) => {
    const errors = [];
    const cardResult = validateCardNumber(data.cardNumber);
    if (!cardResult.valid) errors.push(cardResult.message);
    const shebaResult = validateSheba(data.sheba);
    if (!shebaResult.valid) errors.push(shebaResult.message);
    const accountResult = validateAccountNumber(data.accountNumber);
    if (!accountResult.valid) errors.push(accountResult.message);
    return errors;
  };

  // ============================================
  // ارسال فرم
  // ============================================
  const onSubmit = async (data) => {
    setSaving(true);
    try {
      // ✅ پاکسازی ورودی‌ها
      const sanitizedData = {
        email: sanitizeInput(data.email || ""),
        fullName: sanitizeInput(data.fullName || ""),
        nationalId: sanitizeInput(data.nationalId || ""),
        birthDate: sanitizeInput(data.birthDate || ""),
        gender: sanitizeInput(data.gender || ""),
        cardNumber: sanitizeInput(data.cardNumber || ""),
        sheba: sanitizeInput(data.sheba || ""),
        accountNumber: sanitizeInput(data.accountNumber || ""),
      };

      if (editingSection === "account") {
        const response = await profileApi.updateProfile({
          email: sanitizedData.email,
        });
        setAccountData((prev) => ({ ...prev, email: sanitizedData.email }));
        toast.success("ایمیل با موفقیت ذخیره شد");
      } else if (editingSection === "personal") {
        const nameParts = sanitizedData.fullName.trim().split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        const convertToEnglishDigits = (str) => {
          const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
          return str.replace(/[۰-۹]/g, (d) => persianDigits.indexOf(d));
        };

        const response = await profileApi.updateProfile({
          firstName,
          lastName,
          gender: sanitizedData.gender,
          nationalCode: convertToEnglishDigits(sanitizedData.nationalId),
          birthDate: convertToEnglishDigits(sanitizedData.birthDate),
        });

        // ✅ ذخیره در کوکی
        setCookie("passengerFullName", sanitizedData.fullName, 30);
        setCookie("passengerGender", sanitizedData.gender, 30);
        setCookie("passengerNationalId", sanitizedData.nationalId, 30);
        setCookie("passengerBirthDate", sanitizedData.birthDate, 30);

        setPersonalData({
          fullName: sanitizedData.fullName,
          gender: sanitizedData.gender,
          nationalId: sanitizedData.nationalId,
          birthDate: sanitizedData.birthDate,
        });
        toast.success("مشخصات مسافر با موفقیت ذخیره شد");
      } else if (editingSection === "bank") {
        const validationErrors = validateBankData(data);
        if (validationErrors.length > 0) {
          toast.error(validationErrors[0]);
          setSaving(false);
          return;
        }

        const convertToEnglishDigits = (str) => {
          const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
          return str.replace(/[۰-۹]/g, (d) => persianDigits.indexOf(d));
        };

        const response = await profileApi.updateProfile({
          payment: {
            shaba_code: convertToEnglishDigits(sanitizedData.sheba),
            debitCard_code: convertToEnglishDigits(sanitizedData.cardNumber),
            accountIdentifier: convertToEnglishDigits(
              sanitizedData.accountNumber,
            ),
          },
        });

        // ✅ فقط ۴ رقم آخر کارت
        const lastFour = sanitizedData.cardNumber.replace(/\s/g, "").slice(-4);
        setCookie("lastUsedCard", lastFour, 30);

        setBankData({
          cardNumber: `**** **** **** ${lastFour}`,
          sheba: sanitizedData.sheba,
          accountNumber: sanitizedData.accountNumber,
        });
        toast.success("اطلاعات بانکی با موفقیت ذخیره شد");
      }

      setEditingSection(null);
      reset();
    } catch (error) {
      console.error("❌ Error saving profile:", error);
      const errorMessage = error?.message || "خطا در ذخیره اطلاعات";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // عنوان بخش
  // ============================================
  const getSectionTitle = (section, defaultTitle) => {
    if (editingSection === section) {
      if (section === "personal") return "ویرایش اطلاعات شخصی";
      if (section === "bank") return "ویرایش اطلاعات بانکی";
      if (section === "account") return "ویرایش اطلاعات حساب";
    }
    return defaultTitle;
  };

  // ============================================
  // کامپوننت‌های کمکی
  // ============================================
  const ValidationBadge = ({ valid, message }) => {
    if (valid === null) return null;
    return (
      <span
        className={`${styles.validationBadge} ${valid ? styles.validBadge : styles.invalidBadge}`}
      >
        {valid ? "✓" : "✗"} {message}
      </span>
    );
  };

  const CardTypeBadge = ({ cardType }) => {
    if (!cardType) return null;
    return (
      <span
        className={styles.cardTypeBadge}
        style={{ backgroundColor: cardType.color }}
      >
        {cardType.name}
      </span>
    );
  };

  if (loading) return <div className={styles.loading}>در حال بارگذاری...</div>;

  return (
    <div className={styles.container}>
      <Toaster position="top-center" />
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* ۱. اطلاعات حساب کاربری */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>{getSectionTitle("account", "اطلاعات حساب کاربری")}</h3>
            {editingSection !== "account" && (
              <div className={styles.headerActions}>
                <Image
                  width={14}
                  height={14}
                  alt="icon"
                  src="/SVG/profile/edit-2.svg"
                />
                <button
                  type="button"
                  className={styles.editBtn}
                  onClick={() => handleEditClick("account")}
                >
                  {accountData.email ? " افزودن " : " افزودن"}
                </button>
              </div>
            )}
          </div>
          <div className={styles.content}>
            {editingSection === "account" ? (
              <div className={styles.accountEditForm}>
                <div className={styles.accountFields}>
                  <div className={styles.accountField}>
                    <label>شماره موبایل</label>
                    <input
                      type="tel"
                      value={toPersianNumber(accountData.mobile)}
                      disabled
                      className={styles.disabledInput}
                    />
                  </div>
                  <div className={styles.accountField}>
                    <label>ایمیل</label>
                    <input
                      placeholder="آدرس ایمیل"
                      type="email"
                      className={errors.email ? styles.errorInput : ""}
                    />
                    {errors.email && (
                      <span className={styles.errorText}>
                        {errors.email.message}
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.accountActions}>
                  <button
                    type="submit"
                    className={styles.saveBtnOne}
                    disabled={saving}
                  >
                    {saving ? "در حال ذخیره..." : "تایید"}
                  </button>
                  <button
                    type="button"
                    className={styles.saveBtnTwo}
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    انصراف
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.infoRow}>
                  <span className={styles.label}>شماره موبایل:</span>
                  <span className={styles.value} dir="ltr">
                    {toPersianNumber(accountData.mobile)}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>ایمیل:</span>
                  <span
                    className={styles.value}
                    dir="ltr"
                    title={accountData.email}
                  >
                    {accountData.email ? truncateEmail(accountData.email) : "-"}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className={styles.divider}></div>

        {/* ۲. اطلاعات شخصی */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>{getSectionTitle("personal", "اطلاعات شخصی")}</h3>
            {editingSection !== "personal" && (
              <div className={styles.headerActions}>
                <Image
                  width={14}
                  height={14}
                  alt="icon"
                  src="/SVG/profile/edit-2.svg"
                />
                <button
                  type="button"
                  className={styles.editBtn}
                  onClick={() => handleEditClick("personal")}
                >
                  ویرایش اطلاعات
                </button>
              </div>
            )}
          </div>
          <div className={styles.content}>
            {editingSection === "personal" ? (
              <div className={styles.formGroup}>
                <div className={styles.twoCols}>
                  <div>
                    <input
                      placeholder="نام و نام خانوادگی"
                      type="text"
                      {...register("fullName", { required: "الزامی است" })}
                      className={errors.fullName ? styles.errorInput : ""}
                    />
                    {errors.fullName && (
                      <span className={styles.errorText}>
                        {errors.fullName.message}
                      </span>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="کد ملی"
                      {...register("nationalId", {
                        required: "الزامی است",
                        pattern: {
                          value: /^[۰-۹0-9]{10}$/,
                          message: "۱۰ رقم باشد",
                        },
                      })}
                      maxLength={10}
                      className={errors.nationalId ? styles.errorInput : ""}
                      onChange={(e) => handlePersianInput(e, "nationalId")}
                    />
                    {errors.nationalId && (
                      <span className={styles.errorText}>
                        {errors.nationalId.message}
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.twoCols}>
                  <div>
                    <select
                      {...register("gender", { required: "الزامی است" })}
                      className={errors.gender ? styles.errorInput : ""}
                    >
                      <option value="">انتخاب کنید</option>
                      <option value="male">مرد</option>
                      <option value="female">زن</option>
                      <option value="other">سایر</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      {...register("birthDate", { required: "الزامی است" })}
                      placeholder="تاریخ تولد"
                      className={errors.birthDate ? styles.errorInput : ""}
                      onChange={(e) => handlePersianInput(e, "birthDate")}
                    />
                    {errors.birthDate && (
                      <span className={styles.errorText}>
                        {errors.birthDate.message}
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.saveBtn}>
                  <button
                    type="submit"
                    className={styles.saveBtnOne}
                    disabled={saving}
                  >
                    {saving ? "در حال ذخیره..." : "تایید"}
                  </button>
                  <button
                    type="button"
                    className={styles.saveBtnTwo}
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    انصراف
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.infoGrid}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>نام و نام خانوادگی:</span>
                  <span className={styles.value}>
                    {personalData.fullName || "-"}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>کد ملی:</span>
                  <span className={styles.value} dir="ltr">
                    {toPersianNumber(personalData.nationalId) || "-"}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>جنسیت:</span>
                  <span className={styles.value}>
                    {personalData.gender === "male"
                      ? "مرد"
                      : personalData.gender === "female"
                        ? "زن"
                        : personalData.gender === "other"
                          ? "سایر"
                          : "-"}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>تاریخ تولد:</span>
                  <span className={styles.value}>
                    {toPersianNumber(personalData.birthDate) || "-"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.divider}></div>

        {/* ۳. اطلاعات حساب بانکی */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>{getSectionTitle("bank", "اطلاعات حساب بانکی")}</h3>
            {editingSection !== "bank" && (
              <div className={styles.headerActions}>
                <Image
                  width={14}
                  height={14}
                  alt="icon"
                  src="/SVG/profile/edit-2.svg"
                />
                <button
                  type="button"
                  className={styles.editBtn}
                  onClick={() => handleEditClick("bank")}
                >
                  ویرایش اطلاعات
                </button>
              </div>
            )}
          </div>
          <div className={styles.content}>
            {editingSection === "bank" ? (
              <div className={styles.formGroup}>
                {/* شماره کارت */}
                <div className={styles.bankFieldWrapper}>
                  <div className={styles.bankFieldHeader}>
                    <label>شماره کارت</label>
                    <CardTypeBadge cardType={cardValidation.cardType} />
                  </div>
                  <div className={styles.bankInputWrapper}>
                    <input
                      type="text"
                      {...register("cardNumber", {
                        required: "الزامی است",
                        validate: (value) => {
                          const result = validateCardNumber(value);
                          return result.valid || result.message;
                        },
                      })}
                      placeholder="XXXX XXXX XXXX XXXX"
                      dir="ltr"
                      maxLength={19}
                      className={`${styles.bankInput} ${
                        cardValidation.valid === false ? styles.inputError : ""
                      } ${cardValidation.valid === true ? styles.inputValid : ""}`}
                      onChange={handleCardInput}
                    />
                    <ValidationBadge
                      valid={cardValidation.valid}
                      message={cardValidation.message}
                    />
                  </div>
                  {errors.cardNumber && (
                    <span className={styles.errorText}>
                      {errors.cardNumber.message}
                    </span>
                  )}
                </div>

                {/* شماره شبا */}
                <div className={styles.bankFieldWrapper}>
                  <div className={styles.bankFieldHeader}>
                    <label>شماره شبا</label>
                    {shebaValidation.valid === true && (
                      <span className={styles.validBadge}>✓ معتبر</span>
                    )}
                  </div>
                  <div className={styles.bankInputWrapper}>
                    <input
                      type="text"
                      {...register("sheba", {
                        required: "الزامی است",
                        validate: (value) => {
                          const result = validateSheba(value);
                          return result.valid || result.message;
                        },
                      })}
                      placeholder="IR XX XXXX XXXX XXXX XXXX XXXX XX"
                      dir="ltr"
                      maxLength={26}
                      className={`${styles.bankInput} ${
                        shebaValidation.valid === false ? styles.inputError : ""
                      } ${shebaValidation.valid === true ? styles.inputValid : ""}`}
                      onChange={(e) => handlePersianInput(e, "sheba")}
                    />
                    <ValidationBadge
                      valid={shebaValidation.valid}
                      message={shebaValidation.message}
                    />
                  </div>
                  {errors.sheba && (
                    <span className={styles.errorText}>
                      {errors.sheba.message}
                    </span>
                  )}
                </div>

                {/* شماره حساب */}
                <div className={styles.bankFieldWrapper}>
                  <div className={styles.bankFieldHeader}>
                    <label>شماره حساب</label>
                    {accountValidation.valid === true && (
                      <span className={styles.validBadge}>✓ معتبر</span>
                    )}
                  </div>
                  <div className={styles.bankInputWrapper}>
                    <input
                      placeholder="شماره حساب بانکی"
                      type="text"
                      {...register("accountNumber", {
                        required: "الزامی است",
                        validate: (value) => {
                          const result = validateAccountNumber(value);
                          return result.valid || result.message;
                        },
                      })}
                      dir="ltr"
                      maxLength={13}
                      className={`${styles.bankInput} ${
                        accountValidation.valid === false
                          ? styles.inputError
                          : ""
                      } ${accountValidation.valid === true ? styles.inputValid : ""}`}
                      onChange={(e) => handlePersianInput(e, "accountNumber")}
                    />
                    <ValidationBadge
                      valid={accountValidation.valid}
                      message={accountValidation.message}
                    />
                  </div>
                  {errors.accountNumber && (
                    <span className={styles.errorText}>
                      {errors.accountNumber.message}
                    </span>
                  )}
                </div>

                {/* راهنمای اعتبارسنجی */}
                <div className={styles.validationGuide}>
                  <p>💡 نکات مهم:</p>
                  <ul>
                    <li>شماره کارت با الگوریتم Luhn بررسی می‌شود</li>
                    <li>شماره شبا با الگوریتم MOD-97 اعتبارسنجی می‌شود</li>
                    <li>شماره حساب باید ۱۰ تا ۱۳ رقم باشد</li>
                  </ul>
                </div>

                <div className={styles.saveBtn}>
                  <button
                    type="submit"
                    className={styles.saveBtnOne}
                    disabled={
                      saving ||
                      cardValidation.valid === false ||
                      shebaValidation.valid === false ||
                      accountValidation.valid === false
                    }
                  >
                    {saving ? "تایید" : "تایید  "}
                  </button>
                  <button
                    type="button"
                    className={styles.saveBtnTwo}
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    انصراف
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.infoGrid}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>شماره شبا:</span>
                  <span className={styles.value} dir="ltr">
                    {bankData.sheba ? formatSheba(bankData.sheba) : "-"}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>شماره حساب:</span>
                  <span className={styles.value} dir="ltr">
                    {toPersianNumber(bankData.accountNumber) || "-"}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>شماره کارت:</span>
                  <span className={styles.value} dir="ltr">
                    {toPersianNumber(bankData.cardNumber) || "-"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

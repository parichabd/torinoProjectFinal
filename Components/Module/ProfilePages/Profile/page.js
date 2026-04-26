"use client";
import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import Cookies from "js-cookie";
import { toPersianNumber } from "@/utils/number";
import styles from "./Profile.module.css";
import Image from "next/image";

const getCookieValue = (name) => {
  if (typeof window === "undefined") return "";
  return Cookies.get(name) || "";
};

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState(null);
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

  // State برای نمایش موقت ایمیل
  const [tempEmail, setTempEmail] = useState(null);
  const emailTimeoutRef = useRef(null);

  useEffect(() => {
    const mobile = localStorage.getItem("mobile") || "";
    const storedName =
      localStorage.getItem("userName") || getCookieValue("userName") || "";
    const fullName = localStorage.getItem("passengerFullName") || storedName;
    const gender = localStorage.getItem("passengerGender") || "";
    const nationalId = localStorage.getItem("passengerNationalId") || "";
    const birthDate = localStorage.getItem("passengerBirthDate") || "";
    const fullCard = localStorage.getItem("fullCardNumber") || "";
    const lastFour = localStorage.getItem("lastUsedCard") || "";
    const cardToShow =
      fullCard || (lastFour ? `**** **** **** ${lastFour}` : "");

    setAccountData({ mobile, email: "" });
    setPersonalData({ fullName, gender, nationalId, birthDate });
    setBankData({ cardNumber: cardToShow, sheba: "", accountNumber: "" });
    setLoading(false);
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  // تبدیل اعداد به فارسی هنگام تایپ
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
        cardNumber: toPersianNumber(bankData.cardNumber),
        accountNumber: toPersianNumber(bankData.accountNumber),
        sheba: toPersianNumber(bankData.sheba),
      });
    }
  };

  const handleCancel = () => {
    setEditingSection(null);
    reset();
  };

  const onSubmit = (data) => {
    if (editingSection === "account") {
      const newEmail = data.email;
      setAccountData((prev) => ({ ...prev, email: newEmail }));

      // نمایش موقت ایمیل
      setTempEmail(newEmail);

      // پاک کردن timeout قبلی
      if (emailTimeoutRef.current) {
        clearTimeout(emailTimeoutRef.current);
      }

      // بعد از 1.5 ثانیه فرم را ببند
      emailTimeoutRef.current = setTimeout(() => {
        setTempEmail(null);
        setEditingSection(null);
        reset();
      }, 1500);

      toast.success("ایمیل ذخیره شد");

    } else if (editingSection === "personal") {
      setPersonalData(data);
      localStorage.setItem("passengerFullName", data.fullName);
      localStorage.setItem("passengerGender", data.gender);
      localStorage.setItem("passengerNationalId", data.nationalId);
      localStorage.setItem("passengerBirthDate", data.birthDate);
      toast.success("مشخصات مسافر ذخیره شد");
      setEditingSection(null);
      reset();

    } else if (editingSection === "bank") {
      setBankData({
        cardNumber: data.cardNumber,
        sheba: data.sheba,
        accountNumber: data.accountNumber,
      });
      localStorage.setItem("fullCardNumber", data.cardNumber);
      toast.success("اطلاعات بانکی ذخیره شد");
      setEditingSection(null);
      reset();
    }
  };

  // پاکسازی timeout هنگام unmount
  useEffect(() => {
    return () => {
      if (emailTimeoutRef.current) {
        clearTimeout(emailTimeoutRef.current);
      }
    };
  }, []);

  // تابع برای نمایش هدر مناسب
  const getSectionTitle = (section, defaultTitle) => {
    if (editingSection === section) {
      if (section === "personal") return "ویرایش اطلاعات شخصی";
      if (section === "bank") return "ویرایش اطلاعات بانکی";
      if (section === "account") return "ویرایش اطلاعات حساب";
    }
    return defaultTitle;
  };

  if (loading) return <div className={styles.loading}>در حال بارگذاری...</div>;

  return (
    <div className={styles.container}>
      <Toaster position="top-center" />
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* --- ۱. اطلاعات حساب کاربری --- */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>{getSectionTitle("account", "اطلاعات حساب کاربری")}</h3>
          </div>
          <div className={styles.content}>
            {editingSection === "account" ? (
              <div className={styles.formGroup}>
                {/* دکمه لغو بالای فرم */}
                <div className={styles.cancelTop}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={handleCancel}
                  >
                    لغو
                  </button>
                </div>

                <div className={styles.profInfo}>
                  <label>شماره موبایل</label>
                  <input
                    type="tel"
                    value={toPersianNumber(accountData.mobile)}
                    disabled
                    className={styles.disabledInput}
                  />
                </div>
                <div className={styles.inputEmail}>
                  <input
                    placeholder="آدرس ایمیل"
                    type="email"
                    {...register("email", { required: "الزامی است" })}
                    className={errors.email ? styles.errorInput : ""}
                  />
                  {errors.email && (
                    <span className={styles.errorText}>
                      {errors.email.message}
                    </span>
                  )}
                  <button type="submit" className={styles.saveBtn}>
                    تایید
                  </button>
                </div>
              </div>
            ) : tempEmail ? (
              // نمایش موقت ایمیل بعد از ذخیره
              <div className={styles.infoGrid}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>شماره موبایل:</span>
                  <span className={styles.value} dir="ltr">
                    {toPersianNumber(accountData.mobile)}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>ایمیل:</span>
                  <span className={styles.value} dir="ltr">
                    {tempEmail}
                  </span>
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
                  <span className={styles.value} dir="ltr">
                    {accountData.email || "-"}
                  </span>
                  <div className={styles.addButt}>
                    <Image
                      width={14}
                      height={14}
                      alt="icon"
                      src="/SVG/profile/edit-2.svg"
                    />
                    <button
                      type="button"
                      className={styles.addBtn}
                      onClick={() => handleEditClick("account")}
                    >
                      افزودن
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className={styles.divider}></div>

        {/* --- ۲. اطلاعات شخصی --- */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>{getSectionTitle("personal", "اطلاعات شخصی")}</h3>
            {/* ✅ مخفی کردن دکمه در حالت ویرایش */}
            {editingSection !== "personal" && (
              <div>
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
                {/* دکمه انصراف زیر فرم */}
                <div className={styles.saveBtn}>
                  <button type="submit" className={styles.saveBtnOne}>
                    تایید
                  </button>
                  <button
                    type="button"
                    className={styles.saveBtnTwo}
                    onClick={handleCancel}
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
                        : "سایر"}
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

        {/* --- ۳. اطلاعات حساب بانکی --- */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>{getSectionTitle("bank", "اطلاعات حساب بانکی")}</h3>
            {/* ✅ مخفی کردن دکمه در حالت ویرایش */}
            {editingSection !== "bank" && (
              <div>
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
                <div className={styles.twoCols}>
                  <div>
                    <input
                      type="text"
                      {...register("cardNumber", { required: "الزامی است" })}
                      placeholder="شماره کارت"
                      dir="ltr"
                      className={errors.cardNumber ? styles.errorInput : ""}
                      onChange={(e) => handlePersianInput(e, "cardNumber")}
                    />
                    {errors.cardNumber && (
                      <span className={styles.errorText}>
                        {errors.cardNumber.message}
                      </span>
                    )}
                  </div>
                  <div>
                    <input
                      placeholder="شماره حساب"
                      type="text"
                      {...register("accountNumber", { required: "الزامی است" })}
                      dir="ltr"
                      className={errors.accountNumber ? styles.errorInput : ""}
                      onChange={(e) => handlePersianInput(e, "accountNumber")}
                    />
                    {errors.accountNumber && (
                      <span className={styles.errorText}>
                        {errors.accountNumber.message}
                      </span>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      {...register("sheba", { required: "الزامی است" })}
                      placeholder="شماره شبا"
                      dir="ltr"
                      className={errors.sheba ? styles.errorInput : ""}
                      onChange={(e) => handlePersianInput(e, "sheba")}
                    />
                    {errors.sheba && (
                      <span className={styles.errorText}>
                        {errors.sheba.message}
                      </span>
                    )}
                  </div>
                </div>
                {/* دکمه انصراف زیر فرم */}
                <div className={styles.saveBtn}>
                  <button type="submit" className={styles.saveBtnOne}>
                    تایید
                  </button>
                  <button
                    type="button"
                    className={styles.saveBtnTwo}
                    onClick={handleCancel}
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
                    {toPersianNumber(bankData.sheba) || "-"}
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
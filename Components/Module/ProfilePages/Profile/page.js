"use client";
import React, { useState, useEffect } from "react";
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
    accountNumber: "", // ← اضافه شد
  });

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
    setBankData({ cardNumber: cardToShow, sheba: "-", accountNumber: "-" });
    setLoading(false);
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const handleEditClick = (section) => {
    setEditingSection(section);
    if (section === "account")
      reset({ mobile: accountData.mobile, email: accountData.email });
    else if (section === "personal") reset({ ...personalData });
    else if (section === "bank") reset({ ...bankData });
  };

  const onSubmit = (data) => {
    if (editingSection === "account") {
      setAccountData((prev) => ({ ...prev, email: data.email }));
      toast.success("ایمیل ذخیره شد");
    } else if (editingSection === "personal") {
      setPersonalData(data);
      localStorage.setItem("passengerFullName", data.fullName);
      localStorage.setItem("passengerGender", data.gender);
      localStorage.setItem("passengerNationalId", data.nationalId);
      localStorage.setItem("passengerBirthDate", data.birthDate);
      toast.success("مشخصات مسافر ذخیره شد");
    } else if (editingSection === "bank") {
      setBankData({
        cardNumber: data.cardNumber,
        sheba: data.sheba,
        accountNumber: data.accountNumber,
      });
      localStorage.setItem("fullCardNumber", data.cardNumber);
      toast.success("اطلاعات بانکی ذخیره شد");
    }
    setEditingSection(null);
  };

  if (loading) return <div className={styles.loading}>در حال بارگذاری...</div>;

  return (
    <div className={styles.container}>
      <Toaster position="top-center" />
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* --- ۱. اطلاعات حساب کاربری --- */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>اطلاعات حساب کاربری</h3>
          </div>
          <div className={styles.content}>
            {editingSection === "account" ? (
              <div className={styles.formGroup}>
                <div className={styles.profInfo}>
                  <label>شماره موبایل</label>
                  <input
                    type="tel"
                    value={accountData.mobile}
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
                    {accountData.email}
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
            <h3>اطلاعات شخصی</h3>
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
                {editingSection === "personal" ? "لغو" : "ویرایش اطلاعات"}
              </button>
            </div>
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
                          value: /^[0-9]{10}$/,
                          message: "۱۰ رقم باشد",
                        },
                      })}
                      maxLength={10}
                      className={errors.nationalId ? styles.errorInput : ""}
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
                    />
                    {errors.birthDate && (
                      <span className={styles.errorText}>
                        {errors.birthDate.message}
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.saveBtn}>
                  <button type="submit" className={styles.saveBtnOne}>
                    تایید
                  </button>
                  <button type="submit" className={styles.saveBtnTwo}>
                    انصراف
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.infoGrid}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>نام و نام خانوادگی:</span>
                  <span className={styles.value}>
                    {personalData.fullName || "ثبت نشده"}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>کد ملی:</span>
                  <span className={styles.value} dir="ltr">
                    {personalData.nationalId || "ثبت نشده"}
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
                    {personalData.birthDate || "ثبت نشده"}
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
            <h3>اطلاعات حساب بانکی</h3>
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
                {editingSection === "bank" ? "لغو" : "ویرایش اطلاعات"}
              </button>
            </div>
          </div>
          <div className={styles.content}>
            {editingSection === "bank" ? (
              <div className={styles.formGroup}>
                <div className={styles.twoCols}>
                  <div>
                    <label>شماره شبا</label>
                    <input
                      type="text"
                      {...register("sheba", { required: "الزامی است" })}
                      placeholder="IR..."
                      dir="ltr"
                      className={errors.sheba ? styles.errorInput : ""}
                    />
                    {errors.sheba && (
                      <span className={styles.errorText}>
                        {errors.sheba.message}
                      </span>
                    )}
                  </div>
                  <div>
                    <label>شماره حساب</label>
                    <input
                      type="text"
                      {...register("accountNumber", { required: "الزامی است" })}
                      dir="ltr"
                      className={errors.accountNumber ? styles.errorInput : ""}
                    />
                    {errors.accountNumber && (
                      <span className={styles.errorText}>
                        {errors.accountNumber.message}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <label>شماره کارت</label>
                  <input
                    type="text"
                    {...register("cardNumber", { required: "الزامی است" })}
                    placeholder="XXXX XXXX XXXX XXXX"
                    dir="ltr"
                    className={errors.cardNumber ? styles.errorInput : ""}
                  />
                  {errors.cardNumber && (
                    <span className={styles.errorText}>
                      {errors.cardNumber.message}
                    </span>
                  )}
                </div>
                <div className={styles.saveBtn}>
                  <button type="submit" className={styles.saveBtnOne}>
                    تایید
                  </button>
                  <button type="submit" className={styles.saveBtnTwo}>
                    انصراف
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.infoGrid}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>شماره شبا:</span>
                  <span className={styles.value} dir="ltr">
                    {bankData.sheba || "ثبت نشده"}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>شماره حساب:</span>
                  <span className={styles.value} dir="ltr">
                    {bankData.accountNumber || "ثبت نشده"}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>شماره کارت:</span>
                  <span className={styles.value} dir="ltr">
                    {bankData.cardNumber || "ثبت نشده"}
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

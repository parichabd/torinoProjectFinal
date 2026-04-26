"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { toPersianNumber } from "@/utils/number";
import { profileApi } from "@/lib/api"; // ✅ ایمپورت API
import styles from "./Profile.module.css";
import Image from "next/image";

const getCookieValue = (name) => {
  if (typeof window === "undefined") return "";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return "";
};

const truncateEmail = (email, maxLength = 25) => {
  if (!email) return "";
  if (email.length <= maxLength) return email;
  return email.substring(0, maxLength) + "...";
};

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); // ✅ برای نمایش وضعیت ذخیره
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

  useEffect(() => {
    // ✅ ابتدا از localStorage بارگذاری کن
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

    // ✅ سعی کن اطلاعات را از سرور هم بگیری
    fetchServerData();

    setLoading(false);
  }, []);

  // ✅ تابع برای دریافت اطلاعات از سرور
  const fetchServerData = async () => {
    try {
      const data = await profileApi.getProfile();
      
      // بروزرسانی state ها با داده‌های سرور
      if (data.email) {
        setAccountData(prev => ({ ...prev, email: data.email }));
      }
      
      if (data.firstName || data.lastName) {
        const fullName = `${data.firstName || ""} ${data.lastName || ""}`.trim();
        setPersonalData(prev => ({ ...prev, fullName }));
        localStorage.setItem("passengerFullName", fullName);
      }
      
      if (data.gender) {
        setPersonalData(prev => ({ ...prev, gender: data.gender }));
        localStorage.setItem("passengerGender", data.gender);
      }
      
      if (data.nationalCode) {
        setPersonalData(prev => ({ ...prev, nationalId: String(data.nationalCode) }));
        localStorage.setItem("passengerNationalId", String(data.nationalCode));
      }
      
      if (data.birthDate) {
        setPersonalData(prev => ({ ...prev, birthDate: data.birthDate }));
        localStorage.setItem("passengerBirthDate", data.birthDate);
      }
      
      if (data.payment) {
        setBankData({
          cardNumber: data.payment.debitCard_code || "",
          sheba: data.payment.shaba_code || "",
          accountNumber: data.payment.accountIdentifier || "",
        });
        
        if (data.payment.debitCard_code) {
          localStorage.setItem("fullCardNumber", data.payment.debitCard_code);
        }
      }
    } catch (error) {
      console.log("Could not fetch server data:", error);
      // اگر خطا داد، مهم نیست - از localStorage استفاده می‌کنیم
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

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

  // ✅ تابع ذخیره‌سازی اصلاح شده
  const onSubmit = async (data) => {
    setSaving(true); // شروع لودینگ

    try {
      if (editingSection === "account") {
        // ذخیره ایمیل
        const response = await profileApi.updateProfile({
          email: data.email,
        });
        
        setAccountData((prev) => ({ ...prev, email: data.email }));
        toast.success("ایمیل با موفقیت ذخیره شد");
        
      } else if (editingSection === "personal") {
        // تبدیل نام کامل به firstName و lastName
        const nameParts = data.fullName.trim().split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        // تبدیل اعداد فارسی به انگلیسی برای ارسال به سرور
        const convertToEnglishDigits = (str) => {
          const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
          return str.replace(/[۰-۹]/g, (d) => persianDigits.indexOf(d));
        };

        const response = await profileApi.updateProfile({
          firstName,
          lastName,
          gender: data.gender,
          nationalCode: convertToEnglishDigits(data.nationalId),
          birthDate: convertToEnglishDigits(data.birthDate),
        });

        // بروزرسانی localStorage
        localStorage.setItem("passengerFullName", data.fullName);
        localStorage.setItem("passengerGender", data.gender);
        localStorage.setItem("passengerNationalId", data.nationalId);
        localStorage.setItem("passengerBirthDate", data.birthDate);

        // بروزرسانی state
        setPersonalData({
          fullName: data.fullName,
          gender: data.gender,
          nationalId: data.nationalId,
          birthDate: data.birthDate,
        });

        toast.success("مشخصات مسافر با موفقیت ذخیره شد");
        
      } else if (editingSection === "bank") {
        // تبدیل اعداد فارسی به انگلیسی
        const convertToEnglishDigits = (str) => {
          const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
          return str.replace(/[۰-۹]/g, (d) => persianDigits.indexOf(d));
        };

        const response = await profileApi.updateProfile({
          payment: {
            shaba_code: convertToEnglishDigits(data.sheba),
            debitCard_code: convertToEnglishDigits(data.cardNumber),
            accountIdentifier: convertToEnglishDigits(data.accountNumber),
          },
        });

        // بروزرسانی localStorage
        localStorage.setItem("fullCardNumber", data.cardNumber);

        // بروزرسانی state
        setBankData({
          cardNumber: data.cardNumber,
          sheba: data.sheba,
          accountNumber: data.accountNumber,
        });

        toast.success("اطلاعات بانکی با موفقیت ذخیره شد");
      }

      setEditingSection(null);
      reset();
      
    } catch (error) {
      console.error("❌ Error saving profile:", error);
      
      // نمایش پیام خطای مناسب
      const errorMessage = error?.message || "خطا در ذخیره اطلاعات";
      toast.error(errorMessage);
    } finally {
      setSaving(false); // پایان لودینگ
    }
  };

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
                  {accountData.email ? "ویرایش اطلاعات" : "افزودن"}
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
                      {...register("email", { required: "الزامی است" })}
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
                  <span className={styles.value} dir="ltr" title={accountData.email}>
                    {accountData.email ? truncateEmail(accountData.email) : "-"}
                  </span>
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

        {/* --- ۳. اطلاعات حساب بانکی --- */}
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
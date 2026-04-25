// app/Header/Layout.jsx
"use client";
import { useState, useEffect, useRef } from "react";
import { IoHomeOutline } from "react-icons/io5";
import { MdOutlineAirplaneTicket, MdOutlinePermPhoneMsg } from "react-icons/md";
import { PiUserSoundDuotone } from "react-icons/pi";
import { IoMdNotifications } from "react-icons/io";
import { toPersianNumber } from "@/utils/number";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthToast from "@/Components/Auth/AuthToast";
import Image from "next/image";
import Cookies from "js-cookie";
import styles from "./Layout.module.css";

// ✅ کامپوننت Badge زنگوله
const BellBadge = () => (
  <span className={styles.bellBadge}>
    <IoMdNotifications size={10} color="#fff" />
  </span>
);

// ✅ کامپوننت Badge عدد
const NumberBadge = () => <span className={styles.numberBadge}>۱</span>;

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [mobile, setMobile] = useState(null);

  // ✅ وضعیت نوتیفیکیشن
  const [hasNotification, setHasNotification] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const desktopRef = useRef(null);
  const mobileRef = useRef(null);

  const menuHandler = () => setIsOpen((prev) => !prev);

  const openLogin = () => {
    setAuthMode("login");
    setIsToastOpen(true);
  };

  const openRegister = () => {
    setAuthMode("register");
    setIsToastOpen(true);
  };

  const toggleUserMenu = (e) => {
    e.stopPropagation();
    setIsUserMenuOpen((prev) => !prev);
  };

  // ✅ بررسی نوتیفیکیشن‌ها
  useEffect(() => {
    const checkNotifications = () => {
      const hasNew = localStorage.getItem("hasNewOrder");
      const count = localStorage.getItem("newOrderCount");
      if (hasNew === "true") {
        setHasNotification(true);
        setNotificationCount(parseInt(count || "0", 10));
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 3000);
    return () => clearInterval(interval);
  }, []);

  // ✅ پاک کردن نوتیفیکیشن
  const clearNotification = () => {
    localStorage.removeItem("hasNewOrder");
    localStorage.removeItem("newOrderCount");
    setHasNotification(false);
    setNotificationCount(0);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMobile = localStorage.getItem("mobile");
      if (savedMobile !== null) {
        setTimeout(() => setMobile(savedMobile), 0);
      }

      const handleLoginSuccess = () => {
        const newMobile = localStorage.getItem("mobile");
        if (newMobile !== null) {
          setTimeout(() => setMobile(newMobile), 0);
        }
      };

      window.addEventListener("auth:login-success", handleLoginSuccess);
      return () =>
        window.removeEventListener("auth:login-success", handleLoginSuccess);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isDesktop = window.innerWidth >= 1024;
      const ref = isDesktop ? desktopRef.current : mobileRef.current;
      if (ref && !ref.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserMenuOpen]);

  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("mobile");
    localStorage.removeItem("userName");
    localStorage.removeItem("hasNewOrder");
    localStorage.removeItem("newOrderCount");
    Cookies.remove("accessToken", { path: "/" });
    Cookies.remove("refreshToken", { path: "/" });
    setMobile(null);
    setIsUserMenuOpen(false);
    setHasNotification(false);
    router.replace("/");
  };

  // ✅ وقتی روی "اطلاعات حساب کاربری" کلیک می‌کنه
  const handleProfileClick = () => {
    clearNotification();
    setIsUserMenuOpen(false);
  };

  const userMenuContent = (
    <div className={styles.userMenu}>
      {mobile && (
        <div
          className={`${styles.item} ${styles.mobileOnly} ${styles.profileRow}`}
        >
          <div className={styles.DP_profile}>
            <div className={styles.DP_profile_base}>
              <Image
                src="/SVG/profile/DP/Ellipse 2.svg"
                alt="Torino Logo"
                width={22}
                height={22}
              />
            </div>
            <div className={styles.DP_profile_icon}>
              <Image
                src="/SVG/profile/DP/frame.svg"
                alt="Torino Logo"
                width={22}
                height={22}
              />
            </div>
          </div>
          <div className={styles.numberPD}>{toPersianNumber(mobile)}</div>
        </div>
      )}

      {/* ✅ لینک پروفایل با زنگوله */}
      <Link
        href="/ProfileInfo"
        className={`${styles.item} ${styles.noUnderline}`}
        onClick={handleProfileClick}
      >
        <Image
          src="/SVG/profile/profile.svg"
          alt="Torino Logo"
          width={20}
          height={20}
        />
        <h1>اطلاعات حساب کاربری</h1>
        {/* ✅ زنگوله در کنار پروفایل */}
        {hasNotification && <NumberBadge />}
      </Link>

      <div className={styles.divider_profile}></div>
      <div className={`${styles.item} ${styles.exit}`} onClick={handleLogout}>
        <Image
          src="/SVG/profile/logout.svg"
          alt="Torino Logo"
          width={20}
          height={20}
        />
        <h1>خروج از حساب کاربری </h1>
      </div>
    </div>
  );

  return (
    <>
      <header className={`${styles.header_layout} ${styles.container}`}>
        {/* LEFT SIDE */}
        <div className={styles.left_side}>
          <div className={styles.desktop_menu}>
            <Image
              src="/image/Torino (4) 1.png"
              alt="Torino Logo"
              width={120}
              height={40}
            />
            <Link href="/">صفحه اصلی</Link>
            <Link href="/Guide/TourismServices">خدمات گردشگری</Link>
            <Link href="/Info/about-us">درباره ما</Link>
            <Link href="/Info/contact">تماس با ما</Link>
          </div>
          <div className={styles.mobile_menu}>
            <button className={styles.button} onClick={menuHandler}>
              <Image
                src="/icon/Group 46.png"
                alt="menu"
                width={30}
                height={35}
              />
            </button>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className={styles.right_side}>
          {/* DESKTOP */}
          <div className={styles.desktop_menu}>
            <div
              className={`${styles.login_desktop} ${mobile ? styles.noBorder : ""}`}
            >
              {mobile ? (
                <div className={styles.userWrapper} ref={desktopRef}>
                  <div className={styles.userSection} onClick={toggleUserMenu}>
                    <Image
                      src="/icon/profile.png"
                      alt="profile"
                      width={19}
                      height={14}
                    />

                    {/* ✅ شماره تلفن با Badge عدد */}
                    <div className={styles.phoneWrapper}>
                      <span className={styles.user_mobile}>
                        {toPersianNumber(mobile)}
                      </span>
                      {/* ✅ عدد ۱ بالای شماره تلفن */}
                      {hasNotification && <BellBadge />}


                    </div>

                    <Image
                      src="/SVG/arrow-down.svg"
                      alt="arrow"
                      width={18}
                      height={18}
                      className={isUserMenuOpen ? styles.rotateArrow : ""}
                    />
                  </div>
                  {isUserMenuOpen && userMenuContent}
                </div>
              ) : (
                <>
                  <div className={styles.login_icon}>
                    <Image
                      src="/icon/profile.png"
                      alt="profile"
                      width={22}
                      height={22}
                    />
                    <button onClick={openLogin}>ورود</button>
                    <span>|</span>
                  </div>
                  <div className={styles.login_icon}>
                    <button onClick={openRegister}>ثبت نام</button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* MOBILE */}
          <div className={styles.mobile_menu}>
            {mobile ? (
              <div className={styles.userWrapper} ref={mobileRef}>
                <div className={styles.userSection} onClick={toggleUserMenu}>
                  <Image
                    src="/icon/profile.png"
                    alt="profile"
                    width={22}
                    height={22}
                  />

                  {/* ✅ شماره تلفن با Badge عدد */}
                  <div className={styles.phoneWrapper}>
                    <span className={styles.user_mobile}>
                      {toPersianNumber(mobile)}
                    </span>
                    {/* ✅ عدد ۱ بالای شماره تلفن */}
                      {hasNotification && <BellBadge />}

                  </div>

                  <Image
                    src="/SVG/arrow-down.svg"
                    alt="arrow"
                    width={24}
                    height={24}
                    className={isUserMenuOpen ? styles.rotateArrow : ""}
                  />
                </div>
                {isUserMenuOpen && userMenuContent}
              </div>
            ) : (
              <button onClick={openLogin}>
                <Image
                  src="/icon/sign in buttom.png"
                  alt="sign in"
                  width={47}
                  height={47}
                />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      {isOpen && (
        <div className={styles.mobile_overlay} onClick={menuHandler} />
      )}
      <nav className={`${styles.mobile_drawer} ${isOpen ? styles.open : ""}`}>
        <Link href="/" onClick={menuHandler}>
          <IoHomeOutline /> صفحه اصلی
        </Link>
        <Link href="/Guide/TourismServices" onClick={menuHandler}>
          <MdOutlineAirplaneTicket /> خدمات گردشگری
        </Link>
        <Link href="/Info/about-us" onClick={menuHandler}>
          <PiUserSoundDuotone /> درباره ما
        </Link>
        <Link href="/Info/contact" onClick={menuHandler}>
          <MdOutlinePermPhoneMsg /> تماس با ما
        </Link>
      </nav>

      {isToastOpen && (
        <AuthToast mode={authMode} onClose={() => setIsToastOpen(false)} />
      )}
    </>
  );
}

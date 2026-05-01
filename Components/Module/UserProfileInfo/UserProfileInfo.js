"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./UserProfileInfo.module.css";
import Image from "next/image";
import Transaction from "../ProfilePages/Transaction/page";
import MyTour from "../ProfilePages/MyTours/page";
import Profile from "../ProfilePages/Profile/page";

function UserProfileInfo() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // ⬇️ گرفتن tab از URL بدون useEffect
  const tab = searchParams.get("tab");
  const activePage = useMemo(() => {
    if (tab === "mytour") return "mytour";
    if (tab === "transaction") return "transaction";
    return "profile";
  }, [tab]);

  const [activeButtonStyle, setActiveButtonStyle] = useState({
    left: 0,
    width: 0,
  });
  const navRef = useRef(null);

  const updateActiveLineStyle = (page) => {
    const activeButton = document.querySelector(`[data-page="${page}"]`);
    if (activeButton && navRef.current) {
      const containerRect = navRef.current.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      const left = buttonRect.left - containerRect.left;
      const width = buttonRect.width;
      setActiveButtonStyle({ left, width });
    }
  };

  useEffect(() => {
    updateActiveLineStyle(activePage);
    const handleResize = () => updateActiveLineStyle(activePage);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activePage]);

  const navigateTo = (page) => {
    // ⬇️ همه tab‌ها توی URL نشون داده میشن
    router.push(`/ProfileInfo?tab=${page}`);
  };

  const getIconSrc = (activeName, inactiveName) => {
    return activePage === activeName
      ? `/SVG/profile/icons/${activeName}-green.svg`
      : `/SVG/profile/icons/${inactiveName}-black.svg`;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <nav className={styles.nav} ref={navRef}>
          <div
            className={`${styles.navItem} ${activePage === "profile" ? styles.active : ""}`}
            data-page="profile"
            onClick={() => navigateTo("profile")}
          >
            <Image
              src={getIconSrc("profile", "profile")}
              width={16}
              height={16}
              alt="profile icon"
            />
            <span className={styles.text}>پروفایل</span>
          </div>
          <div
            className={`${styles.navItem} ${activePage === "mytour" ? styles.active : ""}`}
            data-page="mytour"
            onClick={() => navigateTo("mytour")}
          >
            <Image
              src={getIconSrc("mytour", "mytour")}
              width={16}
              height={16}
              alt="tour icon"
            />
            <span className={styles.text}>تور های من</span>
          </div>
          <div
            className={`${styles.navItem} ${activePage === "transaction" ? styles.active : ""}`}
            data-page="transaction"
            onClick={() => navigateTo("transaction")}
          >
            <Image
              src={getIconSrc("transaction", "transaction")}
              width={16}
              height={16}
              alt="transaction icon"
            />
            <span className={styles.text}>تراکنش</span>
          </div>
          <div
            className={styles.activeLine}
            style={{
              left: `${activeButtonStyle.left}px`,
              width: `${activeButtonStyle.width}px`,
            }}
          />
        </nav>
      </header>
      <div className={styles.divider}></div>
      <main className={styles.mainContent}>
        {activePage === "transaction" && <Transaction />}
        {activePage === "mytour" && <MyTour />}
        {activePage === "profile" && <Profile />}
      </main>
    </div>
  );
}

export default UserProfileInfo;
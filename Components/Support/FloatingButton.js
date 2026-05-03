"use client";

import { useState } from "react";
import SupportPanel from "./SupportPanel";

import styles from "./Support.module.css";
import Image from "next/image";

const FloatingButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* پنل پشتیبانی */}
      <SupportPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />

      {/* دکمه شناور */}
      <div className={styles.floatingContainer}>
        {/* شمارنده پیام‌ها (اختیاری) */}
        <div className={styles.notificationBadge}>۳</div>

        <button
          className={`${styles.floatingButton} ${isOpen ? styles.active : ""}`}
          onClick={togglePanel}
          aria-label="پشتیبانی"
        >
          {/* آیکون چت */}
          <Image
            width={40}
            height={40}
            src="/SVG/support.png"
            alt="پشتیبانی"
            className={styles.supportIcon}
          />

          {/* آیکون بستن (هنگام باز بودن) */}
          <svg
            className={styles.iconClose}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </>
  );
};

export default FloatingButton;

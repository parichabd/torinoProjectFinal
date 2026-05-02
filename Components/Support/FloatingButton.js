"use client";
import { useState } from "react";
import styles from "./Support.module.css";
import SupportPanel from "./SupportPanel";

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
          <svg
            className={styles.iconChat}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M21 11.5C21 16.1944 16.9706 20 12 20C10.5 20 9.09315 19.5889 7.87868 18.8787L3 20L4.5 15.5C3.75 14.25 3.375 12.75 3.375 11.25C3.375 6.50557 7.50557 2.625 12.25 2.625C17.2444 2.625 21.375 6.75557 21.375 11.75C21.375 11.6389 21.375 11.5694 21.375 11.5H21Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

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
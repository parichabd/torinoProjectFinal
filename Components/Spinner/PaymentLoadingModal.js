// components/PaymentLoadingModal.jsx
"use client";
import styles from "./PaymentLoadingModal.module.css";

export default function PaymentLoadingModal({ isOpen }) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.spinnerContainer}>
          <div className={styles.spinner}></div>
        </div>
        <h2>در حال بررسی موجودیت تور</h2>
        <p>لطفاً چند لحظه صبر کنید...</p>
        <div className={styles.progressBar}>
          <div className={styles.progress}></div>
        </div>
      </div>
    </div>
  );
}
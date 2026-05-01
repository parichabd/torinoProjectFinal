"use client";
import React, { useState, useEffect } from "react";
import styles from "./Transaction.module.css";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import { toPersianNumber, formatNumber } from "@/utils/number";
import { formatShamsiDate } from "@/utils/dateUtils";
import { transactionApi } from "@/lib/api";

const Transaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTransaction, setExpandedTransaction] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await transactionApi.getTransactions();
      setTransactions(data || []);
    } catch (error) {
      toast.error("خطا در دریافت تراکنش‌ها");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (transactionId) => {
    setExpandedTransaction((prev) =>
      prev === transactionId ? null : transactionId
    );
  };

  // تابع فرمت تاریخ و ساعت
  const formatDateTime = (dateString) => {
    if (!dateString) return { date: "-", time: "-" };

    const date = new Date(dateString);
    const dateOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const timeOptions = {
      hour: "2-digit",
      minute: "2-digit",
    };

    return {
      date: date.toLocaleDateString("fa-IR", dateOptions),
      time: date.toLocaleTimeString("fa-IR", timeOptions),
    };
  };

  // تابع فرمت مبلغ (تبدیل ریال به تومان)
  const formatAmount = (amount) => {
    if (!amount) return 0;
    // اگه مبلغ به ریال هست، تقسیم بر ۱۰ کن
    return formatNumber(amount / 10);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <p>هنوز تراکنشی نداشته‌اید</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: "#ffffff",
            color: "#419027",
            fontFamily: "Vazirmatn, sans-serif",
            direction: "rtl",
          },
        }}
      />

      {/* هدر جدول */}
      <div className={styles.tableHeader}>
        <div className={styles.headerCell}>
          <span>تاریخ و ساعت</span>
        </div>
        <div className={styles.headerCell}>
          <span>مبلغ (تومان)</span>
        </div>
        <div className={styles.headerCell}>
          <span>شماره سفارش</span>
        </div>
      </div>

      {/* لیست تراکنش‌ها */}
      <div className={styles.transactionsList}>
        {transactions.map((transaction) => {
          const { date, time } = formatDateTime(transaction.createdAt);
          const isExpanded = expandedTransaction === transaction.id;

          return (
            <div key={transaction.id} className={styles.transactionWrapper}>
              {/* ردیف اصلی */}
              <div
                className={styles.transactionRow}
                onClick={() => toggleExpand(transaction.id)}
              >
                <div className={styles.cell}>
                  <div className={styles.dateTimeContainer}>
                    <span className={styles.dateText}>{date}</span>
                    <span className={styles.timeText}>{time}</span>
                  </div>
                </div>
                <div className={styles.cell}>
                  <span className={styles.amountValue}>
                    {formatAmount(transaction.amount)}
                  </span>
                </div>
                <div className={styles.cell}>
                  <span className={styles.orderNumber}>
                    {toPersianNumber(transaction.id?.slice(-6) || "")}
                  </span>
                </div>
              </div>

              {/* جزئیات اضافی */}
              {isExpanded && (
                <div className={styles.expandedDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>شناسه تراکنش:</span>
                    <span className={styles.detailValue}>
                      {transaction.id}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>نوع تراکنش:</span>
                    <span className={styles.detailValue}>
                      {transaction.type === "Purchase" ? "خرید" : transaction.type}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>مبلغ کل:</span>
                    <span className={styles.detailValue}>
                      {formatAmount(transaction.amount)} تومان
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>تاریخ کامل:</span>
                    <span className={styles.detailValue}>
                      {date} - ساعت {time}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Transaction;
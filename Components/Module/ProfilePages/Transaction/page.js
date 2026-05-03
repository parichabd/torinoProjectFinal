"use client";
import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { toPersianNumber, formatNumber } from "@/utils/number";
import { transactionApi } from "@/lib/api";

import styles from "./Transaction.module.css";

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
      prev === transactionId ? null : transactionId,
    );
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return { date: "-", time: "-" };
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const formattedDate = `${year}/${month}/${day}`;
    const timeOptions = {
      hour: "2-digit",
      minute: "2-digit",
    };
    return {
      date: toPersianNumber(formattedDate),
      time: date.toLocaleTimeString("fa-IR", timeOptions),
    };
  };

  const formatAmount = (amount) => {
    if (!amount) return 0;
    return formatNumber(amount);
  };

  const getTransactionType = (type) => {
    const types = {
      Purchase: "ثبت نام در تور گردشگری",
      Withdrawal: "لغو تور گردشگری",
      Transfer: "انتقال تور گردشگری",
    };
    return types[type] || type || "-";
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

      {/* هدر جدول - موبایل */}
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

      {/* هدر جدول - دسکتاپ */}
      <div className={styles.tableHeaderDesktop}>
        <div className={styles.headerCellDesktop}>
          <span>تاریخ و ساعت</span>
        </div>
        <div className={styles.headerCellDesktop}>
          <span>مبلغ (تومان)</span>
        </div>
        <div className={styles.headerCellDesktop}>
          <span>نوع تراکنش</span>
        </div>
        <div className={styles.headerCellDesktop}>
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
              {/* ردیف اصلی - موبایل */}
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

              {/* ردیف اصلی - دسکتاپ */}
              <div
                className={styles.transactionRowDesktop}
                onClick={() => toggleExpand(transaction.id)}
              >
                <div className={styles.cellDesktop}>
                  <div className={styles.dateTimeContainerDesktop}>
                    <span className={styles.dateTextDesktop}>{date}</span>
                    <span className={styles.timeTextDesktop}>{time}</span>
                  </div>
                </div>
                <div className={styles.cellDesktop}>
                  <span className={styles.amountValueDesktop}>
                    {formatAmount(transaction.amount)}
                  </span>
                </div>
                <div className={styles.cellDesktop}>
                  <span className={styles.typeValueDesktop}>
                    {getTransactionType(transaction.type)}
                  </span>
                </div>
                <div className={styles.cellDesktop}>
                  <span className={styles.orderNumberDesktop}>
                    {toPersianNumber(transaction.id?.slice(-6) || "")}
                  </span>
                </div>
              </div>

              {/* جزئیات اضافی */}
              {isExpanded && (
                <div className={styles.expandedDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>شناسه تراکنش:</span>
                    <span className={styles.detailValue}>{transaction.id}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>نوع تراکنش:</span>
                    <span className={styles.detailValue}>
                      {getTransactionType(transaction.type)}
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

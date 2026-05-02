"use client";
import { useState } from "react";
import styles from "./Support.module.css";
import { toPersianNumber } from "@/utils/number";

const SupportPanel = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "سلام! چطور می‌تونم کمکتون کنم؟ 👋",
      isAdmin: true,
      time: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // اضافه کردن پیام کاربر
    const newMessage = {
      id: Date.now(),
      text: message,
      isAdmin: false,
      time: new Date(),
    };
    setMessages([...messages, newMessage]);
    setMessage("");

    // شبیه‌سازی پاسخ پشتیبان
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: "پیام شما دریافت شد. به زودی پاسخ می‌دیم 💬",
          isAdmin: true,
          time: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 1500);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={`${styles.panel} ${isOpen ? styles.panelOpen : ""}`}>
      {/* هدر پنل */}
      <div className={styles.panelHeader}>
        <div className={styles.headerInfo}>
          <div className={styles.avatar}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <div>
            <h3>پشتیبانی آنلاین</h3>
            <span className={styles.status}>
              <span className={styles.statusDot}></span>
              آنلاین
            </span>
          </div>
        </div>
        <button className={styles.closeBtn} onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* پیام‌ها */}
      <div className={styles.messagesContainer}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${styles.message} ${
              msg.isAdmin ? styles.adminMessage : styles.userMessage
            }`}
          >
            <div className={styles.messageBubble}>
              <p>{msg.text}</p>
              <span className={styles.messageTime}>
                {toPersianNumber(formatTime(msg.time))}
              </span>
            </div>
          </div>
        ))}

        {/* تایپینگ انیمیشن */}
        {isTyping && (
          <div className={`${styles.message} ${styles.adminMessage}`}>
            <div className={styles.messageBubble}>
              <div className={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* فرم ارسال پیام */}
      <form className={styles.inputForm} onSubmit={sendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="پیام خود را بنویسید..."
          className={styles.messageInput}
        />
        <button type="submit" className={styles.sendBtn} disabled={!message.trim()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default SupportPanel;
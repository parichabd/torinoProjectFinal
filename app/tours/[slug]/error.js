"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Error({ error, reset }) {
  const router = useRouter();
  useEffect(() => {
    console.error("خطا در صفحه تور:", error);
  }, [error]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <h1
        style={{ color: "#e74d3cdc", fontSize: "2rem", marginBottom: "60px" }}
      >
        📍 متاسفانه خطایی رخ داده است
      </h1>
      <p style={{ color: "#555", marginBottom: "20px" }}>
        لطفاً بعداً دوباره تلاش کنید یا با پشتیبانی تماس بگیرید.
      </p>
      <button
        onClick={() => router.push("../Guide/support")}
        style={{
          padding: "10px 20px",
          backgroundColor: "#28a746cf",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "16px",
          fontFamily: "Iranian Sans",
        }}
      >
        تماس با پشتیبانی
      </button>
    </div>
  );
}

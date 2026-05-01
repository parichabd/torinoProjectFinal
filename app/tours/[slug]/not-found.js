import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
      }}
    >
      <h1 style={{ color: "#333", fontSize: "3rem" }}>!404</h1>
      <h2 style={{ color: "#555" }}>تور مورد نظر یافت نشد!</h2>
      <p style={{ color: "#777" }}>
        ممکن است آدرس تغییر کرده باشد یا این تور حذف شده باشد.
      </p>
      <Link
        href="/"
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#28A745",
          color: "white",
          textDecoration: "none",
          borderRadius: "5px",
        }}
      >
        بازگشت به صفحه اصلی
      </Link>
    </div>
  );
}

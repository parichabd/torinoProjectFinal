import Header from "@/Components/Layout/Header";
import Footer from "@/Components/Layout/Footer";
import ReactQueryProvider from "@/Provider/ReactQueryProvider";
import InitialLoader from "@/Components/Spinner/InitialLoader";
import FloatingButton from "@/Components/Support/FloatingButton"; // ← اضافه کنید
import "./globals.css";
import styles from "../Components/Layout/Layout.module.css";

export const metadata = {
  title: "تورینو",
  description: "سفر به راحتی چند کلیک!",
  metadataBase: new URL("https://torino.ir"),
  icons: { icon: "/image/cover.svg" },
  openGraph: {
    title: "تورینو",
    description: "سفر به راحتی چند کلیک!",
    url: "https://torino.ir",
    type: "website",
    images: ["/images/cover.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "تورینو",
    description: "سفر به راحتی چند کلیک!",
    images: ["/images/cover.png"],
  },
};

export const viewport = {
  themeColor: "#fff",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <ReactQueryProvider>
          {/* Loader wrapper */}
          <InitialLoader>
            <div className={styles.layout}>
              <Header />
              <div className={styles.dividerer_menu}></div>
              <main className={`${styles.container} ${styles.main}`}>
                {children}
              </main>
              <Footer />
            </div>
          </InitialLoader>
        </ReactQueryProvider>

        {/* دکمه پشتیبانی - بیرون از همه چیز */}
        <FloatingButton />
      </body>
    </html>
  );
}

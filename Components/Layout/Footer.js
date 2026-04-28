import Link from "next/link";

import Image from "next/image";
import styles from "./Layout.module.css";

export default function Footer() {
  return (
    <footer className={`${styles.foot_layout} ${styles.container}`}>
      <div className={styles.divider}></div>
      <div className={styles.footer_desktop}>
        <div className={styles.footer_links}>
          <div className={styles.torino_info}>
            <h1>تورینو</h1>
            <Link href="/Info/about-us">درباره ما</Link>
            <Link href="/Info/contact">تماس با ما</Link>
            <Link href="/Guide/whyUs">چرا تورینو</Link>
            <Link href="/Info/insurance">بیمه مسافرتی</Link>
          </div>
          <div className={styles.torino_info}>
            <h1>خدمات مشتریان</h1>
            <Link href="/Guide/support">پشتیبانی آنلاین</Link>
            <Link href="/Guide/purchase">راهنمای خرید</Link>
            <Link href="/Guide/refund">راهنمای استرداد</Link>
            <Link href="/Info/faq">پرسش و پاسخ</Link>
          </div>
        </div>

        <div className={styles.footer_icons}>
          <div className={styles.footer_icons_logo}>
            <Image
              src="/image/Torino (4) 1.png"
              alt="Torino Logo"
              width={120}
              height={40}
              style={{ width: "auto", height: "auto" }}
            />
            <p>تلفن پشتیبانی:۸۵۷۴-۰۲۱</p>
          </div>
          <div className={styles.footer_icons_img}>
            <div className={styles.images}>
              <Image
                src="/image/ecunion-35c3c933.svg"
                alt="ecunion"
                width={40}
                height={40}
              />
              <Image
                src="/image/samandehi-6e2b448a.svg"
                alt="samandehi"
                width={40}
                height={40}
              />
              <Image
                src="/image/aira-682b7c43.svg"
                alt="aira"
                width={40}
                height={40}
              />
            </div>
            <div className={`${styles.images} ${styles.center}`}>
              <Image
                src="/image/state-airline-f45c55b2 1.svg"
                alt="state airline"
                width={40}
                height={40}
              />
              <Image
                src="/image/passenger-rights-48368f81 1.svg"
                alt="passenger rights"
                width={40}
                height={40}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.divider_two}></div>
      <p className={styles.paragraph}>
        کلیه حقوق این وب سایت متعلق به تورینو میباشد.
      </p>
    </footer>
  );
}

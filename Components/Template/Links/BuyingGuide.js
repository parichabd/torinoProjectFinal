import styles from "./BuyingGuide.module.css";
import Image from "next/image";

function BuyingGuide() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>راهنمای خرید تور</h1>

      <div className={styles.steps}>
        {steps.map((step, index) => (
          <div key={index} className={styles.step}>
            <div className={styles.number}>{index + 1}</div>

            <div className={styles.content}>
              <h2>{step.title}</h2>
              <p>{step.text}</p>
            </div>

            <div className={styles.image}>
              <Image
                src={step.image}
                alt={step.title}
                width={300} // اندازه تقریبی، یا اندازه واقعی تصویرت
                height={200} // اندازه تقریبی، یا اندازه واقعی تصویرت
                style={{ width: "100%", height: "auto" }} // برای ریسپانسیو
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const steps = [
  {
    title: "قدم اول",
    text: "برای رزرو تور، ابتدا وارد سایت تورینو شده و از نوار جستجو شهر مبدا، مقصد، تاریخ و تعداد مسافران را انتخاب کنید.",
    image: "/SVG/static/Screenshot 2026-04-22 at 11.31.27 PM.png",
  },
  {
    title: "قدم دوم",
    text: "با استفاده از فیلترها و مقایسه قیمت‌ها، هتل مورد نظر خود را انتخاب کرده و جزئیات آن را بررسی کنید.",
    image: "/SVG/static/Screenshot 2026-04-22 at 11.32.28 PM.png",
  },
  {
    title: "قدم سوم",
    text: "وسایل نقلیه رفت و برگشت را بررسی کرده و مناسب‌ترین گزینه را انتخاب کنید.",
    image: "/SVG/static/Screenshot 2026-04-22 at 11.32.57 PM.png",
  },
  {
    title: "قدم پنجم",
    text: "در صورت نداشتن حساب کاربری، شماره موبایل خود را برای دریافت کد تایید وارد کنید.",
    image: "/SVG/static/Screenshot 2026-04-22 at 11.39.17 PM.png",
  },
  {
    title: "قدم ششم",
    text: "کد ارسال شده از طریق پیامک را وارد کنید.",
    image: "/SVG/static/Screenshot 2026-04-22 at 11.39.25 PM.png",
  },
  {
    title: "قدم هفتم",
    text: "اطلاعات مسافران را ثبت کنید. این اطلاعات برای دفعات بعد ذخیره می‌شود.",
    image: "/SVG/static/Screenshot 2026-04-22 at 11.33.29 PM.png",
  },
  {
    title: "قدم هشتم",
    text: "خلاصه سفارش را بررسی کرده و به مرحله پرداخت بروید.",
    image: "/SVG/static/Screenshot 2026-04-22 at 11.40.16 PM.png",
  },
  {
    title: "قدم نهم",
    text: "پس از پرداخت، تاییدیه موقت صادر می‌شود و نتیجه نهایی از طریق پیامک اطلاع داده خواهد شد.",
    image: "/SVG/static/Screenshot 2026-04-22 at 11.40.45 PM.png",
  },
];

export default BuyingGuide;

import styles from "./PhoneReseved.module.css";
import Image from "next/image";
import Link from "next/link";
import { FaPhoneVolume } from "react-icons/fa6";

function PhoneReseved() {
  return (
    <div className={styles.mainRes}>
      <div className={styles.reserved}>
        <div className={styles.buyPhone}>
          <h1>
            خرید تلفنی از
            <span>تورینو</span>
          </h1>
          <p>به هرکجا که میخواهید!</p>
        </div>
        <div className={styles.reservedImage}>
          <Image
            src="/SVG/static/professional.png"
            alt="phone"
            width={195}
            height={158}
          />
        </div>
      </div>
      <div className={styles.phoneNum}>
        <div className={styles.phone}>
          <p>۰۲۱-۱۸۴۰</p>
          <p>
            <FaPhoneVolume />
          </p>
        </div>
        <div>
          <button>
            <Link href="/Guide/support">اطلاعات بیشتر</Link>
          </button>
        </div>
      </div>
    </div>
  );
}

export default PhoneReseved;

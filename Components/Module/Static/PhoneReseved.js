import styles from "./PhoneReseved.module.css";
import Image from "next/image";
import Link from "next/link";
import { FaPhoneVolume } from "react-icons/fa6";

function PhoneReseved() {
  return (
    <>
      <div className={styles.reserved}>
        <div className={styles.buyPhone}>
          <h1>
            خرید تلفی از
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
          <p>
            {" "}
            <FaPhoneVolume />
          </p>
          <p>021-1840</p>
        </div>
        <div>
          <button>
            <Link href="/Guide/support">اطلاعات بیشتر</Link>
          </button>
        </div>
      </div>
    </>
  );
}

export default PhoneReseved;

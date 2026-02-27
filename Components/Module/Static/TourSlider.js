"use client";

import { useState } from "react";
import styles from "./TourSlider.module.css";
import Image from "next/image";

const images = [
  "/SVG/static/R (1).svg",
  "/SVG/static/OIP (8).svg",
  "/SVG/static/car-4260033_1280.svg",
  "/SVG/static/image_SI3sJmh4_1727080822376_raw.svg",
];

export default function TourSlider() {
  const [active, setActive] = useState(0);

  const next = () => {
    setActive((prev) => (prev + 1) % images.length);
  };

  const prev = () => {
    setActive((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.stack}>
        {images.map((img, index) => {
          const position = (index - active + images.length) % images.length;

          return (
           <div
  key={index}
  className={styles.card}
  style={{
    transform: `
      translateX(${-position * 35}px)
      translateY(${position * 0}px)
      scale(${1 - position * 0.05})
    `,
    zIndex: images.length - position,
  }}
>
  <Image
    src={img}
    alt=""
    fill
    className={styles.image}
  />
</div>
          );
        })}
      </div>

      <div className={styles.controls}>
        <button onClick={prev}>‹</button>
        <span>
          {active + 1} / {images.length}
        </span>
        <button onClick={next}>›</button>
      </div>
    </div>
  );
}

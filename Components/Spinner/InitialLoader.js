"use client";

import { useEffect, useState } from "react";
import { HashLoader } from "react-spinners";

import styles from "./InitialLoader.module.css";

export default function InitialLoader({ children }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1 * 1000 ); 
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className={styles.spinnerOverlay}>
        <HashLoader color="#20c975" size={90} />
      </div>
    );
  }

  return <>{children}</>;
}
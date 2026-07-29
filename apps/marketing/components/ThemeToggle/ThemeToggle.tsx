"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "../icons";
import styles from "./ThemeToggle.module.css";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    const theme = next ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // localStorage unavailable (private browsing, disabled storage) — theme just won't persist
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light background" : "Switch to dark background"}
      className={styles.toggle}
      data-testid="theme-toggle"
      onClick={toggle}
    >
      <span className={styles.track}>
        <span className={`${styles.thumb} ${isDark ? styles.thumbOn : ""}`}>
          {isDark ? <MoonIcon className={styles.icon} /> : <SunIcon className={styles.icon} />}
        </span>
      </span>
    </button>
  );
}

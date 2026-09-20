import Link from "next/link";
import styles from "./shell.module.css";

export function Brand({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/"
      className={styles.brand}
      onClick={onNavigate}
      aria-label="CiscoKU Lab home"
    >
      <span className={styles.mark} aria-hidden="true">
        <svg width="27" height="27" viewBox="0 0 28 28" fill="none">
          <path
            d="m9 7-6 7 6 7m10-14 6 7-6 7M16 6l-4 16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span>
        CiscoKU <span className={styles.brandLight}>Lab</span>
        <small>LEARN. EXPLORE. GROW.</small>
      </span>
    </Link>
  );
}

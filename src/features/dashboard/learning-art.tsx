import { Code2, Fingerprint, Sparkles, Terminal } from "lucide-react";
import styles from "./dashboard.module.css";

export function LearningArt() {
  return (
    <div className={styles.art} aria-hidden="true">
      <div className={styles.orbit} />
      <div className={styles.orbitSmall} />
      <div className={styles.artCenter}>
        <Terminal size={52} strokeWidth={1.5} />
        <span>hello, curious mind_</span>
      </div>
      <div className={styles.artTile}>
        <Code2 size={24} />
      </div>
      <div className={styles.artTileSecond}>
        <Fingerprint size={28} />
      </div>
      <Sparkles className={styles.sparkle} size={24} />
      <span className={styles.artDot} />
    </div>
  );
}

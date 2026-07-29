import Link from "next/link";
import { hero } from "../../content/home";
import styles from "./Home.module.css";

export default function Hero() {
  return (
    <section className={styles.heroSection}>
      <div className={styles.heroBackground} aria-hidden="true">
        <svg className={styles.heroRing} viewBox="0 0 800 800" fill="none">
          <circle cx="400" cy="400" r="380" className={styles.heroRingCircle} strokeWidth="1" />
        </svg>
      </div>

      <div className={`wrap ${styles.hero}`}>
        <h1 className={styles.heroHeadline}>{hero.headline}</h1>
        <div className={styles.heroActions}>
          <Link href={hero.primaryCta.href} className="btn btn-primary">
            {hero.primaryCta.label}
          </Link>
          <Link href={hero.secondaryCta.href} className="btn btn-secondary">
            {hero.secondaryCta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import { hero } from "../../content/home";
import styles from "./Home.module.css";

export default function Hero() {
  return (
    <section className={styles.heroSection}>
      <div className={styles.heroBackground} aria-hidden="true">
        <div className={styles.heroRingA} />
        <div className={styles.heroRingB} />
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

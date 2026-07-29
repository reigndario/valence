import Link from "next/link";
import { comparisonCards } from "../../content/home";
import styles from "./Home.module.css";

export default function ComparisonCards() {
  return (
    <section className={`wrap ${styles.comparisonSection}`}>
      <div className={styles.comparisonGrid}>
        {comparisonCards.map((card) => (
          <div key={card.title} className={styles.comparisonCard}>
            <h3 className={styles.comparisonTitle}>{card.title}</h3>
            <p className={styles.comparisonTagline}>{card.tagline}</p>
            <ul className={styles.comparisonBullets}>
              {card.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            <Link href={card.cta.href} className="btn btn-secondary">
              {card.cta.label}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

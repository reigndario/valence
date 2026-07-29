import Link from "next/link";
import { dollarContent } from "../../content/dollar";
import styles from "./Dollar.module.css";

export default function DollarPage() {
  return (
    <div className="stub-page">
      <p className="eyebrow">{dollarContent.eyebrow}</p>
      <h1>{dollarContent.title}</h1>
      <p className="lede">{dollarContent.lede}</p>

      <div className={styles.priceCard}>
        <div className={styles.priceRow}>
          <span className={styles.priceValue}>{dollarContent.price}</span>
          <span className={styles.priceUnit}>{dollarContent.priceUnit}</span>
        </div>
        <ul className={styles.featureList}>
          {dollarContent.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
        <div className={styles.ctas}>
          <Link href={dollarContent.ctaHref} className="btn btn-primary">
            {dollarContent.ctaLabel}
          </Link>
          <Link href="/security-services/audits" className="btn btn-secondary">
            See Security Audits
          </Link>
        </div>
      </div>

      <p className="stub-note">{dollarContent.note}</p>
    </div>
  );
}

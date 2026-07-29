import { featureCallouts } from "../../content/home";
import styles from "./Home.module.css";

export default function FeatureCallouts() {
  return (
    <section className={`wrap ${styles.featuresSection}`}>
      <ul className={styles.featuresList}>
        {featureCallouts.map((feature) => (
          <li key={feature.title} className={styles.featureCard}>
            <h3 className={styles.featureTitle}>{feature.title}</h3>
            <p className={styles.featureBody}>{feature.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

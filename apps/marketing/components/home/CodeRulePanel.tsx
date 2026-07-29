import Link from "next/link";
import { codeRulePanel } from "../../content/home";
import styles from "./Home.module.css";

export default function CodeRulePanel() {
  return (
    <section className={`wrap ${styles.panelSection}`}>
      <p className={styles.panelLabel}>{codeRulePanel.label}</p>
      <div className={styles.panelGrid}>
        <div className={styles.codeBlock}>
          <p className={`mono ${styles.codeBlockFilename}`}>{codeRulePanel.code.filename}</p>
          <pre className={`mono ${styles.codeBlockPre}`}>{codeRulePanel.code.source}</pre>
        </div>
        <div className={styles.codeBlock}>
          <p className={`mono ${styles.codeBlockFilename}`}>Rule — {codeRulePanel.rule.filename}</p>
          <pre className={`mono ${styles.codeBlockPre}`}>{codeRulePanel.rule.source}</pre>
        </div>
      </div>
      <Link href={codeRulePanel.learnMore.href} className={styles.panelLearnMore}>
        {codeRulePanel.learnMore.label} →
      </Link>
    </section>
  );
}

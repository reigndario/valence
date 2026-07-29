import { toolingStrip } from "../../content/home";
import styles from "./Home.module.css";

// Swap for real client logos once we have named ones to show — see CLAUDE.md's
// content rules against invented clients or logos.
export default function ToolingStrip() {
  return (
    <section className={`wrap ${styles.toolingStrip}`}>
      <p className={styles.toolingLabel}>{toolingStrip.label}</p>
      <ul className={styles.toolingList}>
        {toolingStrip.tools.map((tool) => (
          <li key={tool} className={`mono ${styles.toolingItem}`}>
            {tool}
          </li>
        ))}
      </ul>
    </section>
  );
}

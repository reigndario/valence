import Link from "next/link";
import { navGroups, socialLinks, legalLinks } from "../../content/nav";
import { GithubIcon, TwitterIcon, LinkedinIcon } from "../icons";
import styles from "./Footer.module.css";

const socialIcons = { github: GithubIcon, twitter: TwitterIcon, linkedin: LinkedinIcon };

export default function Footer() {
  return (
    <footer className={styles.footer} data-testid="site-footer">
      <div className={`wrap ${styles.inner}`}>
        <div className={styles.top}>
          <Link href="/" className={styles.logo}>
            Valence
          </Link>

          <div className={styles.columns}>
            {navGroups.map((group) => (
              <div key={group.label} className={styles.column}>
                <p className={styles.columnTitle}>{group.label}</p>
                <ul>
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.bottom}>
          <ul className={styles.socialList}>
            {socialLinks.map((social) => {
              const Icon = socialIcons[social.icon];
              return (
                <li key={social.label}>
                  <a href={social.href} aria-label={social.label} target="_blank" rel="noreferrer">
                    <Icon />
                  </a>
                </li>
              );
            })}
          </ul>

          <ul className={styles.legalList}>
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>

          <p className={styles.copyright}>© {new Date().getFullYear()} Valence</p>
        </div>
      </div>
    </footer>
  );
}

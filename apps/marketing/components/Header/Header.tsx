"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { productLinks, menuGroups, docsLink, dollarLink, primaryCta, socialLinks } from "../../content/nav";
import { GithubIcon, TwitterIcon, LinkedinIcon, MenuIcon, CloseIcon, ChevronIcon } from "../icons";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import styles from "./Header.module.css";

const socialIcons = { github: GithubIcon, twitter: TwitterIcon, linkedin: LinkedinIcon };

const equalizerBars = Array.from({ length: 7 });

// One distinct font per product tab (see app/layout.tsx for the font loads).
const productFontClasses = [styles.productFontArtemis, styles.productFontScout, styles.productFontFoil];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuOpenGroup, setMenuOpenGroup] = useState<number | null>(null);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function toggleMenuGroup(index: number) {
    setMenuOpenGroup((current) => (current === index ? null : index));
  }

  function closeMenu() {
    setMenuOpen(false);
    setMenuOpenGroup(null);
  }

  return (
    <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ""}`} data-testid="site-header">
      <div className={`wrap ${styles.inner}`}>
        <Link href="/" className={styles.logo} onClick={closeMenu}>
          <span className={styles.logoText}>Valence</span>
          <span className={styles.equalizer} aria-hidden="true">
            {equalizerBars.map((_, i) => (
              <span key={i} className={styles.bar} style={{ "--i": i } as CSSProperties} />
            ))}
          </span>
        </Link>

        <nav className={styles.productNav} aria-label="Products">
          <ul className={styles.productList}>
            {productLinks.map((link, i) => (
              <li key={link.href}>
                <Link href={link.href} className={`${styles.productTab} ${productFontClasses[i]}`}>
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href={dollarLink.href} className={`${styles.productTab} ${styles.dollarTab}`}>
                {dollarLink.label}
              </Link>
            </li>
          </ul>
        </nav>

        <div className={styles.actions}>
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
          <Link href={primaryCta.href} className="btn btn-primary">
            {primaryCta.label}
          </Link>
        </div>

        <ThemeToggle />

        <button
          type="button"
          className={styles.menuToggle}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          data-testid="menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {menuOpen && (
        <div className={styles.menuPanel} data-testid="nav-menu">
          <ul>
            {menuGroups.map((group, groupIndex) => (
              <li key={group.label} className={styles.menuAccordionItem}>
                <button
                  type="button"
                  className={styles.menuAccordionButton}
                  aria-expanded={menuOpenGroup === groupIndex}
                  data-testid={`menu-accordion-toggle-${groupIndex}`}
                  onClick={() => toggleMenuGroup(groupIndex)}
                >
                  {group.label}
                  <ChevronIcon className={menuOpenGroup === groupIndex ? styles.chevronOpen : styles.chevron} />
                </button>
                {menuOpenGroup === groupIndex && (
                  <ul className={styles.menuAccordionPanel} data-testid={`menu-accordion-panel-${groupIndex}`}>
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} onClick={closeMenu}>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
            <li className={styles.menuAccordionItem}>
              <Link href={docsLink.href} className={styles.menuAccordionButton} onClick={closeMenu}>
                {docsLink.label}
              </Link>
            </li>
          </ul>
          <div className={styles.menuPanelMobileActions}>
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
            <Link href={primaryCta.href} className="btn btn-primary" onClick={closeMenu}>
              {primaryCta.label}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

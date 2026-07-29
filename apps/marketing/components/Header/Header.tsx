"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, FocusEvent, KeyboardEvent } from "react";
import Link from "next/link";
import { navGroups, docsLink, primaryCta, socialLinks } from "../../content/nav";
import { GithubIcon, TwitterIcon, LinkedinIcon, MenuIcon, CloseIcon, ChevronIcon } from "../icons";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import styles from "./Header.module.css";

const socialIcons = { github: GithubIcon, twitter: TwitterIcon, linkedin: LinkedinIcon };

const equalizerBars = Array.from({ length: 7 });

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [openGroup, setOpenGroup] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileOpenGroup, setMobileOpenGroup] = useState<number | null>(null);

  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const linkRefs = useRef<Array<Array<HTMLAnchorElement | null>>>([]);
  const [focusPendingGroup, setFocusPendingGroup] = useState<number | null>(null);
  const skipFocusOpenRef = useRef(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (focusPendingGroup === null) return;
    linkRefs.current[focusPendingGroup]?.[0]?.focus();
    setFocusPendingGroup(null);
  }, [focusPendingGroup]);

  function closeAll() {
    setOpenGroup(null);
  }

  function handleButtonKeyDown(index: number, e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpenGroup(index);
      setFocusPendingGroup(index);
    } else if (e.key === "Escape") {
      setOpenGroup(null);
    }
  }

  function handleButtonFocus(index: number) {
    if (skipFocusOpenRef.current) {
      skipFocusOpenRef.current = false;
      return;
    }
    setOpenGroup(index);
  }

  function handleLinkKeyDown(groupIndex: number, linkIndex: number, e: KeyboardEvent<HTMLAnchorElement>) {
    const links = navGroups[groupIndex].links;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.min(linkIndex + 1, links.length - 1);
      linkRefs.current[groupIndex]?.[next]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (linkIndex === 0) {
        buttonRefs.current[groupIndex]?.focus();
      } else {
        linkRefs.current[groupIndex]?.[linkIndex - 1]?.focus();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpenGroup(null);
      skipFocusOpenRef.current = true;
      buttonRefs.current[groupIndex]?.focus();
    }
  }

  function handleGroupBlur(groupIndex: number, e: FocusEvent<HTMLLIElement>) {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    setOpenGroup((current) => (current === groupIndex ? null : current));
  }

  function toggleMobileGroup(index: number) {
    setMobileOpenGroup((current) => (current === index ? null : index));
  }

  function closeMobile() {
    setMobileOpen(false);
    setMobileOpenGroup(null);
  }

  return (
    <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ""}`} data-testid="site-header">
      <div className={`wrap ${styles.inner}`}>
        <Link href="/" className={styles.logo} onClick={closeMobile}>
          <span className={styles.logoText}>Valence</span>
          <span className={styles.equalizer} aria-hidden="true">
            {equalizerBars.map((_, i) => (
              <span key={i} className={styles.bar} style={{ "--i": i } as CSSProperties} />
            ))}
          </span>
        </Link>

        <nav className={styles.desktopNav} aria-label="Primary">
          <ul className={styles.navList}>
            {navGroups.map((group, groupIndex) => (
              <li
                key={group.label}
                className={styles.navItem}
                onMouseEnter={() => setOpenGroup(groupIndex)}
                onMouseLeave={() => setOpenGroup((current) => (current === groupIndex ? null : current))}
                onBlur={(e) => handleGroupBlur(groupIndex, e)}
              >
                <button
                  type="button"
                  className={styles.navButton}
                  ref={(el) => {
                    buttonRefs.current[groupIndex] = el;
                  }}
                  aria-expanded={openGroup === groupIndex}
                  aria-haspopup="true"
                  onFocus={() => handleButtonFocus(groupIndex)}
                  onKeyDown={(e) => handleButtonKeyDown(groupIndex, e)}
                >
                  {group.label}
                  <ChevronIcon className={styles.chevron} />
                </button>
                {openGroup === groupIndex && (
                  <div className={styles.dropdownPanel} data-testid={`dropdown-${groupIndex}`}>
                    <ul>
                      {group.links.map((link, linkIndex) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            ref={(el) => {
                              if (!linkRefs.current[groupIndex]) linkRefs.current[groupIndex] = [];
                              linkRefs.current[groupIndex][linkIndex] = el;
                            }}
                            onKeyDown={(e) => handleLinkKeyDown(groupIndex, linkIndex, e)}
                            onClick={closeAll}
                          >
                            <span className={styles.dropdownLinkLabel}>{link.label}</span>
                            {link.description && (
                              <span className={styles.dropdownLinkDescription}>{link.description}</span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
            <li className={styles.navItem}>
              <Link href={docsLink.href} className={styles.navButton}>
                {docsLink.label}
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
          className={styles.mobileToggle}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          data-testid="mobile-toggle"
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {mobileOpen && (
        <div className={styles.mobileNav} data-testid="mobile-nav">
          <ul>
            {navGroups.map((group, groupIndex) => (
              <li key={group.label} className={styles.mobileAccordionItem}>
                <button
                  type="button"
                  className={styles.mobileAccordionButton}
                  aria-expanded={mobileOpenGroup === groupIndex}
                  data-testid={`mobile-accordion-toggle-${groupIndex}`}
                  onClick={() => toggleMobileGroup(groupIndex)}
                >
                  {group.label}
                  <ChevronIcon className={mobileOpenGroup === groupIndex ? styles.chevronOpen : styles.chevron} />
                </button>
                {mobileOpenGroup === groupIndex && (
                  <ul className={styles.mobileAccordionPanel} data-testid={`mobile-accordion-panel-${groupIndex}`}>
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} onClick={closeMobile}>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
            <li className={styles.mobileAccordionItem}>
              <Link href={docsLink.href} className={styles.mobileAccordionButton} onClick={closeMobile}>
                {docsLink.label}
              </Link>
            </li>
          </ul>
          <Link href={primaryCta.href} className="btn btn-primary" onClick={closeMobile}>
            {primaryCta.label}
          </Link>
        </div>
      )}
    </header>
  );
}

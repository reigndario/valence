import Link from "next/link";
import type { StubContent } from "../content/types";

export default function StubPage({ content }: { content: StubContent }) {
  return (
    <div className="stub-page">
      <p className="eyebrow">{content.eyebrow}</p>
      <h1>{content.title}</h1>
      <p className="lede">{content.lede}</p>
      {content.links && (
        <ul className="stub-links">
          {content.links.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      )}
      {content.note && <p className="stub-note">{content.note}</p>}
    </div>
  );
}

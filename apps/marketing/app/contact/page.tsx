import { contactContent } from "../../content/contact";

export default function ContactPage() {
  return (
    <div className="stub-page">
      <p className="eyebrow">{contactContent.eyebrow}</p>
      <h1>{contactContent.title}</h1>
      <p className="lede">{contactContent.lede}</p>
      <a className="btn btn-primary" href={contactContent.cta.href}>
        {contactContent.cta.label}
      </a>
    </div>
  );
}

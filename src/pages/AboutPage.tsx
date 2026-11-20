import { Link } from "react-router-dom";
import { useI18n } from "../lib/i18n";
import { aboutEn, aboutZh } from "../content/about";

const whatIcons = [
  // plug / connect
  <svg key="a" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M9 7V3M15 7V3M8 11h8v3a4 4 0 01-4 4v3M8 11V9a1 1 0 011-1h6a1 1 0 011 1v2"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>,
  // shield / local
  <svg key="b" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
  </svg>,
  // compass / discover
  <svg key="c" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
    <path
      d="M14.5 9.5l-2 5-5 2 2-5 5-2z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
  </svg>,
];

export function AboutPage() {
  const { locale } = useI18n();
  const page = locale === "en" ? aboutEn : aboutZh;

  return (
    <div className="page-scroll page-fill">
      <div className="about-page">
        <div className="page-panel about-panel">
          <header className="about-hero">
            <h1>{page.title}</h1>
            <p>{page.lead}</p>
          </header>

          <div className="about-body">
            <section className="about-vision">
              <h2>{page.vision.heading}</h2>
              {page.vision.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </section>

            <section className="about-block">
              <h2>{page.whatWeDo.heading}</h2>
              <div className="about-feature-grid">
                {page.whatWeDo.items.map((item, i) => (
                  <article key={item.title} className="about-feature-card">
                    <span className="about-feature-icon">{whatIcons[i]}</span>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="about-block">
              <h2>{page.values.heading}</h2>
              <div className="about-value-grid">
                {page.values.items.map((item) => (
                  <article key={item.title} className="about-value-card">
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="about-closing">
              <h2>{page.closing.heading}</h2>
              {page.closing.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
              <div className="about-closing-actions">
                <Link to="/" className="save-btn about-cta-primary">
                  {page.closing.ctaPrimary}
                </Link>
                <Link to="/models" className="ghost-btn about-cta">
                  {page.closing.ctaSecondary}
                </Link>
                <Link to="/discover" className="ghost-btn about-cta">
                  {page.closing.ctaTertiary}
                </Link>
              </div>
            </section>

            <footer className="about-foot">
              <p>{page.closing.foot}</p>
              <p>
                <Link to="/docs">{locale === "en" ? "Docs" : "文档"}</Link>
                <span aria-hidden> · </span>
                <Link to="/models">
                  {locale === "en" ? "Backup" : "数据备份"}
                </Link>
              </p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}

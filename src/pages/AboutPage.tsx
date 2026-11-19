import { useI18n } from "../lib/i18n";
import { aboutEn, aboutZh } from "../content/about";

export function AboutPage() {
  const { locale } = useI18n();
  const article = locale === "en" ? aboutEn : aboutZh;

  return (
    <div className="page-scroll">
      <article className="article">
        <header className="article-hero">
          <p className="article-kicker">{article.updated}</p>
          <h1>{article.title}</h1>
          <p className="article-lead">{article.lead}</p>
        </header>
        {article.sections.map((section) => (
          <section key={section.heading} className="article-section">
            <h2>{section.heading}</h2>
            {section.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </section>
        ))}
      </article>
    </div>
  );
}

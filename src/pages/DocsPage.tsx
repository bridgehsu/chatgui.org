import { useI18n } from "../lib/i18n";
import { docsEn, docsZh } from "../content/docs";

export function DocsPage() {
  const { locale } = useI18n();
  const doc = locale === "en" ? docsEn : docsZh;

  return (
    <div className="page-scroll">
      <div className="docs-layout">
        <nav className="docs-toc" aria-label="Docs">
          <p className="docs-toc-title">{doc.title}</p>
          <ul>
            {doc.sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.heading}</a>
              </li>
            ))}
          </ul>
        </nav>
        <article className="article docs-article">
          <header className="article-hero">
            <h1>{doc.title}</h1>
            <p className="article-lead">{doc.lead}</p>
          </header>
          {doc.sections.map((section) => (
            <section key={section.id} id={section.id} className="article-section">
              <h2>{section.heading}</h2>
              {section.paragraphs?.map((p) => (
                <p key={p}>{p}</p>
              ))}
              {section.steps ? (
                <ol>
                  {section.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              ) : null}
              {section.bullets ? (
                <ul>
                  {section.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}

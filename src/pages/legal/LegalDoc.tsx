import { Link } from "react-router-dom";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";

export type LegalSection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export default function LegalDoc({
  title,
  description,
  canonicalPath,
  updated,
  intro,
  sections,
  jsonLdType,
}: {
  title: string;
  description: string;
  canonicalPath: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
  jsonLdType: "PrivacyPolicy" | "TermsOfService";
}) {
  useDocumentMeta({
    title,
    description,
    canonicalPath,
    ogType: "article",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": jsonLdType,
      name: title,
      description,
      url: `https://www.jevahapp.com${canonicalPath}`,
      dateModified: updated,
      publisher: { "@type": "Organization", name: "Jevah" },
    },
  });

  return (
    <div className="min-h-screen bg-[var(--jevah-bg,#fff)] pt-[4.75rem] text-jevah-text sm:pt-24">
      <header className="border-b border-[#c4a574]/25 bg-gradient-to-br from-[#e8f4f1] via-[#f7f1e4] to-[#eef6f3] px-4 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#256E63]">
            Jevah legal
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
            {title.replace(" — Jevah", "")}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-jevah-text-muted">
            {intro}
          </p>
          <p className="mt-3 text-sm text-jevah-text-muted">
            Last updated: {updated}
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 sm:px-8 lg:grid-cols-[220px_1fr]">
        <nav className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#9a7b3c]">
            On this page
          </p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-jevah-text-muted hover:text-[#256E63]"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <article className="space-y-10">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-28">
              <h2 className="text-2xl font-bold tracking-tight">{s.title}</h2>
              <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-[#1f2a24] dark:text-[#e8e0d2]">
                {s.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              {s.bullets?.length ? (
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed">
                  {s.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          <p className="rounded-2xl border border-[#c4a574]/30 bg-[#f7f1e4]/60 p-5 text-sm">
            Questions? Email{" "}
            <a
              className="font-semibold text-[#256E63]"
              href="mailto:support@jevahapp.com"
            >
              support@jevahapp.com
            </a>{" "}
            or visit{" "}
            <Link to="/contact" className="font-semibold text-[#256E63]">
              Contact
            </Link>
            . Lagos office: 24a Bashorun Okunsanya Street, Off Admiralty Way,
            Lekki Phase 1.
          </p>
        </article>
      </div>
    </div>
  );
}

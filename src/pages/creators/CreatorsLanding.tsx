import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const TYPES = [
  {
    title: "Artists",
    body: "Gospel, worship, and afro-gospel catalogs with a public profile listeners can follow.",
  },
  {
    title: "Ministers",
    body: "Share messages and music that travels with your congregation beyond Sunday.",
  },
  {
    title: "Podcasters",
    body: "Faith conversations that sit beside music — same catalog, clear shelves.",
  },
];

export default function CreatorsLanding() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="jevah-dashboard-shell">
      <section className="relative overflow-hidden px-4 pb-16 pt-28 sm:px-8 sm:pt-32 lg:px-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 10% 0%, rgba(37,110,99,0.18), transparent 55%), radial-gradient(ellipse 50% 40% at 90% 20%, rgba(255,165,0,0.12), transparent 50%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jevah-accent">
            Jevah Creators
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-jevah-text sm:text-5xl">
            Spotify for gospel — built for faith music
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-jevah-text-muted sm:text-lg">
            Apply once. When approved, upload to the Artists shelf. Copyright-free
            beds stay curated by Jevah — same Track model, separate surfaces.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to={isAuthenticated ? "/creators/apply" : "/creators/login"}
              state={
                isAuthenticated
                  ? undefined
                  : { from: "/creators/apply", intent: "creator" }
              }
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-jevah-accent px-8 text-sm font-semibold text-white transition hover:bg-jevah-accent-hover sm:w-auto"
            >
              {isAuthenticated ? "Continue application" : "Become a creator"}
            </Link>
            <Link
              to={
                isAuthenticated
                  ? "/creators/studio"
                  : "/creators/login"
              }
              state={
                isAuthenticated
                  ? undefined
                  : { from: "/creators/studio", intent: "creator" }
              }
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-jevah-accent/30 px-8 text-sm font-semibold text-jevah-accent transition hover:bg-jevah-accent/5 sm:w-auto"
            >
              Open studio
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-8 lg:px-12">
        <div className="grid gap-6 sm:grid-cols-3">
          {TYPES.map((t) => (
            <div key={t.title} className="rounded-2xl border border-jevah-border bg-jevah-surface p-6">
              <h2 className="text-lg font-semibold text-jevah-text">{t.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-jevah-text-muted">{t.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-jevah-text-muted">
          Already approved? Head to{" "}
          <Link to="/creators/studio" className="font-semibold text-jevah-accent hover:underline">
            your studio
          </Link>
          . Admins review applications in the Artists queue — not here.
        </p>
      </section>
    </div>
  );
}

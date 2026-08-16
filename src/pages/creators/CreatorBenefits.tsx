import { Link } from "react-router-dom";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import { useAuth } from "../../context/AuthContext";
import {
  MusicalNoteIcon,
  GlobeAltIcon,
  ChartBarIcon,
  UserGroupIcon,
  HeartIcon,
  ShieldCheckIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

const BENEFITS = [
  {
    title: "A gospel-first audience",
    body: "Your music sits on the Artists shelf next to worship, choir, and Afro-gospel — not a dump of every genre on earth.",
    extra:
      "Copyright-free beds stay on a separate curated shelf. Listeners who want original ministry music find you on purpose.",
    icon: MusicalNoteIcon,
  },
  {
    title: "A page people can share",
    body: "Photo, banner, bio, and tracks in one URL: /artists/your-name. Same story you tell on Sunday, ready for midweek.",
    extra:
      "Verified creators get the gold mark. Share the link on WhatsApp, Instagram, or the church bulletin.",
    icon: GlobeAltIcon,
  },
  {
    title: "Streams you can actually read",
    body: "Studio Analytics shows listens, unique listeners, and how far people play — 7, 28, or 90 days.",
    extra:
      "Double down on what people finish. A spike after a service is normal; the week after tells you if the song travels.",
    icon: ChartBarIcon,
  },
  {
    title: "Cover art that travels",
    body: "Every track can carry its own artwork. The vinyl player and the public page both use it.",
    extra:
      "Replace a cover later from Catalog without re-uploading the audio.",
    icon: PhotoIcon,
  },
  {
    title: "Room for the whole ministry",
    body: "Solo ministers, worship teams, choirs, and faith podcasters use the same Studio. One apply. One catalog.",
    extra:
      "Discography packs singles into EPs and albums when a project should travel together.",
    icon: UserGroupIcon,
  },
  {
    title: "A trusted shelf",
    body: "Verification is the gate. That is why upload waits on approval — listeners know the Artists shelf is ministry music.",
    extra:
      "Admins review applications in the Artists queue. You are not competing with spam accounts for attention.",
    icon: ShieldCheckIcon,
  },
];

export default function CreatorBenefits() {
  useDocumentMeta({
    title: "Why gospel artists join Jevah — Creator Studio",
    description:
      "A gospel audience, a public artist page, stream analytics, and a trusted Artists shelf — why ministers publish on Jevah.",
    canonicalPath: "/creators/benefits",
  });
  const { isAuthenticated } = useAuth();
  const applyTo = isAuthenticated ? "/creators/apply" : "/creators/login";

  return (
    <div className="jevah-dashboard-shell px-4 pb-20 pt-28 sm:px-8 sm:pt-32 lg:px-12">
      <div className="mx-auto max-w-3xl text-center">
        <p className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-jevah-accent">
          <HeartIcon className="h-3.5 w-3.5" />
          Why artists join
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-jevah-text">
          Built so ministry music can travel
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-jevah-text-muted sm:text-base">
          Jevah is not a generic upload dump. It is a gospel house: listeners come for
          worship and the Word. Your catalog lives in that room.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2">
        {BENEFITS.map((b) => {
          const Icon = b.icon;
          return (
            <article
              key={b.title}
              className="rounded-2xl border border-jevah-border bg-jevah-surface p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-jevah-text">{b.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-jevah-text-muted">
                {b.body}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-jevah-text">{b.extra}</p>
            </article>
          );
        })}
      </div>

      <div className="mx-auto mt-12 flex max-w-3xl flex-col items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-[#0B1A1F] to-[#12263a] px-6 py-7 text-white sm:flex-row sm:px-8">
        <div>
          <p className="text-lg font-black">Start with the application</p>
          <p className="mt-1 text-sm text-white/65">
            Read how Studio works, then apply. Upload unlocks after you are verified.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Link
            to={applyTo}
            state={
              isAuthenticated
                ? undefined
                : { from: "/creators/apply", intent: "creator" }
            }
            className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#0B1A1F]"
          >
            Become a Creator
          </Link>
          <Link
            to="/creators/how"
            className="inline-flex items-center justify-center rounded-full border border-white/25 px-5 py-2.5 text-sm font-bold text-white"
          >
            How Studio works
          </Link>
        </div>
      </div>
    </div>
  );
}

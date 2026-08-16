import { Link } from "react-router-dom";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import { useAuth } from "../../context/AuthContext";
import {
  SparklesIcon,
  CheckBadgeIcon,
  ArrowUpTrayIcon,
  ChartBarIcon,
  ClockIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

const STEPS = [
  {
    n: "01",
    title: "Create your account",
    body: "Sign in from Creator in the header. Use the same email you want listeners and Jevah to reach you on.",
    detail:
      "You land in Studio even before approval — the desk shows a review card instead of upload until you are verified.",
    icon: SparklesIcon,
  },
  {
    n: "02",
    title: "Send one application",
    body: "Display name, ministry type, genres, a short bio, and optional social links. That is the whole form.",
    detail:
      "Admins see you in the Artists queue. Typical review is 1–2 days. You get email when the desk opens.",
    icon: EnvelopeIcon,
  },
  {
    n: "03",
    title: "Wait with the desk open",
    body: "Studio stays readable. You cannot publish yet — that is how the Artists shelf stays trusted gospel music.",
    detail:
      "If something is missing, support will ask. You will not be left in a silent queue.",
    icon: ClockIcon,
  },
  {
    n: "04",
    title: "Upload tracks & cover art",
    body: "Drop one song or a batch. Title, genre, and artwork per track. Save as draft or publish to the shelf.",
    detail:
      "Covers travel with the player. You can replace art later from Catalog → Edit.",
    icon: ArrowUpTrayIcon,
  },
  {
    n: "05",
    title: "Pack albums, then grow",
    body: "Discography groups singles into an EP or album. Analytics shows who listened and how far they played.",
    detail:
      "Brand Profile is the public page at /artists/your-name — photo, banner, bio, and the catalog people share.",
    icon: ChartBarIcon,
  },
];

export default function CreatorHow() {
  useDocumentMeta({
    title: "How Creator Studio works — Jevah",
    description:
      "Apply as a gospel artist, get verified, upload tracks with cover art, and grow from Jevah Studio.",
    canonicalPath: "/creators/how",
  });
  const { isAuthenticated } = useAuth();
  const applyTo = isAuthenticated ? "/creators/apply" : "/creators/login";

  return (
    <div className="jevah-dashboard-shell px-4 pb-20 pt-28 sm:px-8 sm:pt-32 lg:px-12">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-jevah-accent">
          How Studio works
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-jevah-text">
          Apply once. Publish when you are verified.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-jevah-text-muted sm:text-base">
          Five steps from first login to a live track on the Artists shelf. No mystery
          queue — Studio always tells you whether you are waiting, uploading, or live.
        </p>
      </div>

      <ol className="mx-auto mt-12 max-w-3xl space-y-4">
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <li
              key={step.n}
              className="rounded-2xl border border-jevah-border bg-jevah-surface p-5 sm:p-6"
            >
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-jevah-accent/10 text-jevah-accent ring-1 ring-jevah-accent/20">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-jevah-accent">
                    Step {step.n}
                  </p>
                  <h2 className="mt-0.5 text-lg font-bold text-jevah-text">
                    {step.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-jevah-text-muted">
                    {step.body}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-jevah-text">
                    {step.detail}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mx-auto mt-10 flex max-w-3xl flex-col items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-[#0B1A1F] to-[#12263a] px-6 py-7 text-white sm:flex-row sm:px-8">
        <div>
          <p className="inline-flex items-center gap-1.5 text-sm font-black">
            <CheckBadgeIcon className="h-4 w-4 text-emerald-300" />
            Ready to start?
          </p>
          <p className="mt-1 text-sm text-white/65">
            Application is one form. Upload unlocks after approval.
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
            to="/creators/benefits"
            className="inline-flex items-center justify-center rounded-full border border-white/25 px-5 py-2.5 text-sm font-bold text-white"
          >
            Why artists join
          </Link>
        </div>
      </div>
    </div>
  );
}

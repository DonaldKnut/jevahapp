import {
  CheckBadgeIcon,
  MusicalNoteIcon,
  QueueListIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const STEPS = [
  {
    icon: MusicalNoteIcon,
    title: "Claim your name",
    body: "Listeners find you by the display name you publish on Jevah.",
  },
  {
    icon: QueueListIcon,
    title: "Pick your shelf",
    body: "Artist, minister, or podcaster — same studio, clear surfaces.",
  },
  {
    icon: CheckBadgeIcon,
    title: "Get reviewed",
    body: "Admins approve in the Artists queue. Then you upload.",
  },
];

export default function ApplyPromoAside() {
  return (
    <aside className="auth-promo relative hidden h-full w-[42%] shrink-0 flex-col overflow-hidden lg:flex xl:w-[40%]">
      <img
        src="https://res.cloudinary.com/dajpllbyu/image/upload/v1785390152/Two_Africans_listening_to_phones_202607300639_woclw7.jpg"
        alt=""
        className="absolute inset-0 h-full w-full scale-105 object-cover object-center brightness-90 saturate-110"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1A1208] via-[#3D2A12]/80 to-[#0B1A1F]/55"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-45"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 20% 80%, rgba(255,165,0,0.35), transparent 55%), radial-gradient(ellipse 50% 40% at 90% 10%, rgba(37,110,99,0.35), transparent 50%)",
        }}
      />

      <div className="relative z-10 flex h-full flex-col px-10 py-10 xl:px-12 xl:py-12">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/35 bg-amber-500/20 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-widest text-amber-100 backdrop-blur-md">
            <SparklesIcon className="h-3.5 w-3.5 text-amber-300" />
            Jevah for Creators
          </span>
        </div>

        <div className="my-auto max-w-md py-10">
          <h2 className="text-[2.1rem] font-extrabold leading-[1.15] tracking-tight text-white drop-shadow-sm xl:text-[2.4rem]">
            Get your music in front of people already listening.
          </h2>
          <p className="mt-4 max-w-[28rem] text-sm leading-relaxed text-slate-200">
            Same idea as Spotify for Artists: one apply form, a review gate, then
            a studio where you ship tracks to the gospel shelf.
          </p>

          <ol className="mt-8 space-y-4">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 ring-1 ring-amber-300/25 backdrop-blur-md">
                  <Icon className="h-4 w-4 text-amber-200" />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">
                    <span className="mr-1.5 font-mono text-[10px] text-amber-300/80">
                      0{i + 1}
                    </span>
                    {title}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-300">
                    {body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <p className="border-t border-white/10 pt-4 text-[11px] text-slate-300">
          Required fields are marked. Everything else is optional — add socials
          later from Studio if you prefer.
        </p>
      </div>
    </aside>
  );
}

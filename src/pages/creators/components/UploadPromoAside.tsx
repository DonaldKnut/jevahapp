import {
  CloudArrowUpIcon,
  MusicalNoteIcon,
  SparklesIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export default function UploadPromoAside() {
  return (
    <aside className="auth-promo relative hidden min-h-[640px] overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-[#1A1208] via-[#2A1D0E] to-[#0B1A1F] shadow-[0_12px_40px_rgba(0,0,0,0.35)] lg:col-span-5 lg:flex lg:flex-col lg:justify-between p-8">
      <img
        src="https://res.cloudinary.com/dajpllbyu/image/upload/v1785390152/Two_Africans_listening_to_phones_202607300639_woclw7.jpg"
        alt=""
        className="absolute inset-0 h-full w-full scale-105 object-cover object-center brightness-75 saturate-110"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B1A1F] via-[#1A1208]/85 to-transparent" />
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 30% 80%, rgba(245,158,11,0.4), transparent 60%), radial-gradient(ellipse 60% 40% at 80% 20%, rgba(37,110,99,0.4), transparent 50%)",
        }}
      />

      <div className="relative z-10">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/35 bg-amber-500/20 px-3.5 py-1 text-[11px] font-black uppercase tracking-widest text-amber-200 backdrop-blur-md">
          <MusicalNoteIcon className="h-3.5 w-3.5 text-amber-300" />
          Jevah Creator Studio
        </span>
      </div>

      <div className="relative z-10 my-auto py-8">
        <h2 className="text-2xl font-black leading-tight tracking-tight text-white drop-shadow-md xl:text-3xl">
          Share gospel music with listeners who are listening.
        </h2>
        <p className="mt-3 text-xs font-medium leading-relaxed text-slate-200 drop-shadow-sm">
          Upload your latest worship singles, albums, or sermon audio directly
          to the Jevah streaming platform.
        </p>

        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 ring-1 ring-white/15 backdrop-blur-md">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/30 text-amber-200">
              <SparklesIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Instant Distribution</p>
              <p className="text-[10px] text-slate-300">
                Published directly to user shelves upon review
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 ring-1 ring-white/15 backdrop-blur-md">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/30 text-emerald-200">
              <CheckCircleIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">High Fidelity Audio</p>
              <p className="text-[10px] text-slate-300">
                Supports lossless WAV, MP3, and M4A formats
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-4 text-[11px] text-slate-300">
        <span className="inline-flex items-center gap-1.5">
          <CloudArrowUpIcon className="h-3.5 w-3.5" />
          Creator Guidelines
        </span>
        <span className="font-mono text-amber-300">Ready</span>
      </div>
    </aside>
  );
}

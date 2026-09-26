import { JEVAH_EMAIL_LOGO_URL } from "../../lib/emailBrand";
import {
  CREATOR_WELCOME_STEPS,
  creatorWelcomeSubject,
} from "../../lib/creatorWelcomeEmail";

export default function CreatorWelcomeEmailPreview({
  firstName,
  optionalNote,
}: {
  firstName: string;
  optionalNote?: string;
}) {
  const name = firstName.trim() || "friend";
  const note = optionalNote?.trim();

  return (
    <div className="overflow-hidden rounded-2xl border border-jevah-border bg-[#f7f4ee] text-[#1a1a1a] shadow-inner">
      <div className="border-b border-black/5 bg-[#0b1a1f] px-4 py-5 text-white">
        <img
          src={JEVAH_EMAIL_LOGO_URL}
          alt="Jevah"
          width={140}
          height={70}
          className="mx-auto h-14 w-auto object-contain"
        />
        <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-amber-300/90">
          Preview · Studio invite
        </p>
        <p className="mt-1 text-center text-sm font-bold">
          {creatorWelcomeSubject(name)}
        </p>
      </div>
      <div className="space-y-3 px-4 py-4 text-[13px] leading-relaxed">
        <p>Hi {name},</p>
        <p className="font-semibold">
          Welcome to Jevah. We’re glad you’re here.
        </p>
        <p className="text-[#3f3f3f]">
          Whether you’re here to share your music, ministry, podcast, message,
          or your story, Jevah was built to give your voice a place to reach
          people who need to hear it.
        </p>
        <p className="text-[#3f3f3f]">
          Your creator profile is now ready. This is your space to{" "}
          <strong>publish, connect with your audience, grow your community,
          and make an impact beyond the moment.</strong>
        </p>
        {note ? (
          <div className="rounded-xl border border-amber-500/25 bg-amber-50 px-3 py-2.5 text-[12px] text-amber-950">
            {note}
          </div>
        ) : null}
        <p className="font-semibold">Here’s what you can do next:</p>
        <ul className="space-y-2">
          {CREATOR_WELCOME_STEPS.map((step) => (
            <li key={step.title} className="flex gap-2">
              <span className="mt-0.5 shrink-0" aria-hidden>
                {step.icon}
              </span>
              <span>
                <strong>{step.title}</strong>
                <span className="text-[#3f3f3f]"> — {step.body}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="font-semibold">Your next chapter starts here.</p>
        <p>Welcome to Jevah, {name}.</p>
        <p className="text-[12px] font-bold tracking-wide text-[#0b1a1f]">
          Create. Connect. Inspire.
        </p>
        <p className="text-[12px] text-[#6b6b6b]">The Jevah Team</p>
      </div>
    </div>
  );
}

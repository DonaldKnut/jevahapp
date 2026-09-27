import { JEVAH_EMAIL_LOGO_URL } from "../../lib/emailBrand";
import {
  CREATOR_WELCOME_BODY,
  creatorWelcomePlain,
  creatorWelcomeSubject,
} from "../../lib/creatorWelcomeEmail";

export default function CreatorWelcomeEmailPreview({
  firstName,
  optionalNote,
  subject,
  body,
}: {
  firstName: string;
  optionalNote?: string;
  subject?: string;
  body?: string;
}) {
  const name = firstName.trim() || "friend";
  const heading = subject?.trim()
    ? subject.includes("{{firstName}}")
      ? creatorWelcomeSubject(name)
      : subject
    : creatorWelcomeSubject(name);
  const letter = creatorWelcomePlain(
    name,
    optionalNote,
    body?.trim() || CREATOR_WELCOME_BODY
  );

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
        <p className="mt-1 text-center text-sm font-bold">{heading}</p>
      </div>
      <div className="px-4 py-4 text-[13px] leading-relaxed text-[#1a1a1a]">
        <p className="whitespace-pre-wrap">{letter}</p>
      </div>
    </div>
  );
}

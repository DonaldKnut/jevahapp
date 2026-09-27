/** Official Studio-ready welcome. Backend interpolates the same tokens. */
export const CREATOR_WELCOME_TEMPLATE_ID = "creator_welcome_v1";

export const CREATOR_WELCOME_SUBJECT = "Welcome to Jevah, {{firstName}}";

export const CREATOR_WELCOME_BODY = `Hi {{firstName}},

Welcome to Jevah. We’re glad you’re here.

Whether you’re here to share your music, ministry, podcast, message, or your story, Jevah was built to give your voice a place to reach people who need to hear it.

Your creator profile is now ready. This is your space to publish, connect with your audience, grow your community, and make an impact beyond the moment.

Here’s what you can do next:

🎙️ Share your work — Upload your music, podcasts, sermons, teachings, or other content.

🌍 Reach more people — Put your voice in front of an audience beyond your immediate circle.

💬 Build your community — Connect with people who listen, watch, follow, and believe in what you do.

🚀 Grow with Jevah — Keep creating, keep showing up, and let your journey unfold.

Your next chapter starts here.

Welcome to Jevah, {{firstName}}.

Create. Connect. Inspire.

The Jevah Team`;

const WELCOME_DRAFT_KEY = "jevah.admin.artistWelcomeLetter";

export function readWelcomeDraft(): { subject: string; body: string } | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(WELCOME_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { subject?: string; body?: string };
    if (!parsed.body?.trim() && !parsed.subject?.trim()) return null;
    return {
      subject: parsed.subject?.trim() || CREATOR_WELCOME_SUBJECT,
      body: parsed.body?.trim() || CREATOR_WELCOME_BODY,
    };
  } catch {
    return null;
  }
}

export function writeWelcomeDraft(subject: string, body: string) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(
    WELCOME_DRAFT_KEY,
    JSON.stringify({ subject, body })
  );
}

export const CREATOR_WELCOME_STEPS = [
  {
    icon: "🎙️",
    title: "Share your work",
    body: "Upload your music, podcasts, sermons, teachings, or other content.",
  },
  {
    icon: "🌍",
    title: "Reach more people",
    body: "Put your voice in front of an audience beyond your immediate circle.",
  },
  {
    icon: "💬",
    title: "Build your community",
    body: "Connect with people who listen, watch, follow, and believe in what you do.",
  },
  {
    icon: "🚀",
    title: "Grow with Jevah",
    body: "Keep creating, keep showing up, and let your journey unfold.",
  },
] as const;

export function creatorFirstName(
  source?: { displayName?: string; name?: string; firstName?: string } | string
) {
  if (typeof source === "string") {
    const first = source.trim().split(/\s+/)[0];
    return first || "friend";
  }
  const raw =
    source?.firstName || source?.displayName || source?.name || "";
  const first = raw.trim().split(/\s+/)[0];
  return first || "friend";
}

export function fillWelcomeTokens(text: string, firstName: string) {
  return text.split("{{firstName}}").join(firstName);
}

export function creatorWelcomeSubject(firstName: string) {
  return fillWelcomeTokens(CREATOR_WELCOME_SUBJECT, firstName);
}

export function insertOptionalNote(body: string, optionalNote?: string) {
  const note = optionalNote?.trim();
  if (!note) return body;
  const marker = "Here’s what you can do next:";
  if (body.includes(marker)) {
    return body.replace(marker, `${note}\n\n${marker}`);
  }
  return `${body.trim()}\n\n${note}`;
}

export function creatorWelcomePlain(
  firstName: string,
  optionalNote?: string,
  bodyTemplate = CREATOR_WELCOME_BODY
) {
  const name = firstName.trim() || "friend";
  return fillWelcomeTokens(insertOptionalNote(bodyTemplate, optionalNote), name);
}

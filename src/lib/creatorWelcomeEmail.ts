/** Official Studio-ready welcome. Backend interpolates the same tokens. */
export const CREATOR_WELCOME_TEMPLATE_ID = "creator_welcome_v1";

export const CREATOR_WELCOME_SUBJECT = "Welcome to Jevah, {{firstName}}";

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

export function creatorWelcomePlain(firstName: string, optionalNote?: string) {
  const name = firstName.trim() || "friend";
  const note = optionalNote?.trim();
  const steps = CREATOR_WELCOME_STEPS.map(
    (s) => `${s.icon} ${s.title} — ${s.body}`
  ).join("\n\n");

  return [
    `Hi ${name},`,
    "",
    "Welcome to Jevah. We’re glad you’re here.",
    "",
    "Whether you’re here to share your music, ministry, podcast, message, or your story, Jevah was built to give your voice a place to reach people who need to hear it.",
    "",
    "Your creator profile is now ready. This is your space to publish, connect with your audience, grow your community, and make an impact beyond the moment.",
    note ? `\n${note}\n` : "",
    "Here’s what you can do next:",
    "",
    steps,
    "",
    "Your next chapter starts here.",
    "",
    `Welcome to Jevah, ${name}.`,
    "",
    "Create. Connect. Inspire.",
    "",
    "The Jevah Team",
  ]
    .filter((line, i, arr) => !(line === "" && arr[i - 1] === ""))
    .join("\n");
}

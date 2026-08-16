import LegalDoc, { type LegalSection } from "./legal/LegalDoc";

const UPDATED = "16 August 2026";

const sections: LegalSection[] = [
  {
    id: "who",
    title: "Who we are",
    paragraphs: [
      "Jevah (“we”, “us”) operates the Jevah mobile apps and website at jevahapp.com — a gospel community platform for Christian music, the Holy Bible, sermons, children’s faith learning, and creator tools.",
      "Controller: Jevah, 24a Bashorun Okunsanya Street, Off Admiralty Way, Lekki Phase 1, Lagos, Nigeria. Email: support@jevahapp.com.",
    ],
  },
  {
    id: "collect",
    title: "Information we collect",
    paragraphs: [
      "We collect what you give us and what the product needs to run.",
    ],
    bullets: [
      "Account: name, email, password or social login, phone if you add it.",
      "Profile: stage name, bio, location, avatar, banner, social links for artists.",
      "Creator content: audio files, album art, release metadata, lyrics if you paste them.",
      "Usage: device type, app version, IP address, pages and tracks you open, approximate region for analytics.",
      "Communications: support messages and optional newsletter email.",
      "Payments: if a paid feature launches, card data is handled by a processor — we do not store full card numbers.",
    ],
  },
  {
    id: "use",
    title: "How we use information",
    paragraphs: [
      "We use data to provide Jevah, keep it safe, and improve it — not to sell your identity to advertisers.",
    ],
    bullets: [
      "Sign-in, profiles, Bible reading, music playback, and creator studio.",
      "Personalize gospel and Bible recommendations (including “For You” ranking).",
      "Process uploads (presigned storage), transcode audio, and show album art.",
      "Send service email (password reset, creator review). Marketing email only with consent; you can unsubscribe.",
      "Detect abuse, spam, copyright claims, and security incidents.",
      "Comply with law and enforce our Terms.",
    ],
  },
  {
    id: "legal-bases",
    title: "Legal bases (including Nigeria NDPR / NDPA)",
    paragraphs: [
      "Where Nigerian data-protection law applies, we process personal data on contract (to provide the app), consent (newsletters, optional cookies), legitimate interests (security, product improvement, public artist pages you publish), and legal obligation (lawful requests).",
      "If you are in the EEA/UK, similar GDPR bases apply. You may withdraw consent at any time without affecting prior lawful processing.",
    ],
  },
  {
    id: "sharing",
    title: "Sharing",
    paragraphs: [
      "We do not sell personal information. We share only as needed to run Jevah.",
    ],
    bullets: [
      "Infrastructure: cloud hosting, object storage for audio and images, email delivery, analytics that we configure.",
      "Public by design: artist profiles, published tracks, display names, and album art you choose to publish.",
      "Legal: if required by law, court order, or to protect users and the service.",
      "Business transfer: if Jevah is acquired, data may move with the product under this policy’s spirit.",
    ],
  },
  {
    id: "children",
    title: "Children",
    paragraphs: [
      "The Children’s Zone is meant for families. We do not knowingly collect personal data from children under 13 (or the digital-consent age in your country) without a parent or guardian.",
      "Parents may contact support@jevahapp.com to review or delete a child’s information. Artist and studio tools are for adults (18+).",
    ],
  },
  {
    id: "retention",
    title: "Retention and security",
    paragraphs: [
      "We keep account and catalog data while your account is open and as needed for backups, disputes, and law. You may request deletion; some records (invoices, abuse logs) may be kept longer where required.",
      "We use HTTPS, access controls, and least-privilege for staff. No method is perfectly secure. Tell us immediately at support@jevahapp.com if you suspect unauthorized access.",
    ],
  },
  {
    id: "rights",
    title: "Your rights",
    paragraphs: [
      "Subject to applicable law, you may request access, correction, deletion, portability, or restriction of processing, and object to certain uses. You may lodge a complaint with the Nigeria Data Protection Commission (NDPC) or your local authority.",
      "In the app or by email: update your profile, close your account, or opt out of marketing. Unsubscribing from email does not delete your account.",
    ],
  },
  {
    id: "cookies",
    title: "Cookies and local storage",
    paragraphs: [
      "The website uses essential cookies/local storage for login session, theme (light/dark), Bible translation preference, and reading-plan progress on this device. We do not run third-party ad networks on the marketing site today. If that changes, we will update this policy.",
    ],
  },
  {
    id: "international",
    title: "International transfers",
    paragraphs: [
      "Servers and backups may sit outside Nigeria. We use providers that offer appropriate safeguards for the regions they serve. By using Jevah you understand your data may be processed in those locations.",
    ],
  },
  {
    id: "changes",
    title: "Changes",
    paragraphs: [
      "We will post updates here and change the “Last updated” date. Material changes may also be emailed to the address on your account.",
    ],
  },
];

export default function Privacy() {
  return (
    <LegalDoc
      title="Privacy Policy — Jevah"
      description="How Jevah collects, uses, and protects your data across the gospel music app, Bible reader, and creator studio. NDPR and children’s privacy included."
      canonicalPath="/privacy"
      updated={UPDATED}
      intro="This policy explains how Jevah handles personal information when you use our gospel music app, online Bible, sermons, children’s zone, and creator studio."
      sections={sections}
      jsonLdType="PrivacyPolicy"
    />
  );
}

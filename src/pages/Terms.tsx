import LegalDoc, { type LegalSection } from "./legal/LegalDoc";

const UPDATED = "16 August 2026";

const sections: LegalSection[] = [
  {
    id: "acceptance",
    title: "Agreement",
    paragraphs: [
      "These Terms govern your use of Jevah websites, apps, and APIs (the “Service”). By creating an account or using Jevah you agree to them. If you do not agree, do not use the Service.",
      "Jevah is a gospel-oriented platform: Bible reading, Christian music, sermons, community, and tools for artists who minister through music. It is not legal, medical, or pastoral advice.",
    ],
  },
  {
    id: "eligibility",
    title: "Eligibility and accounts",
    paragraphs: [
      "You must be at least 13 to use a personal account (or the minimum age in your country). Creator Studio and artist uploads are for users 18 and over.",
      "You are responsible for your password and for activity under your account. Notify us if you suspect misuse. We may suspend accounts that violate these Terms or harm the community.",
    ],
  },
  {
    id: "license",
    title: "License to use Jevah",
    paragraphs: [
      "We grant you a limited, non-exclusive, non-transferable license to use the Service for personal faith, worship, and (if approved) creator publishing. You may not scrape, reverse engineer, or overload our systems, or use bots except as we expressly allow (for example search engines indexing public pages).",
    ],
  },
  {
    id: "bible",
    title: "Bible text",
    paragraphs: [
      "Scripture shown in Jevah Bible is served from our API. The default World English Bible (WEB) is public domain. Licensed translations, if listed later, may appear only where we have rights; those texts remain the property of their publishers. Do not copy licensed text into commercial products without the publisher’s permission.",
    ],
  },
  {
    id: "music",
    title: "Music, album art, and creators",
    paragraphs: [
      "Curated / copyright-free tracks are licensed for listening on Jevah as presented. Artist tracks remain the artist’s (or their label’s) property.",
      "If you upload audio or images you must own the rights or have a license that allows streaming on Jevah worldwide. You grant Jevah a license to host, transcode, display album art and profile photos, and stream that content to listeners for the Service.",
      "You must not upload infringing, hateful, sexually explicit, or unlawful material. We may remove content and terminate repeat infringers. Copyright complaints: support@jevahapp.com with the work, URL, and your contact details (a good-faith DMCA-style notice).",
    ],
  },
  {
    id: "community",
    title: "Community standards",
    paragraphs: [
      "Do not harass, impersonate, spam, or post scams. Prayer and forum spaces are for building up the body of Christ — not for scraping contacts or selling leads. We may moderate or remove posts that violate this spirit or the law.",
    ],
  },
  {
    id: "payments",
    title: "Paid features",
    paragraphs: [
      "Core listening and Bible reading are free today. If we introduce paid plans or tips, prices, taxes, and refunds will be shown at checkout. App Store / Play billing is also governed by Apple or Google terms.",
    ],
  },
  {
    id: "ip",
    title: "Jevah intellectual property",
    paragraphs: [
      "The Jevah name, logo, site design, and software are ours. You may not use our marks in a way that suggests partnership without written permission.",
    ],
  },
  {
    id: "disclaimer",
    title: "Disclaimers",
    paragraphs: [
      "THE SERVICE IS PROVIDED “AS IS”. We do not warrant uninterrupted, error-free, or virus-free operation. Scripture and sermons are for spiritual encouragement, not professional counsel.",
    ],
  },
  {
    id: "liability",
    title: "Limitation of liability",
    paragraphs: [
      "To the fullest extent permitted by law, Jevah and its team are not liable for indirect, incidental, special, or consequential damages, or loss of data, profits, or goodwill. Our total liability for claims relating to the Service is limited to the greater of (a) fees you paid us in the 12 months before the claim or (b) USD 50.",
      "Nothing in these Terms limits liability that cannot be limited under Nigerian law (including fraud or personal injury caused by negligence where such limits are forbidden).",
    ],
  },
  {
    id: "indemnity",
    title: "Indemnity",
    paragraphs: [
      "You will defend and indemnify Jevah against claims arising from your content, your violation of these Terms, or your infringement of someone else’s rights.",
    ],
  },
  {
    id: "termination",
    title: "Termination",
    paragraphs: [
      "You may stop using Jevah and request account deletion. We may suspend or end access for breach, risk, or if we shut down the Service. Provisions that should survive (IP, liability, indemnity) survive termination.",
    ],
  },
  {
    id: "law",
    title: "Governing law",
    paragraphs: [
      "These Terms are governed by the laws of the Federal Republic of Nigeria, without regard to conflict-of-law rules. Courts in Lagos, Nigeria have exclusive jurisdiction, except that we may seek injunctive relief anywhere to protect the Service or users.",
    ],
  },
  {
    id: "changes",
    title: "Changes",
    paragraphs: [
      "We may update these Terms. Continued use after the new “Last updated” date means you accept the revised Terms. If a change is material we will try to notify you by email or in-app notice.",
    ],
  },
];

export default function Terms() {
  return (
    <LegalDoc
      title="Terms and Conditions — Jevah"
      description="Terms of use for Jevah: gospel streaming, Bible, creator uploads, accounts, and acceptable use of the Christian community platform."
      canonicalPath="/terms"
      updated={UPDATED}
      intro="Please read these terms before using Jevah. They cover accounts, gospel music and album art, the Bible reader, creator studio, and how we handle disputes."
      sections={sections}
      jsonLdType="TermsOfService"
    />
  );
}

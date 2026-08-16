export const SITE_ORIGIN = "https://www.jevahapp.com";
export const SITE_NAME = "Jevah";

export const DEFAULT_KEYWORDS = [
  "Jevah",
  "gospel music app",
  "Christian app",
  "Bible app",
  "gospel songs",
  "worship music",
  "Christian community",
  "faith",
  "sermons",
  "Nigerian gospel",
  "Afro gospel",
  "read the Bible online",
  "Christian streaming",
].join(", ");

export const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Jevah",
  url: SITE_ORIGIN,
  logo: `${SITE_ORIGIN}/favicon.ico`,
  email: "support@jevahapp.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "24a Bashorun Okunsanya Street, Off Admiralty Way, Lekki Phase 1",
    addressLocality: "Lagos",
    addressCountry: "NG",
  },
  sameAs: ["https://www.facebook.com"],
};

export const WEBSITE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Jevah",
  url: SITE_ORIGIN,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_ORIGIN}/bible/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export const APP_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Jevah",
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Android, iOS, Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  description:
    "Gospel music, Holy Bible, sermons, and a Christian community — the Jevah app for faith, worship, and the Word.",
};

export type SeoPage = {
  path: string;
  title: string;
  description: string;
  keywords?: string;
};

export const MARKETING_SEO_PAGES: SeoPage[] = [
  {
    path: "/",
    title: "Jevah — Gospel music, Bible, and Christian community app",
    description:
      "Jevah is the gospel app for faith: stream worship and Afro-gospel, read the Holy Bible, hear sermons, and grow with a Christian community. Free on web and mobile.",
  },
  {
    path: "/music",
    title: "Gospel music & worship songs — Jevah",
    description:
      "Listen to gospel music, worship, choir, and Afro-gospel on Jevah. Discover Christian artists and copyright-free faith tracks.",
  },
  {
    path: "/bible",
    title: "Jevah Bible — Read the World English Bible online",
    description:
      "Read the Holy Bible on Jevah. Search verses, follow reading plans, and share Scripture in the public-domain World English Bible.",
  },
  {
    path: "/sermons",
    title: "Christian sermons & teaching — Jevah",
    description:
      "Scripture-rooted sermons and messages on faith, prayer, and hope. Listen on the Jevah Christian app.",
  },
  {
    path: "/creators",
    title: "Gospel artists on Jevah — share Christian music",
    description:
      "Upload gospel music, build a public artist profile, and reach listeners who love worship, Afro-gospel, and the Word.",
  },
  {
    path: "/about",
    title: "About Jevah — a gospel community platform",
    description:
      "Jevah brings gospel music, the Bible, sermons, children’s faith learning, and Christian community into one sacred space.",
  },
  {
    path: "/privacy",
    title: "Privacy Policy — Jevah",
    description:
      "How Jevah collects, uses, and protects your data across the gospel music app, Bible reader, and creator studio. NDPR and children’s privacy included.",
  },
  {
    path: "/terms",
    title: "Terms and Conditions — Jevah",
    description:
      "Terms of use for Jevah: gospel streaming, Bible, creator uploads, accounts, and acceptable use of the Christian community platform.",
  },
  {
    path: "/contact",
    title: "Contact Jevah",
    description:
      "Reach the Jevah team in Lagos for support, gospel artist partnerships, and faith-community questions.",
  },
  {
    path: "/children",
    title: "Children’s Zone — Bible games and faith for kids | Jevah",
    description:
      "Faith-filled Bible games, stories, and learning for children on Jevah — a safe Christian space for young hearts.",
  },
  {
    path: "/ebooks",
    title: "Christian e-books — Jevah",
    description:
      "Faith-building Christian e-books and devotionals alongside gospel music and the Bible on Jevah.",
  },
  {
    path: "/events",
    title: "Christian events — Jevah",
    description:
      "Discover faith gatherings, worship nights, and gospel community events on Jevah.",
  },
  {
    path: "/blog",
    title: "Jevah Blog — faith, gospel music, and the Word",
    description:
      "Stories on gospel music, Christian living, and Scripture from the Jevah community.",
  },
  {
    path: "/forum",
    title: "Prayer and faith forum — Jevah",
    description:
      "A Christian community forum for prayer, encouragement, and conversation in the faith.",
  },
];

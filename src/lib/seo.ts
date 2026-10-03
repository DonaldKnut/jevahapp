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
  name: "Tevadice Limited",
  legalName: "Tevadice Limited",
  alternateName: "Jevah",
  url: SITE_ORIGIN,
  logo: `${SITE_ORIGIN}/favicon.ico`,
  email: "support@jevahapp.com",
  telephone: "+2347037742764",
  address: {
    "@type": "PostalAddress",
    streetAddress: "1B Ondo Street, Okeira, Ogba",
    addressLocality: "Lagos",
    addressRegion: "Lagos",
    addressCountry: "NG",
  },
  location: [
    {
      "@type": "Place",
      name: "Registered Office",
      address: {
        "@type": "PostalAddress",
        streetAddress: "1B Ondo Street, Okeira, Ogba",
        addressLocality: "Lagos",
        addressCountry: "NG",
      },
    },
    {
      "@type": "Place",
      name: "Secondary Office",
      address: {
        "@type": "PostalAddress",
        streetAddress:
          "23A, Bashorun Okusanya Street, Off Admiralty Road, Off Admiralty Way, Lekki Phase 1",
        addressLocality: "Lagos",
        addressCountry: "NG",
      },
    },
  ],
  sameAs: [
    "https://x.com/Jevah_hq",
    "https://www.instagram.com/jevahhq/",
  ],
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
    "Jevah is a gospel platform operated by Tevadice Limited: gospel music, the Holy Bible, sermons, and a Christian community.",
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
      "Jevah is a gospel platform operated by Tevadice Limited: stream worship and Afro-gospel, read the Holy Bible, hear sermons, and grow with a Christian community.",
  },
  {
    path: "/music",
    title: "Gospel music & worship songs — Jevah",
    description:
      "Listen to gospel music, worship, choir, and Afro-gospel on Jevah. Discover Christian artists and copyright-free faith tracks.",
  },
  {
    path: "/artists",
    title: "Gospel artists — Jevah",
    description:
      "Meet verified gospel artists, worship leaders, and choirs on Jevah. Open a public page and listen.",
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
      "Watch and listen to scripture-rooted sermons on faith, prayer, and hope. Browse the live Jevah sermon catalog.",
  },
  {
    path: "/explore",
    title: "Latest on Jevah — gospel videos & sermons",
    description:
      "Discover the latest live gospel videos, sermons, and media on Jevah.",
  },
  {
    path: "/creators",
    title: "Gospel artists on Jevah — share Christian music",
    description:
      "Upload gospel music, build a public artist profile, and reach listeners who love worship, Afro-gospel, and the Word.",
  },
  {
    path: "/creators/how",
    title: "How Creator Studio works — Jevah",
    description:
      "Apply as a gospel artist, get verified, upload tracks with cover art, and grow from Jevah Studio.",
  },
  {
    path: "/creators/benefits",
    title: "Why gospel artists join Jevah — Creator Studio",
    description:
      "A gospel audience, a public artist page, stream analytics, and a trusted Artists shelf — why ministers publish on Jevah.",
  },
  {
    path: "/about",
    title: "About Jevah — operated by Tevadice Limited",
    description:
      "Jevah is a digital platform operated by Tevadice Limited, a company registered in Nigeria. Gospel music, the Bible, sermons, and Christian community.",
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
    title: "Contact Jevah — Tevadice Limited",
    description:
      "Customer service for Jevah: support@jevahapp.com and +234 703 774 2764. Registered office of Tevadice Limited in Ogba, Lagos, Nigeria.",
  },
  {
    path: "/children",
    title: "Children’s Zone — Bible games and faith for kids | Jevah",
    description:
      "Faith-filled Bible games, stories, and learning for children on Jevah — a safe Christian space for young hearts.",
  },
  {
    path: "/ebooks",
    title: "Christian ebooks & devotionals — Jevah",
    description:
      "Browse and read faith-filled ebooks, devotionals, and teaching PDFs on Jevah.",
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

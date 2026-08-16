import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { BIBLE_SEO_ROUTES, SITE } from "./bible-seo-routes.mjs";

const MARKETING_SEO_ROUTES = [
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
    title: "About Jevah — a gospel community platform",
    description:
      "Jevah brings gospel music, the Bible, sermons, children’s faith learning, and Christian community into one sacred space.",
  },
  {
    path: "/privacy",
    title: "Privacy Policy — Jevah",
    description:
      "How Jevah collects, uses, and protects your data across the gospel music app, Bible reader, and creator studio.",
  },
  {
    path: "/terms",
    title: "Terms and Conditions — Jevah",
    description:
      "Terms of use for Jevah: gospel streaming, Bible, creator uploads, accounts, and the Christian community platform.",
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
];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function injectMeta(html, route) {
  const url = `${SITE}${route.path.split(" ").join("%20")}`;
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: route.title,
    description: route.description,
    url,
    isPartOf: { "@type": "WebSite", name: "Jevah", url: SITE },
  });
  const tags = `
    <meta name="description" content="${esc(route.description)}" />
    <meta property="og:title" content="${esc(route.title)}" />
    <meta property="og:description" content="${esc(route.description)}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${esc(url)}" />
    <meta property="og:site_name" content="Jevah" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(route.title)}" />
    <meta name="twitter:description" content="${esc(route.description)}" />
    <link rel="canonical" href="${esc(url)}" />
    <script type="application/ld+json">${jsonLd}</script>
  `;
  let out = html.replace(/<title>[^<]*<\/title>/i, `<title>${esc(route.title)}</title>`);
  if (!/<title>/.test(out)) {
    out = out.replace("<head>", `<head><title>${esc(route.title)}</title>`);
  }
  return out.replace(/<head[^>]*>/i, (m) => `${m}\n${tags}`);
}

function writeRoute(html, routePath) {
  if (routePath === "/" || routePath === "") {
    fs.writeFileSync(path.join(dist, "index.html"), html);
    return;
  }
  const rel = routePath.replace(/^\//, "");
  const nestedDir = path.join(dist, rel);
  fs.mkdirSync(nestedDir, { recursive: true });
  fs.writeFileSync(path.join(nestedDir, "index.html"), html);

  const flat = path.join(dist, `${rel}.html`);
  fs.mkdirSync(path.dirname(flat), { recursive: true });
  fs.writeFileSync(flat, html);
}

function writeSitemap(routes) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = routes.map((r) => {
    const loc = `${SITE}${encodeURI(r.path === "/" ? "/" : r.path)}`;
    const pri = r.path === "/" || r.path === "/bible" ? "1.0" : r.path.startsWith("/bible") ? "0.7" : "0.8";
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${pri}</priority>
  </url>`;
  }).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  fs.writeFileSync(path.join(dist, "sitemap.xml"), xml);
  const publicDir = path.join(root, "public");
  fs.mkdirSync(publicDir, { recursive: true });
  fs.writeFileSync(path.join(publicDir, "sitemap.xml"), xml);
}

async function enrichJohn316(routes) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(
      "https://api.jevahapp.com/api/bible/books/John/chapters/3/verses/16?translation=web",
      { signal: ctrl.signal }
    );
    clearTimeout(t);
    if (!res.ok) return routes;
    const body = await res.json();
    const data = body?.data || body;
    const verse = Array.isArray(data) ? data[0] : data?.verse || data;
    const text = verse?.text;
    if (!text) return routes;
    return routes.map((r) =>
      r.path === "/bible/John/3/16"
        ? {
            ...r,
            description: `${text} — John 3:16, World English Bible, on Jevah.`,
          }
        : r
    );
  } catch {
    return routes;
  }
}

export async function prerenderBible() {
  const indexPath = path.join(dist, "index.html");
  if (!fs.existsSync(indexPath)) {
    console.warn("prerender-bible: dist/index.html missing, skip");
    return;
  }
  const index = fs.readFileSync(indexPath, "utf8");
  const routes = [
    ...MARKETING_SEO_ROUTES,
    ...(await enrichJohn316(BIBLE_SEO_ROUTES)),
  ];
  for (const route of routes) {
    writeRoute(injectMeta(index, route), route.path);
  }
  writeSitemap(routes);
  console.log(`prerender: ${routes.length} URLs`);
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  prerenderBible().catch((err) => {
    console.warn("prerender-bible failed:", err?.message || err);
    process.exitCode = 0;
  });
}

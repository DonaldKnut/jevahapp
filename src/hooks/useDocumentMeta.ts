import { useEffect } from "react";
import { DEFAULT_KEYWORDS, SITE_NAME } from "../lib/seo";

type Meta = {
  title: string;
  description: string;
  canonicalPath?: string;
  keywords?: string;
  ogType?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[] | null;
};

function upsertMeta(name: string, content: string, attr: "name" | "property" = "name") {
  let el = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

/**
 * SPA SEO: unique titles, descriptions, canonicals, Open Graph, JSON-LD.
 * Popular routes are also prerendered at build for crawlers that skip JS.
 */
export function useDocumentMeta({
  title,
  description,
  canonicalPath,
  keywords,
  ogType = "website",
  jsonLd,
}: Meta) {
  const json = jsonLd ? JSON.stringify(jsonLd) : "";
  useEffect(() => {
    const prev = document.title;
    document.title = title;
    upsertMeta("description", description);
    upsertMeta("keywords", keywords || DEFAULT_KEYWORDS);
    upsertMeta("og:title", title, "property");
    upsertMeta("og:description", description, "property");
    upsertMeta("og:type", ogType, "property");
    upsertMeta("og:site_name", SITE_NAME, "property");
    upsertMeta("twitter:card", "summary_large_image");
    upsertMeta("twitter:title", title);
    upsertMeta("twitter:description", description);
    const origin = window.location.origin;
    const canonical = `${origin}${canonicalPath || window.location.pathname}`;
    upsertLink("canonical", canonical);
    upsertMeta("og:url", canonical, "property");

    let script: HTMLScriptElement | null = null;
    if (json) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = "jevah-jsonld";
      script.text = json;
      document.getElementById("jevah-jsonld")?.remove();
      document.head.appendChild(script);
    }

    return () => {
      document.title = prev;
      if (script) script.remove();
    };
  }, [title, description, canonicalPath, keywords, ogType, json]);
}

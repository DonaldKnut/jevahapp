/** Strip tags for limits and empty checks. Safe in browser and SSR. */
export function htmlToPlain(html: string) {
  if (typeof document === "undefined") {
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
  const el = document.createElement("div");
  el.innerHTML = html;
  return (el.textContent || el.innerText || "").replace(/\s+/g, " ").trim();
}

export function isEmptyHtml(html: string) {
  return !htmlToPlain(html).length;
}

export function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

const BIO_TAGS = new Set(["P", "BR", "EM", "I", "STRONG", "B", "A", "UL", "OL", "LI", "H2", "H3"]);

function safeHref(href: string) {
  const t = href.trim();
  if (/^https?:\/\//i.test(t) || t.startsWith("mailto:") || t.startsWith("/")) {
    return t;
  }
  return "";
}

/** Keep only the marks the bio editor can create. */
export function sanitizeBioHtml(html: string) {
  if (!html) return "";
  if (typeof document === "undefined") return htmlToPlain(html);
  const root = document.createElement("div");
  root.innerHTML = html;

  const walk = (node: Node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.COMMENT_NODE) {
        child.parentNode?.removeChild(child);
        continue;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) continue;
      const el = child as HTMLElement;
      if (!BIO_TAGS.has(el.tagName)) {
        const parent = el.parentNode;
        while (el.firstChild) parent?.insertBefore(el.firstChild, el);
        parent?.removeChild(el);
        walk(node);
        return;
      }
      for (const attr of Array.from(el.attributes)) {
        if (el.tagName === "A" && attr.name === "href") {
          const href = safeHref(el.getAttribute("href") || "");
          if (href) {
            el.setAttribute("href", href);
            el.setAttribute("rel", "noopener noreferrer");
            el.setAttribute("target", "_blank");
          } else {
            el.removeAttribute("href");
          }
        } else {
          el.removeAttribute(attr.name);
        }
      }
      walk(el);
    }
  };

  walk(root);
  return root.innerHTML;
}

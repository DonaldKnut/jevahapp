import { looksLikeHtml, sanitizeBioHtml } from "../../../lib/htmlText";

const INNER =
  "[&_p]:m-0 [&_p+p]:mt-[0.55em] [&_em]:italic [&_i]:italic [&_strong]:font-semibold [&_b]:font-semibold [&_a]:underline [&_a]:underline-offset-2";

type Props = {
  html: string;
  className?: string;
};

export default function BioRichText(props: Props) {
  const html = props.html;
  const className = [INNER, props.className || ""].filter(Boolean).join(" ");
  if (!html.trim()) return null;
  if (!looksLikeHtml(html)) {
    return <p className={className}>{html}</p>;
  }
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizeBioHtml(html) }}
    />
  );
}

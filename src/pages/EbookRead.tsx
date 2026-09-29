import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  SpeakerWaveIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { ApiError } from "../lib/api";
import { getErrorMessage } from "../lib/errors";
import {
  MEDIA_PROTECT_ATTRS,
  attachShellProtection,
  blockMediaContextMenu,
  blockMediaDrag,
} from "../lib/mediaProtection";
import { JEVAH_FALLBACK_THUMB } from "../lib/sermonMedia";
import {
  ebookViewerUrl,
  fetchEbookText,
  fetchEbookTts,
  fetchEbookTtsConfig,
  generateEbookTts,
  resolveEbook,
} from "../services/ebooks";
import type { EbookCard, EbookTextPage } from "../types/ebook";

type Mode = "pages" | "read";

type LocationState = { ebook?: EbookCard };

const ZOOM_MIN = 0.75;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.125;
const ZOOM_DEFAULT = 1;

function clampZoom(z: number) {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(z * 1000) / 1000));
}

function zoomLabel(z: number) {
  return `${Math.round(z * 100)}%`;
}

export default function EbookRead() {
  const { id = "" } = useParams<{ id: string }>();
  const location = useLocation();
  const hint = (location.state as LocationState | null)?.ebook ?? null;

  const stageRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [ebook, setEbook] = useState<EbookCard | null>(
    hint?.id === id ? hint : null
  );
  const [loading, setLoading] = useState(!ebook);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("pages");
  const [pdfBust, setPdfBust] = useState(0);
  const [chromeHidden, setChromeHidden] = useState(false);

  const [textPages, setTextPages] = useState<EbookTextPage[]>([]);
  const [textPage, setTextPage] = useState(0);
  const [textLoading, setTextLoading] = useState(false);
  const [textError, setTextError] = useState<string | null>(null);

  const [ttsAvailable, setTtsAvailable] = useState(false);
  const [ttsUrl, setTtsUrl] = useState<string | null>(null);
  const [ttsBusy, setTtsBusy] = useState(false);
  const [ttsMsg, setTtsMsg] = useState<string | null>(null);
  const [listenOpen, setListenOpen] = useState(false);
  const [zoom, setZoom] = useState(ZOOM_DEFAULT);

  useDocumentMeta({
    title: ebook ? `${ebook.title} — Jevah Ebooks` : "Ebook — Jevah",
    description:
      ebook?.description || "Read this Christian ebook on Jevah.",
    canonicalPath: id ? `/ebooks/${id}` : "/ebooks",
  });

  const load = useCallback(async () => {
    if (!id) {
      setError("Ebook not found");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const card = await resolveEbook(id, hint?.id === id ? hint : null);
      if (!card) {
        setEbook(null);
        setError("This ebook is not available.");
      } else {
        setEbook(card);
      }
    } catch (err) {
      setEbook(null);
      if (err instanceof ApiError && err.status === 404) {
        setError("This ebook is not available.");
      } else {
        setError(getErrorMessage(err, "Could not load this ebook."));
      }
    } finally {
      setLoading(false);
    }
  }, [id, hint]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void fetchEbookTtsConfig().then((c) => setTtsAvailable(c.available));
  }, []);

  useEffect(() => {
    return attachShellProtection(stageRef.current);
  }, [ebook, mode]);

  const pdfSrc = useMemo(() => {
    if (!ebook) return null;
    const base = ebookViewerUrl(ebook);
    if (!base) return null;
    if (!pdfBust) return base;
    try {
      const [withoutHash, hash = ""] = base.split("#");
      const u = new URL(withoutHash);
      u.searchParams.set("_jevah", String(pdfBust));
      return hash ? `${u.toString()}#${hash}` : u.toString();
    } catch {
      return base;
    }
  }, [ebook, pdfBust]);

  const loadText = useCallback(async () => {
    if (!id) return;
    setTextLoading(true);
    setTextError(null);
    try {
      const res = await fetchEbookText(id);
      setTextPages(res.pages);
      setTextPage(0);
      if (!res.pages.length) {
        setTextError("No text could be extracted from this book yet.");
      }
    } catch (err) {
      setTextPages([]);
      setTextError(getErrorMessage(err, "Could not load text for this book."));
    } finally {
      setTextLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (
      mode === "read" &&
      textPages.length === 0 &&
      !textLoading &&
      !textError
    ) {
      void loadText();
    }
  }, [mode, textPages.length, textLoading, textError, loadText]);

  const goPrev = useCallback(() => {
    setTextPage((p) => Math.max(0, p - 1));
  }, []);

  const goNext = useCallback(() => {
    setTextPage((p) => Math.min(textPages.length - 1, p + 1));
  }, [textPages.length]);

  const zoomIn = useCallback(() => {
    setZoom((z) => clampZoom(z + ZOOM_STEP));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((z) => clampZoom(z - ZOOM_STEP));
  }, []);

  const zoomReset = useCallback(() => {
    setZoom(ZOOM_DEFAULT);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && (e.key === "=" || e.key === "+")) {
        e.preventDefault();
        zoomIn();
        return;
      }
      if (mod && e.key === "-") {
        e.preventDefault();
        zoomOut();
        return;
      }
      if (mod && e.key === "0") {
        e.preventDefault();
        zoomReset();
        return;
      }
      if (mode !== "read") return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "Escape") {
        setChromeHidden(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, goPrev, goNext, zoomIn, zoomOut, zoomReset]);

  const ensureListen = useCallback(async () => {
    if (!id || !ebook) return;
    setTtsBusy(true);
    setTtsMsg(null);
    setListenOpen(true);
    try {
      let tts = await fetchEbookTts(id);
      if (!tts?.audioUrl) {
        tts = await generateEbookTts(id);
      }
      if (tts?.audioUrl) {
        setTtsUrl(tts.audioUrl);
      } else {
        setTtsMsg("Listen audio is not available for this book yet.");
      }
    } catch (err) {
      setTtsMsg(getErrorMessage(err, "Could not start listen mode."));
    } finally {
      setTtsBusy(false);
    }
  }, [id, ebook]);

  if (loading) {
    return (
      <div className="ebook-reader-shell flex min-h-dvh items-center justify-center px-4 pt-20">
        <div className="ebook-reader-stage w-full max-w-4xl animate-pulse">
          <div className="h-[min(78dvh,820px)] rounded-[1.5rem] bg-jevah-card/80" />
        </div>
      </div>
    );
  }

  if (error || !ebook) {
    return (
      <div className="jevah-dashboard-shell flex min-h-dvh flex-col items-center justify-center px-4 pb-20 pt-28 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-jevah-accent/10 text-jevah-accent">
          <BookOpenIcon className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-xl font-extrabold text-jevah-text">
          {error || "Ebook not found"}
        </h1>
        <Link
          to="/ebooks"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-jevah-accent px-5 py-2.5 text-sm font-bold text-white"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to ebooks
        </Link>
      </div>
    );
  }

  const thumb = ebook.thumbnailUrl?.trim() || JEVAH_FALLBACK_THUMB;
  const currentText = textPages[textPage];
  const progress =
    textPages.length > 0 ? ((textPage + 1) / textPages.length) * 100 : 0;

  return (
    <div className="ebook-reader-shell relative min-h-dvh overflow-x-hidden font-sans antialiased">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <img
          src={thumb}
          alt=""
          className="h-full w-full scale-110 object-cover opacity-35 blur-3xl"
          draggable={false}
        />
        <div className="ebook-reader-veil absolute inset-0" />
      </div>

      {/* Top chrome */}
      <header
        className={`ebook-reader-chrome sticky top-0 z-30 transition-transform duration-300 ${
          chromeHidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-3 py-3 sm:px-6 lg:px-10">
          <Link
            to="/ebooks"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/25 text-white ring-1 ring-white/15 backdrop-blur-md transition hover:bg-black/40"
            aria-label="Back to ebooks"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white sm:text-base">
              {ebook.title}
            </p>
            <p className="truncate text-[11px] text-white/65 sm:text-xs">
              {[ebook.authorName, ebook.category].filter(Boolean).join(" · ") ||
                "In-app reading · not for download"}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <ModeChip
              active={mode === "pages"}
              onClick={() => setMode("pages")}
              icon={<BookOpenIcon className="h-4 w-4" />}
              label="Pages"
              short="PDF"
            />
            <ModeChip
              active={mode === "read"}
              onClick={() => setMode("read")}
              icon={<DocumentTextIcon className="h-4 w-4" />}
              label="Read"
              short="Text"
            />
            {ttsAvailable ? (
              <button
                type="button"
                disabled={ttsBusy}
                onClick={() => void ensureListen()}
                className="inline-flex h-10 items-center gap-1.5 rounded-full bg-white/12 px-2.5 text-xs font-bold text-white ring-1 ring-white/15 backdrop-blur-md transition hover:bg-white/20 disabled:opacity-60 sm:px-3"
                aria-label="Listen"
              >
                <SpeakerWaveIcon className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {ttsBusy ? "…" : "Listen"}
                </span>
              </button>
            ) : null}
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl justify-end px-3 pb-2 sm:hidden">
          <EbookZoomControls
            zoom={zoom}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onReset={zoomReset}
          />
        </div>
        {mode === "read" && textPages.length > 0 ? (
          <div className="h-0.5 w-full bg-white/10">
            <div
              className="h-full bg-amber-400/90 transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : null}
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-3 pb-28 pt-4 sm:px-6 lg:grid-cols-[13.5rem_minmax(0,1fr)] lg:gap-8 lg:px-10 lg:pt-6">
        {/* Cover rail — desktop */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <div className="ebook-cover-frame overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.65)]">
              <img
                src={thumb}
                alt=""
                className="aspect-[2/3] w-full object-cover"
                draggable={false}
                onError={(e) => {
                  e.currentTarget.src = JEVAH_FALLBACK_THUMB;
                }}
              />
            </div>
            {ebook.description ? (
              <p className="text-xs leading-relaxed text-white/60 line-clamp-8">
                {ebook.description}
              </p>
            ) : null}
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
              Stream only · no download
            </p>
          </div>
        </aside>

        {/* Reader stage */}
        <div className="min-w-0">
          {/* Mobile cover strip */}
          <div className="mb-4 flex items-center gap-3 lg:hidden">
            <img
              src={thumb}
              alt=""
              className="h-16 w-11 shrink-0 rounded-lg object-cover ring-1 ring-white/15 shadow-lg"
              draggable={false}
            />
            {ebook.description ? (
              <p className="line-clamp-3 text-xs leading-relaxed text-white/70">
                {ebook.description}
              </p>
            ) : (
              <p className="text-xs text-white/55">
                Read in-app on Jevah. Downloads are disabled.
              </p>
            )}
          </div>

          <div
            ref={stageRef}
            className="ebook-reader-stage media-no-download relative overflow-hidden rounded-[1.25rem] sm:rounded-[1.5rem]"
            onContextMenu={blockMediaContextMenu}
            onDragStart={blockMediaDrag}
            onClick={() => {
              if (mode === "read") setChromeHidden((v) => !v);
            }}
          >
            <div
              className="absolute right-3 top-3 z-20 hidden sm:block"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <EbookZoomControls
                zoom={zoom}
                onZoomIn={zoomIn}
                onZoomOut={zoomOut}
                onReset={zoomReset}
                variant="overlay"
              />
            </div>

            {mode === "pages" ? (
              pdfSrc ? (
                <div className="ebook-zoom-viewport">
                  <div
                    className="ebook-zoom-canvas"
                    style={{
                      transform: `scale(${zoom})`,
                      transformOrigin: "top left",
                    }}
                  >
                    <iframe
                      key={pdfSrc}
                      title={ebook.title}
                      src={pdfSrc}
                      className="ebook-pdf-frame h-[min(78dvh,860px)] w-full border-0 bg-[#0a1210]"
                      referrerPolicy="no-referrer"
                      onError={() => {
                        setPdfBust((n) => n + 1);
                        void load();
                      }}
                    />
                  </div>
                </div>
              ) : (
                <EmptyStage
                  title="This book is not available yet"
                  body="The file is missing or still processing. Try Read mode if text is ready."
                  action={
                    <button
                      type="button"
                      onClick={() => setMode("read")}
                      className="mt-4 rounded-full bg-jevah-accent px-4 py-2 text-sm font-bold text-white"
                    >
                      Try Read mode
                    </button>
                  }
                />
              )
            ) : (
              <div className="ebook-zoom-viewport ebook-zoom-viewport--text">
                <div
                  className="ebook-read-pane min-h-[min(78dvh,860px)] px-5 py-8 sm:px-10 sm:py-12 lg:px-14"
                  style={
                    {
                      "--ebook-text-scale": zoom,
                    } as CSSProperties
                  }
                >
                {textLoading ? (
                  <p className="text-center text-sm text-white/60">
                    Preparing pages…
                  </p>
                ) : textError ? (
                  <EmptyStage title="Text unavailable" body={textError} />
                ) : currentText ? (
                  <>
                    <article className="ebook-prose mx-auto max-w-2xl">
                      <p className="mb-6 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-200/70">
                        Page {textPage + 1} of {textPages.length}
                      </p>
                      <div className="whitespace-pre-wrap">{currentText.text}</div>
                    </article>

                    <div
                      className="mx-auto mt-10 flex max-w-2xl items-center justify-between gap-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        disabled={textPage === 0}
                        onClick={goPrev}
                        className="inline-flex h-11 items-center gap-1.5 rounded-full bg-white/10 px-4 text-sm font-bold text-white ring-1 ring-white/15 transition hover:bg-white/18 disabled:opacity-35"
                      >
                        <ChevronLeftIcon className="h-4 w-4" />
                        <span className="hidden xs:inline">Prev</span>
                      </button>
                      <span className="text-xs font-semibold tabular-nums text-white/55">
                        {textPage + 1} / {textPages.length}
                      </span>
                      <button
                        type="button"
                        disabled={textPage >= textPages.length - 1}
                        onClick={goNext}
                        className="inline-flex h-11 items-center gap-1.5 rounded-full bg-white/10 px-4 text-sm font-bold text-white ring-1 ring-white/15 transition hover:bg-white/18 disabled:opacity-35"
                      >
                        <span className="hidden xs:inline">Next</span>
                        <ChevronRightIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <EmptyStage
                    title="No pages yet"
                    body="Switch to Pages if the PDF is ready, or check back soon."
                  />
                )}
                </div>
              </div>
            )}
          </div>

          <p className="mt-3 text-center text-[11px] text-white/45">
            Reading on Jevah · saving and downloading are disabled
          </p>
        </div>
      </div>

      {/* Listen dock */}
      {listenOpen ? (
        <div className="ebook-listen-dock fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
          <div className="mx-auto flex max-w-3xl items-center gap-3 rounded-2xl border border-white/10 bg-[#071410]/92 p-3 shadow-2xl backdrop-blur-xl">
            <SpeakerWaveIcon className="h-5 w-5 shrink-0 text-amber-300" />
            <div className="min-w-0 flex-1">
              {ttsUrl ? (
                <audio
                  ref={audioRef}
                  controls
                  className="w-full"
                  src={ttsUrl}
                  preload="metadata"
                  {...MEDIA_PROTECT_ATTRS}
                  onContextMenu={blockMediaContextMenu}
                  controlsList={MEDIA_PROTECT_ATTRS.controlsList}
                />
              ) : (
                <p className="text-xs font-semibold text-white/70">
                  {ttsBusy
                    ? "Preparing listen audio…"
                    : ttsMsg || "Listen unavailable"}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setListenOpen(false);
                audioRef.current?.pause();
              }}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white"
              aria-label="Close listen"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function EbookZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
  className = "",
  variant = "bar",
}: {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  className?: string;
  variant?: "bar" | "overlay";
}) {
  const atMin = zoom <= ZOOM_MIN + 0.001;
  const atMax = zoom >= ZOOM_MAX - 0.001;
  const atDefault = Math.abs(zoom - ZOOM_DEFAULT) < 0.001;

  const shell =
    variant === "overlay"
      ? "bg-[#071410]/88 ring-white/15 shadow-lg backdrop-blur-xl"
      : "bg-white/12 ring-white/15 backdrop-blur-md";

  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-full p-0.5 ring-1 ${shell} ${className}`}
      role="group"
      aria-label="Zoom"
    >
      <button
        type="button"
        disabled={atMin}
        onClick={onZoomOut}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white transition hover:bg-white/15 disabled:opacity-35"
        aria-label="Zoom out"
      >
        <MagnifyingGlassMinusIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        disabled={atDefault}
        onClick={onReset}
        className="min-w-[2.75rem] px-1 text-center text-[11px] font-bold tabular-nums text-white/90 transition hover:bg-white/10 disabled:opacity-50"
        aria-label="Reset zoom"
        title="Reset zoom (Ctrl+0)"
      >
        {zoomLabel(zoom)}
      </button>
      <button
        type="button"
        disabled={atMax}
        onClick={onZoomIn}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white transition hover:bg-white/15 disabled:opacity-35"
        aria-label="Zoom in"
      >
        <MagnifyingGlassPlusIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

function ModeChip({
  active,
  onClick,
  icon,
  label,
  short,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
  short: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10 items-center gap-1.5 rounded-full px-2.5 text-xs font-bold transition sm:px-3 ${
        active
          ? "bg-white text-[#0B1A1F] shadow-sm"
          : "bg-white/12 text-white ring-1 ring-white/15 backdrop-blur-md hover:bg-white/20"
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{short}</span>
    </button>
  );
}

function EmptyStage({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-[min(50dvh,420px)] flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <BookOpenIcon className="h-8 w-8 text-amber-300/80" />
      <p className="font-semibold text-white">{title}</p>
      <p className="max-w-sm text-sm text-white/60">{body}</p>
      {action}
    </div>
  );
}

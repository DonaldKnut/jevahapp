import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  applyAsCreator,
  fetchCreatorMe,
  type CreatorMe,
} from "../../services/creatorsApi";
import { ApiError } from "../../lib/api";
import { useFeedback } from "../../components/admin/Feedback";
import { ErrorToaster } from "../../components/ErrorToaster";
import ApplyPromoAside from "./components/ApplyPromoAside";
import ApplyFormFields from "./components/ApplyFormFields";
import {
  firstApplyErrorKey,
  GENRE_OPTIONS,
  parseCreatorApply,
  type CreatorApplyFieldErrors,
  type CreatorApplyInput,
} from "./schemas/creatorApply";

const emptyForm = (): CreatorApplyInput => ({
  creatorTypes: ["artist"],
  displayName: "",
  genres: [],
  bio: "",
  instagram: "",
  youtube: "",
  spotify: "",
  avatarUrl: "",
  applicationNote: "",
});

export default function CreatorApply() {
  const navigate = useNavigate();
  const { toast } = useFeedback();
  const [me, setMe] = useState<CreatorMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<CreatorApplyInput>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<CreatorApplyFieldErrors>({});

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await fetchCreatorMe();
        if (!alive) return;
        setMe(data);
        if (data.artist?.displayName || data.artist?.name) {
          setValues((prev) => ({
            ...prev,
            displayName: data.artist?.displayName || data.artist?.name || "",
          }));
        }
        if (!data.capabilities.canApply && data.capabilities.showCreatorHub) {
          navigate("/creators/studio", { replace: true });
        }
      } catch {
        /* first-time applicants may 404 until apply */
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [navigate]);

  function onChange(
    key: keyof CreatorApplyInput,
    value: CreatorApplyInput[keyof CreatorApplyInput]
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function onToggleType(id: CreatorApplyInput["creatorTypes"][number]) {
    setValues((prev) => {
      const next = prev.creatorTypes.includes(id)
        ? prev.creatorTypes.filter((t) => t !== id)
        : [...prev.creatorTypes, id];
      return { ...prev, creatorTypes: next };
    });
    setFieldErrors((prev) => {
      if (!prev.creatorTypes) return prev;
      const next = { ...prev };
      delete next.creatorTypes;
      return next;
    });
  }

  function onToggleGenre(g: (typeof GENRE_OPTIONS)[number]) {
    setValues((prev) => {
      const next = prev.genres.includes(g)
        ? prev.genres.filter((x) => x !== g)
        : [...prev.genres, g];
      return { ...prev, genres: next };
    });
    setFieldErrors((prev) => {
      if (!prev.genres) return prev;
      const next = { ...prev };
      delete next.genres;
      return next;
    });
  }

  function focusFirstError(errs: CreatorApplyFieldErrors) {
    const key = firstApplyErrorKey(errs);
    if (!key) return;
    window.requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>(
        `[data-apply-field="${key}"]`
      );
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      const focusable = el?.matches("input, textarea, button")
        ? el
        : el?.querySelector<HTMLElement>("input, textarea, button");
      focusable?.focus();
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = parseCreatorApply(values);
    if (!parsed.ok) {
      setFieldErrors(parsed.errors);
      const firstKey = firstApplyErrorKey(parsed.errors);
      const first = (firstKey && parsed.errors[firstKey]) || "Fix the highlighted fields.";
      setError(first);
      toast.error("Check your application", first);
      focusFirstError(parsed.errors);
      return;
    }

    setBusy(true);
    setError(null);
    setFieldErrors({});
    try {
      const v = parsed.data;
      const socials: Record<string, string> = {};
      if (v.instagram) socials.instagram = v.instagram;
      if (v.youtube) socials.youtube = v.youtube;
      if (v.spotify) socials.spotify = v.spotify;

      const result = await applyAsCreator({
        displayName: v.displayName,
        bio: v.bio,
        genres: v.genres,
        creatorTypes: v.creatorTypes,
        socials: Object.keys(socials).length ? socials : undefined,
        applicationNote: v.applicationNote,
        avatarUrl: v.avatarUrl,
      });
      setMe(result);
      toast.success("Application submitted", result.capabilities.statusMessage);
      navigate("/creators/studio", { replace: true });
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not submit application.";
      setError(msg);
      toast.error("Apply failed", msg);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-jevah-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <ErrorToaster error={error} title="Application error" />
      <div
        className="auth-root flex h-dvh overflow-hidden font-sans antialiased transition-colors duration-300"
        style={{ backgroundColor: "var(--jevah-auth-root)" }}
      >
        <ApplyPromoAside />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="mx-auto w-full max-w-xl px-5 pb-28 pt-10 sm:px-8 sm:pt-12 lg:px-10 lg:pt-14">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-jevah-accent">
                Apply
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-jevah-text">
                Become a creator
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-jevah-text-muted">
                Tell us who you are. Required fields mirror Spotify for Artists
                access — name, role, and genre. Everything else is optional.
              </p>

              {me?.capabilities.showPendingBanner && (
                <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                  {me.capabilities.statusMessage}
                </div>
              )}

              {/* Mobile-only promo strip (desktop uses left panel) */}
              <div className="mt-6 rounded-2xl border border-amber-500/25 bg-gradient-to-br from-[#1A1208] to-[#0B1A1F] p-4 text-white lg:hidden">
                <p className="text-sm font-bold">Jevah for Creators</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">
                  Apply once → admin review → upload to the gospel shelf.
                </p>
              </div>

              <form
                id="creator-apply-form"
                onSubmit={(e) => void onSubmit(e)}
                className="mt-8"
                noValidate
              >
                <ApplyFormFields
                  values={values}
                  errors={fieldErrors}
                  busy={busy}
                  onChange={onChange}
                  onToggleType={onToggleType}
                  onToggleGenre={onToggleGenre}
                />
              </form>

              <p className="mt-8 text-center text-sm text-jevah-text-muted lg:text-left">
                <Link
                  to="/creators"
                  className="text-jevah-accent hover:underline"
                >
                  Back to Creators
                </Link>
              </p>
            </div>
          </div>

          <div className="shrink-0 border-t border-jevah-border/80 bg-jevah-surface/95 px-5 py-4 backdrop-blur-md sm:px-8 lg:px-10">
            <div className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-jevah-text-muted">
                Admins review in the Artists queue. You&apos;ll land in Studio
                after submit.
              </p>
              <button
                type="submit"
                form="creator-apply-form"
                disabled={busy}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-jevah-accent px-8 text-sm font-semibold text-white transition hover:bg-jevah-accent-hover disabled:opacity-60 sm:w-auto"
              >
                {busy ? "Submitting…" : "Submit application"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

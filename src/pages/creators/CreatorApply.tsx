import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  applyAsCreator,
  fetchCreatorMe,
  uploadCreatorImage,
  type CreatorMe,
} from "../../services/creatorsApi";
import { useFeedback } from "../../components/admin/Feedback";
import { getErrorMessage, toastApiError } from "../../lib/errors";
import { assertImageFile, COVER_MAX_BYTES, normalizeGenreTag } from "../../lib/media";
import ApplyPromoAside from "./components/ApplyPromoAside";
import ApplyFormFields from "./components/ApplyFormFields";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import {
  firstApplyErrorKey,
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
  applicationNote: "",
});

export default function CreatorApply() {
  const navigate = useNavigate();
  const { toast } = useFeedback();
  const [me, setMe] = useState<CreatorMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [values, setValues] = useState<CreatorApplyInput>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<CreatorApplyFieldErrors>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

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
        if (data.artist?.avatarUrl) {
          setAvatarPreview(data.artist.avatarUrl);
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

  function onPickAvatar(file: File) {
    try {
      assertImageFile(file, COVER_MAX_BYTES);
    } catch (err) {
      const message = getErrorMessage(err, "Choose a JPG, PNG, or WebP under 5MB.");
      setFieldErrors((prev) => ({ ...prev, avatarUrl: message }));
      toast.error("Photo", message);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = typeof reader.result === "string" ? reader.result : "";
      if (!url) return;
      setAvatarFile(file);
      setAvatarPreview(url);
      setFieldErrors((prev) => {
        if (!prev.avatarUrl) return prev;
        const next = { ...prev };
        delete next.avatarUrl;
        return next;
      });
    };
    reader.readAsDataURL(file);
  }

  function onClearAvatar() {
    setAvatarFile(null);
    setAvatarPreview(me?.artist?.avatarUrl || null);
  }

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

  function clearGenreError() {
    setFieldErrors((prev) => {
      if (!prev.genres) return prev;
      const next = { ...prev };
      delete next.genres;
      return next;
    });
  }

  function onToggleGenre(g: string) {
    setValues((prev) => {
      const next = prev.genres.includes(g)
        ? prev.genres.filter((x) => x !== g)
        : [...prev.genres, g];
      return { ...prev, genres: next };
    });
    clearGenreError();
  }

  function onAddCustomGenre(raw: string): boolean {
    const slug = normalizeGenreTag(raw);
    if (!slug) {
      setFieldErrors((prev) => ({
        ...prev,
        genres: "Use 2–40 letters or numbers.",
      }));
      return false;
    }
    if (values.genres.includes(slug)) {
      clearGenreError();
      return true;
    }
    if (values.genres.length >= 8) {
      setFieldErrors((prev) => ({ ...prev, genres: "Keep it to 8 genres." }));
      return false;
    }
    setValues((prev) => ({ ...prev, genres: [...prev.genres, slug] }));
    clearGenreError();
    return true;
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
      const first =
        (firstKey && parsed.errors[firstKey]) || "Fix the highlighted fields.";
      toast.error("Check your application", first);
      focusFirstError(parsed.errors);
      return;
    }

    setBusy(true);
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
      });
      if (avatarFile) {
        try {
          await uploadCreatorImage("avatar", avatarFile);
        } catch {
          toast.warning(
            "Photo pending",
            "Application is in. Add the photo from Studio if it did not attach."
          );
        }
      }
      setMe(result);
      toast.success("Application submitted", result.capabilities.statusMessage);
      navigate("/creators/studio", { replace: true });
    } catch (err) {
      toastApiError(toast, "Apply failed", err, "Could not submit application.");
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
    <div
      className="auth-root flex h-dvh overflow-hidden font-sans antialiased"
      style={{ backgroundColor: "var(--jevah-auth-root)" }}
    >
      <ApplyPromoAside />

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-[#060e18] bg-gradient-to-br from-[#0b1a24] via-[#0d1c27] to-[#060e18] text-slate-100">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 20% 80%, rgba(245,158,11,0.14), transparent 55%), radial-gradient(ellipse 60% 50% at 85% 15%, rgba(37,110,99,0.2), transparent 55%)",
          }}
          aria-hidden
        />

        <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto w-full max-w-xl px-5 pb-10 pt-9 sm:px-8 sm:pt-12 lg:px-10">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-500/10 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-amber-200">
                Application
              </span>
              <Link
                to="/creators"
                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300/90 transition hover:text-amber-200 hover:underline"
              >
                <ArrowLeftIcon className="h-3.5 w-3.5 stroke-[2.5]" />
                Creators
              </Link>
            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-[2.15rem]">
              Become a creator
            </h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">
              Name, role, and genre are required. Everything else can wait until
              Studio.
            </p>

            {me?.capabilities.showPendingBanner ? (
              <div className="mt-5 rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">
                {me.capabilities.statusMessage}
              </div>
            ) : null}

            <form
              id="creator-apply-form"
              onSubmit={(e) => void onSubmit(e)}
              className="mt-7"
              noValidate
            >
              <ApplyFormFields
                values={values}
                errors={fieldErrors}
                busy={busy}
                onChange={onChange}
                onToggleType={onToggleType}
                onToggleGenre={onToggleGenre}
                onAddCustomGenre={onAddCustomGenre}
                avatarPreview={avatarPreview}
                onPickAvatar={onPickAvatar}
                onClearAvatar={onClearAvatar}
              />
            </form>
          </div>
        </div>

        <div className="relative z-10 shrink-0 border-t border-white/10 bg-[#070e16]/90 px-5 py-3.5 backdrop-blur-xl sm:px-8 lg:px-10">
          <div className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Reviewed in the Artists queue. Studio opens after you submit.
            </p>
            <button
              type="submit"
              form="creator-apply-form"
              disabled={busy}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-amber-400 px-7 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {busy ? "Submitting…" : "Submit application"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

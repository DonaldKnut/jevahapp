import { Link } from "react-router-dom";
import type { CreatorMe } from "../../../types/creator";
import type { TrackCard } from "../../../types/media";

/**
 * Drive studio chrome from capabilities.nextStep (Open/Closed).
 * Avoid scattering status === "pending" checks across screens.
 */
export default function CreatorHubByStep({
  me,
  tracks,
  onUpload,
}: {
  me: CreatorMe;
  tracks: TrackCard[];
  onUpload: () => void;
}) {
  const step = me.capabilities.nextStep;

  switch (step) {
    case "apply":
      return (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <h2 className="text-xl font-semibold text-[#0B1A1F]">Become a creator</h2>
          <p className="mt-2 text-sm text-slate-500">
            {me.capabilities.statusMessage}
          </p>
          <Link
            to="/creators/apply"
            className="mt-6 inline-flex rounded-full bg-[#256E63] px-6 py-3 text-sm font-semibold text-white"
          >
            Apply now
          </Link>
        </div>
      );
    case "wait_review":
      return (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Under review
          </p>
          <p className="mt-2 text-sm text-amber-900">
            {me.capabilities.statusMessage}
          </p>
        </div>
      );
    case "contact_support":
      return (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8">
          <p className="text-sm text-rose-800">{me.capabilities.statusMessage}</p>
          <a
            href="mailto:support@jevahapp.com"
            className="mt-4 inline-flex text-sm font-semibold text-rose-700 underline"
          >
            Contact support
          </a>
        </div>
      );
    case "upload_first_track":
      return (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <h2 className="text-xl font-semibold">Upload your first song</h2>
          <p className="mt-2 text-sm text-slate-500">
            {me.capabilities.statusMessage}
          </p>
          <button
            type="button"
            onClick={onUpload}
            className="mt-6 rounded-full bg-[#256E63] px-6 py-3 text-sm font-semibold text-white"
          >
            Upload track
          </button>
        </div>
      );
    case "manage_catalog":
    default:
      if (!tracks.length && me.capabilities.canUploadTracks) {
        return (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <h2 className="text-xl font-semibold">Your catalog is empty</h2>
            <button
              type="button"
              onClick={onUpload}
              className="mt-6 rounded-full bg-[#256E63] px-6 py-3 text-sm font-semibold text-white"
            >
              Upload track
            </button>
          </div>
        );
      }
      return null;
  }
}

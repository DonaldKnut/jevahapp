import { QuestionMarkCircleIcon } from "@heroicons/react/24/solid";

export default function TourFab({
  onClick,
  hidden,
  lift,
  tone = "admin",
}: {
  onClick: () => void;
  hidden?: boolean;
  lift?: boolean;
  tone?: "admin" | "creator";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`tour-fab tour-fab--${tone}${lift ? " tour-fab--lift" : ""}${
        hidden ? " tour-fab--hidden" : ""
      }`}
      aria-label="Take the tour"
      title="Take the tour"
    >
      <span className="tour-fab-ping" aria-hidden />
      <span className="tour-fab-orb">
        <QuestionMarkCircleIcon className="h-8 w-8" />
      </span>
      <span className="tour-fab-tip">Tour</span>
    </button>
  );
}

import { trackThumb, type TrackCard } from "../../lib/media";

type Props = {
  track: TrackCard | null;
  playing: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: "h-12 w-12",
  md: "h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]",
  lg: "h-40 w-40 sm:h-52 sm:w-52",
};

/**
 * Spotify-style rolling vinyl with album art in the center.
 * Spins only while `playing` is true.
 */
export default function VinylDisc({
  track,
  playing,
  size = "md",
  className = "",
}: Props) {
  const thumb = track ? trackThumb(track) : null;

  return (
    <div
      className={`relative shrink-0 ${sizes[size]} ${className}`}
      aria-hidden
    >
      <div
        className={`vinyl-disc h-full w-full rounded-full shadow-[0_8px_28px_rgba(0,0,0,0.35)] ${
          playing ? "vinyl-disc--spinning" : ""
        }`}
        style={{
          background:
            "radial-gradient(circle at center, #1a1a1a 0%, #1a1a1a 14%, #2a2a2a 15%, #111 38%, #0a0a0a 55%, #222 56%, #0d0d0d 70%, #1f1f1f 71%, #050505 100%)",
        }}
      >
        {/* Groove rings */}
        <div
          className="pointer-events-none absolute inset-[8%] rounded-full opacity-40"
          style={{
            background:
              "repeating-radial-gradient(circle at center, transparent 0 2px, rgba(255,255,255,0.04) 2px 3px)",
          }}
        />

        {/* Album art hub */}
        <div className="absolute inset-[22%] overflow-hidden rounded-full ring-1 ring-white/10 shadow-inner">
          {thumb ? (
            <img
              src={thumb}
              alt=""
              className="h-full w-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-jevah-accent to-emerald-700 text-white">
              <span className="text-[10px] font-black tracking-widest opacity-90 sm:text-xs">
                JEVAH
              </span>
            </div>
          )}
        </div>

        {/* Center spindle */}
        <div className="absolute left-1/2 top-1/2 h-[9%] w-[9%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0a0a0a] ring-1 ring-white/25" />
      </div>
    </div>
  );
}

import JevahLogoLight from "../assets/logos/logo.png";
import { useTheme } from "../context/ThemeContext";

const JEVAH_LOGO_DARK =
  "https://res.cloudinary.com/dajpllbyu/image/upload/v1785405074/jevahh_app-removebg-preview_v6cpg3.png";

interface JevahLogoProps {
  width?: number;
  height?: number;
  className?: string;
  /** Soft plate behind the mark — follows light/dark. */
  plated?: boolean;
  /** Use the light-colored mark (for dark sidebars). */
  onDark?: boolean;
}

function JevahLogo({
  width = 120,
  height = 60,
  className = "",
  plated = false,
  onDark,
}: JevahLogoProps) {
  const { resolved } = useTheme();
  const darkMark = onDark ?? resolved === "dark";
  const src = darkMark ? JEVAH_LOGO_DARK : JevahLogoLight;

  const plate = plated
    ? darkMark
      ? "rounded-2xl bg-white/10 px-3 py-1.5 ring-1 ring-white/20 backdrop-blur-md shadow-md"
      : "rounded-2xl bg-white px-3 py-1.5 shadow-md ring-1 ring-black/10"
    : "";

  return (
    <div className={`inline-flex items-center ${plate} ${className}`.trim()}>
      <img
        src={src}
        alt="JEVAH Logo"
        width={width}
        height={height}
        className={`h-auto max-w-full object-contain transition-all duration-300 ${
          darkMark ? "brightness-110 drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]" : ""
        }`}
      />
    </div>
  );
}

export default JevahLogo;
